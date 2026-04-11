import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_BODY = 4000;

/**
 * GET: Recent support threads (latest message per publisher).
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const publisherId = url.searchParams.get("publisherId")?.trim() ?? "";

  const supabase = createServerSupabaseClient();

  if (publisherId) {
    const { data, error } = await supabase
      .from("publisher_support_messages")
      .select("id, body, sender, created_at, publisher_id")
      .eq("publisher_id", publisherId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ messages: data ?? [] });
  }

  const { data: rows, error } = await supabase
    .from("publisher_support_messages")
    .select("id, body, sender, created_at, publisher_id")
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const seen = new Set<string>();
  const threads: { publisherId: string; lastMessage: string; lastAt: string; lastSender: string }[] = [];
  for (const r of rows ?? []) {
    const pid = String((r as { publisher_id?: string }).publisher_id ?? "");
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    threads.push({
      publisherId: pid,
      lastMessage: String((r as { body?: string }).body ?? ""),
      lastAt: String((r as { created_at?: string }).created_at ?? ""),
      lastSender: String((r as { sender?: string }).sender ?? ""),
    });
  }

  return NextResponse.json({ threads });
}

type PostBody = { publisherId?: string; body?: string };

/**
 * POST: Staff reply to a publisher.
 */
export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const publisherId = typeof body.publisherId === "string" ? body.publisherId.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!publisherId) {
    return NextResponse.json({ error: "publisherId is required" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  if (text.length > MAX_BODY) {
    return NextResponse.json({ error: `Message too long (max ${MAX_BODY})` }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", publisherId).maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "Publisher profile not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("publisher_support_messages")
    .insert({
      publisher_id: publisherId,
      body: text,
      sender: "staff",
    })
    .select("id, body, sender, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
