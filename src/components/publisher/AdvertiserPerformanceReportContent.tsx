"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AdvertiserRow = {
  advertiserId: number;
  name: string;
  network: "Awin";
  code: string;
  clicks: number;
  sales: number;
  leads: number;
  revenueByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

type ReportPayload = {
  from: string;
  to: string;
  attributedTransactionCount: number;
  diagnostics?: {
    trackingLinkCount: number;
    distinctSlugs: number;
    attributedTransactionsInRange: number;
    dbTransactionsWithPublisherIdInRange: number | null;
  };
  kpis: {
    totalClicks: number;
    sales: number;
    leads: number;
    revenueByCurrency: Record<string, number>;
    commissionByCurrency: Record<string, number>;
  };
  advertisers: AdvertiserRow[];
};

function defaultRangeYmd(): { from: string; to: string } {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/** Sum per currency — not FX-converted across currencies. */
function formatCurrencyBucket(ob: Record<string, number> | undefined): string {
  if (!ob) return "—";
  const entries = Object.entries(ob).filter(([, v]) => Number(v) > 0);
  if (entries.length === 0) return "—";
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([c, v]) => formatMoney(v, c)).join(" · ");
}

function bucketToCsvCell(ob: Record<string, number>): string {
  const s = Object.entries(ob)
    .filter(([, v]) => Number(v) > 0)
    .map(([c, v]) => `${c}:${Number(v).toFixed(2)}`)
    .join("; ");
  return `"${(s || "—").replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const card = "rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm";
const kpiCard =
  "rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-4 shadow-inner shadow-black/20 sm:min-h-[100px]";

export default function AdvertiserPerformanceReportContent() {
  const defaults = useMemo(() => defaultRangeYmd(), []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);

  const [data, setData] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async (f: string, t: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ from: f, to: t });
      const res = await fetch(`/api/publisher/reports/advertiser-performance?${params}`, { credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as ReportPayload & { error?: string };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not load report.");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Could not load report.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(appliedFrom, appliedTo);
  }, [load, appliedFrom, appliedTo]);

  const filtered = useMemo(() => {
    const rows = data?.advertisers ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        String(r.advertiserId).includes(q)
    );
  }, [data, filter]);

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const visiblePages = useMemo(() => {
    const total = totalPages;
    const c = pageSafe;
    if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1) as (number | "gap")[];
    const set = new Set<number>();
    set.add(1);
    set.add(total);
    for (let i = c - 2; i <= c + 2; i++) {
      if (i >= 1 && i <= total) set.add(i);
    }
    const sorted = [...set].sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const v = sorted[i]!;
      if (i > 0 && v - sorted[i - 1]! > 1) out.push("gap");
      out.push(v);
    }
    return out;
  }, [totalPages, pageSafe]);

  const exportCsv = () => {
    if (!data) return;
    const header = ["Advertiser", "Network", "Code", "Clicks", "Sales", "Leads", "Revenue (by currency)", "Commission (by currency)"];
    const lines = filtered.map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        r.network,
        `"${r.code.replace(/"/g, '""')}"`,
        r.clicks,
        r.sales,
        r.leads,
        bucketToCsvCell(r.revenueByCurrency),
        bucketToCsvCell(r.commissionByCurrency),
      ].join(",")
    );
    downloadCsv(`linkhexa-advertiser-performance-${data.from}_${data.to}.csv`, [header.join(","), ...lines].join("\n"));
  };

  const applyRange = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Reports</p>
          <h1
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
          >
            Advertiser performance
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Clicks, sales, and revenue for <strong className="text-zinc-300">your</strong> account only: same attribution as
            the dashboard (Awin rows linked to your publisher id or your link slugs). Raw Awin network totals are not split
            here per LinkHexa publisher — attribution happens after sync in our database.
          </p>
          {data && !loading && (
            <p className="mt-2 text-xs text-zinc-500">
              Attributed transactions in this range:{" "}
              <span className="font-mono text-zinc-400">{data.attributedTransactionCount.toLocaleString()}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              From (UTC)
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              To (UTC)
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyRange()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
            >
              Apply
            </button>
            <button
              type="button"
              disabled={!data || loading}
              onClick={() => exportCsv()}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div
        className="mb-6 rounded-xl border border-sky-500/25 bg-sky-500/[0.08] px-4 py-3 text-sm leading-relaxed text-sky-100/90"
        role="note"
      >
        <span className="font-semibold text-sky-200">Notice · </span>
        Figures are from your LinkHexa account: short-link <strong className="text-white">clicks</strong> per brand, and{" "}
        <strong className="text-white">Awin</strong> rows attributed to you (publisher id or matching link slug in click
        ref). Payout policy and platform fees are defined in your publisher agreement — not shown as a split here. Multiple
        currencies are listed separately (no FX conversion).
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(
          [
            { label: "Total clicks", format: "int" as const, render: () => (data?.kpis.totalClicks ?? 0).toLocaleString() },
            { label: "Sales (txns)", format: "int" as const, render: () => (data?.kpis.sales ?? 0).toLocaleString() },
            { label: "Leads", format: "int" as const, render: () => (data?.kpis.leads ?? 0).toLocaleString() },
            {
              label: "Total revenue",
              format: "text" as const,
              render: () => formatCurrencyBucket(data?.kpis.revenueByCurrency),
            },
            {
              label: "Total commission",
              format: "text" as const,
              render: () => formatCurrencyBucket(data?.kpis.commissionByCurrency),
            },
          ] as const
        ).map((kpi) => (
          <div key={kpi.label} className={kpiCard}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{kpi.label}</p>
            <p
              className={`mt-2 font-bold tabular-nums tracking-tight text-white ${
                kpi.format === "text" ? "text-base leading-snug sm:text-lg" : "text-xl sm:text-2xl"
              }`}
            >
              {loading ? "…" : kpi.render()}
            </p>
          </div>
        ))}
      </div>

      <div className={card}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Filter by advertiser or code…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 sm:max-w-md"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="network-filter" className="sr-only">
                Network
              </label>
              <span className="text-xs text-zinc-500">Network</span>
              <select
                id="network-filter"
                disabled
                className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-400"
                title="LinkHexa currently integrates Awin for this report"
              >
                <option>All (Awin)</option>
              </select>
            </div>
          </div>
          <p className="shrink-0 text-sm text-zinc-500">
            <span className="font-medium text-zinc-300">{filtered.length}</span> advertisers
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Advertiser</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3 text-right">Sales</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-amber-200/90">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && slice.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                    No rows match this filter.{" "}
                    <Link href="/dashboard/brands" className="font-medium text-indigo-400 hover:underline">
                      Browse brands
                    </Link>{" "}
                    to create links.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                slice.map((r) => (
                  <tr key={r.advertiserId} className="text-zinc-300">
                    <td className="px-4 py-3 font-medium text-zinc-100">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-violet-500/35 bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-200">
                        {r.network}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-indigo-200/90">{r.code}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white">{r.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{r.sales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{r.leads}</td>
                    <td className="max-w-[220px] px-4 py-3 text-right text-xs font-medium leading-snug text-teal-300/95 sm:text-sm">
                      {formatCurrencyBucket(r.revenueByCurrency)}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-right text-xs font-medium leading-snug text-white sm:text-sm">
                      {formatCurrencyBucket(r.commissionByCurrency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/brands/${r.advertiserId}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-200"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {visiblePages.map((p, idx) =>
              p === "gap" ? (
                <span key={`gap-${idx}`} className="px-1 text-zinc-600">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                    p === pageSafe
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                      : "border border-white/10 bg-zinc-950 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
