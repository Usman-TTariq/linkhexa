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
  financials: { totalPublisherPayoutUsd: number; totalGrossOnLinksUsd: number | null };
};

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard-stats", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Could not load stats");
          return;
        }
        if (!cancelled) setStats(data as DashboardStats);
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
      <p className="mt-1 text-sm text-zinc-400">Live totals from your Supabase data (profiles, Awin applications, short links).</p>

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
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total publisher payout (commissions)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{formatUsd(stats.financials.totalPublisherPayoutUsd)}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                No commission ledger table yet — this stays at $0 until you store payouts in the database.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total gross on tracking links</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-teal-400">
                {stats.financials.totalGrossOnLinksUsd == null ? "—" : formatUsd(stats.financials.totalGrossOnLinksUsd)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Order value is not recorded on <code className="text-zinc-500">publisher_go_links</code> yet — wire conversions/revenue to show a real total.
              </p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-white">Activity by platform</h2>
            <p className="mt-1 text-sm text-zinc-500">
              LinkHexa currently integrates Awin for programmes and short links. Other networks would appear as additional rows when connected.
            </p>
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
                    <td className="px-4 py-3 text-zinc-500">—</td>
                    <td className="px-4 py-3 text-zinc-500">—</td>
                    <td className="px-4 py-3 tabular-nums">{stats.brandApplications.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{formatUsd(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
