"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Brand = {
  programmeId: number;
  name: string;
  displayUrl: string | null;
  logoUrl: string | null;
  applicationStatus: "not_applied" | "pending" | "approved" | "rejected";
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  rangeFrom: number;
  rangeTo: number;
};

const LIMIT_OPTIONS = [12, 24, 36] as const;

export default function BrandsGridContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const approvedOnly = searchParams.get("filter") === "approved";

  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [joinedOnAwinCount, setJoinedOnAwinCount] = useState(0);
  const [inSyncCacheCount, setInSyncCacheCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(12);
  const [searchDraft, setSearchDraft] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const firstLoad = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchDraft.trim()), 350);
    return () => clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, approvedOnly, limit]);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      const isFirst = firstLoad.current;
      if (isFirst) setLoading(true);
      else setRefetching(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("scope", approvedOnly ? "approved" : "all");

      try {
        const res = await fetch(`/api/publisher/awin/brands?${params.toString()}`, {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Access denied.");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || data.detail || "Could not load brands.");
          return;
        }
        const data = await res.json();
        setBrands(data.brands ?? []);
        setPagination(data.pagination ?? null);
        setJoinedOnAwinCount(data.joinedOnAwinCount ?? 0);
        setInSyncCacheCount(data.inSyncCacheCount ?? 0);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError("Could not load brands.");
      } finally {
        if (!ctrl.signal.aborted) {
          setLoading(false);
          setRefetching(false);
          firstLoad.current = false;
        }
      }
    };
    load();
    return () => ctrl.abort();
  }, [router, page, limit, debouncedSearch, approvedOnly]);

  const apply = async (programmeId: number) => {
    setApplyingId(programmeId);
    setError(null);
    try {
      const res = await fetch("/api/publisher/awin/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ programmeId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Apply failed.");
        return;
      }
      setBrands((prev) =>
        prev.map((b) =>
          b.programmeId === programmeId ? { ...b, applicationStatus: "pending" as const } : b
        )
      );
    } finally {
      setApplyingId(null);
    }
  };

  const pg = pagination;
  const showFullSpinner = loading && brands.length === 0;

  if (showFullSpinner) {
    return (
      <div className="relative flex min-h-[50vh] items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]"
          aria-hidden
        />
        <p className="relative text-zinc-400">Loading brands…</p>
      </div>
    );
  }

  const emptyNoCache = inSyncCacheCount === 0 && joinedOnAwinCount === 0;
  const emptyCacheButJoined =
    inSyncCacheCount === 0 && joinedOnAwinCount > 0 && !debouncedSearch && !approvedOnly;
  const emptyApprovedTab =
    approvedOnly && pg && pg.total === 0 && inSyncCacheCount > 0 && !debouncedSearch;
  const emptySearch = pg && pg.total === 0 && debouncedSearch.length > 0;

  return (
    <>
      <div className="relative min-h-screen pb-16 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(139,92,246,0.06),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <header className="border-b border-white/10 pb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Brands</p>
            <h1
              className="mt-2 gradient-text text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              {approvedOnly ? "My brands" : "Available brands"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              {approvedOnly
                ? "Programmes your admin has approved for you. Open a card for details."
                : "Only programmes your Awin publisher account is joined to — the same set as Admin → Awin → Programs → Joined on Awin. Apply here for LinkHexa approval to promote."}
            </p>
            <div
              className="mt-6 inline-flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
              role="tablist"
              aria-label="Brand list filter"
            >
              <div className="flex rounded-xl border border-white/10 bg-zinc-900/80 p-1 shadow-inner shadow-black/20 sm:inline-flex">
                <Link
                  href="/dashboard/brands"
                  role="tab"
                  aria-selected={!approvedOnly}
                  className={`min-h-11 flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all sm:min-h-0 sm:flex-none sm:px-5 ${
                    !approvedOnly
                      ? "bg-indigo-600 text-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.7)]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  All brands
                </Link>
                <Link
                  href="/dashboard/brands?filter=approved"
                  role="tab"
                  aria-selected={approvedOnly}
                  className={`min-h-11 flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all sm:min-h-0 sm:flex-none sm:px-5 ${
                    approvedOnly
                      ? "bg-indigo-600 text-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.7)]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  My brands
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search by name, URL, or programme ID…"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner shadow-black/20 outline-none ring-indigo-500/0 transition-[box-shadow,border-color] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/25"
                  aria-label="Search brands"
                  autoComplete="off"
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <label htmlFor="brands-page-size" className="text-xs font-medium text-zinc-500">
                  Per page
                </label>
                <select
                  id="brands-page-size"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded-lg border border-white/10 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          {error && (
            <div className="mt-6 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/95 ring-1 ring-indigo-500/10">
              {error}
            </div>
          )}

          {!error && (emptyNoCache || emptyCacheButJoined) ? (
            <p className="mt-12 text-center text-zinc-500">
              {emptyCacheButJoined
                ? "You are joined to programmes on Awin, but none appear in the sync cache yet. Ask an admin to run a programmes sync."
                : "No joined programmes in your sync cache, or none on Awin yet. Ask an admin to sync programmes; you must be joined to a programme on Awin for it to appear here."}
            </p>
          ) : !error && emptyApprovedTab ? (
            <p className="mt-12 text-center text-zinc-500">
              No approved brands yet. Apply from Available brands or wait for admin approval.
            </p>
          ) : !error && emptySearch ? (
            <p className="mt-12 text-center text-zinc-500">
              No brands match &ldquo;{debouncedSearch}&rdquo;. Try another name, URL, or ID.
            </p>
          ) : (
            <>
              <div
                className={`relative mt-10 sm:mt-12 ${refetching ? "opacity-60 transition-opacity" : ""}`}
                aria-busy={refetching}
              >
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {brands.map((b) => (
                    <li
                      key={b.programmeId}
                      className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-indigo-500/25 hover:shadow-[0_0_32px_-12px_rgba(99,102,241,0.35)]"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-indigo-500/15 bg-zinc-800/80">
                          {b.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Awin logo hosts vary
                            <img src={b.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">Logo</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate font-semibold text-white">{b.name}</h2>
                          {b.displayUrl ? (
                            <a
                              href={b.displayUrl.startsWith("http") ? b.displayUrl : `https://${b.displayUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block truncate text-sm text-indigo-400 hover:underline"
                            >
                              {b.displayUrl.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            <span className="mt-1 block text-sm text-zinc-500">—</span>
                          )}
                          <p className="mt-2 text-xs text-zinc-500">ID: {b.programmeId}</p>
                        </div>
                      </div>

                      <div className="mt-5 mt-auto pt-2">
                        {b.applicationStatus === "approved" && (
                          <Link
                            href={`/dashboard/brands/${b.programmeId}`}
                            className="flex w-full items-center justify-center rounded-lg bg-indigo-500/15 py-2.5 text-sm font-semibold text-indigo-200 ring-1 ring-indigo-500/35 hover:bg-violet-500/15 hover:ring-violet-500/35"
                          >
                            Approved — View details
                          </Link>
                        )}
                        {b.applicationStatus === "pending" && (
                          <span className="flex w-full cursor-default items-center justify-center rounded-lg bg-violet-500/10 py-2.5 text-sm font-semibold text-violet-200 ring-1 ring-violet-500/30">
                            Pending review
                          </span>
                        )}
                        {(b.applicationStatus === "not_applied" || b.applicationStatus === "rejected") && (
                          <button
                            type="button"
                            onClick={() => apply(b.programmeId)}
                            disabled={applyingId === b.programmeId || refetching}
                            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-8px_rgba(99,102,241,0.55)] hover:bg-indigo-500 disabled:opacity-60"
                          >
                            {b.applicationStatus === "rejected"
                              ? applyingId === b.programmeId
                                ? "Submitting…"
                                : "Apply again"
                              : applyingId === b.programmeId
                                ? "Submitting…"
                                : "Apply for approval"}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {pg && pg.total > 0 && (
                <nav
                  className="mt-10 flex flex-col items-stretch gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination"
                >
                  <p className="text-center text-sm text-zinc-500 sm:text-left">
                    Showing <span className="font-medium text-zinc-300">{pg.rangeFrom}</span>–
                    <span className="font-medium text-zinc-300">{pg.rangeTo}</span> of{" "}
                    <span className="font-medium text-zinc-300">{pg.total}</span>
                    {approvedOnly ? " approved brands" : " brands in sync"}
                    {joinedOnAwinCount > 0 && !approvedOnly && (
                      <span className="text-zinc-600">
                        {" "}
                        ·{" "}
                        <span className="tabular-nums font-medium text-zinc-400">
                          {joinedOnAwinCount.toLocaleString()}
                        </span>{" "}
                        joined on Awin (live API)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pg.page <= 1 || refetching}
                      className="min-w-[5.5rem] rounded-lg border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-indigo-500/30 hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="min-w-[5rem] text-center text-sm tabular-nums text-zinc-400">
                      Page {pg.page} of {pg.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pg.totalPages, p + 1))}
                      disabled={pg.page >= pg.totalPages || refetching}
                      className="min-w-[5.5rem] rounded-lg border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-indigo-500/30 hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
