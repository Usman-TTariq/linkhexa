import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "../../require-admin";

const IMPERSONATE_COOKIE = "impersonate_publisher_id";

export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

