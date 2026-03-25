import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const supabase = createServerSupabaseClient();

  const countWhere = async (table: string, filters: Record<string, string>): Promise<number> => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  };

  try {
    const [
      totalUsers,
      publishers,
      advertisers,
      profilesPending,
      profilesApproved,
      profilesRejected,
      trackingLinksCount,
      brandAppsPending,
      brandAppsApproved,
      brandAppsRejected,
      brandAppsTotal,
      programmesCached,
    ] = await Promise.all([
      countWhere("profiles", {}),
      countWhere("profiles", { role: "publisher" }),
      countWhere("profiles", { role: "advertiser" }),
      countWhere("profiles", { approval_status: "pending" }),
      countWhere("profiles", { approval_status: "approved" }),
      countWhere("profiles", { approval_status: "rejected" }),
      countWhere("publisher_go_links", {}),
      countWhere("publisher_awin_applications", { status: "pending" }),
      countWhere("publisher_awin_applications", { status: "approved" }),
      countWhere("publisher_awin_applications", { status: "rejected" }),
      countWhere("publisher_awin_applications", {}),
      countWhere("awin_programmes", {}),
    ]);

    let totalClicks = 0;
    const { data: clickRows, error: clickErr } = await supabase.from("publisher_go_links").select("click_count");
    if (!clickErr && clickRows) {
      totalClicks = clickRows.reduce((s, r) => s + Number((r as { click_count?: number | null }).click_count ?? 0), 0);
    }

    const { data: pendingSignups, error: pendingErr } = await supabase
      .from("profiles")
      .select("id, username, email, role, created_at")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (pendingErr) {
      return NextResponse.json({ error: pendingErr.message }, { status: 500 });
    }

    return NextResponse.json({
      profiles: {
        total: totalUsers,
        publishers,
        advertisers,
        pending: profilesPending,
        approved: profilesApproved,
        rejected: profilesRejected,
      },
      publisherGoLinks: {
        count: trackingLinksCount,
        totalClicks,
      },
      brandApplications: {
        total: brandAppsTotal,
        pending: brandAppsPending,
        approved: brandAppsApproved,
        rejected: brandAppsRejected,
      },
      awinProgrammesCached: programmesCached,
      pendingSignups: pendingSignups ?? [],
      /** No commissions / revenue tables yet — UI shows placeholders. */
      financials: {
        totalPublisherPayoutUsd: 0,
        totalGrossOnLinksUsd: null as number | null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
