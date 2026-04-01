import { NextResponse } from "next/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";

export async function GET() {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? null;
  const impersonateId = cookieStore.get("impersonate_publisher_id")?.value?.trim() ?? "";
  const impersonating = Boolean(adminToken && verifyAdminToken(adminToken) && impersonateId && impersonateId === pub.userId);

  return NextResponse.json({
    ok: true,
    userId: pub.userId,
    username: pub.username,
    email: pub.email,
    role: "publisher",
    impersonating,
  });
}

