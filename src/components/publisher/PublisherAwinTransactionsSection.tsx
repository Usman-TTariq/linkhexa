"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type ParsedRow = {
  awinTransactionId: string;
  advertiserId: number | null;
  advertiserName?: string | null;
  commissionStatus: string | null;
  commissionAmount: number;
  commissionCurrency: string;
  saleAmount: number;
  saleCurrency: string;
  transactionDate: string;
  clickRef: string | null;
};

type DbRow = {
  awin_transaction_id: string;
  advertiser_id: number | null;
  advertiser_name?: string | null;
  commission_status: string | null;
  commission_amount: number;
  commission_currency: string;
  sale_amount: number;
  sale_currency: string;
  transaction_date: string;
  click_ref: string | null;
  go_link_slug: string | null;
  synced_at: string;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function PublisherAwinTransactionsSection() {
  const [tab, setTab] = useState<"stored" | "live">("stored");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [storedRows, setStoredRows] = useState<DbRow[]>([]);
  const [storedTotal, setStoredTotal] = useState(0);
  const [storedLoading, setStoredLoading] = useState(false);
  const [storedError, setStoredError] = useState<string | null>(null);

  const [liveStart, setLiveStart] = useState("");
  const [liveEnd, setLiveEnd] = useState("");
  const [liveRows, setLiveRows] = useState<ParsedRow[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [liveMeta, setLiveMeta] = useState<{ rangeStart: string; rangeEnd: string; count: number } | null>(null);

  const loadStored = useCallback(async () => {
    setStoredLoading(true);
    setStoredError(null);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (from.trim()) params.set("from", from.trim());
      if (to.trim()) params.set("to", to.trim());
      const res = await fetch(`/api/publisher/awin/transactions?${params}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStoredError(typeof data.error === "string" ? data.error : "Load failed");
        return;
      }
      setStoredRows(Array.isArray(data.rows) ? data.rows : []);
      setStoredTotal(typeof data.total === "number" ? data.total : 0);
    } catch {
      setStoredError("Request failed");
    } finally {
      setStoredLoading(false);
    }
  }, [limit, offset, from, to]);

  useEffect(() => {
    if (tab !== "stored") return;
    void loadStored();
  }, [tab, loadStored]);

  const fetchLive = async () => {
    setLiveLoading(true);
    setLiveError(null);
    setLiveNotice(null);
    setLiveMeta(null);
    setLiveRows([]);
    try {
      const startIso = liveStart.trim() ? `${liveStart.trim()}T00:00:00.000Z` : "";
      const endIso = liveEnd.trim() ? `${liveEnd.trim()}T23:59:59.999Z` : "";
      if (!startIso || !endIso) {
        setLiveError("Choose both start and end dates (UTC).");
        setLiveLoading(false);
        return;
      }
      const res = await fetch("/api/publisher/awin/transactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: startIso, end: endIso }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLiveError(typeof data.error === "string" ? data.error : "Live fetch failed");
        return;
      }
      setLiveRows(Array.isArray(data.rows) ? data.rows : []);
      setLiveMeta({
        rangeStart: data.rangeStart ?? startIso,
        rangeEnd: data.rangeEnd ?? endIso,
        count: typeof data.count === "number" ? data.count : 0,
      });
      if (typeof data.notice === "string") setLiveNotice(data.notice);
    } catch {
      setLiveError("Request failed");
    } finally {
      setLiveLoading(false);
    }
  };

  const storedEnd = Math.min(offset + storedRows.length, offset + limit);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < storedTotal;

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white">Your Awin sales (transactions)</h2>
      <p className="mt-1 text-xs text-zinc-500">
        <strong className="text-zinc-400">Stored</strong> shows your synced Awin rows (matched to your account or your go-link slug / click ref).{" "}
        <strong className="text-zinc-400">Live</strong> pulls the same Awin list as the network, but only rows whose{" "}
        <span className="text-zinc-400">click ref</span> matches one of your short-link slugs (max 31 days per request).
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setTab("stored")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "stored" ? "bg-teal-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Stored (your sales)
        </button>
        <button
          type="button"
          onClick={() => setTab("live")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "live" ? "bg-teal-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Live from Awin
        </button>
      </div>

      {tab === "stored" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">From (UTC)</label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setOffset(0);
                }}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">To (UTC)</label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setOffset(0);
                }}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadStored()}
              disabled={storedLoading}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            >
              {storedLoading ? "Loading…" : "Refresh"}
            </button>
          </div>
          {storedError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{storedError}</p>
          )}
          <p className="text-xs text-zinc-500">
            {storedRows.length === 0 ? 0 : offset + 1}–{storedEnd} of {storedTotal.toLocaleString()}
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Sale</th>
                  <th className="px-3 py-2.5">Commission</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Brand</th>
                  <th className="px-3 py-2.5">Click ref</th>
                  <th className="px-3 py-2.5">Txn id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {storedRows.length === 0 && !storedLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-zinc-500">
                      No synced sales in this date range yet. Use tracking links (slug in Awin click ref), then ask your admin to sync transactions.
                    </td>
                  </tr>
                ) : (
                  storedRows.map((r) => (
                    <tr key={r.awin_transaction_id} className="text-zinc-300">
                      <td className="whitespace-nowrap px-3 py-2 text-xs">{formatWhen(r.transaction_date)}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {formatMoney(Number(r.sale_amount), r.sale_currency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {formatMoney(Number(r.commission_amount), r.commission_currency)}
                      </td>
                      <td className="px-3 py-2 text-xs">{r.commission_status ?? "—"}</td>
                      <td className="px-3 py-2">
                        <div className="min-w-[180px]">
                          <div className="truncate text-sm text-zinc-200" title={r.advertiser_name ?? ""}>
                            {r.advertiser_name ?? "—"}
                          </div>
                          <div className="text-xs tabular-nums text-zinc-500">{r.advertiser_id ?? "—"}</div>
                        </div>
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2 font-mono text-xs" title={r.click_ref ?? ""}>
                        {r.click_ref ?? "—"}
                      </td>
                      <td className="max-w-[100px] truncate px-3 py-2 font-mono text-xs" title={r.awin_transaction_id}>
                        {r.awin_transaction_id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!hasPrev || storedLoading}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!hasNext || storedLoading}
              onClick={() => setOffset((o) => o + limit)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {tab === "live" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Start (UTC)</label>
              <input
                type="date"
                value={liveStart}
                onChange={(e) => setLiveStart(e.target.value)}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">End (UTC)</label>
              <input
                type="date"
                value={liveEnd}
                onChange={(e) => setLiveEnd(e.target.value)}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => void fetchLive()}
              disabled={liveLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {liveLoading ? "Fetching…" : "Fetch from Awin"}
            </button>
          </div>
          {liveError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{liveError}</p>
          )}
          {liveNotice && <p className="text-sm text-amber-200/90">{liveNotice}</p>}
          {liveMeta && (
            <p className="text-sm text-teal-100/90">
              {liveMeta.count.toLocaleString()} sale(s) matched to your link slugs for{" "}
              {new Date(liveMeta.rangeStart).toISOString().slice(0, 10)} →{" "}
              {new Date(liveMeta.rangeEnd).toISOString().slice(0, 10)} (UTC).
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Sale</th>
                  <th className="px-3 py-2.5">Commission</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Brand</th>
                  <th className="px-3 py-2.5">Click ref</th>
                  <th className="px-3 py-2.5">Txn id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liveRows.length === 0 && !liveLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-zinc-500">
                      Pick dates and fetch. Only transactions with your slug as click ref appear here.
                    </td>
                  </tr>
                ) : (
                  liveRows.map((r) => (
                    <tr key={r.awinTransactionId} className="text-zinc-300">
                      <td className="whitespace-nowrap px-3 py-2 text-xs">{formatWhen(r.transactionDate)}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {formatMoney(r.saleAmount, r.saleCurrency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {formatMoney(r.commissionAmount, r.commissionCurrency)}
                      </td>
                      <td className="px-3 py-2 text-xs">{r.commissionStatus ?? "—"}</td>
                      <td className="px-3 py-2">
                        <div className="min-w-[180px]">
                          <div className="truncate text-sm text-zinc-200" title={r.advertiserName ?? ""}>
                            {r.advertiserName ?? "—"}
                          </div>
                          <div className="text-xs tabular-nums text-zinc-500">{r.advertiserId ?? "—"}</div>
                        </div>
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2 font-mono text-xs" title={r.clickRef ?? ""}>
                        {r.clickRef ?? "—"}
                      </td>
                      <td className="max-w-[100px] truncate px-3 py-2 font-mono text-xs" title={r.awinTransactionId}>
                        {r.awinTransactionId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-600">
        Need help?{" "}
        <Link href="/contact" className="text-indigo-400 hover:underline">
          Contact
        </Link>{" "}
        or use support chat.
      </p>
    </section>
  );
}
