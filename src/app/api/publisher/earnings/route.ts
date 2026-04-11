import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { publisherEarningsFromTransactions } from "@/lib/awin/aggregate-from-transactions";

function parseDays(raw: string | null): number {
  const n = Number(raw ?? "30");
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(366, Math.floor(n));
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

  for (const r of list) {
    const cur = (r.currency ?? "GBP").toUpperCase();
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

  const rollupCommissionSum = Object.values(commissionByCurrency).reduce((a, b) => a + b, 0);
  if (list.length === 0 || rollupCommissionSum === 0) {
    const live = await publisherEarningsFromTransactions(supabase, pub.userId, from);
    if (live.totalTxns > 0) {
      series = live.series;
      commissionByCurrency = live.commissionByCurrency;
      saleByCurrency = live.saleByCurrency;
      totalTxns = live.totalTxns;
      source = "awin_transactions";
    }
  }

  return NextResponse.json({
    days,
    from,
    series,
    source,
    totals: {
      commissionByCurrency,
      saleByCurrency,
      transactions: totalTxns,
    },
  });
}
