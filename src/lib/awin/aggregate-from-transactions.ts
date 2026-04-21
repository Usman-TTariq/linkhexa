import type { SupabaseClient } from "@supabase/supabase-js";
import { matchKnownSlug } from "@/lib/awin/slug-match";
import { AWIN_AGG_FALLBACK_CURRENCY } from "@/lib/awin/currency-default";

const PAGE = 500;
const MAX_ROWS = 100_000;
const SLUG_TXN_QUERY_CONCURRENCY = 8;
const GO_LINK_SLUG_IN_CHUNK = 40;

function normPubId(id: string): string {
  return id.trim().toLowerCase();
}

/** True if this Awin row counts toward the publisher (attributed to them, or unattributed but matches one of their link slugs). */
export function publisherOwnsAwinTransactionRow(
  r: { publisher_id: string | null; go_link_slug: string | null; click_ref: string | null },
  publisherId: string,
  slugSet: Set<string>
): boolean {
  const pid = r.publisher_id;
  if (pid && normPubId(pid) === normPubId(publisherId)) return true;
  if (pid && normPubId(pid) !== normPubId(publisherId)) return false;
  if (matchKnownSlug(r.go_link_slug, r.click_ref, slugSet) != null) return true;
  /** Awin sometimes sends values we do not normalize yet — last-resort substring match (null publisher only). */
  const ref = (r.click_ref ?? "").toLowerCase();
  const gs = (r.go_link_slug ?? "").toLowerCase();
  if (!ref && !gs) return false;
  for (const s of slugSet) {
    const low = s.toLowerCase();
    if (s.length >= 6 && (ref.includes(low) || gs.includes(low))) return true;
  }
  return false;
}

type EarningsTxnRow = {
  awin_transaction_id: string;
  publisher_id: string | null;
  go_link_slug: string | null;
  click_ref: string | null;
  transaction_date: string;
  commission_currency?: string | null;
  commission_amount?: number | string | null;
  sale_currency?: string | null;
  sale_amount?: number | string | null;
};

/** Sum commission/sale for all rows with a publisher (when rollup table is empty or stale). */
export async function sumAttributedAwinByCurrency(supabase: SupabaseClient): Promise<{
  commissionByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
}> {
  const commissionByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("commission_currency, commission_amount, sale_currency, sale_amount")
      .not("publisher_id", "is", null)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      commissionByCurrency[cc] = (commissionByCurrency[cc] ?? 0) + Number(r.commission_amount ?? 0);
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + Number(r.sale_amount ?? 0);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { commissionByCurrency, saleByCurrency };
}

