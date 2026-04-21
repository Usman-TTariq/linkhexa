import type { SupabaseClient } from "@supabase/supabase-js";
import { publisherOwnsAwinTransactionRow } from "@/lib/awin/aggregate-from-transactions";

export type AttributedDbTxnRow = {
  awin_transaction_id: string;
  publisher_id: string | null;
  advertiser_id: number | null;
  commission_status: string | null;
  commission_amount: number;
  commission_currency: string;
  sale_amount: number;
  sale_currency: string;
  transaction_date: string;
  click_ref: string | null;
  go_link_slug: string | null;
  synced_at: string;
};

const PAGE = 500;
const MERGED_LIST_CAP = 12_000;
const GO_LINK_SLUG_IN_CHUNK = 40;
const SLUG_TXN_QUERY_CONCURRENCY = 8;

export const ATTRIBUTED_TXN_SELECT =
  "awin_transaction_id, publisher_id, advertiser_id, commission_status, commission_amount, commission_currency, sale_amount, sale_currency, transaction_date, click_ref, go_link_slug, synced_at";

function twoYearsAgoUtc(): Date {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 2);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function publisherSlugSet(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("publisher_go_links").select("slug").eq("publisher_id", userId);
  return new Set((data ?? []).map((r: { slug?: string }) => String(r.slug ?? "").trim()).filter(Boolean));
}

/**
 * All attributed `awin_transactions` rows for this publisher (same merge rules as the publisher transactions API).
 * Optional `from` / `to` filter on `transaction_date` (inclusive).
 */
export async function collectAttributedDbTransactions(
  supabase: SupabaseClient,
  userId: string,
  fromD: Date | null,
  toD: Date | null
): Promise<AttributedDbTxnRow[]> {
  const slugSet = await publisherSlugSet(supabase, userId);
  const uniqueSlugs = [...slugSet];

  if (uniqueSlugs.length === 0) {
    let q = supabase
      .from("awin_transactions")
      .select(ATTRIBUTED_TXN_SELECT)
      .eq("publisher_id", userId)
      .order("transaction_date", { ascending: false });

    if (fromD) q = q.gte("transaction_date", fromD.toISOString());
    if (toD) q = q.lte("transaction_date", toD.toISOString());

    const out: AttributedDbTxnRow[] = [];
    let off = 0;
    while (out.length < MERGED_LIST_CAP) {
      const { data, error } = await q.range(off, off + PAGE - 1);
      if (error) throw new Error(error.message);
      if (!data?.length) break;
      out.push(...(data as AttributedDbTxnRow[]));
      off += PAGE;
      if (data.length < PAGE) break;
    }
    return out;
  }

  const scanFrom = fromD ?? twoYearsAgoUtc();
  const fromIso = scanFrom.toISOString();
  const merged = new Map<string, AttributedDbTxnRow>();

  let off = 0;
  let read = 0;
  while (read < MERGED_LIST_CAP) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select(ATTRIBUTED_TXN_SELECT)
      .eq("publisher_id", userId)
      .gte("transaction_date", fromIso)
      .order("transaction_date", { ascending: false })
      .range(off, off + PAGE - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const r of data as AttributedDbTxnRow[]) {
      merged.set(String(r.awin_transaction_id), r);
    }
    read += data.length;
    off += PAGE;
    if (data.length < PAGE) break;
  }

  for (let c = 0; c < uniqueSlugs.length && merged.size < MERGED_LIST_CAP; c += GO_LINK_SLUG_IN_CHUNK) {
    const inChunk = uniqueSlugs.slice(c, c + GO_LINK_SLUG_IN_CHUNK);
    let inOff = 0;
    while (merged.size < MERGED_LIST_CAP) {
      const { data, error } = await supabase
        .from("awin_transactions")
        .select(ATTRIBUTED_TXN_SELECT)
        .gte("transaction_date", fromIso)
        .in("go_link_slug", inChunk)
        .order("transaction_date", { ascending: false })
        .range(inOff, inOff + PAGE - 1);

      if (error) throw new Error(error.message);
      if (!data?.length) break;
      for (const r of data) {
        if (merged.size >= MERGED_LIST_CAP) break;
        merged.set(String((r as AttributedDbTxnRow).awin_transaction_id), r as AttributedDbTxnRow);
      }
      inOff += PAGE;
      if (data.length < PAGE) break;
    }
  }

  for (let i = 0; i < uniqueSlugs.length && merged.size < MERGED_LIST_CAP; i += SLUG_TXN_QUERY_CONCURRENCY) {
    const slice = uniqueSlugs.slice(i, i + SLUG_TXN_QUERY_CONCURRENCY);
    const pages = await Promise.all(
      slice.map((s) =>
        supabase
          .from("awin_transactions")
          .select(ATTRIBUTED_TXN_SELECT)
          .gte("transaction_date", fromIso)
          .ilike("click_ref", `%${s}%`)
      )
    );
    for (const { data, error } of pages) {
      if (error) continue;
      for (const r of data ?? []) {
        if (merged.size >= MERGED_LIST_CAP) break;
        merged.set(String((r as AttributedDbTxnRow).awin_transaction_id), r as AttributedDbTxnRow);
      }
    }
  }

  let rows = [...merged.values()].filter((r) => publisherOwnsAwinTransactionRow(r, userId, slugSet));

  if (fromD) {
    const t = fromD.getTime();
    rows = rows.filter((r) => new Date(r.transaction_date).getTime() >= t);
  }
  if (toD) {
    const t = toD.getTime();
    rows = rows.filter((r) => new Date(r.transaction_date).getTime() <= t);
  }

  rows.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  return rows;
}
