import type { SupabaseClient } from "@supabase/supabase-js";
import { matchKnownSlug, resolvePublisherIdFromClickRef } from "./slug-match";
import { fetchAwinTransactionsRange, parseAwinTransactionRow } from "./transactions";
import type { ParsedAwinTransaction } from "./transactions";

const OVERLAP_MS = 2 * 24 * 60 * 60 * 1000;
const DEFAULT_BACKFILL_MS = 31 * 24 * 60 * 60 * 1000;

const GO_SHORT_IN_JSON_RE = /\/go\/short\/([A-Za-z0-9]{6,32})\b/gi;

function toFiniteNumberId(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === "bigint") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

type LinkForWinner = { publisher_id: string; slug: string; click_count: number };

function pickPublisherSlugFromLinks(list: LinkForWinner[]): { publisher_id: string; slug: string } | null {
  if (!list.length) return null;
  const scoreByPub = new Map<string, number>();
  const slugsByPub = new Map<string, string[]>();
  for (const l of list) {
    scoreByPub.set(l.publisher_id, (scoreByPub.get(l.publisher_id) ?? 0) + l.click_count);
    const arr = slugsByPub.get(l.publisher_id) ?? [];
    arr.push(l.slug);
    slugsByPub.set(l.publisher_id, arr);
  }
  let bestPub: string | null = null;
  let bestScore = -1;
  for (const [pid, sc] of scoreByPub) {
    if (sc > bestScore || (sc === bestScore && pid < (bestPub ?? "\uffff"))) {
      bestScore = sc;
      bestPub = pid;
    }
  }
  if (!bestPub) return null;
  const slug = [...new Set(slugsByPub.get(bestPub) ?? [])].sort()[0];
  if (!slug) return null;
  return { publisher_id: bestPub, slug };
}

type GoLinkRow = {
  slug?: string;
  publisher_id?: string;
  programme_id?: number | string;
  click_count?: number | string | null;
};

/**
 * All go-links: slug canon for JSON inference, full slug→publisher for attribution,
 * and per-programme fallback target when Awin omits click ref (winner = highest sum of
 * `click_count` among publishers on that programme; ties → lexicographically smallest `publisher_id`).
 */
