"use client";

import PublisherDashboardMain from "@/components/publisher/PublisherDashboardMain";
import { usePublisherDashboardData } from "@/components/publisher/usePublisherDashboardData";

export default function DashboardContent() {
  const d = usePublisherDashboardData();
  const {
    loading,
    profile,
    isPublisher,
    displayName,
    goLinks,
    goLinksLoading,
    goLinksError,
    earnings,
    earningsLoading,
    earningsError,
    primaryCurrency,
    windowTotalCommissionPrimary,
    windowTotalSalePrimary,
    commissionToday,
    commissionLast7,
    commissionLast30,
    saleLast30,
    performanceChartSeries,
    totalLinkClicks,
    topBrandsByClicks,
    newestLinks,
  } = d;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!isPublisher) {
    return (
      <div className="min-h-screen px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1
            className="text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
          >
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">Welcome back{displayName ? `, ${displayName}` : ""}.</p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm">
            {profile && (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Role</dt>
                  <dd className="mt-0.5 font-medium capitalize text-white">{profile.role}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Email</dt>
                  <dd className="mt-0.5 text-white">{profile.email}</dd>
                </div>
              </dl>
            )}
            <p className="mt-6 text-sm text-zinc-500">Publisher analytics layout is available for publisher accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTransactions = earnings?.totals.transactions ?? 0;

  return (
    <PublisherDashboardMain
      displayName={displayName}
      primaryCurrency={primaryCurrency}
      windowTotalCommissionPrimary={windowTotalCommissionPrimary}
      windowTotalSalePrimary={windowTotalSalePrimary}
      totalTransactions={totalTransactions}
      commissionLast30={commissionLast30}
      saleLast30={saleLast30}
      commissionToday={commissionToday}
      commissionLast7={commissionLast7}
      earningsLoading={earningsLoading}
      earningsError={earningsError}
      performanceChartSeries={performanceChartSeries}
      goLinksLoading={goLinksLoading}
      goLinksError={goLinksError}
      goLinks={goLinks}
      totalLinkClicks={totalLinkClicks}
      topBrandsByClicks={topBrandsByClicks}
      newestLinks={newestLinks}
    />
  );
}
