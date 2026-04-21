import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { matchKnownSlug } from "@/lib/awin/slug-match";
import { fetchAwinTransactionsRange, parseAwinTransactionRow } from "@/lib/awin/transactions";
import { isAwinConfigured } from "@/lib/awin/client";

const MAX_LIMIT = 100;
const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;
const TOTALS_PAGE = 500;
const TOTALS_MAX_ROWS = 50_000;
const PROGRAMME_ID_IN_CHUNK = 200;

async function fetchProgrammeNameMap(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  advertiserIds: (number | null | undefined)[]
): Promise<Map<number, string>> {
  const ids = [...new Set(advertiserIds.filter((x): x is number => typeof x === "number" && Number.isFinite(x)))];
  const out = new Map<number, string>();
  for (let i = 0; i < ids.length; i += PROGRAMME_ID_IN_CHUNK) {
    const chunk = ids.slice(i, i + PROGRAMME_ID_IN_CHUNK);
    const { data, error } = await supabase.from("awin_programmes").select("programme_id, name").in("programme_id", chunk);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) out.set(Number(r.programme_id), String(r.name ?? ""));
  }
  return out;
}

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

/**
 * GET: Paginated rows from `awin_transactions` (after sync).
 * Query: limit, offset, from, to (YYYY-MM-DD or ISO), attributedOnly=1
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const attributedOnly = url.searchParams.get("attributedOnly") === "1";
  const goLinkSlugRaw = url.searchParams.get("goLinkSlug")?.trim() ?? "";
  /** Tracking slugs are alphanumeric (see go-links generator); reject anything else. */
  const goLinkSlug = /^[A-Za-z0-9]{6,32}$/.test(goLinkSlugRaw) ? goLinkSlugRaw : "";
  const fromD = parseDateBoundary(url.searchParams.get("from"), false);
  const toD = parseDateBoundary(url.searchParams.get("to"), true);

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("awin_transactions")
    .select(
      "awin_transaction_id, advertiser_id, commission_status, commission_amount, commission_currency, sale_amount, sale_currency, transaction_date, click_ref, publisher_id, go_link_slug, synced_at",
      { count: "exact" }
    )
    .order("transaction_date", { ascending: false });

  if (fromD) q = q.gte("transaction_date", fromD.toISOString());
  if (toD) q = q.lte("transaction_date", toD.toISOString());
  if (attributedOnly) q = q.not("publisher_id", "is", null);
  if (goLinkSlug) {
    q = q.or(`go_link_slug.eq.${goLinkSlug},click_ref.ilike.%${goLinkSlug}%`);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let programmeNames = new Map<number, string>();
  try {
    programmeNames = await fetchProgrammeNameMap(
      supabase,
      (data ?? []).map((r) => (r as { advertiser_id?: number | null }).advertiser_id)
    );
  } catch (e) {
    // Non-fatal: table can still render advertiser ids.
  }

  let filterTotals: {
    commissionByCurrency: Record<string, number>;
    saleByCurrency: Record<string, number>;
    rowCount: number;
    capped: boolean;
  } | null = null;

  if (goLinkSlug) {
    const slugSet = new Set([goLinkSlug]);
    let tq = supabase
      .from("awin_transactions")
      .select(
        "go_link_slug, click_ref, commission_amount, commission_currency, sale_amount, sale_currency, awin_transaction_id"
      )
      .order("transaction_date", { ascending: false })
      .or(`go_link_slug.eq.${goLinkSlug},click_ref.ilike.%${goLinkSlug}%`);

    if (fromD) tq = tq.gte("transaction_date", fromD.toISOString());
    if (toD) tq = tq.lte("transaction_date", toD.toISOString());
    if (attributedOnly) tq = tq.not("publisher_id", "is", null);

    const commissionByCurrency: Record<string, number> = {};
    const saleByCurrency: Record<string, number> = {};
    let rowCount = 0;
    let scanned = 0;
    let off = 0;
    let capped = false;

    while (scanned < TOTALS_MAX_ROWS) {
      const { data: chunk, error: te } = await tq.range(off, off + TOTALS_PAGE - 1);
      if (te) {
        return NextResponse.json({ error: te.message }, { status: 500 });
      }
      if (!chunk?.length) break;

      for (const r of chunk as {
        go_link_slug: string | null;
        click_ref: string | null;
        commission_amount: number | string | null;
        commission_currency: string | null;
        sale_amount: number | string | null;
        sale_currency: string | null;
      }[]) {
        if (!matchKnownSlug(r.go_link_slug, r.click_ref, slugSet)) continue;
        rowCount += 1;
        const cc = (r.commission_currency ?? "GBP").toUpperCase();
        const sc = (r.sale_currency ?? "GBP").toUpperCase();
        commissionByCurrency[cc] =
          (commissionByCurrency[cc] ?? 0) + Number(r.commission_amount ?? 0);
        saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + Number(r.sale_amount ?? 0);
      }

      scanned += chunk.length;
      off += TOTALS_PAGE;
      if (chunk.length < TOTALS_PAGE) break;
    }

    if (scanned >= TOTALS_MAX_ROWS) capped = true;

    filterTotals = { commissionByCurrency, saleByCurrency, rowCount, capped };
  }

  return NextResponse.json({
    source: "database" as const,
    rows: (data ?? []).map((r) => {
      const adv = Number((r as { advertiser_id?: number | null }).advertiser_id ?? NaN);
      const advertiser_name = Number.isFinite(adv) ? programmeNames.get(adv) ?? null : null;
      return { ...r, advertiser_name };
    }),
    total: count ?? 0,
    limit,
    offset,
    goLinkSlug: goLinkSlug || null,
    filterTotals,
  });
}

type LiveBody = { start?: string; end?: string };

/**
 * POST: Same transaction list as Awin publisher UI (GET transactions API), parsed but not written to DB.
 */
export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  if (!isAwinConfigured()) {
    return NextResponse.json({ error: "Awin not configured (AWIN_API_TOKEN, AWIN_PUBLISHER_ID)" }, { status: 503 });
  }

  let body: LiveBody;
  try {
    body = (await request.json()) as LiveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const start = body.start ? new Date(body.start) : null;
  const end = body.end ? new Date(body.end) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "start is required (ISO date)" }, { status: 400 });
  }
  if (!end || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "end is required (ISO date)" }, { status: 400 });
  }
  if (end.getTime() < start.getTime()) {
    return NextResponse.json({ error: "end must be on or after start" }, { status: 400 });
  }
  if (end.getTime() - start.getTime() > MAX_RANGE_MS) {
    return NextResponse.json({ error: "Awin allows at most 31 days per request" }, { status: 400 });
  }

  let raw: unknown[];
  try {
    raw = await fetchAwinTransactionsRange({ startDate: start, endDate: end, timezone: "UTC" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Awin request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const rows = raw.map(parseAwinTransactionRow).filter((x): x is NonNullable<typeof x> => x != null);

  let programmeNames = new Map<number, string>();
  try {
    const supabase = createServerSupabaseClient();
    programmeNames = await fetchProgrammeNameMap(supabase, rows.map((r) => r.advertiserId));
  } catch (e) {
    // Non-fatal.
  }

  return NextResponse.json({
    source: "awin_api" as const,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    count: rows.length,
    rows: rows.map((r) => ({
      ...r,
      advertiserName: r.advertiserId != null ? programmeNames.get(r.advertiserId) ?? null : null,
    })),
  });
}
