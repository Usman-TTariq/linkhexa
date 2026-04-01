import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const IMPERSONATE_COOKIE = "impersonate_publisher_id";
const ONE_HOUR = 60 * 60;

export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  let body: { publisherId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const publisherId = typeof body.publisherId === "string" ? body.publisherId.trim() : "";
  if (!publisherId) {
    return NextResponse.json({ error: "publisherId required" }, { status: 400 });
  }

  // Ensure the target is an approved publisher account.
  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, approval_status")
    .eq("id", publisherId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  if (profile.role !== "publisher") return NextResponse.json({ error: "Target is not a publisher" }, { status: 400 });
  if (profile.approval_status !== "approved") {
    return NextResponse.json({ error: "Publisher not approved" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, publisherId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_HOUR,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

