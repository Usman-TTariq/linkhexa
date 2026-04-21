import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { collectAttributedDbTransactions } from "@/lib/publisher/collect-attributed-db-transactions";

const PROGRAMME_ID_IN_CHUNK = 200;

function parseDateBoundary(s: string | null, endOfDay: boolean): Date | null {
  if (!s?.trim()) return null;
  const d = new Date(s.trim());
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) {
    d.setUTCHours(23, 59, 59, 999);
  } else {
    d.setUTCHours(0, 0, 0, 0);
  }
  return d;
}

function addMoney(bucket: Record<string, number>, currency: string | null | undefined, amount: number) {
  const c = (currency ?? "GBP").toUpperCase().trim() || "GBP";
  bucket[c] = (bucket[c] ?? 0) + (Number.isFinite(amount) ? amount : 0);
}

function scoreAdvertiser(a: { sales: number; commissionByCurrency: Record<string, number> }): number {
  const comm = Object.values(a.commissionByCurrency).reduce((s, v) => s + v, 0);
  return a.sales * 1e6 + comm;
}

async function fetchProgrammeNameMap(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  programmeIds: number[]
): Promise<Map<number, string>> {
  const ids = [...new Set(programmeIds.filter((x) => Number.isFinite(x)))];
  const out = new Map<number, string>();
  for (let i = 0; i < ids.length; i += PROGRAMME_ID_IN_CHUNK) {
    const chunk = ids.slice(i, i + PROGRAMME_ID_IN_CHUNK);
    const { data, error } = await supabase.from("awin_programmes").select("programme_id, name").in("programme_id", chunk);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) out.set(Number(r.programme_id), String(r.name ?? ""));
  }
  return out;
}

type LinkRow = {
  slug: string;
  click_count: number | null;
  programme_id: number;
  awin_programmes: { name?: string | null } | null;
};

