"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type DashboardStats = {
  profiles: {
    total: number;
    publishers: number;
    advertisers: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  publisherGoLinks: { count: number; totalClicks: number };
  brandApplications: { total: number; pending: number; approved: number; rejected: number };
  awinProgrammesCached: number;
  pendingSignups: { id: string; username: string; email: string; role: string; created_at: string }[];
  financials: {
    commissionByCurrency: Record<string, number>;
    saleByCurrency: Record<string, number>;
    totalPublisherPayoutUsd: number;
    totalGrossOnLinksUsd: number | null;
    primaryCurrency: string | null;
    primaryCommission: number;
    primarySale: number;
    source?: "rollup" | "awin_transactions";
  };
  awinReporting: {
    transactionsStored: number;
    transactionsAttributed: number;
    lastSyncAt: string | null;
    lastSyncError: string | null;
  };
  awinActivityLast30Days: {
    fromYmd: string;
    toYmd: string;
    transactionCount: number;
    transactionCountAttributed: number;
    saleByCurrency: Record<string, number>;
    commissionByCurrency: Record<string, number>;
    primarySaleCurrency: string | null;
    primarySale: number;
    primaryCommissionCurrency: string | null;
    primaryCommission: number;
  };
  awinSyncOnDashboardLoad?: { ran: boolean; skippedReason?: string; error?: string };
};

