import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { fetchAwinProgrammes } from "@/lib/awin/client";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const MIN_LIMIT = 6;
const PROGRAMME_ID_IN_CHUNK = 200;

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit));
  const qRaw = (searchParams.get("q") || "").trim();
  const q = qRaw.toLowerCase();
  const scope = searchParams.get("scope") === "approved" ? "approved" : "all";

  let joinedIds: number[] = [];
  try {
    const joined = await fetchAwinProgrammes({ relationship: "joined" });
    joinedIds = [...new Set(joined.map((p) => p.id))];
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not load your joined programmes from Awin. Check API token and try again.", detail: msg },
      { status: 502 }
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: apps, error: aErr } = await supabase
    .from("publisher_awin_applications")
    .select("programme_id, status")
    .eq("publisher_id", pub.userId);

  if (aErr) {
    return NextResponse.json({ error: aErr.message }, { status: 500 });
  }

  if (joinedIds.length === 0) {
    return NextResponse.json({
      brands: [],
      pagination: { page: 1, limit, total: 0, totalPages: 1 },
      joinedOnAwinCount: 0,
      inSyncCacheCount: 0,
    });
  }

  type ProgRow = {
    programme_id: number;
    name: string;
    display_url: string | null;
    logo_url: string | null;
    description: string | null;
    programme_status: string | null;
  };
  const programmes: ProgRow[] = [];
  for (let i = 0; i < joinedIds.length; i += PROGRAMME_ID_IN_CHUNK) {
    const chunk = joinedIds.slice(i, i + PROGRAMME_ID_IN_CHUNK);
    const { data: part, error: pErr } = await supabase
      .from("awin_programmes")
      .select("programme_id, name, display_url, logo_url, description, programme_status")
      .in("programme_id", chunk)
      .order("name", { ascending: true });
    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }
    programmes.push(...(part ?? []));
  }
  programmes.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }));

  const byProgramme = new Map<number, string>();
  for (const a of apps ?? []) {
    byProgramme.set(Number(a.programme_id), a.status as string);
  }

  const brands = programmes.map((row) => {
    const programmeId = Number(row.programme_id);
    const applicationStatus = byProgramme.get(programmeId);
    let uiStatus: "not_applied" | "pending" | "approved" | "rejected";
    if (!applicationStatus) uiStatus = "not_applied";
    else if (applicationStatus === "pending") uiStatus = "pending";
    else if (applicationStatus === "approved") uiStatus = "approved";
    else uiStatus = "rejected";

    return {
      programmeId,
      name: row.name,
      displayUrl: row.display_url,
      logoUrl: row.logo_url,
      description: row.description,
      programmeStatus: row.programme_status,
      applicationStatus: uiStatus,
    };
  });

  let list = brands;
  if (scope === "approved") {
    list = brands.filter((b) => b.applicationStatus === "approved");
  }
  if (q) {
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.displayUrl || "").toLowerCase().includes(q) ||
        String(b.programmeId).includes(qRaw)
    );
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * limit;
  const pageItems = list.slice(from, from + limit);

  return NextResponse.json({
    brands: pageItems,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      rangeFrom: total === 0 ? 0 : from + 1,
      rangeTo: total === 0 ? 0 : Math.min(from + pageItems.length, total),
    },
    joinedOnAwinCount: joinedIds.length,
    inSyncCacheCount: brands.length,
  });
}
