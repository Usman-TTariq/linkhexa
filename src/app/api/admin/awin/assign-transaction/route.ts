import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[A-Za-z0-9]{6,32}$/;

type Body = {
  awin_transaction_id?: string;
  publisher_id?: string;
  go_link_slug?: string;
  /** Required when the row already has a publisher (reassign). */
  confirm_reassign?: boolean;
};

/**
 * POST: assign or reassign any `awin_transaction` to a publisher + one of their slugs.
 * Sets `manually_assigned_at` so Awin sync keeps attribution.
 */
export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const txnId = String(body.awin_transaction_id ?? "").trim();
  const publisherId = String(body.publisher_id ?? "").trim();
  const slug = String(body.go_link_slug ?? "").trim();
  const confirmReassign = Boolean(body.confirm_reassign);

  if (!txnId) {
    return NextResponse.json({ error: "awin_transaction_id is required" }, { status: 400 });
  }
  if (!UUID_RE.test(publisherId)) {
    return NextResponse.json({ error: "Invalid publisher_id" }, { status: 400 });
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid go_link_slug" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: existing, error: ge } = await supabase
    .from("awin_transactions")
    .select("awin_transaction_id, publisher_id")
    .eq("awin_transaction_id", txnId)
    .maybeSingle();

  if (ge || !existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const hadPublisher = existing.publisher_id != null && String(existing.publisher_id).trim() !== "";
  if (hadPublisher && !confirmReassign) {
    return NextResponse.json(
      { error: "This row already has a publisher. Send confirm_reassign: true to move it.", code: "CONFIRM_REASSIGN" },
      { status: 400 }
    );
  }

  const { data: profile, error: pe } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", publisherId)
    .maybeSingle();
  if (pe || !profile || profile.role !== "publisher") {
    return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  }

  const { data: link, error: le } = await supabase
    .from("publisher_go_links")
    .select("slug")
    .eq("publisher_id", publisherId)
    .eq("slug", slug)
    .maybeSingle();
  if (le || !link) {
    return NextResponse.json({ error: "That slug does not belong to this publisher" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: updated, error: ue } = await supabase
    .from("awin_transactions")
    .update({
      publisher_id: publisherId,
      go_link_slug: slug,
      click_ref: slug,
      manually_assigned_at: now,
      manually_assigned_by: null,
      synced_at: now,
    })
    .eq("awin_transaction_id", txnId)
    .select("awin_transaction_id")
    .maybeSingle();

  if (ue) {
    return NextResponse.json({ error: ue.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  const { error: rpcErr } = await supabase.rpc("refresh_publisher_earnings_daily");
  if (rpcErr) {
    return NextResponse.json({ error: `Saved but rollup refresh failed: ${rpcErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, awin_transaction_id: txnId, reassign: hadPublisher });
}
