"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useMemo } from "react";
import PublisherSupportChat from "@/components/publisher/PublisherSupportChat";
import type { GoLinkSummary } from "@/components/publisher/usePublisherDashboardData";

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/** Compact currency for KPI row (e.g. $8.9K) */
function formatCompactMoney(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return formatMoney(n, currency);
  }
}

function axisTickMoney(value: number, currency: string, scaleMax: number): string {
  if (!Number.isFinite(value) || Math.abs(value) < 1e-12) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(0);
    } catch {
      return "0";
    }
  }
  const m = Math.max(scaleMax, Math.abs(value), 1e-12);
  const digits = m >= 100 ? 0 : m >= 1 ? 2 : m >= 0.01 ? 3 : 4;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

/** Last-31-days commission + sales (same currency scale). */
function PerformanceEarningsChart({
  series,
  currency,
}: {
  series: { date: string; commission: number; sale: number }[];
  currency: string;
}) {
  const fillId = useId().replace(/:/g, "");

  const w = 720;
  const h = 220;
  const padL = 52;
  const padR = 16;
  const padT = 28;
  const padB = 36;

  const chart = useMemo(() => {
    if (series.length === 0) return null;
    const maxComm = Math.max(0, ...series.map((s) => s.commission));
    const maxSale = Math.max(0, ...series.map((s) => s.sale));
    const maxY = Math.max(maxComm, maxSale, 1e-12);
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const n = Math.max(series.length, 1);

    const commPts = series.map((s, i) => {
      const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = padT + innerH - (s.commission / maxY) * innerH;
      return { x, y };
    });
    const salePts = series.map((s, i) => {
      const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = padT + innerH - (s.sale / maxY) * innerH;
      return { x, y };
    });

    const commLine = commPts.map((p) => `${p.x},${p.y}`).join(" ");
    const saleLine = salePts.map((p) => `${p.x},${p.y}`).join(" ");
    const area =
      maxComm <= 0 || commPts.length === 0
        ? ""
        : `M ${commPts[0].x},${h - padB} L ${commPts.map((p) => `${p.x},${p.y}`).join(" ")} L ${commPts[commPts.length - 1].x},${h - padB} Z`;

    const tickCount = 4;
    const tickVals = Array.from({ length: tickCount + 1 }, (_, i) => (maxY * i) / tickCount);

    return { maxComm, maxSale, maxY, commLine, saleLine, areaPath: area, tickVals };
  }, [series, h, padB, padL, padR, padT, w]);

  if (series.length === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-950/50 px-4 text-center text-sm text-zinc-500">
        <p>No chart data in this window.</p>
      </div>
    );
  }

  if (!chart || (chart.maxComm <= 0 && chart.maxSale <= 0)) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-950/50 px-4 text-center text-sm text-zinc-500">
        <p className="text-zinc-400">No attributed commission or sales in the last 31 days.</p>
        <p className="max-w-md text-xs leading-relaxed text-zinc-500">
          Link clicks on your short links are counted here, but the chart only uses <strong className="text-zinc-400">synced Awin</strong>{" "}
          orders that match your link slug (click ref). Ask your admin to run an Awin transaction sync if you expect sales.
        </p>
      </div>
    );
  }

  const { maxY, commLine, saleLine, areaPath, tickVals, maxSale, maxComm } = chart;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-end gap-3 px-1 text-[10px] text-zinc-500">
        {maxComm > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-indigo-400" aria-hidden />
            Commission
          </span>
        )}
        {maxSale > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full border border-dashed border-teal-400/90 bg-transparent" aria-hidden />
            Sales
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {tickVals.map((tv, i) => {
          const innerH = h - padT - padB;
          const y = padT + innerH - (tv / maxY) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={2} y={y + 4} className="fill-zinc-500" style={{ fontSize: 9 }}>
                {axisTickMoney(tv, currency, maxY)}
              </text>
            </g>
          );
        })}
        {areaPath && <path d={areaPath} fill={`url(#${fillId})`} />}
        {maxSale > 0 && (
          <polyline
            fill="none"
            stroke="rgb(45,212,191)"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={saleLine}
            opacity={0.92}
          />
        )}
        {maxComm > 0 && (
          <polyline
            fill="none"
            stroke="rgb(129,140,248)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={commLine}
          />
        )}
        {series.map((s, i) => {
          if (i % 5 !== 0 && i !== series.length - 1) return null;
          const n = Math.max(series.length, 1);
          const innerW = w - padL - padR;
          const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
          const day = s.date.slice(8, 10);
          return (
            <text key={`${s.date}-${i}`} x={x} y={h - 10} textAnchor="middle" className="fill-zinc-500" style={{ fontSize: 9 }}>
              {day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

type MainProps = {
  displayName: string;
  primaryCurrency: string;
  windowTotalCommissionPrimary: number;
  windowTotalSalePrimary: number;
  totalTransactions: number;
  commissionLast30: number;
  saleLast30: number;
  commissionToday: number;
  commissionLast7: number;
  earningsLoading: boolean;
  earningsError: string | null;
  performanceChartSeries: { date: string; commission: number; sale: number; transactions: number }[];
  goLinksLoading: boolean;
  goLinksError: string | null;
  goLinks: GoLinkSummary[];
  totalLinkClicks: number;
  topBrandsByClicks: GoLinkSummary[];
  newestLinks: GoLinkSummary[];
};

export default function PublisherDashboardMain({
  displayName,
  primaryCurrency,
  windowTotalCommissionPrimary,
  windowTotalSalePrimary,
  totalTransactions,
  commissionLast30,
  saleLast30,
  commissionToday,
  commissionLast7,
  earningsLoading,
  earningsError,
  performanceChartSeries,
  goLinksLoading,
  goLinksError,
  goLinks,
  totalLinkClicks,
  topBrandsByClicks,
  newestLinks,
}: MainProps) {
  const cardBase = "rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm";

  return (
    <div className="min-h-screen pb-16">
      <PublisherSupportChat />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Overview</p>
            <h1
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Hi {displayName} — attributed Awin performance in {primaryCurrency}.{" "}
              <Link href="/dashboard/detailed" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                Detailed dashboard
              </Link>{" "}
              for links table, raw sales, diagnostics, and multi-currency breakdown.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
          {/* Left: earnings snapshot */}
          <aside className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg shadow-black/25">
              <div className="bg-gradient-to-r from-rose-600/90 via-fuchsia-600/85 to-indigo-600/90 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Earnings snapshot</p>
                <p className="mt-0.5 text-[11px] text-white/75">Last 30 days · {primaryCurrency}</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-xs text-zinc-500">Commission</span>
                  <span className="text-lg font-bold tabular-nums text-white">
                    {earningsLoading ? "…" : formatMoney(commissionLast30, primaryCurrency)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-xs text-zinc-500">Sales (order value)</span>
                  <span className="text-lg font-bold tabular-nums text-teal-300/95">
                    {earningsLoading ? "…" : formatMoney(saleLast30, primaryCurrency)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-xs text-zinc-500">Today · commission</span>
                  <span className="text-base font-semibold tabular-nums text-white">
                    {earningsLoading ? "…" : formatMoney(commissionToday, primaryCurrency)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-zinc-500">Last 7 days · commission</span>
                  <span className="text-base font-semibold tabular-nums text-indigo-200">
                    {earningsLoading ? "…" : formatMoney(commissionLast7, primaryCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`${cardBase} !p-4`}>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tracking links</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{goLinksLoading ? "…" : goLinks.length}</p>
              <p className="mt-1 text-xs text-zinc-500">Active short links</p>
              <p className="mt-3 text-sm tabular-nums text-zinc-300">
                <span className="text-zinc-500">Clicks · </span>
                {goLinksLoading ? "…" : totalLinkClicks.toLocaleString()}
              </p>
              <Link
                href="/dashboard/detailed#tracking-links"
                className="mt-4 inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Manage in detailed view →
              </Link>
            </div>
          </aside>

          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className={cardBase}>
              <h2 className="text-lg font-semibold text-white">Performance</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Totals use your reporting window (synced Awin rows attributed to your link slugs). Chart: last 31 days in{" "}
                {primaryCurrency} — <span className="text-indigo-300/90">commission</span> (solid) and{" "}
                <span className="text-teal-400/90">sales</span> (dashed) share the same scale when both have data.
              </p>
              {earningsError && (
                <p className="mt-3 text-sm text-amber-200/90" role="alert">
                  {earningsError}
                </p>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { label: "Total commissions", value: windowTotalCommissionPrimary },
                    { label: "Total transactions", value: totalTransactions, isCount: true },
                    { label: "Total sales", value: windowTotalSalePrimary, saleTone: true },
                  ] as const
                ).map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 sm:min-h-[88px]"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                    <p
                      className={`mt-1 text-xl font-bold tabular-nums tracking-tight ${
                        "saleTone" in kpi && kpi.saleTone ? "text-teal-300/95" : "text-white"
                      }`}
                    >
                      {earningsLoading
                        ? "…"
                        : "isCount" in kpi && kpi.isCount
                          ? Math.round(kpi.value).toLocaleString()
                          : formatCompactMoney(kpi.value, primaryCurrency)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-white/5 bg-zinc-950/40 px-2 pt-3">
                <PerformanceEarningsChart series={performanceChartSeries} currency={primaryCurrency} />
              </div>
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Day labels are UTC (dd of month). Clicks on your links are not plotted here — only attributed Awin commission/sale
                per day. For tables and diagnostics see{" "}
                <Link href="/dashboard/detailed" className="font-medium text-indigo-400 hover:underline">
                  Detailed dashboard
                </Link>
                .
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className={cardBase}>
                <h3 className="text-sm font-semibold text-white">Top brands by clicks</h3>
                <p className="mt-1 text-xs text-zinc-500">Your LinkHexa short links · click counts on our redirect.</p>
                {goLinksLoading ? (
                  <p className="mt-4 text-sm text-zinc-500">Loading…</p>
                ) : goLinksError ? (
                  <p className="mt-4 text-sm text-amber-200/90">{goLinksError}</p>
                ) : topBrandsByClicks.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-500">No links yet. Approve on a brand and create a tracking link.</p>
                ) : (
                  <ol className="mt-4 space-y-3">
                    {topBrandsByClicks.map((row, i) => (
                      <li key={row.slug} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-zinc-300">
                          <span className="mr-2 font-mono text-xs text-zinc-600">{i + 1}.</span>
                          {row.brandName ?? `Programme ${row.programmeId}`}
                        </span>
                        <span className="shrink-0 font-mono tabular-nums text-white">
                          {Number(row.clickCount ?? 0).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className={cardBase}>
                <h3 className="text-sm font-semibold text-white">Newest links</h3>
                <p className="mt-1 text-xs text-zinc-500">Recently created short URLs.</p>
                {goLinksLoading ? (
                  <p className="mt-4 text-sm text-zinc-500">Loading…</p>
                ) : newestLinks.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-500">Nothing here yet.</p>
                ) : (
                  <ol className="mt-4 space-y-3">
                    {newestLinks.map((row, i) => (
                      <li key={row.slug} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-zinc-300">
                          <span className="mr-2 font-mono text-xs text-zinc-600">{i + 1}.</span>
                          {row.brandName ?? `Programme ${row.programmeId}`}
                        </span>
                        <Link
                          href={`/dashboard/brands/${row.programmeId}`}
                          className="shrink-0 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          Open
                        </Link>
                      </li>
                    ))}
                  </ol>
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
