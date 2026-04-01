import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let body: { programmeId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const programmeId = typeof body.programmeId === "number" ? body.programmeId : Number(body.programmeId);
  if (!Number.isFinite(programmeId)) {
    return NextResponse.json({ error: "programmeId required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: exists, error: exErr } = await supabase
    .from("awin_programmes")
    .select("programme_id")
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (exErr || !exists) {
    return NextResponse.json(
      {
        error:
          "Programme not in LinkHexa cache. Join it on Awin first, then ask an admin to run Sync joined programmes.",
      },
      { status: 404 }
    );
  }

  const { data: existingApp, error: readErr } = await supabase
    .from("publisher_awin_applications")
    .select("id, status")
    .eq("publisher_id", pub.userId)
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }

  if (existingApp?.status === "pending") {
    return NextResponse.json({ error: "Application already pending" }, { status: 400 });
  }
  if (existingApp?.status === "approved") {
    return NextResponse.json({ error: "Already approved for this brand" }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (existingApp?.status === "rejected") {
    const { error: upErr } = await supabase
      .from("publisher_awin_applications")
      .update({ status: "pending", updated_at: now })
      .eq("id", existingApp.id);

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: "pending" });
  }

  const { error: insErr } = await supabase.from("publisher_awin_applications").insert({
    publisher_id: pub.userId,
    programme_id: programmeId,
    status: "pending",
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
