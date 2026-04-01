import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAwinJoinedProgrammesWithStats } from "@/lib/awin/client";

const SELECT_PAGE = 1000;
const DELETE_IN_CHUNK = 200;

async function removeProgrammesNotInSet(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  keepIds: Set<number>
): Promise<number> {
  const allIds: number[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("awin_programmes")
      .select("programme_id")
      .range(from, from + SELECT_PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const r of data) allIds.push(Number(r.programme_id));
    if (data.length < SELECT_PAGE) break;
    from += SELECT_PAGE;
  }

  const toRemove = allIds.filter((id) => !keepIds.has(id));
  let removed = 0;
  for (let i = 0; i < toRemove.length; i += DELETE_IN_CHUNK) {
    const chunk = toRemove.slice(i, i + DELETE_IN_CHUNK);
    const { error } = await supabase.from("awin_programmes").delete().in("programme_id", chunk);
    if (error) throw new Error(error.message);
    removed += chunk.length;
  }
  return removed;
}

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const { relationshipJoinedProgrammes: programmes } = await fetchAwinJoinedProgrammesWithStats();
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    const rows = programmes.map((p) => ({
      programme_id: p.id,
      name: p.name ?? "Unnamed programme",
      description: p.description ?? null,
      display_url: p.displayUrl ?? null,
      logo_url: p.logoUrl ?? null,
      click_through_url: p.clickThroughUrl ?? null,
      currency_code: p.currencyCode ?? null,
      programme_status: p.status ?? null,
      primary_region: p.primaryRegion ?? null,
      synced_at: now,
    }));

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        upserted: 0,
        removed: 0,
        message: "Awin returned no joined programmes (relationship=joined).",
      });
    }

    const { error: upErr } = await supabase.from("awin_programmes").upsert(rows, {
      onConflict: "programme_id",
    });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const keepIds = new Set(programmes.map((p) => p.id));
    const removed = await removeProgrammesNotInSet(supabase, keepIds);

    return NextResponse.json({
      ok: true,
      upserted: rows.length,
      removed,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
