import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  payoutAndSaleForPublisherIdsFromTransactions,
  slugLinkedPayoutAndSaleForPublisherIds,
} from "@/lib/awin/aggregate-from-transactions";

function parseNonNegativeInt(raw: string | null, fallback: number): number {
  const n = Number(raw ?? "");
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function sumCurrencyMap(m: Record<string, number>): number {
  return Object.values(m).reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0);
}

function mergeCurrencyMaps(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (!Number.isFinite(v)) continue;
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const limit = clamp(parseNonNegativeInt(url.searchParams.get("limit"), 25), 1, 100);
    const offset = parseNonNegativeInt(url.searchParams.get("offset"), 0);

    const { data, error, count } = await supabase
      .from("profiles")
      .select(
        "id, username, email, role, company_name, website, payment_email, city, country, approval_status, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const pageProfiles = (data ?? []) as { id: string; role?: string | null }[];
    const publisherIds = pageProfiles.filter((p) => p.role === "publisher").map((p) => p.id);

    const payoutByPublisher = new Map<string, Record<string, number>>();
    const salesByPublisher = new Map<string, Record<string, number>>();

    // Only aggregate rollups for publishers on the current page.
    if (publisherIds.length > 0) {
      const { data: rollupRows, error: rollupError } = await supabase
        .from("publisher_earnings_daily")
        .select("publisher_id, currency, commission_total, sale_total")
        .in("publisher_id", publisherIds);

      if (rollupError) {
        return NextResponse.json({ error: rollupError.message }, { status: 500 });
      }

      type RollupRow = {
        publisher_id: string;
        currency: string | null;
        commission_total: number | string | null;
        sale_total: number | string | null;
      };
      for (const r of (rollupRows ?? []) as RollupRow[]) {
        const pid = r.publisher_id;
        if (!pid) continue;
        const cur = (r.currency ?? "GBP").toUpperCase();
        const payoutPrev = payoutByPublisher.get(pid) ?? {};
        payoutPrev[cur] = (payoutPrev[cur] ?? 0) + Number(r.commission_total ?? 0);
        payoutByPublisher.set(pid, payoutPrev);
        const salePrev = salesByPublisher.get(pid) ?? {};
        salePrev[cur] = (salePrev[cur] ?? 0) + Number(r.sale_total ?? 0);
        salesByPublisher.set(pid, salePrev);
      }

      let liveByPub: Awaited<ReturnType<typeof payoutAndSaleForPublisherIdsFromTransactions>> | null = null;
      let slugByPub: Awaited<ReturnType<typeof slugLinkedPayoutAndSaleForPublisherIds>> | null = null;
      const ensureTxnFallbacks = async () => {
        if (liveByPub && slugByPub) return;
        const [live, slug] = await Promise.all([
          payoutAndSaleForPublisherIdsFromTransactions(supabase, publisherIds),
          slugLinkedPayoutAndSaleForPublisherIds(supabase, publisherIds),
        ]);
        liveByPub = live;
        slugByPub = slug;
      };

      for (const pid of publisherIds) {
        const rp = payoutByPublisher.get(pid) ?? {};
        const rs = salesByPublisher.get(pid) ?? {};
        if (sumCurrencyMap(rp) + sumCurrencyMap(rs) > 0) continue;
        await ensureTxnFallbacks();
        const mergedP = mergeCurrencyMaps(
          liveByPub!.payoutByPublisher.get(pid) ?? {},
          slugByPub!.payoutByPublisher.get(pid) ?? {}
        );
        const mergedS = mergeCurrencyMaps(
          liveByPub!.saleByPublisher.get(pid) ?? {},
          slugByPub!.saleByPublisher.get(pid) ?? {}
        );
        if (sumCurrencyMap(mergedP) + sumCurrencyMap(mergedS) > 0) {
          payoutByPublisher.set(pid, mergedP);
          salesByPublisher.set(pid, mergedS);
        }
      }
    }

    const signups = (data ?? []).map((p) => ({
      ...p,
      payout_totals: payoutByPublisher.get(p.id as string) ?? {},
      sale_totals: salesByPublisher.get(p.id as string) ?? {},
    }));

    return NextResponse.json({ signups, total: count ?? 0, limit, offset });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
