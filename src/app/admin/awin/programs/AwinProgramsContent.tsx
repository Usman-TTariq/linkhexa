"use client";

import { useCallback, useEffect, useState } from "react";
import type { AwinJoinedFetchStats } from "@/lib/awin/client";

type Row = {
  programme_id: number;
  name: string;
  display_url: string | null;
  logo_url: string | null;
  programme_status: string | null;
  synced_at: string;
};

type Stats = {
  totalSynced: number;
  activeCatalogueCount: number;
  joinedOnAwinCount: number | null;
  joinedAwinFetch?: AwinJoinedFetchStats | null;
  joinedPresentInDbCount?: number | null;
  joinedOnAwinFetchedAt?: string | null;
  joinedOnAwinError: string | null;
  approvedApplicationCount: number;
  approvedProgrammeCount: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  view: string;
};

export default function AwinProgramsContent() {
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "all" | "joined">("joined");
  const [page, setPage] = useState(1);

  const fetchPrograms = useCallback(async (p: number, v: "active" | "all" | "joined") => {
    const params = new URLSearchParams({
      view: v,
      page: String(p),
      limit: "100",
    });
    const res = await fetch(`/api/admin/awin/programmes?${params.toString()}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setRows(data.programmes ?? []);
      setPagination(data.pagination ?? null);
      if (data.stats) setStats(data.stats);
    }
  }, []);

  useEffect(() => {
    fetchPrograms(page, view);
  }, [page, view, fetchPrograms]);

  const sync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/awin/sync-programmes", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const up = data.upserted ?? 0;
        const rm = typeof data.removed === "number" ? data.removed : 0;
        setMessage(
          rm > 0
            ? `Synced ${up} joined programme(s) from Awin; removed ${rm} stale row(s) from the database.`
            : `Synced ${up} joined programme(s) from Awin.`
        );
        setPage(1);
        await fetchPrograms(1, view);
      } else {
        setMessage(data.error || "Sync failed.");
      }
    } catch {
      setMessage("Sync request failed.");
    } finally {
      setSyncing(false);
    }
  };

  const changeView = (next: "active" | "all" | "joined") => {
    setView(next);
    setPage(1);
  };

  const totalSynced = stats?.totalSynced ?? 0;
  const activeCat = stats?.activeCatalogueCount ?? 0;
  const joinedApi = stats?.joinedOnAwinCount ?? null;

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Programs
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        <strong className="font-medium text-zinc-300">Joined on Awin</strong> reads live from{" "}
        <code className="rounded bg-white/10 px-1 text-xs">relationship=joined</code> (no DB).
        <strong className="ml-1 font-medium text-zinc-300">Active / All</strong> read{" "}
        <code className="rounded bg-white/10 px-1 text-xs">awin_programmes</code> — after sync that table only holds
        joined programmes (not the full Awin catalogue).
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={sync}
          disabled={syncing}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync joined programmes"}
        </button>
        {message && <span className="text-sm text-zinc-400">{message}</span>}
      </div>

      {stats && (
        <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total synced (DB)</p>
            <p className="mt-1 text-lg font-semibold text-white">{stats.totalSynced.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Joined programmes in DB after sync</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Active catalogue</p>
            <p className="mt-1 text-lg font-semibold text-teal-300">{stats.activeCatalogueCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Joined subset with status Active (not Hidden)</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Joined on Awin (API)</p>
            {stats.joinedOnAwinCount !== null ? (
              <>
                <p className="mt-1 text-lg font-semibold text-indigo-300">
                  {stats.joinedOnAwinCount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">
                  Unique programmes from paginated{" "}
                  <code className="text-zinc-400">GET …/programmes?relationship=joined</code> — same as the Joined tab and
                  what Sync writes to the database.
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-amber-400/90">—</p>
            )}
            {stats.joinedAwinFetch && stats.joinedOnAwinCount !== null && (
              <p className="mt-2 text-xs text-zinc-500">
                <code className="text-zinc-400">relationship=joined</code> (paginated):{" "}
                <strong className="text-zinc-300">{stats.joinedAwinFetch.relationshipUniqueCount.toLocaleString()}</strong>{" "}
                unique IDs ·{" "}
                <strong className="text-zinc-300">{stats.joinedAwinFetch.relationshipResponseRowTotal.toLocaleString()}</strong>{" "}
                raw JSON rows (sum of pages)
              </p>
            )}
            {stats.joinedPresentInDbCount != null && stats.joinedOnAwinCount != null && (
              <p className="mt-2 text-xs text-zinc-500">
                DB overlap (optional <code className="text-zinc-400">?overlap=1</code>):{" "}
                <strong className="text-zinc-300">{stats.joinedPresentInDbCount.toLocaleString()}</strong> of{" "}
                {stats.joinedOnAwinCount.toLocaleString()} joined IDs also in sync cache
              </p>
            )}
            {stats.joinedPresentInDbCount == null && stats.joinedOnAwinCount !== null && (
              <p className="mt-2 text-xs text-zinc-500">
                Joined tab is live API; Active/All use the database — run Sync joined programmes to refresh that cache.
              </p>
            )}
            {stats.joinedOnAwinFetchedAt && (
              <p className="mt-1 text-[11px] text-zinc-600">
                Fetched {new Date(stats.joinedOnAwinFetchedAt).toLocaleString()}
              </p>
            )}
            {stats.joinedOnAwinError && (
              <p className="mt-1 text-xs text-red-400/90">{stats.joinedOnAwinError}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-500">Table:</span>
        <div className="inline-flex rounded-lg border border-white/10 p-0.5">
          <button
            type="button"
            onClick={() => changeView("active")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "active" ? "bg-teal-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Active only ({activeCat.toLocaleString()})
          </button>
          <button
            type="button"
            onClick={() => changeView("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "all" ? "bg-teal-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            All ({totalSynced.toLocaleString()})
          </button>
          <button
            type="button"
            onClick={() => changeView("joined")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "joined" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Joined on Awin ({joinedApi !== null ? joinedApi.toLocaleString() : "—"})
          </button>
        </div>
        {pagination && pagination.total > 0 && (
          <span className="text-sm text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} · showing {rows.length} of {pagination.total.toLocaleString()}{" "}
            {view === "active" ? "active" : view === "joined" ? "joined (live from Awin API)" : "total"}
            {view === "joined" &&
              stats?.joinedOnAwinCount != null &&
              stats.joinedPresentInDbCount != null &&
              stats.joinedOnAwinCount !== stats.joinedPresentInDbCount && (
                <span className="text-zinc-600">
                  {" "}
                  · API reports {stats.joinedOnAwinCount.toLocaleString()} joined; sync cache has{" "}
                  {stats.joinedPresentInDbCount.toLocaleString()}
                </span>
              )}
          </span>
        )}
        {pagination && view === "joined" && pagination.total === 0 && !stats?.joinedOnAwinError && (
          <span className="text-sm text-zinc-500">Awin reported no joined programmes for this publisher.</span>
        )}
        {view === "joined" && stats?.joinedOnAwinError && (
          <span className="text-sm text-red-400/90">Awin joined list failed: {stats.joinedOnAwinError}</span>
        )}
      </div>

      {stats && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm">
          <span className="font-medium text-emerald-200/95">LinkHexa — Approved in Applications</span>
          <span className="text-zinc-300">
            <strong className="text-white">{stats.approvedApplicationCount}</strong> publisher–brand approvals
          </span>
          <span className="text-zinc-400">
            across <strong className="text-zinc-200">{stats.approvedProgrammeCount}</strong> programme
            {stats.approvedProgrammeCount === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
        {totalSynced === 0 && !syncing && view !== "joined" ? (
          <p className="p-6 text-center text-zinc-500">No programmes in database yet. Run Sync joined programmes.</p>
        ) : rows.length === 0 && view === "joined" ? (
          <p className="p-6 text-center text-zinc-500">
            {stats?.joinedOnAwinError
              ? "Could not load joined programmes from Awin."
              : "No joined programmes returned by Awin for this account."}
          </p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-zinc-500">No rows on this page.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Website</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">{view === "joined" ? "Fetched" : "Synced"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.programme_id} className="border-b border-white/5 text-white">
                  <td className="p-3 font-mono text-zinc-400">{r.programme_id}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-indigo-400">
                    {r.display_url ? (
                      <a href={r.display_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {r.display_url.replace(/^https?:\/\//, "").slice(0, 48)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 capitalize text-zinc-400">{r.programme_status || "—"}</td>
                  <td className="p-3 text-zinc-500">
                    {r.synced_at ? new Date(r.synced_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
