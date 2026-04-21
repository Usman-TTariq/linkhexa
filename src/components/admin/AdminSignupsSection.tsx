"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { formatCurrencyTotals } from "@/lib/admin/format-currency-totals";

type SignupRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  company_name: string | null;
  website: string | null;
  payment_email: string | null;
  city: string | null;
  country: string | null;
  approval_status: string;
  created_at: string;
  payout_totals?: Record<string, number>;
  sale_totals?: Record<string, number>;
};

type PublisherLinkRow = {
  id: string;
  slug: string;
  shortUrl: string;
  brandName: string | null;
  clicks: number;
  stats: {
    txnCount: number;
    saleByCurrency: Record<string, number>;
    commissionByCurrency: Record<string, number>;
    unlinkedTxnCount?: number;
    unlinkedSaleByCurrency?: Record<string, number>;
    unlinkedCommissionByCurrency?: Record<string, number>;
    otherPublisherTxnCount?: number;
    otherPublisherSaleByCurrency?: Record<string, number>;
    otherPublisherCommissionByCurrency?: Record<string, number>;
  };
};

function anyAwinTxnCount(s: PublisherLinkRow["stats"]): number {
  return (
    (s.txnCount ?? 0) +
    (s.unlinkedTxnCount ?? 0) +
    (s.otherPublisherTxnCount ?? 0)
  );
}

