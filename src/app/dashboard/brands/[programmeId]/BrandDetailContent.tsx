"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PresentedAwinDetails } from "@/lib/awin/present-programme-details";
import type { PresentedPromotion, PresentedTerms } from "@/lib/awin/present-terms-creative";

type PrimaryRegion = { countryCode?: string; name?: string } | null;

type Brand = {
  programmeId: number;
  name: string;
  displayUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  currencyCode: string | null;
  programmeStatus: string | null;
  clickThroughUrl: string | null;
  applicationStatus: string;
  primaryRegion: PrimaryRegion;
};

type GoLinkRow = {
  slug: string;
  shortUrl: string;
  targetUrl: string;
  deepLink: boolean;
  createdAt: string;
  clickCount: number;
};

type TabId = "overview" | "commission" | "tracking" | "terms" | "creative";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "commission", label: "Commission rates" },
  { id: "tracking", label: "Tracking links" },
  { id: "terms", label: "Terms" },
  { id: "creative", label: "Creative" },
];

function StatRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <div className="text-zinc-500">{label}</div>
      <div className="text-zinc-200 sm:text-right">{value ?? "—"}</div>
    </div>
  );
}

export default function BrandDetailContent({ programmeId }: { programmeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [awinDetails, setAwinDetails] = useState<PresentedAwinDetails | null>(null);
  const [awinTerms, setAwinTerms] = useState<PresentedTerms | null>(null);
  const [awinPromotions, setAwinPromotions] = useState<PresentedPromotion[]>([]);
  const [tab, setTab] = useState<TabId>("overview");
  const [deepLink, setDeepLink] = useState(true);
  const [landingPage, setLandingPage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);
  const [goLinks, setGoLinks] = useState<GoLinkRow[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadBrand = useCallback(async () => {
    const res = await fetch(`/api/publisher/awin/brands/${programmeId}`, { credentials: "include" });
    if (res.status === 401) {
      router.replace("/login");
      return;
    }
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setBrand(data.brand);
    setAwinDetails(data.awinDetails ?? null);
    setAwinTerms(data.awinTerms ?? null);
    setAwinPromotions(Array.isArray(data.awinPromotions) ? data.awinPromotions : []);
    setLoading(false);
  }, [programmeId, router]);

  const loadGoLinks = useCallback(async () => {
    setLinksLoading(true);
    try {
      const res = await fetch(`/api/publisher/go-links?programmeId=${encodeURIComponent(programmeId)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setGoLinks(data.links ?? []);
    } finally {
      setLinksLoading(false);
    }
  }, [programmeId]);

  useEffect(() => {
    loadBrand();
  }, [loadBrand]);

  useEffect(() => {
    if (brand?.applicationStatus === "approved") {
      loadGoLinks();
    }
  }, [brand?.applicationStatus, loadGoLinks]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const storeHref = brand?.displayUrl
    ? brand.displayUrl.startsWith("http")
      ? brand.displayUrl
      : `https://${brand.displayUrl}`
    : null;

  const regionCode =
    brand?.primaryRegion && typeof brand.primaryRegion === "object"
      ? (brand.primaryRegion as { countryCode?: string }).countryCode
      : null;
  const regionName =
    brand?.primaryRegion && typeof brand.primaryRegion === "object"
      ? (brand.primaryRegion as { name?: string }).name
      : null;

  const canCreateLinks = brand?.applicationStatus === "approved" && Boolean(brand?.clickThroughUrl || brand?.displayUrl);

  const createLink = async () => {
    if (!brand) return;
    setCreating(true);
    setCreateError(null);
    setLastCreatedUrl(null);
    try {
      const res = await fetch("/api/publisher/go-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          programmeId: brand.programmeId,
          deepLink,
          landingPage: deepLink ? landingPage : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data.error || "Could not create link.");
        return;
      }
      if (data.shortUrl) {
        setLastCreatedUrl(data.shortUrl);
        await loadGoLinks();
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-[50vh] items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)]"
          aria-hidden
        />
        <p className="relative text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="relative min-h-[50vh] px-4 pb-16 pt-4 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)]"
          aria-hidden
        />
        <p className="relative text-zinc-400">Brand not found.</p>
        <Link href="/dashboard/brands" className="relative mt-4 inline-block text-indigo-400 hover:underline">
          Back to brands
        </Link>
      </div>
    );
  }

  const statusBadge =
    brand.applicationStatus === "approved" ? (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/35">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        Approved on LinkHexa
      </span>
    ) : brand.applicationStatus === "pending" ? (
      <span className="inline-flex rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/30">
        Pending review
      </span>
    ) : brand.applicationStatus === "rejected" ? (
      <span className="inline-flex rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 ring-1 ring-red-500/25">
        Rejected
      </span>
    ) : (
      <span className="inline-flex rounded-lg bg-zinc-500/15 px-3 py-1.5 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
        Not applied
      </span>
    );

  const cardClass =
    "rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm";

  return (
    <div className="relative min-h-screen pb-20 px-4 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_30%,rgba(139,92,246,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl pt-2">
        <Link
          href="/dashboard/brands"
          className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          <span aria-hidden>←</span> Available brands
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
          {/* Sidebar */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(3.75rem+1.5rem)]">
            <div className={`${cardClass} p-5`}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-indigo-500/20 bg-zinc-800/80">
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logoUrl} alt="" className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-zinc-500">Logo</span>
                )}
              </div>
              <h1
                className="mt-4 text-center text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
              >
                {brand.name}
              </h1>
              <p className="mt-1 text-center text-xs text-zinc-500">Awin programme ID · {brand.programmeId}</p>

              {(regionCode || regionName) && (
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <span aria-hidden>🌐</span>
                  {[regionName, regionCode].filter(Boolean).join(" · ")}
                </p>
              )}

              {storeHref && (
                <a
                  href={storeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-indigo-200 transition-colors hover:border-indigo-500/35 hover:bg-indigo-500/10"
                >
                  Visit store
                  <svg className="h-3.5 w-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M16.5 3h6m0 0v6m0-6L10.5 15" />
                  </svg>
                </a>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  title="Coming soon"
                  className="cursor-not-allowed rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-zinc-500"
                  disabled
                >
                  Message
                </button>
                <div className="flex justify-center">{statusBadge}</div>
              </div>

              <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
                <div className="flex justify-between gap-2 text-zinc-500">
                  <dt>Commission</dt>
                  <dd className="max-w-[58%] text-right text-zinc-300">
                    {awinDetails?.commissionSummary ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-zinc-500">
                  <dt>Regions</dt>
                  <dd className="text-right text-zinc-300">{regionCode || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2 text-zinc-500">
                  <dt>
                    <abbr title="Earnings per click (Awin KPI)" className="cursor-help no-underline">
                      EPC
                    </abbr>
                  </dt>
                  <dd className="text-right text-zinc-300">{awinDetails?.epcFormatted ?? "—"}</dd>
                </div>
                {brand.currencyCode && (
                  <div className="flex justify-between gap-2 text-zinc-500">
                    <dt>Currency</dt>
                    <dd className="text-right text-zinc-300">{brand.currencyCode}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-[10px] leading-snug text-zinc-600">
                Commission &amp; EPC from Awin&apos;s programmedetails API when available.
              </p>
            </div>

            {brand.description && (
              <div className={`${cardClass} flex max-h-[min(420px,50vh)] flex-col p-5`}>
                <h2 className="text-sm font-semibold text-zinc-200">Store details</h2>
                <div className="mt-3 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-zinc-400">
                  <p className="whitespace-pre-wrap">{brand.description}</p>
                </div>
                {brand.programmeStatus && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-200 ring-1 ring-violet-500/25">
                      {brand.programmeStatus}
                    </span>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Main */}
          <div className="min-w-0">
            <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    tab === t.id
                      ? "border-indigo-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === "overview" && (
              <div className="space-y-8">
                <section className={cardClass}>
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-base font-semibold text-white">Detailed introduction</h2>
                  </div>
                  <div className="px-5 py-5">
                    {brand.description ? (
                      <div className="prose prose-invert prose-sm max-w-none text-zinc-300 prose-p:leading-relaxed">
                        <p className="whitespace-pre-wrap">{brand.description}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No programme description has been synced yet.</p>
                    )}
                  </div>
                </section>

                <section className={cardClass}>
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-base font-semibold text-white">Create a link</h2>
                    <p className="mt-1 text-sm text-zinc-500">Promote this brand with a short LinkHexa URL.</p>
                  </div>
                  <div className="space-y-5 px-5 py-5">
                    {!canCreateLinks && (
                      <p className="text-sm text-amber-200/90">
                        {brand.applicationStatus !== "approved"
                          ? "Once an admin approves your application, you can generate short links here."
                          : "No destination URL is available yet. Ask an admin to sync this programme from Awin."}
                      </p>
                    )}
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Brand</label>
                      <div className="mt-1.5 rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200">
                        {brand.name}
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={deepLink}
                        onChange={(e) => setDeepLink(e.target.checked)}
                        disabled={!canCreateLinks || creating}
                        className="h-4 w-4 rounded border-white/30 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/40 disabled:opacity-50"
                      />
                      Deep link
                    </label>
                    <div>
                      <label htmlFor="landing-page" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Landing page (optional)
                      </label>
                      <input
                        id="landing-page"
                        type="url"
                        value={landingPage}
                        onChange={(e) => setLandingPage(e.target.value)}
                        disabled={!canCreateLinks || creating || !deepLink}
                        placeholder={storeHref ? `e.g. ${storeHref.replace(/\/$/, "")}/sale` : "https://…"}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                      />
                      <p className="mt-1.5 text-xs text-zinc-500">
                        {deepLink
                          ? "Same store domain only. We send this URL through Awin’s link builder so redirects stay tracked."
                          : "Uses your Awin click-through URL (or store URL) when deep link is off."}
                      </p>
                    </div>
                    {createError && (
                      <p className="text-sm text-red-400" role="alert">
                        {createError}
                      </p>
                    )}
                    {lastCreatedUrl && (
                      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-200/80">Your short link</p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <code className="flex-1 break-all text-sm text-emerald-100">{lastCreatedUrl}</code>
                          <button
                            type="button"
                            onClick={() => copyText(lastCreatedUrl, "new")}
                            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            {copied === "new" ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                          Live redirects use your site domain (set <code className="text-zinc-400">NEXT_PUBLIC_APP_URL</code> in
                          production, e.g. https://linkhexa.com).
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={createLink}
                        disabled={!canCreateLinks || creating}
                        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(99,102,241,0.6)] hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creating ? "Creating…" : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("tracking")}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                      >
                        View all links
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {tab === "commission" && (
              <div className={cardClass}>
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-base font-semibold text-white">Commission &amp; performance</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Pulled live from Awin&apos;s{" "}
                    <code className="rounded bg-zinc-800 px-1 py-0.5 text-[11px] text-zinc-400">programmedetails</code>{" "}
                    endpoint for this programme.
                  </p>
                </div>
                {!awinDetails ? (
                  <div className="px-5 py-6">
                    <p className="text-sm text-zinc-400">
                      No live metrics were returned. This usually means Awin API credentials are not set on the server, the
                      programme id does not match Awin&apos;s <span className="text-zinc-300">advertiserId</span> for this call,
                      or Awin returned an error.
                    </p>
                    <p className="mt-3 text-sm text-zinc-500">
                      Ask an admin to configure <code className="text-zinc-400">AWIN_API_TOKEN</code> and{" "}
                      <code className="text-zinc-400">AWIN_PUBLISHER_ID</code>, and confirm your publisher has access to this
                      programme on Awin.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 text-sm">
                    {awinDetails.commissionRanges.length > 0 ? (
                      <div className="px-5 py-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Commission ranges</h3>
                        <div className="mt-2 space-y-1">
                          {awinDetails.commissionRanges.map((line, i) => (
                            <p key={i} className="text-zinc-200">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-4 text-zinc-500">No commission range data in the last response.</div>
                    )}
                    <StatRow label="EPC (earnings per click)" value={awinDetails.epcFormatted} />
                    <StatRow label="Conversion rate" value={awinDetails.conversionRateDisplay} />
                    <StatRow label="Approval rate" value={awinDetails.approvalPercentageDisplay} />
                    <StatRow label="Awin Index" value={awinDetails.awinIndex != null ? String(awinDetails.awinIndex) : null} />
                    <StatRow
                      label="Validation (avg. days)"
                      value={awinDetails.validationDays != null ? String(awinDetails.validationDays) : null}
                    />
                    <StatRow label="Average payment time" value={awinDetails.averagePaymentTime} />
                    <StatRow
                      label="Deeplink enabled (advertiser)"
                      value={
                        awinDetails.deeplinkEnabled == null
                          ? null
                          : awinDetails.deeplinkEnabled
                            ? "Yes"
                            : "No"
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {tab === "tracking" && (
              <div className={`${cardClass} overflow-hidden`}>
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-base font-semibold text-white">Your short links</h2>
                  <p className="mt-1 text-sm text-zinc-500">Same format as <span className="text-zinc-400">/go/short/…</span> on your public domain.</p>
                </div>
                {brand.applicationStatus !== "approved" ? (
                  <p className="px-5 py-6 text-sm text-zinc-500">Approve your application to create and list links.</p>
                ) : linksLoading ? (
                  <p className="px-5 py-6 text-sm text-zinc-500">Loading…</p>
                ) : goLinks.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-zinc-500">No links yet. Create one from the Overview tab.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {goLinks.map((row) => (
                      <li key={row.slug} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="break-all font-mono text-sm text-indigo-200">{row.shortUrl}</p>
                          <p className="mt-1 break-all text-xs text-zinc-500">{row.targetUrl}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Clicks:{" "}
                            <span className="font-mono tabular-nums text-zinc-300">{Number(row.clickCount || 0).toLocaleString()}</span>
                          </p>
                          {row.deepLink && (
                            <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                              Deep link
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(row.shortUrl, row.slug)}
                          className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          {copied === row.slug ? "Copied" : "Copy"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "terms" && (
              <div className={cardClass}>
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-base font-semibold text-white">Terms &amp; programme rules</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    From Awin <span className="text-zinc-400">programmedetails</span> (programme info) and active offers&apos;{" "}
                    <span className="text-zinc-400">terms</span> fields where provided.
                  </p>
                </div>
                {!awinTerms ? (
                  <div className="px-5 py-6">
                    <p className="text-sm text-zinc-400">
                      Nothing loaded. Configure <code className="text-zinc-500">AWIN_API_TOKEN</code> and{" "}
                      <code className="text-zinc-500">AWIN_PUBLISHER_ID</code>, or try again if Awin returned an error.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {awinTerms.sections.map((s) => (
                      <section key={s.id} className="px-5 py-5">
                        <h3 className="text-sm font-semibold text-indigo-200/95">{s.title}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{s.body}</p>
                      </section>
                    ))}
                  </div>
                )}
                <div className="border-t border-white/10 px-5 py-4">
                  <p className="text-xs leading-relaxed text-zinc-600">
                    Legal and promotional restrictions may change. Always verify in your Awin publisher UI before campaigns.
                  </p>
                </div>
              </div>
            )}

            {tab === "creative" && (
              <div className={cardClass}>
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-base font-semibold text-white">Promotions &amp; creatives</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Active offers from Awin&apos;s promotions API for this advertiser ID (same as your programme id). Use
                    tracking URLs when you need Awin attribution.
                  </p>
                </div>
                {awinPromotions.length === 0 ? (
                  <div className="px-5 py-6">
                    <p className="text-sm text-zinc-400">
                      No active offers returned for this programme. The advertiser may not have live promotions, the id may
                      not match Awin&apos;s advertiser id for offers, or the API call failed (check server env and logs).
                    </p>
                    <p className="mt-3 text-sm text-zinc-500">
                      You can still build links from the Overview tab and use the Awin link builder in your publisher account
                      for banners and feeds.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {awinPromotions.map((p) => (
                      <li key={p.promotionId} className="flex flex-col gap-4 px-5 py-5 sm:flex-row">
                        {p.imageUrl && (
                          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/50 sm:h-28 sm:w-40">
                            {/* eslint-disable-next-line @next/next/no-img-element -- remote Awin creative URL */}
                            <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-200 ring-1 ring-violet-500/30">
                              {p.type}
                            </span>
                            {p.voucherCode && (
                              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25">
                                {p.voucherCode}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-base font-semibold text-white">{p.title}</h3>
                          {p.description && (
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.description}</p>
                          )}
                          {(p.startDate || p.endDate) && (
                            <p className="mt-2 text-xs text-zinc-500">
                              {p.startDate && <span>From {p.startDate.slice(0, 10)}</span>}
                              {p.startDate && p.endDate && " · "}
                              {p.endDate && <span>Until {p.endDate.slice(0, 10)}</span>}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {p.urlTracking && (
                              <a
                                href={p.urlTracking}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                              >
                                Open tracking URL
                              </a>
                            )}
                            {p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                              >
                                Merchant page
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
