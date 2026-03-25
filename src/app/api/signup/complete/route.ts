import { NextResponse } from "next/server";
import { createServerSupabaseClientFromCookies } from "@/lib/supabase/server-route";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClientFromCookies();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = session.user.id;
    const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;

    const username = pickUsername(typeof body.username === "string" ? body.username : "", session.user.email ?? undefined, meta);
    const roleRaw = body.role === "advertiser" || body.role === "publisher" ? body.role : meta.role;
    const role: Role = roleRaw === "advertiser" ? "advertiser" : "publisher";
    const email =
      (typeof body.email === "string" ? body.email.trim() : "") || session.user.email || "";

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
