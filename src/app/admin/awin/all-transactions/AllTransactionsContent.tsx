"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AssignTransactionModal from "@/components/admin/AssignTransactionModal";

const PAGE = 40;
const SLUG_RE = /^[A-Za-z0-9]{6,32}$/;

type Row = {
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

type Scope = "all" | "attributed" | "lost";

type Filters = {
  from: string;
  to: string;
  goSlug: string;
  scope: Scope;
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

function shortPublisher(id: string | null | undefined): string {
  if (!id || !String(id).trim()) return "—";
  const s = String(id);
  return `${s.slice(0, 8)}…`;
}

const defaultFilters: Filters = { from: "", to: "", goSlug: "", scope: "all" };

export default function AllTransactionsContent() {
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
      if (applied.from.trim()) params.set("from", applied.from.trim());
      if (applied.to.trim()) params.set("to", applied.to.trim());
      const slug = applied.goSlug.trim();
      if (SLUG_RE.test(slug)) params.set("goLinkSlug", slug);
      if (applied.scope === "attributed") params.set("attributedOnly", "1");
      if (applied.scope === "lost") params.set("lostOnly", "1");

      const res = await fetch(`/api/admin/awin/transactions?${params}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Load failed");
        setRows([]);
        return;
      }
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } finally {
      setLoading(false);
    }
  }, [offset, applied]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = () => {
    const slugRaw = draft.goSlug.trim();
    setApplied({
      from: draft.from.trim(),
      to: draft.to.trim(),
      goSlug: SLUG_RE.test(slugRaw) ? slugRaw : "",
      scope: draft.scope,
    });
    setOffset(0);
  };

  const clearFilters = () => {
    setDraft(defaultFilters);
    setApplied(defaultFilters);
    setOffset(0);
  };

  const end = Math.min(offset + rows.length, offset + PAGE);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE < total;

  return (
    <AdminShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Awin</p>
            <h1 className="text-2xl font-bold tracking-tight text-white">All transactions (assign)</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Paginated view of every row in <code className="rounded bg-white/10 px-1 text-xs">awin_transactions</code>. Use{" "}
              <strong className="text-zinc-300">Apply filters</strong> so the browser only loads one page at a time. Assign or reassign
              to a publisher + slug; reassign requires confirmation. Manual rows stay protected on sync.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/awin/lost-transactions"
              className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-white/25 hover:bg-white/10"
            >
              Lost only
            </Link>
            <Link
              href="/admin/awin/transactions"
              className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-white/25 hover:bg-white/10"
            >
              Sales / live
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Filters</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              From (UTC date)
              <input
                type="date"
                value={draft.from}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              To (UTC date)
              <input
                type="date"
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex min-w-[140px] flex-col gap-1 text-xs text-zinc-400">
              Go-link slug
              <input
                type="text"
                value={draft.goSlug}
                onChange={(e) => setDraft((d) => ({ ...d, goSlug: e.target.value }))}
                placeholder="Optional · 6–32 chars"
                className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              Scope
              <select
                value={draft.scope}
                onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as Scope }))}
                className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="all">All rows</option>
                <option value="attributed">Attributed only</option>
                <option value="lost">Lost only (no publisher)</option>
              </select>
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Clear
            </button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">
            Pagination uses the filters above. Changing dates or slug without clicking Apply does not refetch (keeps the tab fast).
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" role="alert">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-white">{total.toLocaleString()}</span> matching{" "}
              {total === 1 ? "row" : "rows"}
              {loading ? " · loading…" : rows.length ? ` · rows ${offset + 1}–${end} of ${total.toLocaleString()}` : ""}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrev || loading}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE))}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!hasNext || loading}
                onClick={() => setOffset((o) => o + PAGE)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-zinc-950/50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Programme</th>
                  <th className="px-4 py-3 font-medium">Commission</th>
                  <th className="px-4 py-3 font-medium">Sale</th>
                  <th className="px-4 py-3 font-medium">Publisher</th>
                  <th className="px-4 py-3 font-medium">Slug / ref</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                      No rows for this filter and page.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.awin_transaction_id} className="hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">{formatWhen(r.transaction_date)}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-zinc-300" title={r.advertiser_name ?? undefined}>
                        {r.advertiser_name ?? (r.advertiser_id != null ? `#${r.advertiser_id}` : "—")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                        {formatMoney(Number(r.commission_amount), r.commission_currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-400">
                        {formatMoney(Number(r.sale_amount), r.sale_currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500" title={r.publisher_id ?? ""}>
                        {shortPublisher(r.publisher_id)}
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-zinc-500" title={r.go_link_slug || r.click_ref || ""}>
                        {r.go_link_slug?.trim() || r.click_ref?.trim() || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{r.commission_status ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setAssignFor(r)}
                          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                        >
                          {r.publisher_id ? "Change" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AssignTransactionModal
          row={
            assignFor
              ? {
                  awin_transaction_id: assignFor.awin_transaction_id,
                  commission_amount: Number(assignFor.commission_amount),
                  commission_currency: assignFor.commission_currency,
                  sale_amount: Number(assignFor.sale_amount),
                  sale_currency: assignFor.sale_currency,
                  publisher_id: assignFor.publisher_id,
                }
              : null
          }
          onClose={() => setAssignFor(null)}
          onSuccess={load}
        />
      </div>
    </AdminShell>
  );
}
