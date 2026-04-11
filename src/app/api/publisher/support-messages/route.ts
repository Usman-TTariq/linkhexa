import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

const MAX_BODY = 4000;

/**
 * GET: This publisher's support thread (newest last for chat UI — client can reverse).
 */
export async function GET() {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("publisher_support_messages")
    .select("id, body, sender, created_at")
    .eq("publisher_id", pub.userId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json({ messages: [], error: "Support chat is not set up yet (run database migration)." });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}

/**
 * POST: Publisher sends a message.
 */
export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let bodyText: string;
  try {
    const j = (await request.json()) as { body?: string };
    bodyText = typeof j.body === "string" ? j.body.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!bodyText) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }
  if (bodyText.length > MAX_BODY) {
    return NextResponse.json({ error: `Message too long (max ${MAX_BODY} characters)` }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("publisher_support_messages")
    .insert({
      publisher_id: pub.userId,
      body: bodyText,
      sender: "publisher",
    })
    .select("id, body, sender, created_at")
    .single();

  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json({ error: "Support chat is not set up yet (run database migration)." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
