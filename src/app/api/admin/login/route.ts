import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, adminRequestIsAuthorized, signAdminToken } from "@/lib/admin-session";

const ADMIN_PASSWORD = "admin*123";
const SEVEN_DAYS = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = signAdminToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SEVEN_DAYS,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
