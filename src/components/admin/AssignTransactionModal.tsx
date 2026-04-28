"use client";

import { useEffect, useState } from "react";

export type AssignTxnRow = {
  awin_transaction_id: string;
  commission_amount: number;
  commission_currency: string;
  sale_amount: number;
  sale_currency: string;
  publisher_id: string | null;
};

type PublisherOpt = { id: string; email: string | null; username: string | null };

type LinkOpt = { slug: string };

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

type Props = {
  row: AssignTxnRow | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

/**
 * Assign / reassign publisher + slug. Uses debounced publisher search; loads slugs only after publisher pick.
 */
export default function AssignTransactionModal({ row, onClose, onSuccess }: Props) {
  const [pubQuery, setPubQuery] = useState("");
  const [publishers, setPublishers] = useState<PublisherOpt[]>([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PublisherOpt | null>(null);
  const [links, setLinks] = useState<LinkOpt[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [confirmReassign, setConfirmReassign] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!row) return;
    setPubQuery("");
    setPublishers([]);
    setSelectedPub(null);
    setLinks([]);
    setSelectedSlug("");
    setConfirmReassign(false);
    setMessage(null);
  }, [row?.awin_transaction_id]);

  useEffect(() => {
    if (!row) {
      setPubLoading(false);
      return;
    }
    const t = setTimeout(() => {
      void (async () => {
        setPubLoading(true);
        try {
          const q = pubQuery.trim();
          const url = q.length >= 2 ? `/api/admin/publishers-search?q=${encodeURIComponent(q)}&limit=30` : "/api/admin/publishers-search?limit=30";
          const res = await fetch(url, { credentials: "include" });
          const data = await res.json().catch(() => ({}));
          if (res.ok) setPublishers(data.publishers ?? []);
        } finally {
          setPubLoading(false);
        }
      })();
    }, 320);
    return () => clearTimeout(t);
  }, [pubQuery, row]);

  useEffect(() => {
    if (!selectedPub) {
      setLinks([]);
      setSelectedSlug("");
      return;
    }
    void (async () => {
      setLinksLoading(true);
      try {
        const res = await fetch(`/api/admin/publisher-tracking-links?publisherId=${encodeURIComponent(selectedPub.id)}`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLinks([]);
          return;
        }
        const raw = (data.links ?? []) as { slug?: string }[];
        setLinks(raw.map((l) => ({ slug: String(l.slug ?? "") })).filter((l) => l.slug.length >= 6));
        setSelectedSlug("");
      } finally {
        setLinksLoading(false);
      }
    })();
  }, [selectedPub]);

  if (!row) return null;

  const needsReassignConfirm = row.publisher_id != null && String(row.publisher_id).trim() !== "";

  const submit = async () => {
    if (!selectedPub || !selectedSlug) {
      setMessage("Choose a publisher and a tracking slug.");
      return;
    }
    if (needsReassignConfirm && !confirmReassign) {
      setMessage("Confirm that you want to move this row to another publisher.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/awin/assign-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awin_transaction_id: row.awin_transaction_id,
          publisher_id: selectedPub.id,
          go_link_slug: selectedSlug,
          confirm_reassign: needsReassignConfirm ? true : false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      onClose();
      await onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">Assign transaction</h2>
        <p className="mt-1 font-mono text-xs text-zinc-500">{row.awin_transaction_id}</p>
        <p className="mt-2 text-sm text-zinc-400">
          {formatMoney(Number(row.commission_amount), row.commission_currency)} commission ·{" "}
          {formatMoney(Number(row.sale_amount), row.sale_currency)} sale
        </p>
        {needsReassignConfirm && (
          <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/95">
            This row already has a publisher. Reassigning moves credit in reports to the publisher you pick below.
          </p>
        )}

        <label className="mt-6 block text-xs font-medium uppercase tracking-wider text-zinc-500">Find publisher</label>
        <input
          type="search"
          value={pubQuery}
          onChange={(e) => setPubQuery(e.target.value)}
          placeholder="Email or username…"
          className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
        />
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-zinc-950/80">
          {pubLoading ? (
            <p className="px-3 py-2 text-xs text-zinc-500">Loading…</p>
          ) : publishers.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">No publishers found.</p>
          ) : (
            publishers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPub(p)}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-white/5 px-3 py-2 text-left text-sm last:border-0 hover:bg-white/5 ${
                  selectedPub?.id === p.id ? "bg-teal-900/30" : ""
                }`}
              >
                <span className="text-white">{p.username?.trim() || p.email || p.id}</span>
                {p.email ? <span className="text-xs text-zinc-500">{p.email}</span> : null}
              </button>
            ))
          )}
        </div>

        {selectedPub && (
          <>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-zinc-500">Tracking slug</label>
            <p className="mt-0.5 text-xs text-zinc-600">Must be one of this publisher&apos;s short links.</p>
            {linksLoading ? (
              <p className="mt-2 text-xs text-zinc-500">Loading links…</p>
            ) : links.length === 0 ? (
              <p className="mt-2 text-xs text-amber-200/90">No go-links for this publisher.</p>
            ) : (
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-teal-500/50 focus:outline-none"
              >
                <option value="">Select slug…</option>
                {links.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.slug}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {needsReassignConfirm && (
          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={confirmReassign}
              onChange={(e) => setConfirmReassign(e.target.checked)}
              className="mt-1 rounded border-white/20 bg-zinc-950"
            />
            <span>I confirm reassigning this transaction to the publisher above.</span>
          </label>
        )}

        {message && <p className="mt-4 text-sm text-amber-200/90">{message}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !selectedPub || !selectedSlug || (needsReassignConfirm && !confirmReassign)}
            onClick={() => void submit()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-40"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
