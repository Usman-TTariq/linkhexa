import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { publishersPayoutAndSaleFromTransactions } from "@/lib/awin/aggregate-from-transactions";

function parseDays(raw: string | null): number {
  const n = Number(raw ?? "30");
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(366, Math.floor(n));
}

function startDateIso(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

/** Per-publisher commission + sale (gross) totals from `publisher_earnings_daily`, with txn fallback when rollup is empty. */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get("days"));
  const from = startDateIso(days);

  const supabase = createServerSupabaseClient();
  const { data: rows, error } = await supabase
    .from("publisher_earnings_daily")
    .select("publisher_id, currency, commission_total, sale_total")
    .gte("earn_date", from);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type R = {
    publisher_id: string;
    currency: string;
    commission_total: number | string | null;
    sale_total: number | string | null;
  };
  let byPubCommission = new Map<string, Record<string, number>>();
  let byPubSale = new Map<string, Record<string, number>>();
  for (const r of (rows ?? []) as R[]) {
    const pid = r.publisher_id;
    const cur = (r.currency ?? "GBP").toUpperCase();
    const cm = byPubCommission.get(pid) ?? {};
    cm[cur] = (cm[cur] ?? 0) + Number(r.commission_total ?? 0);
    byPubCommission.set(pid, cm);
    const sm = byPubSale.get(pid) ?? {};
    sm[cur] = (sm[cur] ?? 0) + Number(r.sale_total ?? 0);
    byPubSale.set(pid, sm);
  }

  let rollupCommissionSum = 0;
  let rollupSaleSum = 0;
  for (const m of byPubCommission.values()) {
    rollupCommissionSum += Object.values(m).reduce((a, v) => a + v, 0);
  }
  for (const m of byPubSale.values()) {
    rollupSaleSum += Object.values(m).reduce((a, v) => a + v, 0);
  }

  if (rollupCommissionSum === 0 && rollupSaleSum === 0) {
    const live = await publishersPayoutAndSaleFromTransactions(supabase, from);
    if (live.payoutByPublisher.size > 0 || live.saleByPublisher.size > 0) {
      byPubCommission = live.payoutByPublisher;
      byPubSale = live.saleByPublisher;
    }
  }

  const ids = [...new Set([...byPubCommission.keys(), ...byPubSale.keys()])];
  if (ids.length === 0) {
    return NextResponse.json({ from, days, publishers: [] });
  }

  const { data: profiles } = await supabase.from("profiles").select("id, username, email").in("id", ids);

  const profMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const publishers = ids
    .map((id) => {
      const p = profMap.get(id);
      return {
        publisherId: id,
        username: (p?.username as string) ?? "—",
        email: (p?.email as string) ?? "",
        commissionByCurrency: byPubCommission.get(id) ?? {},
        saleByCurrency: byPubSale.get(id) ?? {},
      };
    })
    .sort((a, b) => {
      const sa =
        Object.values(a.commissionByCurrency).reduce((x, y) => x + y, 0) +
        Object.values(a.saleByCurrency).reduce((x, y) => x + y, 0) / 1000;
      const sb =
        Object.values(b.commissionByCurrency).reduce((x, y) => x + y, 0) +
        Object.values(b.saleByCurrency).reduce((x, y) => x + y, 0) / 1000;
      return sb - sa;
    })
    .slice(0, 100);

  return NextResponse.json({ from, days, publishers });
}