async function loadPublisherGoLinkContext(supabase: SupabaseClient): Promise<{
  slugCanon: Map<string, string>;
  slugToPublisher: Map<string, string>;
  /** Awin advertiser/programme id → default publisher + slug for orphan transactions */
  programmeAttributionFallback: Map<number, { publisher_id: string; slug: string }>;
}> {
  const slugCanon = new Map<string, string>();
  const slugToPublisher = new Map<string, string>();
  /** programme_id → list of links (for fallback winner pick) */
  const programmeLinks = new Map<number, { publisher_id: string; slug: string; click_count: number }[]>();
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("publisher_go_links")
      .select("slug, publisher_id, programme_id, click_count")
      .range(from, from + PAGE - 1);
    if (error || !data?.length) break;
    for (const r of data as GoLinkRow[]) {
      const slug = String(r.slug ?? "").trim();
      const pub = String(r.publisher_id ?? "").trim();
      const prog = toFiniteNumberId(r.programme_id);
      const clicks = Number(r.click_count ?? 0);
      if (slug.length >= 6 && pub) {
        slugCanon.set(slug.toLowerCase(), slug);
        slugToPublisher.set(slug, pub);
      }
      if (prog != null && pub && slug.length >= 6) {
        const list = programmeLinks.get(prog) ?? [];
        list.push({ publisher_id: pub, slug, click_count: Number.isFinite(clicks) ? clicks : 0 });
        programmeLinks.set(prog, list);
      }
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const programmeAttributionFallback = new Map<number, { publisher_id: string; slug: string }>();
  for (const [prog, list] of programmeLinks) {
    const picked = pickPublisherSlugFromLinks(list);
    if (!picked) continue;
    programmeAttributionFallback.set(prog, picked);
  }

  return { slugCanon, slugToPublisher, programmeAttributionFallback };
}

/** When Awin omits `clickRefs`, recover slug if any JSON field contains `/go/short/{slug}` for a known link. */
function inferClickRefFromPayload(raw: unknown, slugCanon: Map<string, string>): string | null {
  if (slugCanon.size === 0) return null;
  try {
    const s = JSON.stringify(raw);
    let m: RegExpExecArray | null;
    GO_SHORT_IN_JSON_RE.lastIndex = 0;
    while ((m = GO_SHORT_IN_JSON_RE.exec(s)) !== null) {
      const canon = slugCanon.get(m[1].toLowerCase());
      if (canon) return canon;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export type SyncAwinTransactionsResult = {
  ok: true;
  rangeStart: string;
  rangeEnd: string;
  fetched: number;
  upserted: number;
  attributed: number;
  unmatched: number;
  /** Rows updated after Awin upsert: programme fallback (click-weighted), `click_ref` was empty */
  fallbackAttributed: number;
  /** Transactions still without `click_ref` after sync + fallback */
  stillWithoutClickRef: number;
} | { ok: false; error: string };

type UpsertTxnRow = {
  awin_transaction_id: string;
  advertiser_id: number | null;
  commission_status: string | null;
  commission_amount: number;
  commission_currency: string;
  sale_amount: number;
  sale_currency: string;
  transaction_date: string;
  click_ref: string | null;
  publisher_id: string | null;
  go_link_slug: string | null;
  synced_at: string;
  manually_assigned_at?: string | null;
  manually_assigned_by?: string | null;
};

type DbAttributionOnly = {
  click_ref: string | null;
  publisher_id: string | null;
  go_link_slug: string | null;
  manually_assigned_at?: string | null;
  manually_assigned_by?: string | null;
};

/** If DB already has attribution (fallback / prior sync) and Awin sends nulls, keep DB values. */
function mergePreserveAttributionFromDb(row: UpsertTxnRow, existing: DbAttributionOnly | undefined): UpsertTxnRow {
  if (!existing) return row;
  if (existing.manually_assigned_at) {
    return {
      ...row,
      click_ref: existing.click_ref ?? row.click_ref,
      publisher_id: existing.publisher_id ?? row.publisher_id,
      go_link_slug: existing.go_link_slug ?? row.go_link_slug,
      manually_assigned_at: existing.manually_assigned_at,
      manually_assigned_by: existing.manually_assigned_by ?? null,
    };
  }
  const hadDb =
    (typeof existing.click_ref === "string" && existing.click_ref.trim() !== "") ||
    existing.publisher_id != null ||
    (typeof existing.go_link_slug === "string" && existing.go_link_slug.trim() !== "");
  if (!hadDb) return row;
  const incoming =
    (row.click_ref != null && String(row.click_ref).trim() !== "") ||
    row.publisher_id != null ||
    (row.go_link_slug != null && String(row.go_link_slug).trim() !== "");
  if (incoming) return row;
  return {
    ...row,
    click_ref: existing.click_ref ?? row.click_ref,
    publisher_id: existing.publisher_id ?? row.publisher_id,
    go_link_slug: existing.go_link_slug ?? row.go_link_slug,
  };
}

function toIsoBoundary(d: Date, endOfDay: boolean): Date {
  const x = new Date(d);
  if (endOfDay) {
    x.setUTCHours(23, 59, 59, 999);
  } else {
    x.setUTCHours(0, 0, 0, 0);
  }
  return x;
}

/**
 * Pulls Awin transactions for a bounded UTC window, upserts into `awin_transactions`,
 * resolves `publisher_id` via `publisher_go_links.slug = click_ref`, refreshes daily rollup.
 */
export async function syncAwinTransactionsToDatabase(
  supabase: SupabaseClient,
  options?: { start?: Date; end?: Date }
): Promise<SyncAwinTransactionsResult> {
  const end = options?.end ? toIsoBoundary(options.end, true) : toIsoBoundary(new Date(), true);

  let start: Date;
  if (options?.start) {
    start = toIsoBoundary(options.start, false);
  } else {
    const { data: state } = await supabase
      .from("awin_transaction_sync_state")
      .select("last_window_end")
      .eq("id", "default")
      .maybeSingle();

    const lastEnd = state?.last_window_end ? new Date(String(state.last_window_end)) : null;
    if (lastEnd && !Number.isNaN(lastEnd.getTime())) {
      start = new Date(lastEnd.getTime() - OVERLAP_MS);
    } else {
      start = new Date(end.getTime() - DEFAULT_BACKFILL_MS);
    }
    start = toIsoBoundary(start, false);
  }

  if (start.getTime() > end.getTime()) {
    return { ok: false, error: "start after end" };
  }

  const { slugCanon, slugToPublisher, programmeAttributionFallback } = await loadPublisherGoLinkContext(supabase);

  let fetched: unknown[];
  try {
    fetched = await fetchAwinTransactionsRange({ startDate: start, endDate: end, timezone: "UTC" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Awin fetch failed";
    await supabase.from("awin_transaction_sync_state").upsert(
      {
        id: "default",
        last_error: msg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    return { ok: false, error: msg };
  }

  const parsed: ParsedAwinTransaction[] = [];
  for (const raw of fetched) {
    const p = parseAwinTransactionRow(raw);
    if (!p) continue;
    const inferred = p.clickRef ? null : inferClickRefFromPayload(raw, slugCanon);
    const clickRef = p.clickRef ?? inferred;
    parsed.push({ ...p, clickRef });
  }

  const knownSlugs = new Set(slugToPublisher.keys());

  let attributed = 0;
  let unmatched = 0;
  const rows: UpsertTxnRow[] = parsed.map((p) => {
    const publisherId = resolvePublisherIdFromClickRef(p.clickRef, slugToPublisher);
    const matchedSlug = matchKnownSlug(null, p.clickRef, knownSlugs);
    return {
      awin_transaction_id: p.awinTransactionId,
      advertiser_id: p.advertiserId,
      commission_status: p.commissionStatus,
      commission_amount: p.commissionAmount,
      commission_currency: p.commissionCurrency,
      sale_amount: p.saleAmount,
      sale_currency: p.saleCurrency,
      transaction_date: p.transactionDate,
      click_ref: p.clickRef,
      publisher_id: publisherId,
      go_link_slug: matchedSlug,
      synced_at: new Date().toISOString(),
    };
  });
  for (const p of parsed) {
    const publisherId = resolvePublisherIdFromClickRef(p.clickRef, slugToPublisher);
    if (publisherId) attributed += 1;
    else if (p.clickRef) unmatched += 1;
  }

  let upserted = 0;
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize);
    const ids = slice.map((r) => r.awin_transaction_id);
    const { data: existingRows } = await supabase
      .from("awin_transactions")
      .select("awin_transaction_id, click_ref, publisher_id, go_link_slug, manually_assigned_at, manually_assigned_by")
      .in("awin_transaction_id", ids);

    const existingById = new Map<string, DbAttributionOnly>();
    for (const ex of existingRows ?? []) {
      const row = ex as {
        awin_transaction_id: string;
        click_ref?: string | null;
        publisher_id?: string | null;
        go_link_slug?: string | null;
        manually_assigned_at?: string | null;
        manually_assigned_by?: string | null;
      };
      existingById.set(String(row.awin_transaction_id), {
        click_ref: row.click_ref ?? null,
        publisher_id: row.publisher_id ?? null,
        go_link_slug: row.go_link_slug ?? null,
        manually_assigned_at: row.manually_assigned_at ?? null,
        manually_assigned_by: row.manually_assigned_by ?? null,
      });
    }

    const mergedSlice = slice.map((row) =>
      mergePreserveAttributionFromDb(row, existingById.get(String(row.awin_transaction_id)))
    );

    const { error } = await supabase.from("awin_transactions").upsert(mergedSlice, {
      onConflict: "awin_transaction_id",
    });
    if (error) {
      await supabase.from("awin_transaction_sync_state").upsert(
        {
          id: "default",
          last_error: error.message,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      return { ok: false, error: error.message };
    }
    upserted += slice.length;
  }

  let fallbackAttributed = 0;
  const applyProgrammeFallback = async (clickRefFilter: "null" | "empty") => {
    for (const [advertiserId, { publisher_id, slug }] of programmeAttributionFallback) {
      const payload = {
        click_ref: slug,
        publisher_id,
        go_link_slug: slug,
        synced_at: new Date().toISOString(),
      };
      const run = (advKey: number | string) => {
        let q = supabase
          .from("awin_transactions")
          .update(payload)
          .eq("advertiser_id", advKey)
          .is("manually_assigned_at", null)
          .select("awin_transaction_id");
        if (clickRefFilter === "null") return q.is("click_ref", null);
        return q.eq("click_ref", "");
      };
      let { data, error } = await run(advertiserId);
      if (!error && (!data || data.length === 0)) {
        const second = await run(String(advertiserId));
        data = second.data;
        error = second.error;
      }
      if (!error && data?.length) fallbackAttributed += data.length;
    }
  };
  await applyProgrammeFallback("null");
  await applyProgrammeFallback("empty");

  const { error: rpcErr } = await supabase.rpc("refresh_publisher_earnings_daily");
  if (rpcErr) {
    await supabase.from("awin_transaction_sync_state").upsert(
      {
        id: "default",
        last_error: rpcErr.message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    return { ok: false, error: rpcErr.message };
  }

  await supabase.from("awin_transaction_sync_state").upsert(
    {
      id: "default",
      last_completed_at: new Date().toISOString(),
      last_window_end: end.toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  const { count: nullRefCount } = await supabase
    .from("awin_transactions")
    .select("awin_transaction_id", { count: "exact", head: true })
    .is("click_ref", null);
  const { count: emptyRefCount } = await supabase
    .from("awin_transactions")
    .select("awin_transaction_id", { count: "exact", head: true })
    .eq("click_ref", "");

  return {
    ok: true,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    fetched: fetched.length,
    upserted,
    attributed,
    unmatched,
    fallbackAttributed,
    stillWithoutClickRef: (nullRefCount ?? 0) + (emptyRefCount ?? 0),
  };
}
