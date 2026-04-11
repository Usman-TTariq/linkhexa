import type { SupabaseClient } from "@supabase/supabase-js";
import { syncAwinTransactionsToDatabase } from "./sync-transactions";
import { rollingUtcWindowDays } from "./aggregate-from-transactions";

const DEFAULT_THROTTLE_MS = 15 * 60 * 1000;

function parseThrottleMs(): number {
  const raw = process.env.ADMIN_DASHBOARD_AWIN_SYNC_MINUTES?.trim();
  if (!raw) return DEFAULT_THROTTLE_MS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_THROTTLE_MS;
  return Math.min(120, n) * 60 * 1000;
}

/**
 * Pulls last 30 days from Awin into `awin_transactions` when the admin dashboard loads,
 * throttled so we do not hit the API on every refresh.
 */
export async function maybeSyncAwinOnAdminDashboardLoad(
  supabase: SupabaseClient,
  options: { force: boolean }
): Promise<{ ran: boolean; skippedReason?: string; error?: string }> {
  if (options.force) {
    const { start, end } = rollingUtcWindowDays(30);
    const result = await syncAwinTransactionsToDatabase(supabase, { start, end });
    if (!result.ok) {
      return { ran: true, error: result.error };
    }
    return { ran: true };
  }

  const throttleMs = parseThrottleMs();
  const { data: syncRow } = await supabase
    .from("awin_transaction_sync_state")
    .select("last_completed_at")
    .eq("id", "default")
    .maybeSingle();

  const last = syncRow?.last_completed_at ? new Date(String(syncRow.last_completed_at)).getTime() : 0;
  const now = Date.now();
  if (last > 0 && now - last < throttleMs) {
    return {
      ran: false,
      skippedReason: `Synced ${Math.round((now - last) / 60000)} min ago; next auto-pull in ~${Math.max(1, Math.round((throttleMs - (now - last)) / 60000))} min (or use Sync now).`,
    };
  }

  const { start, end } = rollingUtcWindowDays(30);
  const result = await syncAwinTransactionsToDatabase(supabase, { start, end });
  if (!result.ok) {
    return { ran: true, error: result.error };
  }
  return { ran: true };
}
