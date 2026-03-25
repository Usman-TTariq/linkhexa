"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = { username: string; email: string; role: string };

type GoLinkSummary = {
  slug: string;
  shortUrl: string;
  targetUrl: string;
  deepLink: boolean;
  createdAt: string;
  clickCount: number;
  programmeId: number;
  brandName: string | null;
};

const MOCK_SITES = [
  { name: "TechDigest Daily", url: "techdigest.example.com", status: "Approved" as const },
  { name: "Coupon Finder", url: "coupons.example.io", status: "Approved" as const },
  { name: "Style & Home", url: "stylehome.blog", status: "Pending" as const },
  { name: "GameVault News", url: "gamevault.net", status: "Approved" as const },
  { name: "Finance Brief", url: "financebrief.co", status: "Approved" as const },
  { name: "Travel Notes", url: "travelnotes.app", status: "Approved" as const },
  { name: "Fitness Hub", url: "fitnesshub.fit", status: "Pending" as const },
  { name: "Crypto Weekly", url: "cryptoweekly.news", status: "Approved" as const },
];

const MOCK_TABLE_ROWS = [
  { site: "techdigest.example.com", impressions: "124,500", ctr: "1.2%", ecpm: "$4.10", earnings: "$510.35" },
  { site: "coupons.example.io", impressions: "89,200", ctr: "0.9%", ecpm: "$3.40", earnings: "$303.28" },
  { site: "gamevault.net", impressions: "210,000", ctr: "1.5%", ecpm: "$5.20", earnings: "$1,092.00" },
  { site: "financebrief.co", impressions: "45,800", ctr: "0.7%", ecpm: "$2.90", earnings: "$132.82" },
];

const MOCK_CHANNELS = [
  { name: "Display", share: "42%", earnings: "$412.00" },
  { name: "Native", share: "28%", earnings: "$274.50" },
  { name: "Video", share: "18%", earnings: "$176.20" },
  { name: "Other", share: "12%", earnings: "$117.30" },
];

const MOCK_COUNTRIES = [
  { country: "United States", impressions: "198k", earnings: "$620.10" },
  { country: "United Kingdom", impressions: "72k", earnings: "$241.80" },
  { country: "Germany", impressions: "54k", earnings: "$189.40" },
  { country: "Canada", impressions: "41k", earnings: "$132.00" },
];

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function ProfileCompletenessRing({ percent }: { percent: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center sm:items-start">
      <div className="relative h-[132px] w-[132px]">
        <svg className="-rotate-90" width="132" height="132" viewBox="0 0 132 132" aria-hidden>
          <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="66"
            cy="66"
            r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-white">{percent}%</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">complete</span>
        </div>
      </div>
      <p className="mt-3 max-w-[200px] text-center text-xs text-zinc-500 sm:text-left">Profile completeness</p>
    </div>
  );
}

