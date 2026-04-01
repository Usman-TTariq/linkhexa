import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";

export function requireAdmin(request: Request): NextResponse | null {
  if (!adminRequestIsAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
