import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncAwinTransactionsToDatabase } from "@/lib/awin/sync-transactions";
import { isAwinConfigured } from "@/lib/awin/client";

/** Manual sync from admin UI or tools. */
export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  if (!isAwinConfigured()) {
    return NextResponse.json({ error: "Awin is not configured on the server" }, { status: 503 });
  }

  const supabase = createServerSupabaseClient();
  let body: { start?: string; end?: string } = {};
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      body = (await request.json()) as typeof body;
    }
  } catch {
    body = {};
  }

  const start = body.start ? new Date(body.start) : undefined;
  const end = body.end ? new Date(body.end) : undefined;
  if (start && Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }
  if (end && Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
  }

  const result = await syncAwinTransactionsToDatabase(supabase, { start, end });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json(result);
}
