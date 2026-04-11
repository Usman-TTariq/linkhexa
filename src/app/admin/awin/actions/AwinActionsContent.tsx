"use client";

import { useState } from "react";
import Link from "next/link";

const CONVERSION_JSON_PLACEHOLDER = `{
  "orders": [
    {
      "orderReference": "UNIQUE-TXN-ID-MAX-50",
      "amount": 123.45,
      "currency": "EUR",
      "transactionTime": 1762859931,
      "commissionGroup": [{ "code": "DEFAULT", "amount": 123.45 }],
      "clickTime": 1762859852,
      "awc": "1001_xxx_xxx",
      "clickRef": "example",
      "customerAcquisition": "NEW"
    }
  ]
}`;

export default function AwinActionsContent() {
  const [syncing, setSyncing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [conversionSubmitting, setConversionSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conversionPublisherId, setConversionPublisherId] = useState("");
  const [conversionAdvertiserId, setConversionAdvertiserId] = useState("");
  const [conversionJson, setConversionJson] = useState(CONVERSION_JSON_PLACEHOLDER);

  const runSync = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const body =
        startDate.trim() && endDate.trim()
          ? JSON.stringify({ start: `${startDate.trim()}T00:00:00.000Z`, end: `${endDate.trim()}T23:59:59.999Z` })
          : "{}";
      const res = await fetch("/api/admin/awin/sync-transactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Sync failed.");
        return;
      }
      setMessage(
        `Synced OK. Fetched ${data.fetched ?? 0}, saved ${data.upserted ?? 0}. ` +
          `Attributed ${data.attributed ?? 0}, unmatched click refs ${data.unmatched ?? 0}.`
      );
    } catch {
      setError("Sync request failed.");
    } finally {
      setSyncing(false);
    }
  };

  const runRebuild = async () => {
    setRebuilding(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/awin/rebuild-rollup", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Rebuild failed.");
        return;
      }
      setMessage("Daily rollup rebuilt from awin_transactions (publisher_earnings_daily).");
    } catch {
      setError("Rebuild request failed.");
    } finally {
      setRebuilding(false);
    }
  };

  const submitConversionOrders = async () => {
    setConversionSubmitting(true);
    setMessage(null);
    setError(null);
    let parsed: { publisherId?: string | number; advertiserId?: string | number; orders?: unknown[] };
    try {
      parsed = JSON.parse(conversionJson) as typeof parsed;
    } catch {
      setError("Conversion payload is not valid JSON.");
      setConversionSubmitting(false);
      return;
    }
    const pub = conversionPublisherId.trim() || parsed.publisherId;
    const adv = conversionAdvertiserId.trim() || parsed.advertiserId;
    if (pub === undefined || pub === null || String(pub).trim() === "") {
      setError("Set Publisher ID or include publisherId in JSON (or set AWIN_PUBLISHER_ID on the server).");
      setConversionSubmitting(false);
      return;
    }
    if (adv === undefined || adv === null || String(adv).trim() === "") {
      setError("Set Advertiser ID or include advertiserId in JSON (or set AWIN_ADVERTISER_ID on the server).");
      setConversionSubmitting(false);
      return;
    }
    if (!Array.isArray(parsed.orders) || parsed.orders.length === 0) {
      setError("JSON must include a non-empty orders array.");
      setConversionSubmitting(false);
      return;
    }
    for (let i = 0; i < parsed.orders.length; i++) {
      const row = parsed.orders[i];
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        setError(`orders[${i}]: must be an object.`);
        setConversionSubmitting(false);
        return;
      }
      const o = row as Record<string, unknown>;
      if (typeof o.orderReference !== "string" || !o.orderReference.trim()) {
        setError(`orders[${i}].orderReference: required string (unique transaction id).`);
        setConversionSubmitting(false);
        return;
      }
      if (o.orderReference.length > 50) {
        setError(`orders[${i}].orderReference: at most 50 characters.`);
        setConversionSubmitting(false);
        return;
      }
      if (typeof o.amount !== "number" || !Number.isFinite(o.amount)) {
        setError(`orders[${i}].amount: required number (transaction value).`);
        setConversionSubmitting(false);
        return;
      }
      if (typeof o.currency !== "string" || !/^[A-Za-z]{3}$/.test(o.currency.trim())) {
        setError(`orders[${i}].currency: required ISO 4217 code (3 letters, e.g. EUR).`);
        setConversionSubmitting(false);
        return;
      }
      if (typeof o.transactionTime !== "number" || !Number.isInteger(o.transactionTime)) {
        setError(`orders[${i}].transactionTime: required integer UNIX time (seconds).`);
        setConversionSubmitting(false);
        return;
      }
    }
    try {
      const res = await fetch("/api/admin/awin/conversion-orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publisherId: pub,
          advertiserId: adv,
          orders: parsed.orders,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : `Awin returned ${typeof data.awinStatus === "number" ? data.awinStatus : res.status}.`
        );
        return;
      }
      const batch =
        data.awin && typeof data.awin === "object" && data.awin !== null && "batchId" in data.awin
          ? String((data.awin as { batchId?: string }).batchId ?? "")
          : "";
      setMessage(
        `Conversion API OK (HTTP ${data.awinStatus ?? res.status})` +
          (batch ? `. batchId: ${batch}` : ".") +
          " Check Awin reporting after a few minutes."
      );
    } catch {
      setError("Conversion API request failed.");
    } finally {
      setConversionSubmitting(false);
    }
  };

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Actions
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Run server-side jobs against the Awin API and maintain the local earnings rollup. Nothing here calls Awin from the
        browser — credentials stay on the server.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-6 rounded-lg border border-teal-500/25 bg-teal-500/10 px-4 py-3 text-sm text-teal-100">{message}</p>
      )}

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Sync transactions</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Pulls the Awin transactions list (up to 31 days per request), upserts into{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">awin_transactions</code>, matches{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">click_ref</code> to short-link slugs, then
            refreshes the daily rollup.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Leave dates empty to use the default window (overlap with last sync, or last ~31 days on first run). Awin allows at
            most <span className="font-medium text-zinc-300">31 days</span> per request — pick a narrower range or run sync
            multiple times for longer history.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="awin-sync-start" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Start (UTC date)
              </label>
              <input
                id="awin-sync-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label htmlFor="awin-sync-end" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                End (UTC date)
              </label>
              <input
                id="awin-sync-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <button
              type="button"
              onClick={runSync}
              disabled={syncing || (Boolean(startDate.trim()) !== Boolean(endDate.trim()))}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              title={startDate.trim() !== endDate.trim() && (startDate.trim() || endDate.trim()) ? "Set both dates or clear both" : undefined}
            >
              {syncing ? "Syncing…" : "Run transaction sync"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Post orders (publisher API)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sends{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">
              POST /publishers/&#123;publisherId&#125;/advertiser/&#123;advertiserId&#125;/orders
            </code>{" "}
            with header <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">x-api-key</code> (same env as below).
            Rate limit: about <span className="text-zinc-300">6 requests per second</span>. De-duplicate{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-zinc-300">orderReference</code> before posting.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400">Required on each order (validated before send):</span>{" "}
            <code className="rounded bg-white/5 px-1">orderReference</code> (string, unique txn id, max 50 chars),{" "}
            <code className="rounded bg-white/5 px-1">amount</code> (float),{" "}
            <code className="rounded bg-white/5 px-1">currency</code> (ISO 4217),{" "}
            <code className="rounded bg-white/5 px-1">transactionTime</code> (UNIX seconds). Add{" "}
            <code className="rounded bg-white/5 px-1">commissionGroup</code>,{" "}
            <code className="rounded bg-white/5 px-1">clickTime</code>, <code className="rounded bg-white/5 px-1">awc</code>,{" "}
            <code className="rounded bg-white/5 px-1">clickRef</code>, <code className="rounded bg-white/5 px-1">customerAcquisition</code>{" "}
            per Awin. If you still use <code className="rounded bg-white/5 px-1">commissionGroups</code>, the server maps it to{" "}
            <code className="rounded bg-white/5 px-1">commissionGroup</code>.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Env: <code className="rounded bg-white/5 px-1">AWIN_CONVERSION_API_KEY</code>. Optional defaults:{" "}
            <code className="rounded bg-white/5 px-1">AWIN_PUBLISHER_ID</code>,{" "}
            <code className="rounded bg-white/5 px-1">AWIN_ADVERTISER_ID</code>.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-4">
              <div>
                <label
                  htmlFor="awin-conv-publisher"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Publisher ID (optional if AWIN_PUBLISHER_ID is set)
                </label>
                <input
                  id="awin-conv-publisher"
                  type="text"
                  inputMode="numeric"
                  value={conversionPublisherId}
                  onChange={(e) => setConversionPublisherId(e.target.value)}
                  placeholder="e.g. 123456"
                  className="mt-1 w-full max-w-xs rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="awin-conv-advertiser"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Advertiser ID (optional if AWIN_ADVERTISER_ID is set)
                </label>
                <input
                  id="awin-conv-advertiser"
                  type="text"
                  inputMode="numeric"
                  value={conversionAdvertiserId}
                  onChange={(e) => setConversionAdvertiserId(e.target.value)}
                  placeholder="e.g. 12345"
                  className="mt-1 w-full max-w-xs rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="awin-conv-json" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                JSON (orders array only — path ids are set via fields above or env)
              </label>
              <textarea
                id="awin-conv-json"
                value={conversionJson}
                onChange={(e) => setConversionJson(e.target.value)}
                spellCheck={false}
                rows={14}
                className="mt-1 w-full max-w-3xl rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200"
              />
            </div>
            <button
              type="button"
              onClick={submitConversionOrders}
              disabled={conversionSubmitting}
              className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {conversionSubmitting ? "Submitting…" : "Submit orders to Awin"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Rebuild daily rollup</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Recomputes <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">publisher_earnings_daily</code> from
            attributed rows in <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">awin_transactions</code>. Use
            after manual SQL imports or if dashboards look out of date.
          </p>
          <button
            type="button"
            onClick={runRebuild}
            disabled={rebuilding}
            className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
          >
            {rebuilding ? "Rebuilding…" : "Rebuild rollup"}
          </button>
        </section>

        <section className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Scheduled sync (cron)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Hourly cron is configured in <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">vercel.json</code>{" "}
            for <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">POST /api/cron/awin-transactions</code>.
            Set env <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">AWIN_SYNC_CRON_SECRET</code> and send
            header <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">Authorization: Bearer &lt;secret&gt;</code>
            .
          </p>
        </section>

        <p className="text-sm text-zinc-500">
          <Link href="/admin" className="font-medium text-teal-400 hover:text-teal-300 hover:underline">
            Admin dashboard
          </Link>{" "}
          — same sync + rollup controls and live totals.
        </p>
      </div>
    </>
  );
}
