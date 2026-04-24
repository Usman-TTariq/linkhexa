"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
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

/** Smooth Catmull-Rom–style cubic path through points (open curve). */
function smoothPathFromPoints(pts: { x: number; y: number }[], tension = 0.22): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  const t = tension;
  const d: string[] = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

function areaPathUnderCommission(commPts: { x: number; y: number }[], bottomY: number, tension: number): string {
  if (commPts.length === 0) return "";
  const top = smoothPathFromPoints(commPts, tension);
  const tail = top.replace(/^M\s+[\d.-]+\s+[\d.-]+/, "");
  return `M ${commPts[0].x} ${bottomY} L ${commPts[0].x} ${commPts[0].y}${tail} L ${commPts[commPts.length - 1].x} ${bottomY} Z`;
}

function formatRollingTrendPct(p: number | null): string {
  if (p === null) return "—";
  const digits = Math.abs(p) >= 10 ? 1 : 2;
  const s = p > 0 ? "+" : "";
  return `${s}${p.toFixed(digits)}%`;
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

/** Last-31-days commission + gross sales — dual Y scale, smooth curves, prior-31 commission overlay, hover tooltip. */
function PerformanceEarningsChart({
  series,
  previousSeries,
  currency,
}: {
  series: { date: string; commission: number; sale: number }[];
  previousSeries: { date: string; commission: number; sale: number }[];
  currency: string;
}) {
  const fillId = useId().replace(/:/g, "");
  const glowId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const w = 720;
  const h = 248;
  const padL = 56;
  const padR = 56;
  const padT = 12;
  const padB = 40;
  const curveTension = 0.24;

  const prevAligned = useMemo(() => {
    if (previousSeries.length >= series.length) return previousSeries.slice(0, series.length);
    return [
      ...previousSeries,
      ...Array.from({ length: series.length - previousSeries.length }, () => ({
        date: "",
        commission: 0,
        sale: 0,
      })),
    ];
  }, [series, previousSeries]);

  const chart = useMemo(() => {
    if (series.length === 0) return null;
    const maxComm = Math.max(0, ...series.map((s) => s.commission));
    const maxPrevComm = Math.max(0, ...prevAligned.map((s) => s.commission));
    const maxSale = Math.max(0, ...series.map((s) => s.sale));
    const leftMax = Math.max(maxComm, maxPrevComm, 1e-12);
    const scaleSale = Math.max(maxSale, 1e-12);
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const n = Math.max(series.length, 1);
    const bottomY = h - padB;

    const xAt = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);

    const commPts = series.map((s, i) => ({
      x: xAt(i),
      y: padT + innerH - (s.commission / leftMax) * innerH,
    }));
    const prevCommPts = prevAligned.map((s, i) => ({
      x: xAt(i),
      y: padT + innerH - (s.commission / leftMax) * innerH,
    }));
    const salePts = series.map((s, i) => ({
      x: xAt(i),
      y: padT + innerH - (s.sale / scaleSale) * innerH,
    }));

    const commPath = maxComm > 0 ? smoothPathFromPoints(commPts, curveTension) : "";
    const prevCommPath = maxPrevComm > 0 ? smoothPathFromPoints(prevCommPts, curveTension) : "";
    const salePath = maxSale > 0 ? smoothPathFromPoints(salePts, curveTension) : "";
    const areaPath = maxComm > 0 && commPts.length > 0 ? areaPathUnderCommission(commPts, bottomY, curveTension) : "";

    const tickCount = 4;
    const gridRows = Array.from({ length: tickCount + 1 }, (_, i) => {
      const fracFromBottom = i / tickCount;
      const y = padT + innerH - fracFromBottom * innerH;
      const vComm = leftMax * fracFromBottom;
      const vSale = maxSale * fracFromBottom;
      return { y, vComm, vSale };
    });

    return {
      maxComm,
      maxPrevComm,
      maxSale,
      leftMax,
      scaleSale,
      commPts,
      prevCommPts,
      salePts,
      commPath,
      prevCommPath,
      salePath,
      areaPath,
      gridRows,
      bottomY,
      xAt,
      padL,
      innerW,
      n,
    };
  }, [series, prevAligned, h, padB, padL, padR, padT, w]);

  const onSvgPointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || !chart) return;
    const rect = svg.getBoundingClientRect();
    const vx = ((clientX - rect.left) / Math.max(rect.width, 1)) * w;
    const { padL: pl, innerW: iw, n: nPts } = chart;
    const ix = Math.max(0, Math.min(nPts - 1, Math.round(((vx - pl) / Math.max(iw, 1)) * (nPts - 1))));
    setHover(ix);
  };

  if (series.length === 0) {
    return (
      <div className="flex h-[248px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-950/50 px-4 text-center text-sm text-zinc-500">
        <p>No chart data in this window.</p>
      </div>
    );
  }

  if (!chart || (chart.maxComm <= 0 && chart.maxSale <= 0)) {
    return (
      <div className="flex h-[248px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-950/50 px-4 text-center text-sm text-zinc-500">
        <p className="text-zinc-400">No attributed commission or sales in the last 31 days.</p>
        <p className="max-w-md text-xs leading-relaxed text-zinc-500">
          Link clicks on your short links are counted here, but the chart only uses <strong className="text-zinc-400">synced Awin</strong>{" "}
          orders that match your link slug (click ref). Ask your admin to run an Awin transaction sync if you expect sales.
        </p>
      </div>
    );
  }

  const { commPath, prevCommPath, salePath, areaPath, gridRows, maxSale, maxComm, maxPrevComm, commPts, salePts, prevCommPts, bottomY, n } =
    chart;
  const hx = hover !== null ? commPts[hover]?.x ?? null : null;
  const dayLabel = hover !== null ? series[hover]?.date?.slice(8, 10) : null;

  return (
    <div className="relative">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-zinc-400">
          {maxComm > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.65)]" aria-hidden />
              Commission <span className="text-zinc-600">(current · left)</span>
            </span>
          )}
          {maxPrevComm > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-3.5 border-t border-dashed border-zinc-500" aria-hidden />
              Commission <span className="text-zinc-600">(prior 31d · left)</span>
            </span>
          )}
          {maxSale > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-3.5 border-t border-dashed border-teal-400/90" aria-hidden />
              Gross sales <span className="text-zinc-600">(current · right)</span>
            </span>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="h-[min(280px,42vw)] w-full min-h-[220px] touch-none select-none"
        preserveAspectRatio="none"
        aria-hidden
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => onSvgPointer(e.clientX)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) onSvgPointer(t.clientX);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) onSvgPointer(t.clientX);
        }}
        onTouchEnd={() => setHover(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(129,140,248)" stopOpacity="0.42" />
            <stop offset="55%" stopColor="rgb(99,102,241)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {gridRows.map((row, i) => (
          <g key={i}>
            <line x1={padL} y1={row.y} x2={w - padR} y2={row.y} stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
            {maxComm + maxPrevComm > 0 && (
              <text x={2} y={row.y + 4} className="fill-indigo-200/88" style={{ fontSize: 9 }}>
                {axisTickMoney(row.vComm, currency, chart.leftMax)}
              </text>
            )}
            {maxSale > 0 && (
              <text x={w - 2} y={row.y + 4} textAnchor="end" className="fill-teal-300/88" style={{ fontSize: 9 }}>
                {axisTickMoney(row.vSale, currency, maxSale)}
              </text>
            )}
          </g>
        ))}
        {areaPath && <path d={areaPath} fill={`url(#${fillId})`} />}
        {maxPrevComm > 0 && prevCommPath && (
          <path
            d={prevCommPath}
            fill="none"
            stroke="rgba(161,161,170,0.55)"
            strokeWidth="1.35"
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {maxSale > 0 && salePath && (
          <path
            d={salePath}
            fill="none"
            stroke="rgb(45,212,191)"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
        )}
        {maxComm > 0 && commPath && (
          <path
            d={commPath}
            fill="none"
            stroke="rgb(165,180,252)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />
        )}
        {hover !== null && hx !== null && (
          <line
            x1={hx}
            y1={padT}
            x2={hx}
            y2={bottomY}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {hover !== null && maxComm > 0 && (
          <circle cx={commPts[hover].x} cy={commPts[hover].y} r={5} fill="rgb(165,180,252)" stroke="rgb(24,24,27)" strokeWidth="2" pointerEvents="none" />
        )}
        {hover !== null && maxSale > 0 && (
          <circle cx={salePts[hover].x} cy={salePts[hover].y} r={4} fill="rgb(45,212,191)" stroke="rgb(24,24,27)" strokeWidth="2" pointerEvents="none" />
        )}
        {series.map((s, i) => {
          if (i % 5 !== 0 && i !== series.length - 1) return null;
          const innerW = w - padL - padR;
          const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
          const day = s.date.slice(8, 10);
          return (
            <text
              key={`${s.date}-${i}`}
              x={x}
              y={h - 10}
              textAnchor="middle"
              className={hover === i ? "fill-zinc-200" : "fill-zinc-500"}
              style={{ fontSize: 9 }}
            >
              {day}
            </text>
          );
        })}
      </svg>

      {hover !== null && dayLabel !== null && (
        <div
          className="pointer-events-none absolute z-20 min-w-[9.5rem] -translate-x-1/2 rounded-lg border border-white/12 bg-zinc-900/95 px-3 py-2.5 shadow-xl shadow-black/40 backdrop-blur-sm"
          style={{
            left: `${(commPts[hover].x / w) * 100}%`,
            top: 6,
          }}
        >
          <p className="text-[11px] font-semibold tabular-nums text-white">Day {dayLabel}</p>
          <p className="mt-1.5 space-y-1 text-[10px] leading-snug text-zinc-300">
            <span className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="text-zinc-500">Commission</span>
              <span className="ml-auto font-mono tabular-nums text-indigo-200">{formatMoney(series[hover].commission, currency)}</span>
            </span>
            {maxPrevComm > 0 && (
              <span className="flex items-center gap-2">
                <span className="h-px w-2.5 shrink-0 border-t border-dashed border-zinc-500" />
                <span className="text-zinc-500">Prior 31d</span>
                <span className="ml-auto font-mono tabular-nums text-zinc-400">
                  {formatMoney(prevAligned[hover]?.commission ?? 0, currency)}
                </span>
              </span>
            )}
            {maxSale > 0 && (
              <span className="flex items-center gap-2">
                <span className="h-px w-2.5 shrink-0 border-t border-dashed border-teal-400" />
                <span className="text-zinc-500">Gross sales</span>
                <span className="ml-auto font-mono tabular-nums text-teal-300/95">{formatMoney(series[hover].sale, currency)}</span>
              </span>
            )}
          </p>
        </div>
      )}
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
  performanceChartSeriesPrevious: { date: string; commission: number; sale: number; transactions: number }[];
  performanceRolling31Trends: {
    commissionPct: number | null;
    salePct: number | null;
    transactionsPct: number | null;
  } | null;
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
  performanceChartSeriesPrevious,
  performanceRolling31Trends,
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
                Totals use your reporting window (synced Awin rows attributed to your link slugs). Chart: last 31 UTC days in{" "}
                {primaryCurrency} — <span className="text-indigo-300/90">commission</span> (smooth line + fill, left),{" "}
                <span className="text-zinc-400">prior 31d commission</span> (dashed grey, same axis),{" "}
                <span className="text-teal-400/90">gross sales</span> (dashed, right). Sales use a separate scale so commission stays
                readable. Hover for a vertical guide and values.
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
              {performanceRolling31Trends && (
                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-zinc-500">
                  <span className="font-medium text-zinc-400">Rolling 31d vs prior 31d</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-zinc-600">Commission</span>
                    <span
                      className={
                        performanceRolling31Trends.commissionPct === null
                          ? "text-zinc-400"
                          : performanceRolling31Trends.commissionPct >= 0
                            ? "text-emerald-400/90"
                            : "text-rose-400/90"
                      }
                    >
                      {formatRollingTrendPct(performanceRolling31Trends.commissionPct)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-zinc-600">Sales</span>
                    <span
                      className={
                        performanceRolling31Trends.salePct === null
                          ? "text-zinc-400"
                          : performanceRolling31Trends.salePct >= 0
                            ? "text-emerald-400/90"
                            : "text-rose-400/90"
                      }
                    >
                      {formatRollingTrendPct(performanceRolling31Trends.salePct)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-zinc-600">Transactions</span>
                    <span
                      className={
                        performanceRolling31Trends.transactionsPct === null
                          ? "text-zinc-400"
                          : performanceRolling31Trends.transactionsPct >= 0
                            ? "text-emerald-400/90"
                            : "text-rose-400/90"
                      }
                    >
                      {formatRollingTrendPct(performanceRolling31Trends.transactionsPct)}
                    </span>
                  </span>
                </p>
              )}
              <div className="mt-4 rounded-xl border border-white/5 bg-zinc-950/40 px-2 pb-2 pt-3">
                <PerformanceEarningsChart
                  series={performanceChartSeries}
                  previousSeries={performanceChartSeriesPrevious}
                  currency={primaryCurrency}
                />
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