type Agg = {
  sales: number;
  revenueByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

/**
 * Aggregated advertiser (programme) performance for the **signed-in publisher only**.
 * Transactions come from `collectAttributedDbTransactions` (same attribution as the dashboard — not raw Awin “whole account” totals).
 *
 * Query: `from` and `to` as YYYY-MM-DD (optional; defaults to last 365 days UTC).
 */
export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const url = new URL(request.url);
  const toD = parseDateBoundary(url.searchParams.get("to"), true) ?? (() => {
    const d = new Date();
    d.setUTCHours(23, 59, 59, 999);
    return d;
  })();
  let fromD = parseDateBoundary(url.searchParams.get("from"), false);
  if (!fromD) {
    const d = new Date(toD);
    d.setUTCDate(d.getUTCDate() - 364);
    d.setUTCHours(0, 0, 0, 0);
    fromD = d;
  }
  if (fromD.getTime() > toD.getTime()) {
    return NextResponse.json({ error: "from must be on or before to" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const [{ data: linkRows, error: linkErr }, txns] = await Promise.all([
    supabase
      .from("publisher_go_links")
      .select("slug, click_count, programme_id, awin_programmes(name)")
      .eq("publisher_id", pub.userId),
    collectAttributedDbTransactions(supabase, pub.userId, fromD, toD),
  ]);

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  const links = (linkRows ?? []) as unknown as LinkRow[];

  const clicksByProgramme = new Map<number, number>();
  const slugsByProgramme = new Map<number, string[]>();
  const nameFromLinks = new Map<number, string>();

  for (const l of links) {
    const pid = Number(l.programme_id);
    if (!Number.isFinite(pid)) continue;
    clicksByProgramme.set(pid, (clicksByProgramme.get(pid) ?? 0) + Number(l.click_count ?? 0));
    const sl = String(l.slug ?? "").trim();
    if (sl) {
      const arr = slugsByProgramme.get(pid) ?? [];
      if (!arr.includes(sl)) arr.push(sl);
      slugsByProgramme.set(pid, arr);
    }
    const ap = l.awin_programmes as { name?: string | null } | null | undefined;
    const nm = ap?.name?.trim();
    if (nm) nameFromLinks.set(pid, nm);
  }

  const kpiRevenueByCurrency: Record<string, number> = {};
  const kpiCommissionByCurrency: Record<string, number> = {};

  const byAdvertiser = new Map<number, Agg>();

  for (const r of txns) {
    addMoney(kpiCommissionByCurrency, r.commission_currency, Number(r.commission_amount ?? 0));
    addMoney(kpiRevenueByCurrency, r.sale_currency, Number(r.sale_amount ?? 0));

    const aid = r.advertiser_id;
    if (aid == null || !Number.isFinite(Number(aid))) continue;
    const id = Number(aid);
    const cur = byAdvertiser.get(id) ?? {
      sales: 0,
      revenueByCurrency: {},
      commissionByCurrency: {},
    };
    cur.sales += 1;
    addMoney(cur.revenueByCurrency, r.sale_currency, Number(r.sale_amount ?? 0));
    addMoney(cur.commissionByCurrency, r.commission_currency, Number(r.commission_amount ?? 0));
    byAdvertiser.set(id, cur);
  }

  const programmeIds = [...new Set([...clicksByProgramme.keys(), ...byAdvertiser.keys()])].sort((a, b) => a - b);
  let nameMap = new Map<number, string>();
  try {
    nameMap = await fetchProgrammeNameMap(supabase, programmeIds);
  } catch {
    // non-fatal
  }

  const advertisers = programmeIds.map((advertiserId) => {
    const agg = byAdvertiser.get(advertiserId) ?? {
      sales: 0,
      revenueByCurrency: {},
      commissionByCurrency: {},
    };
    const slugs = slugsByProgramme.get(advertiserId) ?? [];
    const code = slugs.length <= 2 ? slugs.join(", ") : `${slugs.slice(0, 2).join(", ")} +${slugs.length - 2}`;
    const name =
      nameFromLinks.get(advertiserId) ||
      nameMap.get(advertiserId)?.trim() ||
      `Programme ${advertiserId}`;
    return {
      advertiserId,
      name,
      network: "Awin" as const,
      code: code || "—",
      clicks: clicksByProgramme.get(advertiserId) ?? 0,
      sales: agg.sales,
      leads: 0,
      revenueByCurrency: agg.revenueByCurrency,
      commissionByCurrency: agg.commissionByCurrency,
    };
  });

  advertisers.sort((a, b) => scoreAdvertiser(b) - scoreAdvertiser(a));

  const totalClicks = [...clicksByProgramme.values()].reduce((s, v) => s + v, 0);

  const distinctSlugs = new Set(links.map((l) => String(l.slug ?? "").trim()).filter(Boolean)).size;

  let dbTransactionsWithPublisherIdInRange: number | null = null;
  try {
    let q = supabase
      .from("awin_transactions")
      .select("awin_transaction_id", { count: "exact", head: true })
      .eq("publisher_id", pub.userId);
    if (fromD) q = q.gte("transaction_date", fromD.toISOString());
    if (toD) q = q.lte("transaction_date", toD.toISOString());
    const { count, error } = await q;
    if (!error) dbTransactionsWithPublisherIdInRange = count ?? 0;
  } catch {
    dbTransactionsWithPublisherIdInRange = null;
  }

  return NextResponse.json({
    from: fromD.toISOString().slice(0, 10),
    to: toD.toISOString().slice(0, 10),
    /** Same publisher as session; row count of attributed txns in range */
    attributedTransactionCount: txns.length,
    kpis: {
      totalClicks,
      sales: txns.length,
      leads: 0,
      revenueByCurrency: kpiRevenueByCurrency,
      commissionByCurrency: kpiCommissionByCurrency,
    },
    advertisers,
    diagnostics: {
      trackingLinkCount: links.length,
      distinctSlugs,
      /** Rows your publisher can read after merge + ownership filter (same as table “Sales”) */
      attributedTransactionsInRange: txns.length,
      /** Raw DB count where `publisher_id` = you (ignores slug-only path); if this is 0, sync never attributed you */
      dbTransactionsWithPublisherIdInRange,
    },
  });
}