function ymdFromTimestamptz(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Rebuild publisher earnings from `awin_transactions` (rollup empty/stale). Includes unattributed rows that match this publisher's go-link slugs. */
export async function publisherEarningsFromTransactions(
  supabase: SupabaseClient,
  publisherId: string,
  fromYmd: string
): Promise<{
  series: {
    date: string;
    currency: string;
    commission: number;
    sale: number;
    transactions: number;
  }[];
  commissionByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
  totalTxns: number;
}> {
  const commissionByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  const bucket = new Map<string, { commission: number; sale: number; txns: number }>();
  let totalTxns = 0;

  const fromIso = `${fromYmd}T00:00:00.000Z`;
  const merged = new Map<string, EarningsTxnRow>();

  const { data: linkRows, error: linkErr } = await supabase
    .from("publisher_go_links")
    .select("slug")
    .eq("publisher_id", publisherId);

  if (linkErr) {
    return { series: [], commissionByCurrency: {}, saleByCurrency: {}, totalTxns: 0 };
  }

  const uniqueSlugs = [
    ...new Set(
      (linkRows ?? []).map((x: { slug?: string }) => String(x.slug ?? "").trim()).filter(Boolean)
    ),
  ];
  const slugSet = new Set(uniqueSlugs);

  let offset = 0;
  let totalRead = 0;
  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select(
        "awin_transaction_id, publisher_id, go_link_slug, click_ref, transaction_date, commission_currency, commission_amount, sale_currency, sale_amount"
      )
      .eq("publisher_id", publisherId)
      .gte("transaction_date", fromIso)
      .order("transaction_date", { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;
    for (const r of data as EarningsTxnRow[]) {
      merged.set(String(r.awin_transaction_id), r);
    }
    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  if (uniqueSlugs.length > 0) {
    /** Exact `go_link_slug` matches (sync writes this) — avoids fragile multi-part `.or()` filters. */
    for (let c = 0; c < uniqueSlugs.length; c += GO_LINK_SLUG_IN_CHUNK) {
      const inChunk = uniqueSlugs.slice(c, c + GO_LINK_SLUG_IN_CHUNK);
      let inOff = 0;
      while (inOff < MAX_ROWS) {
        const { data, error } = await supabase
          .from("awin_transactions")
          .select(
            "awin_transaction_id, publisher_id, go_link_slug, click_ref, transaction_date, commission_currency, commission_amount, sale_currency, sale_amount"
          )
          .gte("transaction_date", fromIso)
          .in("go_link_slug", inChunk)
          .order("transaction_date", { ascending: true })
          .range(inOff, inOff + PAGE - 1);

        if (error || !data?.length) break;
        for (const r of data as EarningsTxnRow[]) {
          merged.set(String(r.awin_transaction_id), r);
        }
        inOff += PAGE;
        if (data.length < PAGE) break;
      }
    }

    /** Click ref often holds URL or variant text without `go_link_slug` set — one ilike per slug. */
    for (let i = 0; i < uniqueSlugs.length; i += SLUG_TXN_QUERY_CONCURRENCY) {
      const slice = uniqueSlugs.slice(i, i + SLUG_TXN_QUERY_CONCURRENCY);
      const pages = await Promise.all(
        slice.map((s) =>
          supabase
            .from("awin_transactions")
            .select(
              "awin_transaction_id, publisher_id, go_link_slug, click_ref, transaction_date, commission_currency, commission_amount, sale_currency, sale_amount"
            )
            .gte("transaction_date", fromIso)
            .ilike("click_ref", `%${s}%`)
        )
      );
      for (const { data, error } of pages) {
        if (error) continue;
        for (const r of data ?? []) {
          const row = r as EarningsTxnRow;
          merged.set(String(row.awin_transaction_id), row);
        }
      }
    }
  }

  for (const r of merged.values()) {
    if (!publisherOwnsAwinTransactionRow(r, publisherId, slugSet)) continue;
    const day = ymdFromTimestamptz(r.transaction_date);
    if (day < fromYmd) continue;
    const cur = (r.commission_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
    const sc = (r.sale_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
    const c = Number(r.commission_amount ?? 0);
    const s = Number(r.sale_amount ?? 0);
    commissionByCurrency[cur] = (commissionByCurrency[cur] ?? 0) + c;
    saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + s;
    totalTxns += 1;

    const key = `${day}|${cur}`;
    const agg = bucket.get(key) ?? { commission: 0, sale: 0, txns: 0 };
    agg.commission += c;
    agg.sale += s;
    agg.txns += 1;
    bucket.set(key, agg);
  }

  const series = [...bucket.entries()]
    .map(([key, v]) => {
      const [date, currency] = key.split("|");
      return { date, currency, commission: v.commission, sale: v.sale, transactions: v.txns };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.currency.localeCompare(b.currency));

  return { series, commissionByCurrency, saleByCurrency, totalTxns };
}

/** Per-publisher commission totals for admin table when rollup is empty. */
export async function publishersCommissionFromTransactions(
  supabase: SupabaseClient,
  fromYmd: string
): Promise<Map<string, Record<string, number>>> {
  const byPub = new Map<string, Record<string, number>>();
  const fromIso = `${fromYmd}T00:00:00.000Z`;
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount")
      .not("publisher_id", "is", null)
      .gte("transaction_date", fromIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id: string;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
    }[]) {
      const pid = r.publisher_id;
      const cur = (r.commission_currency ?? "GBP").toUpperCase();
      const m = byPub.get(pid) ?? {};
      m[cur] = (m[cur] ?? 0) + Number(r.commission_amount ?? 0);
      byPub.set(pid, m);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return byPub;
}

/** Per-publisher commission + sale totals from raw transactions (when rollup is empty or zero). */
export async function publishersPayoutAndSaleFromTransactions(
  supabase: SupabaseClient,
  fromYmd: string
): Promise<{
  payoutByPublisher: Map<string, Record<string, number>>;
  saleByPublisher: Map<string, Record<string, number>>;
}> {
  const payoutByPublisher = new Map<string, Record<string, number>>();
  const saleByPublisher = new Map<string, Record<string, number>>();
  const fromIso = `${fromYmd}T00:00:00.000Z`;
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount, sale_currency, sale_amount")
      .not("publisher_id", "is", null)
      .gte("transaction_date", fromIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id: string;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const pid = r.publisher_id;
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      const payoutPrev = payoutByPublisher.get(pid) ?? {};
      payoutPrev[cc] = (payoutPrev[cc] ?? 0) + Number(r.commission_amount ?? 0);
      payoutByPublisher.set(pid, payoutPrev);
      const salePrev = saleByPublisher.get(pid) ?? {};
      salePrev[sc] = (salePrev[sc] ?? 0) + Number(r.sale_amount ?? 0);
      saleByPublisher.set(pid, salePrev);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { payoutByPublisher, saleByPublisher };
}

/** Sum commission + sale per publisher, only for the given publisher IDs (bounded scan). */
export async function payoutAndSaleForPublisherIdsFromTransactions(
  supabase: SupabaseClient,
  publisherIds: string[]
): Promise<{
  payoutByPublisher: Map<string, Record<string, number>>;
  saleByPublisher: Map<string, Record<string, number>>;
}> {
  const payoutByPublisher = new Map<string, Record<string, number>>();
  const saleByPublisher = new Map<string, Record<string, number>>();
  if (publisherIds.length === 0) {
    return { payoutByPublisher, saleByPublisher };
  }

  const MAX_READ = 25_000;
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_READ) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount, sale_currency, sale_amount")
      .in("publisher_id", publisherIds)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id: string;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const pid = r.publisher_id;
      if (!pid) continue;
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      const payoutPrev = payoutByPublisher.get(pid) ?? {};
      payoutPrev[cc] = (payoutPrev[cc] ?? 0) + Number(r.commission_amount ?? 0);
      payoutByPublisher.set(pid, payoutPrev);
      const salePrev = saleByPublisher.get(pid) ?? {};
      salePrev[sc] = (salePrev[sc] ?? 0) + Number(r.sale_amount ?? 0);
      saleByPublisher.set(pid, salePrev);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { payoutByPublisher, saleByPublisher };
}

type SlugTxnAggRow = {
  awin_transaction_id: string;
  publisher_id: string | null;
  go_link_slug: string | null;
  click_ref: string | null;
  sale_amount: number | string | null;
  sale_currency: string | null;
  commission_amount: number | string | null;
  commission_currency: string | null;
};

/**
 * Commission + sale per publisher from `awin_transactions` using the same slug / click_ref rules as the admin
 * per-link breakdown (linked bucket): counts for the go-link owner unless another `publisher_id` is set on the row.
 */
export async function slugLinkedPayoutAndSaleForPublisherIds(
  supabase: SupabaseClient,
  publisherIds: string[]
): Promise<{
  payoutByPublisher: Map<string, Record<string, number>>;
  saleByPublisher: Map<string, Record<string, number>>;
}> {
  const payoutByPublisher = new Map<string, Record<string, number>>();
  const saleByPublisher = new Map<string, Record<string, number>>();
  if (publisherIds.length === 0) {
    return { payoutByPublisher, saleByPublisher };
  }

  const { data: linkRows, error: linkErr } = await supabase
    .from("publisher_go_links")
    .select("publisher_id, slug")
    .in("publisher_id", publisherIds);

  if (linkErr || !linkRows?.length) {
    return { payoutByPublisher, saleByPublisher };
  }

  const publisherSlugSets = new Map<string, Set<string>>();
  const slugToPublisher = new Map<string, string>();
  const allSlugs = new Set<string>();

  for (const row of linkRows as { publisher_id: string; slug: string }[]) {
    const pid = row.publisher_id;
    const slug = row.slug?.trim();
    if (!slug) continue;
    allSlugs.add(slug);
    const set = publisherSlugSets.get(pid) ?? new Set<string>();
    set.add(slug);
    publisherSlugSets.set(pid, set);
    if (!slugToPublisher.has(slug)) slugToPublisher.set(slug, pid);
  }

  const uniqueSlugs = [...allSlugs];
  const merged = new Map<string, SlugTxnAggRow>();

  for (let i = 0; i < uniqueSlugs.length; i += SLUG_TXN_QUERY_CONCURRENCY) {
    const slice = uniqueSlugs.slice(i, i + SLUG_TXN_QUERY_CONCURRENCY);
    const pages = await Promise.all(
      slice.map((s) =>
        supabase
          .from("awin_transactions")
          .select(
            "awin_transaction_id, publisher_id, go_link_slug, click_ref, sale_amount, sale_currency, commission_amount, commission_currency"
          )
          .or(`go_link_slug.eq.${s},click_ref.ilike.%${s}%`)
      )
    );

    for (const { data, error } of pages) {
      if (error) {
        throw new Error(error.message);
      }
      for (const r of (data ?? []) as SlugTxnAggRow[]) {
        merged.set(String(r.awin_transaction_id), r);
      }
    }
  }

  for (const r of merged.values()) {
    const key = matchKnownSlug(r.go_link_slug, r.click_ref, allSlugs);
    if (!key) continue;
    const ownerPid = slugToPublisher.get(key);
    if (!ownerPid) continue;
    const slugSetForOwner = publisherSlugSets.get(ownerPid);
    if (!slugSetForOwner) continue;
    /** Rows already keyed to this publisher are summed in `payoutAndSaleForPublisherIdsFromTransactions`. */
    if (r.publisher_id && normPubId(r.publisher_id) === normPubId(ownerPid)) continue;
    if (!publisherOwnsAwinTransactionRow(r, ownerPid, slugSetForOwner)) continue;

    const cc = (r.commission_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
    const sc = (r.sale_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();

    const payoutPrev = payoutByPublisher.get(ownerPid) ?? {};
    payoutPrev[cc] = (payoutPrev[cc] ?? 0) + Number(r.commission_amount ?? 0);
    payoutByPublisher.set(ownerPid, payoutPrev);

    const salePrev = saleByPublisher.get(ownerPid) ?? {};
    salePrev[sc] = (salePrev[sc] ?? 0) + Number(r.sale_amount ?? 0);
    saleByPublisher.set(ownerPid, salePrev);
  }

  return { payoutByPublisher, saleByPublisher };
}

/** Inclusive rolling window in UTC: `days` calendar days ending today. */
export function rollingUtcWindowDays(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

/**
 * Sums transactions in `awin_transactions` whose `transaction_date` falls in [start, end] (UTC instants).
 * Paginated for large windows.
 */
export async function aggregateAwinTransactionsInRange(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{
  countAll: number;
  countAttributed: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
}> {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  let countAll = 0;
  let countAttributed = 0;
  const saleByCurrency: Record<string, number> = {};
  const commissionByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount, sale_currency, sale_amount")
      .gte("transaction_date", startIso)
      .lte("transaction_date", endIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id?: string | null;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      countAll += 1;
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      const c = Number(r.commission_amount ?? 0);
      const s = Number(r.sale_amount ?? 0);
      commissionByCurrency[cc] = (commissionByCurrency[cc] ?? 0) + c;
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + s;
      if (r.publisher_id) countAttributed += 1;
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { countAll, countAttributed, saleByCurrency, commissionByCurrency };
}
