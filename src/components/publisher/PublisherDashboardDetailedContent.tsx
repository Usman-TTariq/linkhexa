"use client";

import Link from "next/link";
import Image from "next/image";
import PublisherAwinTransactionsSection from "@/components/publisher/PublisherAwinTransactionsSection";
import PublisherSupportChat from "@/components/publisher/PublisherSupportChat";
import {
  hasLinksButNoMatchingAwinRows,
  usePublisherDashboardData,
} from "@/components/publisher/usePublisherDashboardData";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function LiveEarningsSparkline({ points }: { points: number[] }) {
  const w = 560;
  const h = 160;
  const pad = 12;
  if (points.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg border border-white/5 bg-zinc-950/40 text-sm text-zinc-500">
        No commission in this window yet. Create tracking links (they send your link slug as Awin click ref) and run an admin
        sync.
      </div>
    );
  }
  const max = Math.max(...points, 1e-6);
  const toX = (i: number) => pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = points.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `M ${toX(0)},${h - pad} L ${points.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")} L ${toX(points.length - 1)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full text-indigo-400" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="areaFillDetailed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFillDetailed)" />
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={line} />
    </svg>
  );
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
            stroke="url(#ringGradDetailed)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700"
          />
          <defs>
            <linearGradient id="ringGradDetailed" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default function PublisherDashboardDetailedContent() {
  const d = usePublisherDashboardData();
  const {
    loading,
    isPublisher,
    displayName,
    goLinks,
    goLinksLoading,
    goLinksError,
    earnings,
    earningsLoading,
    earningsError,
    earningsReconcileError,
    earningsDebug,
    primaryCurrency,
    windowTotalCommissionPrimary,
    windowTotalSalePrimary,
    commissionToday,
    commissionYesterday,
    commissionLast7,
    commissionLast30,
    saleLast30,
    sparklinePoints,
    totalLinkClicks,
    currencyBreakdown,
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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-zinc-400">This view is for publisher accounts.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const cardBase = "rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm";

  return (
    <div className="min-h-screen pb-16">
      <PublisherSupportChat />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tools &amp; detail</p>
            <h1
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Detailed dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Full earnings tables, tracking links, Awin sales, diagnostics, and account widgets.{" "}
              <Link href="/dashboard" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                ← Back to overview
              </Link>
            </p>
          </div>
        </div>

        <section className={`${cardBase} mb-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12`}>
          <ProfileCompletenessRing percent={41} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2
              className="text-xl font-bold tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Welcome back, {displayName}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Track commissions and sales from synced Awin data, manage tracking links, and browse brands you&apos;re approved
              on.
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
          <aside className="flex flex-col gap-4">
            {(
              [
                { label: "Today (commission)", value: commissionToday, from: "from-rose-600/90", to: "to-orange-500/80" },
                { label: "Yesterday", value: commissionYesterday, from: "from-emerald-600/90", to: "to-teal-500/80" },
                { label: "Last 7 days", value: commissionLast7, from: "from-fuchsia-600/85", to: "to-pink-500/75" },
                { label: "Last 30 days (commission)", value: commissionLast30, from: "from-indigo-600/90", to: "to-blue-500/80" },
                {
                  label: "Last 30 days (sales)",
                  value: saleLast30,
                  from: "from-teal-700/90",
                  to: "to-cyan-600/75",
                },
              ] as const
            ).map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl bg-gradient-to-br ${c.from} ${c.to} p-5 text-white shadow-lg shadow-black/30`}
              >
                <p className="text-sm font-medium text-white/85">{c.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
                  {earningsLoading ? "…" : formatMoney(c.value, primaryCurrency)}
                </p>
              </div>
            ))}
            <p className="px-1 text-[10px] leading-relaxed text-zinc-500">
              Shown in {primaryCurrency} from synced Awin data. Sales are order value attributed via click ref matching your
              link slug.
            </p>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <div className={cardBase}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Earnings overview</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Last 28 days commission ({primaryCurrency}), from the database after admin syncs Awin transactions.{" "}
                    {earnings && (
                      <span className="text-zinc-600">
                        {earnings.totals.transactions} synced transaction
                        {earnings.totals.transactions === 1 ? "" : "s"} in window.
                      </span>
                    )}
                  </p>
                  {!earningsLoading && earnings && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                          Your total commission ({primaryCurrency})
                        </p>
                        <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-white">
                          {formatMoney(windowTotalCommissionPrimary, primaryCurrency)}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-500">
                          From {earnings.from} (UTC) · attributed rows only
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                          Your total sales ({primaryCurrency})
                        </p>
                        <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-teal-300/95">
                          {formatMoney(windowTotalSalePrimary, primaryCurrency)}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-500">Order value from the same attributed Awin transactions</p>
                      </div>
                    </div>
                  )}
                  {!earningsLoading && earnings && currencyBreakdown.length > 1 && (
                    <p className="mt-2 text-[10px] text-zinc-500">
                      You have activity in multiple currencies — headline totals use {primaryCurrency}; see{" "}
                      <strong className="text-zinc-400">Earnings by currency</strong> below for each.
                    </p>
                  )}
                </div>
              </div>
              {earningsError && (
                <p className="mt-4 text-sm text-amber-200/90" role="alert">
                  {earningsError}
                </p>
              )}
              {earningsReconcileError && (
                <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90" role="status">
                  Raw transaction reconcile failed (showing rollup only): {earningsReconcileError}
                </p>
              )}
              {earningsDebug && (
                <details className="mt-3 rounded-lg border border-white/10 bg-zinc-950/60">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-500">
                    DB diagnostics (why totals may be zero)
                  </summary>
                  <pre className="max-h-48 overflow-auto border-t border-white/5 p-3 font-mono text-[10px] leading-relaxed text-zinc-400">
                    {JSON.stringify(earningsDebug, null, 2)}
                  </pre>
                </details>
              )}
              {earningsDebug && hasLinksButNoMatchingAwinRows(earningsDebug) && (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-50/95">
                  <p className="font-semibold text-amber-200">What the zeros mean</p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-100/90">
                    You have <strong className="text-white">{Number(earningsDebug.yourPublisherGoLinks)}</strong> tracking
                    links and LinkHexa is counting <strong className="text-white">clicks</strong> on them. But in{" "}
                    <strong className="text-white">this</strong> Supabase project, table{" "}
                    <code className="rounded bg-black/25 px-1 font-mono text-[11px]">awin_transactions</code> currently has{" "}
                    <strong className="text-white">no rows</strong> where either your{" "}
                    <code className="font-mono text-[11px]">publisher_id</code> matches, or{" "}
                    <code className="font-mono text-[11px]">go_link_slug</code> /{" "}
                    <code className="font-mono text-[11px]">click_ref</code> matches your slugs. The chart and money totals only
                    come from those synced Awin sale rows — not from click counts.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-100/90">
                    <strong className="text-white">Next step:</strong> run{" "}
                    <strong className="text-white">Admin → Awin → Actions (sync transactions)</strong> against this same
                    database (valid <code className="font-mono text-[11px]">AWIN_API_TOKEN</code> / publisher id in env).
                    After a successful sync, the diagnostic counts above should become non‑zero. If{" "}
                    <code className="rounded bg-black/25 px-1 font-mono text-[11px]">
                      awinTransactionsTotalRowsInDatabase
                    </code>{" "}
                    is <strong className="text-white">0</strong>, nothing has been synced for <em>anyone</em> yet — fix env
                    and sync first.
                  </p>
                  {typeof earningsDebug.awinTransactionsTotalRowsInDatabase === "number" && (
                    <p className="mt-2 font-mono text-[11px] text-amber-200/80">
                      awin_transactions (entire table):{" "}
                      <strong className="text-white">
                        {Number(earningsDebug.awinTransactionsTotalRowsInDatabase).toLocaleString()}
                      </strong>{" "}
                      rows
                    </p>
                  )}
                </div>
              )}
              <div className="mt-6 border-t border-white/5 pt-4">
                {earningsLoading ? (
                  <p className="py-12 text-center text-sm text-zinc-500">Loading earnings…</p>
                ) : (
                  <LiveEarningsSparkline points={sparklinePoints} />
                )}
                <div className="mt-2 text-xs text-zinc-500">Daily commission ({primaryCurrency}) · older links may lack click ref</div>
              </div>
              <div className="mt-8 border-t border-white/5 pt-5">
                <h3 className="text-sm font-semibold text-zinc-300">Recent days</h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-4 py-2.5">Date (UTC)</th>
                        <th className="px-4 py-2.5 text-right">Commission</th>
                        <th className="px-4 py-2.5 text-right">Sales</th>
                        <th className="px-4 py-2.5 text-right">Txns</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {earningsLoading && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500">
                            Loading…
                          </td>
                        </tr>
                      )}
                      {earnings &&
                        !earningsLoading &&
                        [...earnings.series]
                          .filter((s) => s.currency === primaryCurrency)
                          .slice(-7)
                          .reverse()
                          .map((row) => (
                            <tr key={`${row.date}-${row.currency}`} className="text-zinc-300">
                              <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{row.date}</td>
                              <td className="px-4 py-2.5 text-right font-medium tabular-nums text-white">
                                {formatMoney(row.commission, primaryCurrency)}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-teal-300/90">
                                {formatMoney(row.sale, primaryCurrency)}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">{row.transactions}</td>
                            </tr>
                          ))}
                      {earnings &&
                        !earningsLoading &&
                        earnings.series.filter((s) => s.currency === primaryCurrency).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500">
                              No commission rows in {primaryCurrency} yet. Run an admin sync, or check other currencies in Awin.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={`${cardBase} scroll-mt-24`} id="tracking-links">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your tracking links</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Clicks are counted on your LinkHexa short URL (<span className="text-zinc-400">/go/short/…</span>). Sales
                    attribution uses the same slug as Awin click ref on new links.
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

            <PublisherAwinTransactionsSection />

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
                      <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                        Performance overview
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/brands" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                        Browse brands
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/brands?filter=approved" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                        My approved brands
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className={cardBase}>
                  <h3 className="text-sm font-semibold text-white">Publisher support</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Use the <strong className="text-zinc-400">chat button</strong> (bottom-right) for in-dashboard messages.
                    Or reach us via{" "}
                    <Link href="/contact" className="text-indigo-400 hover:underline">
                      contact
                    </Link>{" "}
                    — we respond on business days.
                  </p>
                </div>
              </div>

              <div className={cardBase}>
                <h3 className="text-lg font-semibold text-white">Earnings by currency</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Attributed commission and sale value from Awin over the last {earnings?.days ?? 730} days (same source as the
                  chart above). Per-link detail is in <strong className="text-zinc-400">Your Awin sales</strong>.
                </p>
                {earningsLoading ? (
                  <p className="mt-6 text-sm text-zinc-500">Loading…</p>
                ) : earningsError ? (
                  <p className="mt-6 text-sm text-amber-200/90">{earningsError}</p>
                ) : currencyBreakdown.length === 0 ? (
                  <p className="mt-6 rounded-xl border border-white/5 bg-zinc-950/40 px-4 py-6 text-sm text-zinc-500">
                    No earnings in this window yet. Create tracking links (slug in Awin click ref), drive traffic, then ask your
                    admin to sync Awin transactions. Expand <strong className="text-zinc-400">DB diagnostics</strong> above to
                    see raw row counts from the database.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full min-w-[360px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-zinc-950/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                          <th className="px-3 py-2.5">Currency</th>
                          <th className="px-3 py-2.5 text-right">Commission</th>
                          <th className="px-3 py-2.5 text-right">Sale value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currencyBreakdown.map((row) => (
                          <tr key={row.currency} className="text-zinc-300">
                            <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">{row.currency}</td>
                            <td className="px-3 py-2.5 text-right font-medium tabular-nums text-white">
                              {formatMoney(row.commission, row.currency)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-teal-400/90">
                              {formatMoney(row.sale, row.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
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
