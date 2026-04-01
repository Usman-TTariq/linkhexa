import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClientFromCookies } from "@/lib/supabase/server-route";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type Role = "publisher" | "advertiser";

function pickUsername(bodyUsername: string, sessionEmail: string | undefined, meta: Record<string, unknown>): string {
  const u = bodyUsername.trim();
  if (u) return u;
  const fromMeta = typeof meta.username === "string" ? meta.username.trim() : "";
  if (fromMeta) return fromMeta;
  const local = sessionEmail?.split("@")[0]?.trim();
  if (local) return local;
  return "user";
}

async function resolveUserFromRequest(request: Request): Promise<{ user: User; meta: Record<string, unknown> } | NextResponse> {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (bearer) {
    const anon = createClient(url, anonKey);
    const {
      data: { user },
      error,
    } = await anon.auth.getUser(bearer);
    if (error || !user) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }
    return { user, meta: (user.user_metadata ?? {}) as Record<string, unknown> };
  }

  const supabase = await createServerSupabaseClientFromCookies();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return { user: session.user, meta: (session.user.user_metadata ?? {}) as Record<string, unknown> };
}

export async function POST(request: Request) {
  try {
    const resolved = await resolveUserFromRequest(request);
    if (resolved instanceof NextResponse) return resolved;

    const { user, meta } = resolved;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = user.id;

    const username = pickUsername(typeof body.username === "string" ? body.username : "", user.email ?? undefined, meta);
    const roleRaw = body.role === "advertiser" || body.role === "publisher" ? body.role : meta.role;
    const role: Role = roleRaw === "advertiser" ? "advertiser" : "publisher";
    const email = (typeof body.email === "string" ? body.email.trim() : "") || user.email || "";

    const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() || null : null);
    const strOrMeta = (k: string) => str(k) ?? (typeof meta[k] === "string" ? (meta[k] as string).trim() || null : null);

    const serverSupabase = createServerSupabaseClient();

    const { data: existing } = await serverSupabase.from("profiles").select("approval_status").eq("id", id).maybeSingle();

    let approval_status: "pending" | "approved" | "rejected" = "pending";
    if (existing?.approval_status === "approved" || existing?.approval_status === "rejected") {
      approval_status = existing.approval_status;
    }

    const row = {
      id,
      username,
      role,
      email,
      company_name: strOrMeta("company_name"),
      website: strOrMeta("website"),
      company_description: strOrMeta("company_description"),
      payment_email: strOrMeta("payment_email"),
      tax_id: strOrMeta("tax_id"),
      address: strOrMeta("address"),
      city: strOrMeta("city"),
      country: strOrMeta("country"),
      approval_status,
      updated_at: new Date().toISOString(),
    };

    const { error } = await serverSupabase.from("profiles").upsert(row, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
