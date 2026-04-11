import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncAwinTransactionsToDatabase } from "@/lib/awin/sync-transactions";
import { isAwinConfigured } from "@/lib/awin/client";

/**
 * Scheduled sync (Vercel Cron, GitHub Actions, etc.).
 * POST with header: Authorization: Bearer <AWIN_SYNC_CRON_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.AWIN_SYNC_CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "AWIN_SYNC_CRON_SECRET is not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization")?.trim() ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAwinConfigured()) {
    return NextResponse.json({ error: "Awin is not configured" }, { status: 503 });
  }

  const supabase = createServerSupabaseClient();
  const result = await syncAwinTransactionsToDatabase(supabase);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json(result);
}