type PublisherEarningRow = {
  publisherId: string;
  username: string;
  email: string;
  commissionByCurrency: Record<string, number>;
};

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function KpiTile({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "pending" | "clicks";
}) {
  return (
    <div
      className={`rounded-2xl border bg-zinc-900/70 p-4 shadow-lg shadow-black/20 backdrop-blur-sm ${
        variant === "pending" && Number(value) > 0
          ? "border-amber-500/50 ring-1 ring-amber-500/30"
          : "border-white/10"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${
          variant === "clicks" ? "text-teal-400" : "text-white"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [publishersEarnings, setPublishersEarnings] = useState<PublisherEarningRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, pubRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats", { credentials: "include" }),
          fetch("/api/admin/publishers-earnings?days=30", { credentials: "include" }),
        ]);
        const dashData = await dashRes.json().catch(() => ({}));
        const pubData = await pubRes.json().catch(() => ({}));
        if (!dashRes.ok) {
          if (!cancelled) setError(dashData.error ?? "Could not load stats");
          return;
        }
        if (!cancelled) {
          setStats(dashData as DashboardStats);
          setPublishersEarnings(Array.isArray(pubData.publishers) ? pubData.publishers : []);
        }
      } catch {
        if (!cancelled) setError("Could not load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1
        className="text-2xl font-bold text-white sm:text-3xl"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Live totals from Supabase (profiles, Awin applications, short links). Commissions and sales refresh when you run an Awin transaction sync.
      </p>

      {loading && <p className="mt-8 text-zinc-500">Loading dashboard…</p>}
      {error && (
        <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      {stats && !loading && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <KpiTile label="Total users" value={stats.profiles.total} />
            <KpiTile label="Publishers" value={stats.profiles.publishers} />
            <KpiTile label="Pending approval" value={stats.profiles.pending} variant="pending" />
            <KpiTile label="Approved" value={stats.profiles.approved} />
            <KpiTile label="Rejected" value={stats.profiles.rejected} />
            <KpiTile label="Advertisers" value={stats.profiles.advertisers} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <KpiTile label="Brand applications" value={stats.brandApplications.total} />
            <KpiTile label="Tracking links" value={stats.publisherGoLinks.count} />
            <KpiTile label="Clicks" value={stats.publisherGoLinks.totalClicks} variant="clicks" />
            <KpiTile label="Pending applications" value={stats.brandApplications.pending} variant="pending" />
            <KpiTile label="Approved applications" value={stats.brandApplications.approved} />
            <KpiTile label="Rejected applications" value={stats.brandApplications.rejected} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Attributed commissions (rollup)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                {stats.financials.primaryCurrency
                  ? formatMoney(stats.financials.primaryCommission, stats.financials.primaryCurrency)
                  : formatUsd(0)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                USD subtotal: {formatUsd(stats.financials.totalPublisherPayoutUsd)}. Other currencies:{" "}
                {Object.entries(stats.financials.commissionByCurrency)
                  .filter(([c]) => c !== "USD")
                  .map(([c, v]) => `${c} ${v.toFixed(2)}`)
                  .join(" · ") || "—"}
              </p>
              <button
                type="button"
                disabled={syncing}
                onClick={async () => {
                  setSyncing(true);
                  setSyncMessage(null);
                  try {
                    const res = await fetch("/api/admin/awin/sync-transactions", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: "{}",
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setSyncMessage(data.error ?? "Sync failed");
                      return;
                    }
                    setSyncMessage(`Synced ${data.fetched ?? 0} rows, ${data.upserted ?? 0} saved.`);
                    const dashRes = await fetch("/api/admin/dashboard-stats", { credentials: "include" });
                    const pubRes = await fetch("/api/admin/publishers-earnings?days=30", { credentials: "include" });
                    if (dashRes.ok) setStats((await dashRes.json()) as DashboardStats);
                    if (pubRes.ok) {
                      const p = await pubRes.json();
                      setPublishersEarnings(Array.isArray(p.publishers) ? p.publishers : []);
                    }
                  } catch {
                    setSyncMessage("Sync request failed");
                  } finally {
                    setSyncing(false);
                  }
                }}
                className="mt-3 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {syncing ? "Syncing…" : "Sync Awin transactions now"}
              </button>
              {syncMessage && <p className="mt-2 text-xs text-teal-400/90">{syncMessage}</p>}
              {stats.financials.source === "awin_transactions" && (
                <p className="mt-2 text-xs text-amber-200/80">
                  Totals are summed live from <code className="text-zinc-500">awin_transactions</code> because the daily rollup
                  was empty. Use &quot;Rebuild rollup&quot; after bulk imports so publisher dashboards stay fast.
                </p>
              )}
              <button
                type="button"
                disabled={rebuilding}
                onClick={async () => {
                  setRebuilding(true);
                  setSyncMessage(null);
                  try {
                    const res = await fetch("/api/admin/awin/rebuild-rollup", {
                      method: "POST",
                      credentials: "include",
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setSyncMessage(data.error ?? "Rebuild failed");
                      return;
                    }
                    setSyncMessage("Rollup rebuilt from awin_transactions.");
                    const dashRes = await fetch("/api/admin/dashboard-stats", { credentials: "include" });
                    const pubRes = await fetch("/api/admin/publishers-earnings?days=30", { credentials: "include" });
                    if (dashRes.ok) setStats((await dashRes.json()) as DashboardStats);
                    if (pubRes.ok) {
                      const p = await pubRes.json();
                      setPublishersEarnings(Array.isArray(p.publishers) ? p.publishers : []);
                    }
                  } catch {
                    setSyncMessage("Rebuild request failed");
                  } finally {
                    setRebuilding(false);
                  }
                }}
                className="mt-2 rounded-lg border border-white/15 bg-zinc-950/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                {rebuilding ? "Rebuilding…" : "Rebuild daily rollup"}
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Attributed sale value (rollup)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-teal-400">
                {stats.financials.primaryCurrency
                  ? formatMoney(stats.financials.primarySale, stats.financials.primaryCurrency)
                  : "—"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Last Awin sync:{" "}
                {stats.awinReporting.lastSyncAt
                  ? new Date(stats.awinReporting.lastSyncAt).toLocaleString()
                  : "never"}
                . Stored transactions: {stats.awinReporting.transactionsStored.toLocaleString()} (
                {stats.awinReporting.transactionsAttributed.toLocaleString()} matched to a publisher via link slug).
              </p>
              {stats.awinReporting.transactionsStored > 0 &&
                stats.awinReporting.transactionsAttributed === 0 && (
                  <p className="mt-2 text-xs text-amber-200/85">
                    Rows exist but none are attributed: set <code className="text-zinc-500">publisher_id</code> (or{" "}
                    <code className="text-zinc-500">click_ref</code> = a real{" "}
                    <code className="text-zinc-500">publisher_go_links.slug</code>) on each transaction, then Rebuild rollup.
                  </p>
                )}
              {stats.awinReporting.lastSyncError && (
                <p className="mt-2 text-xs text-amber-300/90">Last error: {stats.awinReporting.lastSyncError}</p>
              )}
              <p className="mt-2 text-xs text-zinc-600">
                Schedule POST <code className="text-zinc-500">/api/cron/awin-transactions</code> with{" "}
                <code className="text-zinc-500">Authorization: Bearer AWIN_SYNC_CRON_SECRET</code> for automatic refresh.
              </p>
            </div>
          </div>

          {publishersEarnings.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Publishers — commissions (last 30 days)</h2>
              <p className="mt-1 text-sm text-zinc-500">From daily rollup; attribution uses click ref = short-link slug.</p>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/20 backdrop-blur-sm">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3">Publisher</th>
                      <th className="px-4 py-3 text-right">Commission by currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishersEarnings.slice(0, 25).map((p) => (
                      <tr key={p.publisherId} className="border-b border-white/5 text-zinc-300">
                        <td className="px-4 py-3">
                          <span className="font-medium text-white">{p.username}</span>
                          <span className="mt-0.5 block text-xs text-zinc-500">{p.email}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">
                          {Object.entries(p.commissionByCurrency)
                            .filter(([, v]) => v > 0)
                            .map(([c, v]) => `${c} ${v.toFixed(2)}`)
                            .join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-white">Activity by platform</h2>
            <p className="mt-1 text-sm text-zinc-500">
              LinkHexa currently integrates Awin for programmes and short links. Other networks would appear as additional rows when connected.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              <span className="font-medium text-zinc-500">Awin conversions / gross / payout</span> below use{" "}
              <strong className="text-zinc-400">rolling last 30 days (UTC)</strong> from transactions pulled from the Awin API and
              stored in <code className="text-zinc-500">awin_transactions</code>. Opening this dashboard triggers a throttled
              auto-sync (by default about every 15 minutes, override with{" "}
              <code className="text-zinc-500">ADMIN_DASHBOARD_AWIN_SYNC_MINUTES</code>) so totals stay current; use &quot;Sync Awin
              transactions now&quot; above for an immediate pull.
            </p>
            {stats.awinSyncOnDashboardLoad?.skippedReason && !stats.awinSyncOnDashboardLoad.ran && (
              <p className="mt-2 text-xs text-zinc-500">{stats.awinSyncOnDashboardLoad.skippedReason}</p>
            )}
            {stats.awinSyncOnDashboardLoad?.error && (
              <p className="mt-2 text-xs text-amber-200/85" role="alert">
                Auto-sync: {stats.awinSyncOnDashboardLoad.error}
              </p>
            )}
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/20 backdrop-blur-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Programmes cached</th>
                    <th className="px-4 py-3">Links</th>
                    <th className="px-4 py-3">Clicks</th>
                    <th className="px-4 py-3">Conversions</th>
                    <th className="px-4 py-3">Gross on links</th>
                    <th className="px-4 py-3">Application rows</th>
                    <th className="px-4 py-3 text-right">Payout sum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 text-zinc-300">
                    <td className="px-4 py-3 font-medium text-white">Awin</td>
                    <td className="px-4 py-3 tabular-nums">{stats.awinProgrammesCached.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums">{stats.publisherGoLinks.count.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-teal-400">
                      {stats.publisherGoLinks.totalClicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {stats.awinActivityLast30Days.transactionCount.toLocaleString()}
                      {stats.awinActivityLast30Days.transactionCountAttributed > 0 && (
                        <span className="mt-0.5 block text-[10px] font-normal text-zinc-500">
                          {stats.awinActivityLast30Days.transactionCountAttributed.toLocaleString()} matched to a publisher
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-teal-400/90">
                      {stats.awinActivityLast30Days.primarySaleCurrency && stats.awinActivityLast30Days.primarySale > 0
                        ? formatMoney(
                            stats.awinActivityLast30Days.primarySale,
                            stats.awinActivityLast30Days.primarySaleCurrency
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{stats.brandApplications.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white">
                      {stats.awinActivityLast30Days.primaryCommissionCurrency &&
                      stats.awinActivityLast30Days.primaryCommission > 0
                        ? formatMoney(
                            stats.awinActivityLast30Days.primaryCommission,
                            stats.awinActivityLast30Days.primaryCommissionCurrency
                          )
                        : formatUsd(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-zinc-600">
              Window: {stats.awinActivityLast30Days.fromYmd} → {stats.awinActivityLast30Days.toYmd} UTC · Gross and payout use the
              strongest currency by volume in that window (see Sales / transactions for every row).
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Pending publisher approvals</h2>
              <Link
                href="/admin#admin-all-signups"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 hover:underline"
              >
                View all →
              </Link>
            </div>
            {stats.pendingSignups.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No pending approvals.</p>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {stats.pendingSignups.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-white">{p.username}</p>
                      <p className="text-xs text-zinc-500">{p.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="capitalize">{p.role}</span>
                      <span>{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <Link href="/" className="flex items-center gap-2 opacity-90 transition hover:opacity-100">
              <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={100} height={32} className="h-7 w-auto" />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
              <span>&copy; {new Date().getFullYear()} LinkHexa</span>
              <Link href="/terms" className="hover:text-zinc-300">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="hover:text-zinc-300">
                Privacy Policy
              </Link>
            </div>
          </footer>
        </>
      )}
    </>
  );
}
