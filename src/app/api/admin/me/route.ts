import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
