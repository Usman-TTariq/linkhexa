"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatCurrencyTotals } from "@/lib/admin/format-currency-totals";

type CurrencyMap = Record<string, number>;

type LinkRow = {
  id: string;
  slug: string;
  shortUrl: string;
  targetUrl: string;
  deepLink: boolean;
  clicks: number;
  createdAt: string;
  programmeId: number;
  brandName: string | null;
  publisher: { id: string; username: string; email: string };
  stats: {
    txnCount: number;
    saleByCurrency: CurrencyMap;
    commissionByCurrency: CurrencyMap;
  };
};

const SLUG_RE = /^[A-Za-z0-9]{6,32}$/;

export default function AwinTrackingLinksContent() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [onlyWithSales, setOnlyWithSales] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanCapped, setScanCapped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (onlyWithSales) params.set("onlyWithSales", "1");
      const res = await fetch(`/api/admin/awin/tracking-links?${params}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Load failed");
        setLinks([]);
        setTotal(0);
        return;
      }
      setLinks(Array.isArray(data.links) ? data.links : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
      setScanCapped(Boolean(data.meta?.scanCapped));
    } catch {
      setError("Request failed");
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, onlyWithSales]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.floor(offset / limit) + 1;

  const toggleSalesOnly = (next: boolean) => {
    setOnlyWithSales(next);
    setOffset(0);
  };

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Tracking links
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
        Short links created in LinkHexa (<code className="rounded bg-white/10 px-1 text-xs">/go/short/…</code>
        ). <strong className="text-zinc-300">Clicks</strong> are counted when someone hits that short URL on LinkHexa.
        <strong className="text-zinc-300"> Sales and commission</strong> only appear when Awin reports a{" "}
        <strong className="text-zinc-300">paid / tracked conversion</strong>, the row is stored by{" "}
        <strong className="text-zinc-300">transaction sync</strong>, and the row is{" "}
        <strong className="text-zinc-300">attributed</strong> (same slug on{" "}
        <code className="rounded bg-white/10 px-1 text-xs">click_ref</code> or{" "}
        <code className="rounded bg-white/10 px-1 text-xs">go_link_slug</code> with a{" "}
        <code className="rounded bg-white/10 px-1 text-xs">publisher_id</code>). A click without a matching
        conversion in <code className="rounded bg-white/10 px-1 text-xs">awin_transactions</code> still shows{" "}
        <span className="text-zinc-300">£0.00</span> — that is expected.
      </p>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-500">
        If you expect sales but always see zero, confirm Awin is sending this slug as the click reference, run{" "}
        <Link href="/admin/awin/actions" className="text-teal-400 hover:underline">
          Sync transactions
        </Link>
        , then check{" "}
        <Link href="/admin/awin/transactions" className="text-teal-400 hover:underline">
          Sales & transactions
        </Link>{" "}
        (use <strong className="text-zinc-400">Go link slug</strong> there).
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={onlyWithSales}
            onChange={(e) => toggleSalesOnly(e.target.checked)}
            className="rounded border-white/20 bg-zinc-900"
          />
          Only links with attributed sales
        </label>
        {onlyWithSales && scanCapped && (
          <span className="text-xs text-amber-400">
            Partial scan (older rows may be missing from this ranking).
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
        {loading ? (
          <p className="p-6 text-center text-sm text-zinc-500">Loading…</p>
        ) : links.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">No tracking links found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="p-3 font-medium">Slug / URL</th>
                <th className="p-3 font-medium">Publisher</th>
                <th className="p-3 font-medium">Brand</th>
                <th className="p-3 font-medium">Clicks</th>
                <th className="p-3 font-medium">Txns</th>
                <th className="p-3 font-medium">Sales</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-white">
                  <td className="p-3 align-top">
                    <div className="font-mono text-xs text-teal-300">{row.slug}</div>
                    <div className="mt-1 max-w-[220px] truncate text-xs text-zinc-500" title={row.shortUrl}>
                      {row.shortUrl}
                    </div>
                  </td>
                  <td className="p-3 align-top text-zinc-300">
                    <div>{row.publisher.username}</div>
                    <div className="text-xs text-zinc-500">{row.publisher.email}</div>
                  </td>
                  <td className="p-3 align-top text-zinc-400">{row.brandName ?? "—"}</td>
                  <td className="p-3 align-top text-zinc-300">{row.clicks}</td>
                  <td className="p-3 align-top text-zinc-300">{row.stats.txnCount}</td>
                  <td className="p-3 align-top text-zinc-200">{formatCurrencyTotals(row.stats.saleByCurrency)}</td>
                  <td className="p-3 align-top text-zinc-200">{formatCurrencyTotals(row.stats.commissionByCurrency)}</td>
                  <td className="p-3 align-top text-right">
                    {SLUG_RE.test(row.slug) ? (
                      <Link
                        href={`/admin/awin/transactions?goLinkSlug=${encodeURIComponent(row.slug)}&attributedOnly=1`}
                        className="inline-block rounded bg-white/10 px-2 py-1 text-xs font-medium text-teal-300 hover:bg-white/15"
                      >
                        View sales
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-400">
        <span>
          Page {page} of {totalPages} · {total} link{total === 1 ? "" : "s"}
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            disabled={offset <= 0 || loading}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
            className="rounded border border-white/10 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={offset + limit >= total || loading}
            onClick={() => setOffset((o) => o + limit)}
            className="rounded border border-white/10 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
          >
            Next
          </button>
        </span>
      </div>
    </>
  );
}
