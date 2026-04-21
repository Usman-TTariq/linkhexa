import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { publisherEarningsFromTransactions } from "@/lib/awin/aggregate-from-transactions";
import { AWIN_AGG_FALLBACK_CURRENCY } from "@/lib/awin/currency-default";

function parseDays(raw: string | null): number {
  const n = Number(raw ?? "30");
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(800, Math.floor(n));
}

function startDateUtc(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

/**
 * Fast read from `publisher_earnings_daily` (populated by Awin sync).
 */
export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get("days"));
  const from = startDateUtc(days);

  const supabase = createServerSupabaseClient();
  const { data: rows, error } = await supabase
    .from("publisher_earnings_daily")
    .select("earn_date, currency, commission_total, sale_total, txn_count")
    .eq("publisher_id", pub.userId)
    .gte("earn_date", from)
    .order("earn_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type Row = {
    earn_date: string;
    currency: string;
    commission_total: number | string | null;
    sale_total: number | string | null;
    txn_count: number | string | null;
  };

  const list = (rows ?? []) as Row[];

  let commissionByCurrency: Record<string, number> = {};
  let saleByCurrency: Record<string, number> = {};
  let totalTxns = 0;

  let series: {
    date: string;
    currency: string;
    commission: number;
    sale: number;
    transactions: number;
  }[] = [];

  let source: "rollup" | "awin_transactions" = "rollup";
  let reconcileError: string | null = null;

  for (const r of list) {
    const cur = (r.currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
    const c = Number(r.commission_total ?? 0);
    const s = Number(r.sale_total ?? 0);
    const t = Number(r.txn_count ?? 0);
    commissionByCurrency[cur] = (commissionByCurrency[cur] ?? 0) + c;
    saleByCurrency[cur] = (saleByCurrency[cur] ?? 0) + s;
    totalTxns += t;
    series.push({
      date: r.earn_date,
      currency: cur,
      commission: c,
      sale: s,
      transactions: t,
    });
  }

  series.sort((a, b) => a.date.localeCompare(b.date) || a.currency.localeCompare(b.currency));

  /** Rebuild from `awin_transactions` whenever there is activity (slug-matched or attributed). Overrides rollup so the dashboard matches raw sync data. */
  try {
    const live = await publisherEarningsFromTransactions(supabase, pub.userId, from);
    const liveCommissionSum = Object.values(live.commissionByCurrency).reduce((a, b) => a + b, 0);
    if (live.totalTxns > 0 || liveCommissionSum > 0) {
      series = live.series;
      commissionByCurrency = live.commissionByCurrency;
      saleByCurrency = live.saleByCurrency;
      totalTxns = live.totalTxns;
      source = "awin_transactions";
    }
  } catch (e) {
    reconcileError = e instanceof Error ? e.message : "Could not read transactions for earnings";
  }

  let debug: Record<string, unknown> | undefined;
  if (searchParams.get("debug") === "1") {
    const [{ count: attributed }, { count: linkRows }, slugRes, { count: totalAnyPublisher }] = await Promise.all([
      supabase.from("awin_transactions").select("*", { count: "exact", head: true }).eq("publisher_id", pub.userId),
      supabase.from("publisher_go_links").select("*", { count: "exact", head: true }).eq("publisher_id", pub.userId),
      supabase.from("publisher_go_links").select("slug").eq("publisher_id", pub.userId).limit(100),
      supabase.from("awin_transactions").select("*", { count: "exact", head: true }),
    ]);
    const slugs = [...new Set((slugRes.data ?? []).map((x: { slug?: string }) => String(x.slug ?? "").trim()).filter(Boolean))];
    let txnAnyGoSlugCol = 0 as number;
    let txnClickRefLikeFirstSlug = 0 as number;
    if (slugs.length > 0) {
      const { count } = await supabase
        .from("awin_transactions")
        .select("*", { count: "exact", head: true })
        .in("go_link_slug", slugs.slice(0, 40));
      txnAnyGoSlugCol = count ?? 0;
      const first = slugs[0]!;
      const { count: c2 } = await supabase
        .from("awin_transactions")
        .select("*", { count: "exact", head: true })
        .ilike("click_ref", `%${first}%`);
      txnClickRefLikeFirstSlug = c2 ?? 0;
    }
    debug = {
      awinTransactionsWithYourPublisherId: attributed ?? 0,
      yourPublisherGoLinks: linkRows ?? 0,
      awinTransactionsWhereGoLinkSlugInYourSlugs: txnAnyGoSlugCol,
      awinTransactionsClickRefContainsFirstSlug: txnClickRefLikeFirstSlug,
      firstSlugUsedForClickRefProbe: slugs[0] ?? null,
      slugSample: slugs.slice(0, 5),
      /** If 0, nothing has been synced into this DB yet (or wrong Supabase project). */
      awinTransactionsTotalRowsInDatabase: totalAnyPublisher ?? 0,
      responseSource: source,
      reconcileError,
    };
  }

  return NextResponse.json({
    days,
    from,
    series,
    source,
    reconcileError,
    debug,
    totals: {
      commissionByCurrency,
      saleByCurrency,
      transactions: totalTxns,
    },
  });
}
