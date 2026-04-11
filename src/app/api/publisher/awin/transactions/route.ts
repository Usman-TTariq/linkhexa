import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { fetchAwinTransactionsRange, parseAwinTransactionRow } from "@/lib/awin/transactions";
import { isAwinConfigured } from "@/lib/awin/client";

const MAX_LIMIT = 50;
const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

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

async function publisherSlugSet(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("publisher_go_links").select("slug").eq("publisher_id", userId);
  return new Set((data ?? []).map((r: { slug?: string }) => String(r.slug ?? "").trim()).filter(Boolean));
}

/**
 * GET: This publisher's attributed rows from awin_transactions.
 */
export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 25));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const fromD = parseDateBoundary(url.searchParams.get("from"), false);
  const toD = parseDateBoundary(url.searchParams.get("to"), true);

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("awin_transactions")
    .select(
      "awin_transaction_id, advertiser_id, commission_status, commission_amount, commission_currency, sale_amount, sale_currency, transaction_date, click_ref, go_link_slug, synced_at",
      { count: "exact" }
    )
    .eq("publisher_id", pub.userId)
    .order("transaction_date", { ascending: false });

  if (fromD) q = q.gte("transaction_date", fromD.toISOString());
  if (toD) q = q.lte("transaction_date", toD.toISOString());

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    source: "database" as const,
    rows: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}

type LiveBody = { start?: string; end?: string };

/**
 * POST: Live Awin publisher transactions API, filtered to rows whose click ref matches this publisher's link slugs.
 */
export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  if (!isAwinConfigured()) {
    return NextResponse.json({ error: "Awin is not configured on the server" }, { status: 503 });
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

  const supabase = createServerSupabaseClient();
  const slugs = await publisherSlugSet(supabase, pub.userId);
  if (slugs.size === 0) {
    return NextResponse.json({
      source: "awin_api" as const,
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
      count: 0,
      rows: [] as ReturnType<typeof parseAwinTransactionRow>[],
      notice: "Create at least one tracking link so your click ref can match Awin transactions.",
    });
  }

  let raw: unknown[];
  try {
    raw = await fetchAwinTransactionsRange({ startDate: start, endDate: end, timezone: "UTC" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Awin request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const parsed = raw
    .map(parseAwinTransactionRow)
    .filter((x): x is NonNullable<typeof x> => x != null)
    .filter((row) => {
      const ref = row.clickRef?.trim();
      return Boolean(ref && slugs.has(ref));
    });

  return NextResponse.json({
    source: "awin_api" as const,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    count: parsed.length,
    rows: parsed,
  });
}
