import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  fetchAwinJoinedProgrammesWithStats,
  type AwinJoinedFetchStats,
} from "@/lib/awin/client";
import type { AwinProgramme } from "@/lib/awin/types";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
/** PostgREST URL length caps out on huge `.in()` lists; joined publishers can have 20k+ IDs. */
const PROGRAMME_ID_IN_CHUNK = 200;

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const viewRaw = searchParams.get("view");
  const view: "active" | "all" | "joined" =
    viewRaw === "all" ? "all" : viewRaw === "joined" ? "joined" : "active";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(10, limit), MAX_LIMIT);

  const supabase = createServerSupabaseClient();

  const { count: totalSynced, error: totalErr } = await supabase
    .from("awin_programmes")
    .select("*", { count: "exact", head: true });

  if (totalErr) {
    return NextResponse.json({ error: totalErr.message }, { status: 500 });
  }

  const { count: activeCatalogueCount, error: activeErr } = await supabase
    .from("awin_programmes")
    .select("*", { count: "exact", head: true })
    .or("programme_status.eq.active,programme_status.eq.Active");

  if (activeErr) {
    return NextResponse.json({ error: activeErr.message }, { status: 500 });
  }

  let joinedOnAwinCount: number | null = null;
  let joinedAwinFetch: AwinJoinedFetchStats | null = null;
  let joinedOnAwinError: string | null = null;
  let joinedOnAwinFetchedAt: string | null = null;
  /** Full merged joined list from Awin (used for joined view rows — no DB sync required). */
  let joinedFromApi: AwinProgramme[] = [];

  try {
    const { relationshipJoinedProgrammes, stats: jStats } = await fetchAwinJoinedProgrammesWithStats();
    joinedFromApi = relationshipJoinedProgrammes;
    joinedAwinFetch = jStats;
    /** Matches GET .../programmes?relationship=joined (unique after pagination), not the includeHidden merge. */
    joinedOnAwinCount = jStats.relationshipUniqueCount;
    joinedOnAwinFetchedAt = new Date().toISOString();
  } catch (e) {
    joinedOnAwinError = e instanceof Error ? e.message : "Could not load joined programmes from Awin";
  }

  /**
   * Optional: chunked DB overlap count (100+ round-trips for large publishers).
   * Only when `overlap=1` — avoids slowing every admin programmes request.
   */
  let joinedPresentInDbCount: number | null = null;
  if (searchParams.get("overlap") === "1" && joinedFromApi.length > 0) {
    const joinedIds = joinedFromApi.map((p) => p.id);
    let sum = 0;
    let jdbErr: Error | null = null;
    for (let i = 0; i < joinedIds.length; i += PROGRAMME_ID_IN_CHUNK) {
      const chunk = joinedIds.slice(i, i + PROGRAMME_ID_IN_CHUNK);
      const { count, error } = await supabase
        .from("awin_programmes")
        .select("*", { count: "exact", head: true })
        .in("programme_id", chunk);
      if (error) {
        jdbErr = new Error(error.message);
        break;
      }
      sum += count ?? 0;
    }
    if (!jdbErr) joinedPresentInDbCount = sum;
  }

  let programmes: {
    programme_id: number;
    name: string;
    display_url: string | null;
    logo_url: string | null;
    programme_status: string | null;
    synced_at: string;
  }[] = [];

  let total = 0;
  let totalPages = 1;
  let safePage = 1;

  if (view === "joined") {
    if (joinedOnAwinError || joinedFromApi.length === 0) {
      total = 0;
      totalPages = 1;
      safePage = 1;
      programmes = [];
    } else {
      const fetchedAt = joinedOnAwinFetchedAt ?? new Date().toISOString();
      const rows = joinedFromApi.map((p) => ({
        programme_id: p.id,
        name: p.name ?? "",
        display_url: p.displayUrl ?? null,
        logo_url: p.logoUrl ?? null,
        programme_status: p.status ?? null,
        synced_at: fetchedAt,
      }));
      rows.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }));
      total = rows.length;
      totalPages = Math.max(1, Math.ceil(total / limit));
      safePage = Math.min(page, totalPages);
      const from = (safePage - 1) * limit;
      programmes = rows.slice(from, from + limit);
    }
  } else {
    total = view === "active" ? activeCatalogueCount ?? 0 : totalSynced ?? 0;
    totalPages = Math.max(1, Math.ceil(total / limit));
    safePage = Math.min(page, totalPages);
    const from = (safePage - 1) * limit;
    const to = from + limit - 1;

    let listQuery = supabase
      .from("awin_programmes")
      .select("programme_id, name, display_url, logo_url, programme_status, synced_at")
      .order("name", { ascending: true });

    if (view === "active") {
      listQuery = listQuery.or("programme_status.eq.active,programme_status.eq.Active");
    }

    const { data, error: listErr } = await listQuery.range(from, to);

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }
    programmes = data ?? [];
  }

  const { count: approvedApplicationCount, error: appCountErr } = await supabase
    .from("publisher_awin_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (appCountErr) {
    return NextResponse.json({ error: appCountErr.message }, { status: 500 });
  }

  let approvedProgrammeCount = 0;
  let afrom = 0;
  const pageSize = 1000;
  const progSet = new Set<number>();
  for (;;) {
    const { data: chunk, error: chErr } = await supabase
      .from("publisher_awin_applications")
      .select("programme_id")
      .eq("status", "approved")
      .range(afrom, afrom + pageSize - 1);
    if (chErr) {
      return NextResponse.json({ error: chErr.message }, { status: 500 });
    }
    if (!chunk?.length) break;
    for (const r of chunk) progSet.add(Number(r.programme_id));
    if (chunk.length < pageSize) break;
    afrom += pageSize;
  }
  approvedProgrammeCount = progSet.size;

  return NextResponse.json({
    programmes,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      view,
    },
    stats: {
      totalSynced: totalSynced ?? 0,
      activeCatalogueCount: activeCatalogueCount ?? 0,
      joinedOnAwinCount,
      joinedAwinFetch,
      joinedPresentInDbCount,
      joinedOnAwinFetchedAt,
      joinedOnAwinError,
      approvedApplicationCount: approvedApplicationCount ?? 0,
      approvedProgrammeCount,
    },
  });
}
