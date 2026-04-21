import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { fetchAwinTransactionsRange, parseAwinTransactionRow } from "@/lib/awin/transactions";
import { isAwinConfigured } from "@/lib/awin/client";
import { matchKnownSlug } from "@/lib/awin/slug-match";
import { collectAttributedDbTransactions, publisherSlugSet } from "@/lib/publisher/collect-attributed-db-transactions";

const MAX_LIMIT = 50;
const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;
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
 * GET: This publisher's rows from awin_transactions — attributed to them, or unattributed but matching their go-link slug / click ref.
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

  let rows: Awaited<ReturnType<typeof collectAttributedDbTransactions>>;
  try {
    rows = await collectAttributedDbTransactions(supabase, pub.userId, fromD, toD);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Query failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const total = rows.length;
  const page = rows.slice(offset, offset + limit).map(({ publisher_id: _p, ...rest }) => rest);

  let programmeNames = new Map<number, string>();
  try {
    programmeNames = await fetchProgrammeNameMap(supabase, page.map((r) => r.advertiser_id));
  } catch {
    // Non-fatal.
  }

  return NextResponse.json({
    source: "database" as const,
    rows: page.map((r) => {
      const adv = Number(r.advertiser_id ?? NaN);
      const advertiser_name = Number.isFinite(adv) ? programmeNames.get(adv) ?? null : null;
      return { ...r, advertiser_name };
    }),
    total,
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

  const slugSet = slugs;
  const parsed = raw
    .map(parseAwinTransactionRow)
    .filter((x): x is NonNullable<typeof x> => x != null)
    .filter((row) => matchKnownSlug(null, row.clickRef, slugSet) != null);

  let programmeNames = new Map<number, string>();
  try {
    programmeNames = await fetchProgrammeNameMap(supabase, parsed.map((r) => r.advertiserId));
  } catch {
    // Non-fatal.
  }

  return NextResponse.json({
    source: "awin_api" as const,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    count: parsed.length,
    rows: parsed.map((r) => ({
      ...r,
      advertiserName: r.advertiserId != null ? programmeNames.get(r.advertiserId) ?? null : null,
    })),
  });
}