function EarningsSparkline() {
  const w = 560;
  const h = 160;
  const pad = 12;
  const series1 = [40, 55, 48, 72, 65, 88, 78, 95, 82, 100, 92, 108];
  const series2 = [28, 38, 42, 50, 45, 58, 52, 62, 55, 68, 60, 72];
  const max = 120;
  const toX = (i: number) => pad + (i / (series1.length - 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = (pts: number[]) => pts.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `M ${toX(0)},${h - pad} L ${series1.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")} L ${toX(series1.length - 1)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full text-indigo-400" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={line(series1)} />
      <polyline
        fill="none"
        stroke="rgb(139,92,246)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
        points={line(series2)}
      />
    </svg>
  );
}

const RANGE_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"] as const;

export default function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>("Last 7 days");
  const [tableTab, setTableTab] = useState<"Sites" | "Ad units" | "Reports">("Sites");
  const [siteQuery, setSiteQuery] = useState("");
  const [tableQuery, setTableQuery] = useState("");
  const [goLinks, setGoLinks] = useState<GoLinkSummary[]>([]);
  const [goLinksLoading, setGoLinksLoading] = useState(false);
  const [goLinksError, setGoLinksError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data: row } = await supabase.from("profiles").select("username, email, role").eq("id", session.user.id).single();
      if (row) setProfile({ username: row.username, email: row.email, role: row.role });
      else
        setProfile({
          username: session.user.user_metadata?.username ?? "User",
          email: session.user.email ?? "",
          role: session.user.user_metadata?.role ?? "publisher",
        });
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    if (loading || profile?.role !== "publisher") return;
    let cancelled = false;
    (async () => {
      setGoLinksLoading(true);
      setGoLinksError(null);
      try {
        const res = await fetch("/api/publisher/go-links", { credentials: "include" });
        const data = (await res.json().catch(() => ({}))) as { error?: string; links?: GoLinkSummary[] };
        if (!res.ok) {
          if (!cancelled) setGoLinksError(data.error ?? "Could not load tracking links.");
          return;
        }
        if (!cancelled) setGoLinks(Array.isArray(data.links) ? data.links : []);
      } catch {
        if (!cancelled) setGoLinksError("Could not load tracking links.");
      } finally {
        if (!cancelled) setGoLinksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, profile?.role]);

  const displayName = profile?.username?.trim() || profile?.email?.split("@")[0] || "there";
  const isPublisher = profile?.role === "publisher";
  const totalLinkClicks = useMemo(
    () => goLinks.reduce((sum, l) => sum + Number(l.clickCount ?? 0), 0),
    [goLinks]
  );

  const filteredSites = useMemo(() => {
    const q = siteQuery.trim().toLowerCase();
    if (!q) return MOCK_SITES;
    return MOCK_SITES.filter((s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
  }, [siteQuery]);

  const filteredTableRows = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return MOCK_TABLE_ROWS;
    return MOCK_TABLE_ROWS.filter((row) => row.site.toLowerCase().includes(q));
  }, [tableQuery]);

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

  const cardBase = "rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm";

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Welcome + profile ring */}
        <section className={`${cardBase} mb-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12`}>
          <ProfileCompletenessRing percent={41} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Welcome back, {displayName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Track earnings, site performance, and channels in one place. Connect brands from the catalogue and build tracking links
              when you are approved.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link
                href="/dashboard/brands"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
              >
                Browse brands
              </Link>
              <Link
                href="/dashboard/brands?filter=approved"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/10"
              >
                My brands
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
          {/* Left column — stat cards */}
          <aside className="flex flex-col gap-4">
            {(
              [
                { label: "Total earnings", value: 0, from: "from-rose-600/90", to: "to-orange-500/80" },
                { label: "Yesterday", value: 0, from: "from-emerald-600/90", to: "to-teal-500/80" },
                { label: "Last 7 days", value: 0, from: "from-fuchsia-600/85", to: "to-pink-500/75" },
                { label: "All-time", value: 0, from: "from-indigo-600/90", to: "to-blue-500/80" },
              ] as const
            ).map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl bg-gradient-to-br ${c.from} ${c.to} p-5 text-white shadow-lg shadow-black/30`}
              >
                <p className="text-sm font-medium text-white/85">{c.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{formatUsd(c.value)}</p>
              </div>
            ))}
          </aside>

          {/* Right column — chart + top performance */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className={cardBase}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Earnings overview</h2>
                  <p className="mt-1 text-xs text-zinc-500">Sample trend — live reporting connects here next.</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RANGE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        range === r
                          ? "bg-white/10 text-white ring-1 ring-indigo-500/50"
                          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4">
                <EarningsSparkline />
                <div className="mt-2 flex justify-end gap-6 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
                    Earnings
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-400" aria-hidden />
                    Impressions (scaled)
                  </span>
                </div>
              </div>
              <div className="mt-8 border-t border-white/5 pt-5">
                <h3 className="text-sm font-semibold text-zinc-300">Top performance</h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-4 py-2.5">Site</th>
                        <th className="px-4 py-2.5">Impressions</th>
                        <th className="px-4 py-2.5 text-right">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_TABLE_ROWS.slice(0, 3).map((row) => (
                        <tr key={row.site} className="text-zinc-300">
                          <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{row.site}</td>
                          <td className="px-4 py-2.5 tabular-nums">{row.impressions}</td>
                          <td className="px-4 py-2.5 text-right font-medium tabular-nums text-white">{row.earnings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={cardBase}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your tracking links</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Clicks are counted when someone opens your LinkHexa short URL (<span className="text-zinc-400">/go/short/…</span>
                    ). Network (Awin) reporting stays separate from this.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Total clicks</p>
                  <p className="text-xl font-bold tabular-nums text-white">{totalLinkClicks.toLocaleString()}</p>
                </div>
              </div>
              {goLinksLoading ? (
                <p className="mt-4 text-sm text-zinc-500">Loading links…</p>
              ) : goLinksError ? (
                <p className="mt-4 text-sm text-amber-200/90">{goLinksError}</p>
              ) : goLinks.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">
                  No short links yet. Open a brand you&apos;re approved on and create one under{" "}
                  <span className="text-zinc-400">Tracking links</span>.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2.5">Brand</th>
                        <th className="px-3 py-2.5">Short link</th>
                        <th className="px-3 py-2.5 text-right">Clicks</th>
                        <th className="px-3 py-2.5 text-right">Created</th>
                        <th className="px-3 py-2.5 text-right"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {goLinks.map((row) => (
                        <tr key={row.slug} className="text-zinc-300">
                          <td className="px-3 py-2.5">
                            <span className="font-medium text-zinc-200">{row.brandName ?? `Programme ${row.programmeId}`}</span>
                          </td>
                          <td className="max-w-[220px] px-3 py-2.5">
                            <code className="break-all text-xs text-indigo-200">{row.shortUrl}</code>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums text-white">
                            {Number(row.clickCount ?? 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs text-zinc-500">
                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Link
                              href={`/dashboard/brands/${row.programmeId}`}
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                            >
                              Brand
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
              <div className="flex flex-col gap-4">
                <div className={cardBase}>
                  <h3 className="text-sm font-semibold text-white">Last payment</h3>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-zinc-200">{formatUsd(0)}</p>
                  <p className="mt-1 text-xs text-zinc-500">No payouts yet — thresholds and schedule appear here.</p>
                </div>
                <div className={cardBase}>
                  <h3 className="text-sm font-semibold text-white">Quick links</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>
                      <Link href="/dashboard/brands" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                        Set up ads — brands catalogue
                      </Link>
                    </li>
                    <li>
                      <span className="cursor-default text-zinc-600" title="Coming soon">
                        Invite &amp; earn
                      </span>
                    </li>
                    <li>
                      <span className="cursor-default text-zinc-600" title="Coming soon">
                        Recent announcements
                      </span>
                    </li>
                  </ul>
                </div>
                <div className={cardBase}>
                  <h3 className="text-sm font-semibold text-white">Publisher support</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Questions about approvals or tracking? Use{" "}
                    <Link href="/contact" className="text-indigo-400 hover:underline">
                      contact
                    </Link>{" "}
                    — we respond on business days.
                  </p>
                </div>
              </div>

              <div className={cardBase}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-1 border-b border-white/5 pb-1 sm:border-0 sm:pb-0">
                    {(["Sites", "Ad units", "Reports"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTableTab(t)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                          tableTab === t ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <label className="sr-only" htmlFor="dash-search">
                    Search table
                  </label>
                  <input
                    id="dash-search"
                    type="search"
                    value={tableQuery}
                    onChange={(e) => setTableQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 sm:max-w-xs"
                  />
                </div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2.5">Website</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Impressions</th>
                        <th className="px-3 py-2.5">CTR</th>
                        <th className="px-3 py-2.5">eCPM</th>
                        <th className="px-3 py-2.5 text-right">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTableRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-sm text-zinc-500">
                            No rows match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredTableRows.map((row) => (
                          <tr key={row.site} className="text-zinc-300">
                            <td className="px-3 py-2.5">
                              <span className="flex items-center gap-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-zinc-500">
                                  {row.site[0]?.toUpperCase() ?? "?"}
                                </span>
                                <span className="font-mono text-xs text-zinc-400">{row.site}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                Approved
                              </span>
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-zinc-400">{row.impressions}</td>
                            <td className="px-3 py-2.5 tabular-nums text-zinc-400">{row.ctr}</td>
                            <td className="px-3 py-2.5 tabular-nums text-zinc-400">{row.ecpm}</td>
                            <td className="px-3 py-2.5 text-right font-medium tabular-nums text-white">{row.earnings}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-zinc-600">
                  Tab: {tableTab} — placeholder data for layout; wire to your reporting API when ready.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className={cardBase}>
                <h3 className="text-sm font-semibold text-white">Top channels</h3>
                <div className="mt-4 space-y-3">
                  {MOCK_CHANNELS.map((ch) => (
                    <div key={ch.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-zinc-400">{ch.name}</span>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-xs text-zinc-600">{ch.share}</span>
                        <span className="font-medium text-white">{ch.earnings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cardBase}>
                <h3 className="text-sm font-semibold text-white">Top countries</h3>
                <div className="mt-4 space-y-3">
                  {MOCK_COUNTRIES.map((c) => (
                    <div key={c.country} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-zinc-400">{c.country}</span>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-xs text-zinc-600">{c.impressions}</span>
                        <span className="font-medium text-white">{c.earnings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sites list */}
            <section className={cardBase}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-white">Your sites / platforms</h2>
                <input
                  type="search"
                  value={siteQuery}
                  onChange={(e) => setSiteQuery(e.target.value)}
                  placeholder="Filter sites…"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 sm:max-w-xs"
                  aria-label="Filter sites"
                />
              </div>
              <ul className="mt-5 max-h-[min(480px,50vh)] divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/5">
                {filteredSites.map((s) => (
                  <li key={s.url} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-sm font-bold text-indigo-300">
                        {s.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{s.name}</p>
                        <p className="truncate font-mono text-xs text-zinc-500">{s.url}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.status === "Approved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {s.status}
                      </span>
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                      >
                        View report
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {filteredSites.length === 0 && <p className="mt-4 text-center text-sm text-zinc-500">No sites match your search.</p>}
            </section>
          </div>
        </div>

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 opacity-90 transition hover:opacity-100">
            <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={100} height={32} className="h-7 w-auto" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} LinkHexa</span>
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-zinc-300">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