export default function AdminSignupsSection() {
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [expandedPublisherId, setExpandedPublisherId] = useState<string | null>(null);
  const [linkBreakdownByPublisher, setLinkBreakdownByPublisher] = useState<Record<string, PublisherLinkRow[]>>({});
  const [linkBreakdownLoading, setLinkBreakdownLoading] = useState<string | null>(null);
  const [linkBreakdownError, setLinkBreakdownError] = useState<string | null>(null);
  const linkBreakdownFetched = useRef<Set<string>>(new Set());

  const loadLinkBreakdown = useCallback(async (publisherId: string, opts?: { force?: boolean }) => {
    if (!opts?.force && linkBreakdownFetched.current.has(publisherId)) return;
    setLinkBreakdownLoading(publisherId);
    setLinkBreakdownError(null);
    try {
      const res = await fetch(`/api/admin/publisher-tracking-links?publisherId=${encodeURIComponent(publisherId)}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkBreakdownError(typeof data.error === "string" ? data.error : "Could not load link stats");
        return;
      }
      const links = Array.isArray(data.links) ? (data.links as PublisherLinkRow[]) : [];
      linkBreakdownFetched.current.add(publisherId);
      setLinkBreakdownByPublisher((prev) => ({ ...prev, [publisherId]: links }));
    } catch {
      setLinkBreakdownError("Request failed");
    } finally {
      setLinkBreakdownLoading(null);
    }
  }, []);

  const toggleLinkBreakdown = async (publisherId: string) => {
    if (expandedPublisherId === publisherId) {
      setExpandedPublisherId(null);
      return;
    }
    setExpandedPublisherId(publisherId);
    await loadLinkBreakdown(publisherId);
  };

  useEffect(() => {
    const load = async () => {
      const offset = (page - 1) * pageSize;
      const res = await fetch(`/api/admin/signups?limit=${pageSize}&offset=${offset}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups ?? []);
        setTotal(Number(data.total ?? 0));
      }
    };
    load();
  }, [page, pageSize]);

  useEffect(() => {
    setExpandedPublisherId(null);
    setLinkBreakdownError(null);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateApproval = async (id: string, approval_status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approval_status }),
      });
      if (res.ok) {
        setSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, approval_status } : s))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const loginAsPublisher = async (publisherId: string) => {
    setImpersonatingId(publisherId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publisherId }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } finally {
      setImpersonatingId(null);
    }
  };

  const pending = signups.filter((s) => s.approval_status === "pending");
  const approved = signups.filter((s) => s.approval_status === "approved");
  const rejected = signups.filter((s) => s.approval_status === "rejected");

  return (
    <>
      <section id="admin-all-signups">
        <h2
          className="text-xl font-bold text-white sm:text-2xl"
          style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
        >
          All signups
        </h2>
        <p className="mt-1 text-zinc-400">Approve or reject accounts so publishers can use the dashboard.</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-white">Directory</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Pending: {pending.length} · Approved: {approved.length} · Rejected: {rejected.length}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-500">
          Sales and payout only count <span className="text-zinc-400">Awin orders linked to this account</span> (the
          transaction&apos;s click reference must match one of this publisher&apos;s go-link slugs). Unmatched or
          unsynced orders do not add here, so £0.00 means no linked activity yet. A dash in Company means no company name
          was provided at signup.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
          {signups.length === 0 ? (
            <p className="p-6 text-center text-zinc-500">No signups yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Company</th>
                  <th className="p-3 font-medium">Sales</th>
                  <th className="p-3 font-medium">Payout</th>
                  <th className="p-3 font-medium">Per-link</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-b border-white/5 text-white">
                      <td className="p-3">{row.username}</td>
                      <td className="p-3">{row.email}</td>
                      <td className="p-3 capitalize">{row.role}</td>
                      <td className="p-3">{row.company_name || "—"}</td>
                      <td className="p-3 text-zinc-200">
                        {row.role === "publisher" ? formatCurrencyTotals(row.sale_totals) : "—"}
                      </td>
                      <td className="p-3 text-zinc-200">
                        {row.role === "publisher" ? formatCurrencyTotals(row.payout_totals) : "—"}
                      </td>
                      <td className="p-3">
                        {row.role === "publisher" ? (
                          <button
                            type="button"
                            onClick={() => void toggleLinkBreakdown(row.id)}
                            className="text-xs font-medium text-teal-400 hover:text-teal-300 hover:underline"
                          >
                            {expandedPublisherId === row.id ? "Hide" : "Show"} breakdown
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            row.approval_status === "approved"
                              ? "text-emerald-400"
                              : row.approval_status === "rejected"
                                ? "text-red-400"
                                : "text-amber-400"
                          }
                        >
                          {row.approval_status}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3 text-right">
                        {row.approval_status === "pending" && (
                          <span className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => updateApproval(row.id, "approved")}
                              disabled={updatingId === row.id}
                              className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateApproval(row.id, "rejected")}
                              disabled={updatingId === row.id}
                              className="rounded bg-red-600/80 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </span>
                        )}
                        {row.approval_status === "approved" && row.role === "publisher" && (
                          <span className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => loginAsPublisher(row.id)}
                              disabled={impersonatingId === row.id}
                              className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                              Login as publisher
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                    {row.role === "publisher" && expandedPublisherId === row.id && (
                      <tr key={`${row.id}-breakdown`} className="border-b border-white/5 bg-zinc-950/80">
                        <td colSpan={10} className="p-4">
                          {linkBreakdownLoading === row.id && (
                            <p className="text-sm text-zinc-500">Loading go-links…</p>
                          )}
                          {linkBreakdownError && expandedPublisherId === row.id && (
                            <p className="text-sm text-red-300">{linkBreakdownError}</p>
                          )}
                          {!linkBreakdownLoading &&
                            expandedPublisherId === row.id &&
                            (linkBreakdownByPublisher[row.id] ?? []).length === 0 && (
                              <p className="text-sm text-zinc-500">No short links created yet for this publisher.</p>
                            )}
                          {(linkBreakdownByPublisher[row.id] ?? []).length > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    linkBreakdownFetched.current.delete(row.id);
                                    void loadLinkBreakdown(row.id, { force: true });
                                  }}
                                  disabled={linkBreakdownLoading === row.id}
                                  className="text-xs font-medium text-teal-400 hover:text-teal-300 hover:underline disabled:opacity-50"
                                >
                                  Refresh breakdown
                                </button>
                              </div>
                              <p className="text-xs leading-relaxed text-zinc-500">
                                <span className="font-medium uppercase tracking-wider text-zinc-400">
                                  Per go-link:
                                </span>{" "}
                                <strong className="text-zinc-300">Clicks</strong> are visits to your short URL on
                                LinkHexa. <strong className="text-zinc-300">Linked</strong> is Awin transactions in the
                                DB that match this slug for your links (including rows not yet assigned a publisher in
                                sync). Another user&apos;s <code className="rounded bg-white/10 px-1">publisher_id</code>{" "}
                                on the same slug is excluded. If linked stays 0 but clicks &gt; 0, run sync or confirm
                                Awin sends this slug in the click reference.
                              </p>
                              <div className="overflow-x-auto rounded-lg border border-white/10">
                                <table className="w-full text-left text-xs text-zinc-300">
                                  <thead>
                                    <tr className="border-b border-white/10 bg-zinc-900/60 text-zinc-500">
                                      <th className="p-2 font-medium">Slug</th>
                                      <th className="p-2 font-medium">Short URL</th>
                                      <th className="p-2 font-medium">Brand</th>
                                      <th className="p-2 font-medium">Clicks</th>
                                      <th className="p-2 font-medium">Linked txns</th>
                                      <th className="p-2 font-medium">Linked sales</th>
                                      <th className="p-2 font-medium">Linked comm.</th>
                                      <th className="p-2 font-medium text-right">Open</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(linkBreakdownByPublisher[row.id] ?? []).map((L) => (
                                      <tr key={L.id} className="border-b border-white/5">
                                        <td className="p-2 font-mono text-teal-300">{L.slug}</td>
                                        <td className="max-w-[180px] truncate p-2 text-zinc-500" title={L.shortUrl}>
                                          {L.shortUrl}
                                        </td>
                                        <td className="p-2">{L.brandName ?? "—"}</td>
                                        <td className="p-2 tabular-nums">{L.clicks}</td>
                                        <td className="p-2 tabular-nums">{L.stats.txnCount}</td>
                                        <td className="p-2">{formatCurrencyTotals(L.stats.saleByCurrency)}</td>
                                        <td className="p-2">{formatCurrencyTotals(L.stats.commissionByCurrency)}</td>
                                        <td className="p-2 text-right">
                                          <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:justify-end sm:gap-2">
                                            <Link
                                              href={`/admin/awin/transactions?goLinkSlug=${encodeURIComponent(L.slug)}&attributedOnly=1`}
                                              className="text-teal-400 hover:underline"
                                            >
                                              Linked
                                            </Link>
                                            <Link
                                              href={`/admin/awin/transactions?goLinkSlug=${encodeURIComponent(L.slug)}`}
                                              className="text-zinc-400 hover:underline"
                                            >
                                              All
                                            </Link>
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-zinc-900/40 text-zinc-400">
                                      <td colSpan={4} className="p-2 font-medium">
                                        Total (this publisher, sum of rows above)
                                      </td>
                                      <td className="p-2 tabular-nums font-medium text-white">
                                        {(linkBreakdownByPublisher[row.id] ?? []).reduce(
                                          (a, L) => a + L.stats.txnCount,
                                          0
                                        )}
                                      </td>
                                      <td className="p-2 font-medium text-white">
                                        {formatCurrencyTotals(
                                          (linkBreakdownByPublisher[row.id] ?? []).reduce(
                                            (acc, L) => {
                                              for (const [c, v] of Object.entries(L.stats.saleByCurrency)) {
                                                acc[c] = (acc[c] ?? 0) + v;
                                              }
                                              return acc;
                                            },
                                            {} as Record<string, number>
                                          )
                                        )}
                                      </td>
                                      <td className="p-2 font-medium text-white">
                                        {formatCurrencyTotals(
                                          (linkBreakdownByPublisher[row.id] ?? []).reduce(
                                            (acc, L) => {
                                              for (const [c, v] of Object.entries(L.stats.commissionByCurrency)) {
                                                acc[c] = (acc[c] ?? 0) + v;
                                              }
                                              return acc;
                                            },
                                            {} as Record<string, number>
                                          )
                                        )}
                                      </td>
                                      <td className="p-2" />
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              {(linkBreakdownByPublisher[row.id] ?? []).some((L) => L.clicks > 0) &&
                                (linkBreakdownByPublisher[row.id] ?? []).every((L) => anyAwinTxnCount(L.stats) === 0) && (
                                  <p className="text-xs text-amber-300/90">
                                    Clicks are recorded on LinkHexa, but there are still no{" "}
                                    <code className="rounded bg-white/10 px-1">awin_transactions</code> rows for these
                                    slugs (or click references do not match). Run{" "}
                                    <Link href="/admin/awin/actions" className="text-teal-400 hover:underline">
                                      Sync transactions
                                    </Link>{" "}
                                    and confirm Awin sends this go-link slug as the click reference.
                                  </p>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-400">
          <span>
            Page {page} of {totalPages} · Total {total}
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-white/10 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-white/10 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
            >
              Next
            </button>
          </span>
        </div>
      </section>
    </>
  );
}
