import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX = 40;

/**
 * GET: publishers for admin pickers (e.g. assign lost transaction).
 * Query: q (optional, matches email or username), limit (default 25, max 40)
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(MAX, Math.max(1, Number(url.searchParams.get("limit")) || 25));

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("profiles")
    .select("id, email, username")
    .eq("role", "publisher")
    .order("created_at", { ascending: false })
    .limit(limit);

  const token = q.slice(0, 80).replace(/[^a-zA-Z0-9@._\-\s]/g, "");
  if (token.replace(/\s+/g, "").length >= 2) {
    const t = token.trim().replace(/\s+/g, "%");
    query = query.or(`email.ilike.%${t}%,username.ilike.%${t}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ publishers: data ?? [] });
}
