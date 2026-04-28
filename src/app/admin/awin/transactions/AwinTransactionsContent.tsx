"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  publisher_id: string | null;
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

function formatCurrencyMap(map: Record<string, number>): string {
  const entries = Object.entries(map).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) return "—";
  entries.sort((a, b) => b[1] - a[1]);
  return entries.map(([c, amt]) => formatMoney(amt, c)).join(" · ");
}

type StoredFilterTotals = {
  commissionByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
  rowCount: number;
  capped?: boolean;
};

const GO_LINK_SLUG_RE = /^[A-Za-z0-9]{6,32}$/;

export default function AwinTransactionsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"stored" | "live">("stored");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [attributedOnly, setAttributedOnly] = useState(false);
  const [goLinkSlug, setGoLinkSlug] = useState("");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [storedRows, setStoredRows] = useState<DbRow[]>([]);
  const [storedTotal, setStoredTotal] = useState(0);
  const [storedLoading, setStoredLoading] = useState(false);
  const [storedError, setStoredError] = useState<string | null>(null);
  const [storedFilterTotals, setStoredFilterTotals] = useState<StoredFilterTotals | null>(null);

  const [liveStart, setLiveStart] = useState("");
  const [liveEnd, setLiveEnd] = useState("");
  const [liveRows, setLiveRows] = useState<ParsedRow[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveMeta, setLiveMeta] = useState<{ rangeStart: string; rangeEnd: string; count: number } | null>(null);

  const goLinkSlugFromUrl = searchParams.get("goLinkSlug")?.trim() ?? "";
  /** Must match deep links: "All" uses slug only; "Linked" uses &attributedOnly=1 */
  const attributedOnlyFromUrl = searchParams.get("attributedOnly");
  useEffect(() => {
    if (!GO_LINK_SLUG_RE.test(goLinkSlugFromUrl)) return;
    setGoLinkSlug(goLinkSlugFromUrl);
    setAttributedOnly(attributedOnlyFromUrl === "1");
    setOffset(0);
    setTab("stored");
  }, [goLinkSlugFromUrl, attributedOnlyFromUrl]);

  const loadStored = useCallback(async () => {
    setStoredLoading(true);
    setStoredError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (from.trim()) params.set("from", from.trim());
      if (to.trim()) params.set("to", to.trim());
      if (attributedOnly) params.set("attributedOnly", "1");
      if (GO_LINK_SLUG_RE.test(goLinkSlug.trim())) params.set("goLinkSlug", goLinkSlug.trim());
      const res = await fetch(`/api/admin/awin/transactions?${params}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStoredError(typeof data.error === "string" ? data.error : "Load failed");
        setStoredFilterTotals(null);
        return;
      }
      setStoredRows(Array.isArray(data.rows) ? data.rows : []);
      setStoredTotal(typeof data.total === "number" ? data.total : 0);
      const ft = data.filterTotals;
      if (
        ft &&
        typeof ft.rowCount === "number" &&
        ft.commissionByCurrency &&
        typeof ft.commissionByCurrency === "object" &&
        ft.saleByCurrency &&
        typeof ft.saleByCurrency === "object"
      ) {
        setStoredFilterTotals({
          rowCount: ft.rowCount,
          capped: Boolean(ft.capped),
          commissionByCurrency: ft.commissionByCurrency as Record<string, number>,
          saleByCurrency: ft.saleByCurrency as Record<string, number>,
        });
      } else {
        setStoredFilterTotals(null);
      }
    } catch {
      setStoredError("Request failed");
      setStoredFilterTotals(null);
    } finally {
      setStoredLoading(false);
    }
  }, [limit, offset, from, to, attributedOnly, goLinkSlug]);

  useEffect(() => {
    if (tab !== "stored") return;
    void loadStored();
  }, [tab, loadStored]);

  const fetchLive = async () => {
    setLiveLoading(true);
    setLiveError(null);
    setLiveMeta(null);
    setLiveRows([]);
    try {
      const startIso = liveStart.trim() ? `${liveStart.trim()}T00:00:00.000Z` : "";
      const endIso = liveEnd.trim() ? `${liveEnd.trim()}T23:59:59.999Z` : "";
      if (!startIso || !endIso) {
        setLiveError("Choose both start and end dates (UTC calendar days).");
        setLiveLoading(false);
        return;
      }
      const res = await fetch("/api/admin/awin/transactions", {
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
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Sales &amp; transactions
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
        <strong className="font-medium text-zinc-300">Stored</strong> shows rows saved by transaction sync (
        <code className="rounded bg-white/10 px-1 text-xs">awin_transactions</code>).{" "}
        <strong className="font-medium text-zinc-300">Live (Awin API)</strong> calls the same publisher transactions
        endpoint as the Awin dashboard list (up to 31 days) — results are not saved until you run{" "}
        <Link href="/admin/awin/actions" className="text-teal-400 hover:underline">
          Sync transactions
        </Link>
        . Rows with no publisher after sync live under{" "}
        <Link href="/admin/awin/lost-transactions" className="font-medium text-teal-400 hover:underline">
          Lost transactions
        </Link>{" "}
        (no publisher) or{" "}
        <Link href="/admin/awin/all-transactions" className="font-medium text-teal-400 hover:underline">
          All transactions (assign / change)
        </Link>{" "}
        — paginated, manual assign.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setTab("stored")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "stored" ? "bg-teal-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Stored in LinkHexa
        </button>
        <button
          type="button"
          onClick={() => setTab("live")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "live" ? "bg-teal-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Live from Awin API
        </button>
      </div>

      {tab === "stored" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="txn-from" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                From (UTC date)
              </label>
              <input
                id="txn-from"
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
              <label htmlFor="txn-to" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                To (UTC date)
              </label>
              <input
                id="txn-to"
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setOffset(0);
                }}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={attributedOnly}
                onChange={(e) => {
                  setAttributedOnly(e.target.checked);
                  setOffset(0);
                }}
                className="rounded border-white/20 bg-zinc-950"
              />
              Attributed only
            </label>
            <div>
              <label
                htmlFor="txn-go-slug"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Go link slug
              </label>
              <input
                id="txn-go-slug"
                type="text"
                value={goLinkSlug}
                onChange={(e) => {
                  setGoLinkSlug(e.target.value);
                  setOffset(0);
                }}
                placeholder="e.g. Ab3xY9mK2q"
                className="mt-1 w-44 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
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
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{storedError}</p>
          )}
          <p className="text-xs text-zinc-500">
            Showing {storedRows.length === 0 ? 0 : offset + 1}–{storedEnd} of {storedTotal.toLocaleString()} (page size{" "}
            {limit})
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Sale</th>
                  <th className="px-3 py-3">Commission</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Brand</th>
                  <th className="px-3 py-3">Click ref</th>
                  <th className="px-3 py-3">Publisher</th>
                  <th className="px-3 py-3">Txn id</th>
                </tr>
                {storedFilterTotals && GO_LINK_SLUG_RE.test(goLinkSlug.trim()) && (
                  <tr className="border-b border-white/10 bg-zinc-950/70 text-xs font-normal normal-case">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-3 py-2 text-left font-medium text-zinc-500"
                    >
                      Totals ({storedFilterTotals.rowCount.toLocaleString()} txn
                      {storedFilterTotals.capped ? "+" : ""})
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left tabular-nums font-semibold text-white">
                      {formatCurrencyMap(storedFilterTotals.saleByCurrency)}
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left tabular-nums font-semibold text-teal-300">
                      {formatCurrencyMap(storedFilterTotals.commissionByCurrency)}
                    </th>
                    <th colSpan={5} className="px-3 py-2 text-left font-normal text-zinc-500">
                      {storedFilterTotals.capped
                        ? "Sum capped at first 50k matching rows — increase date range or export for full reconciliation."
                        : "All matching rows in current filters."}
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {storedRows.length === 0 && !storedLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-zinc-500">
                      No rows. Run transaction sync from Actions or the dashboard.
                    </td>
                  </tr>
                ) : (
                  storedRows.map((r) => (
                    <tr key={r.awin_transaction_id} className="border-b border-white/5 text-zinc-300">
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs">{formatWhen(r.transaction_date)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                        {formatMoney(Number(r.sale_amount), r.sale_currency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                        {formatMoney(Number(r.commission_amount), r.commission_currency)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">{r.commission_status ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        <div className="min-w-[180px]">
                          <div className="truncate text-sm text-zinc-200" title={r.advertiser_name ?? ""}>
                            {r.advertiser_name ?? "—"}
                          </div>
                          <div className="text-xs tabular-nums text-zinc-500">{r.advertiser_id ?? "—"}</div>
                        </div>
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs" title={r.click_ref ?? ""}>
                        {r.click_ref ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {r.publisher_id ? (
                          <span className="text-teal-400/90">Yes</span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2.5 font-mono text-xs" title={r.awin_transaction_id}>
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
        <div className="mt-6 space-y-4">
          <p className="text-xs text-zinc-500">
            Uses publisher token (<code className="rounded bg-white/10 px-1">AWIN_API_TOKEN</code>). Maximum window: 31 days
            (Awin limit). Does not write to the database.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="live-start" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Start (UTC date)
              </label>
              <input
                id="live-start"
                type="date"
                value={liveStart}
                onChange={(e) => setLiveStart(e.target.value)}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label htmlFor="live-end" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                End (UTC date)
              </label>
              <input
                id="live-end"
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
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{liveError}</p>
          )}
          {liveMeta && (
            <p className="text-sm text-teal-100/90">
              {liveMeta.count.toLocaleString()} transaction(s) from Awin for{" "}
              {new Date(liveMeta.rangeStart).toISOString().slice(0, 10)} →{" "}
              {new Date(liveMeta.rangeEnd).toISOString().slice(0, 10)} (UTC).
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Sale</th>
                  <th className="px-3 py-3">Commission</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Brand</th>
                  <th className="px-3 py-3">Click ref</th>
                  <th className="px-3 py-3">Txn id</th>
                </tr>
              </thead>
              <tbody>
                {liveRows.length === 0 && !liveLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-zinc-500">
                      Pick dates and fetch — same source as Awin publisher transaction list (within API limits).
                    </td>
                  </tr>
                ) : (
                  liveRows.map((r) => (
                    <tr key={r.awinTransactionId} className="border-b border-white/5 text-zinc-300">
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs">{formatWhen(r.transactionDate)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                        {formatMoney(r.saleAmount, r.saleCurrency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                        {formatMoney(r.commissionAmount, r.commissionCurrency)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">{r.commissionStatus ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        <div className="min-w-[180px]">
                          <div className="truncate text-sm text-zinc-200" title={r.advertiserName ?? ""}>
                            {r.advertiserName ?? "—"}
                          </div>
                          <div className="text-xs tabular-nums text-zinc-500">{r.advertiserId ?? "—"}</div>
                        </div>
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs" title={r.clickRef ?? ""}>
                        {r.clickRef ?? "—"}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2.5 font-mono text-xs" title={r.awinTransactionId}>
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

      <p className="mt-10 text-sm text-zinc-500">
        <Link href="/admin" className="text-teal-400 hover:underline">
          Dashboard
        </Link>{" "}
        ·{" "}
        <Link href="/admin/awin/actions" className="text-teal-400 hover:underline">
          Actions (sync)
        </Link>
      </p>
    </>
  );
}
