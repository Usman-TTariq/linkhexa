import type { SupabaseClient } from "@supabase/supabase-js";
import { expandClickRefVariants, matchKnownSlug, resolvePublisherIdFromClickRef } from "./slug-match";
import { fetchAwinTransactionsRange, parseAwinTransactionRow } from "./transactions";

const OVERLAP_MS = 2 * 24 * 60 * 60 * 1000;
const DEFAULT_BACKFILL_MS = 31 * 24 * 60 * 60 * 1000;

export type SyncAwinTransactionsResult = {
  ok: true;
  rangeStart: string;
  rangeEnd: string;
  fetched: number;
  upserted: number;
  attributed: number;
  unmatched: number;
} | { ok: false; error: string };

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

  const parsed = fetched.map(parseAwinTransactionRow).filter((x): x is NonNullable<typeof x> => x != null);

  const clickRefs = [...new Set(parsed.map((p) => p.clickRef).filter((c): c is string => Boolean(c)))];
  const slugCandidates = new Set<string>();
  for (const ref of clickRefs) {
    for (const c of expandClickRefVariants(ref)) {
      if (/^[A-Za-z0-9]{6,32}$/.test(c)) slugCandidates.add(c);
    }
  }
  const slugToPublisher = new Map<string, string>();

  const slugList = [...slugCandidates];
  if (slugList.length > 0) {
    const chunk = 200;
    for (let i = 0; i < slugList.length; i += chunk) {
      const part = slugList.slice(i, i + chunk);
      const { data: rows } = await supabase
        .from("publisher_go_links")
        .select("slug, publisher_id")
        .in("slug", part);
      for (const row of rows ?? []) {
        const slug = row.slug as string;
        const pid = row.publisher_id as string;
        if (slug && pid) slugToPublisher.set(slug, pid);
      }
    }
  }

  const knownSlugs = new Set(slugToPublisher.keys());

  let attributed = 0;
  let unmatched = 0;
  const rows = parsed.map((p) => {
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
    const { error } = await supabase.from("awin_transactions").upsert(slice, {
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

  return {
    ok: true,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    fetched: fetched.length,
    upserted,
    attributed,
    unmatched,
  };
}
