import { generateAwinTrackingLink, isAwinConfigured } from "@/lib/awin/client";

const LINK_BUILDER_CACHE_TTL_MS = 60 * 60 * 1000;
const linkBuilderCache = new Map<string, { url: string; expires: number }>();

export function normalizeDisplayUrl(display: string | null): string | null {
  if (!display?.trim()) return null;
  const t = display.trim();
  return t.startsWith("http") ? t : `https://${t}`;
}

/** Prefer Awin click-through (tracked); else merchant display URL. */
export function baseTargetUrl(display: string | null, clickThrough: string | null): string | null {
  if (clickThrough?.trim()) return clickThrough.trim();
  return normalizeDisplayUrl(display);
}

/**
 * Append clickref for legacy awclick URLs when Link Builder is unavailable.
 * Skips if primary `clickref` is already set to a non-empty value.
 * (Awin URLs often include `clickref=` with no value — we overwrite that with the slug.)
 */
export function appendAwinClickRefToUrl(url: string, clickRef: string): string {
  try {
    const u = new URL(url.trim());
    let hasNonEmpty = false;
    for (const [k, v] of u.searchParams.entries()) {
      if (k.toLowerCase() === "clickref" && v.trim()) {
        hasNonEmpty = true;
        break;
      }
    }
    if (hasNonEmpty) return u.href;
    for (const key of [...u.searchParams.keys()]) {
      if (key.toLowerCase() === "clickref") u.searchParams.delete(key);
    }
    u.searchParams.set("clickref", clickRef);
    return u.href;
  } catch {
    return url;
  }
}

/** True for Awin-hosted click-through URLs we can attach a publisher `clickref` to. */
export function isLikelyAwinTrackedClickUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    if (host.includes("awin") && (path.includes("cread") || path.includes("awclick"))) return true;
    if (u.searchParams.has("awinaffid") && u.searchParams.has("awinmid")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Ensures primary `clickref` on Awin `cread.php` / `awclick` URLs is set to the go-link `slug`
 * when it is missing or blank. Fixes deep-link rows that stored `clickref=` with no value.
 */
export function ensureAwinPrimaryClickRef(url: string, slug: string): string {
  const ref = slug.trim();
  if (!ref || !isLikelyAwinTrackedClickUrl(url)) return url;
  try {
    const u = new URL(url.trim());
    let primary = "";
    for (const [k, v] of u.searchParams.entries()) {
      if (k.toLowerCase() === "clickref") {
        primary = v;
        break;
      }
    }
    if (primary.trim()) return url;
    for (const key of [...u.searchParams.keys()]) {
      if (key.toLowerCase() === "clickref") u.searchParams.delete(key);
    }
    u.searchParams.set("clickref", ref);
    return u.href;
  } catch {
    return url;
  }
}

/**
 * Tracked URL via Link Builder. Cache key includes clickRef so each short link keeps attribution.
 */
async function trackingUrlToMerchantDisplay(
  programmeId: number,
  destinationNorm: string,
  clickRef?: string
): Promise<string | null> {
  const key = `${programmeId}|${destinationNorm}|${clickRef ?? ""}`;
  const now = Date.now();
  const hit = linkBuilderCache.get(key);
  if (hit && hit.expires > now) return hit.url;
  try {
    const built = await generateAwinTrackingLink({
      advertiserId: programmeId,
      destinationUrl: destinationNorm,
      parameters: clickRef ? { clickRef } : undefined,
    });
    linkBuilderCache.set(key, { url: built.url, expires: now + LINK_BUILDER_CACHE_TTL_MS });
    return built.url;
  } catch {
    return null;
  }
}

/**
 * Best destination for a go link. When `clickRef` is set (use go-link slug), it is sent to
 * Awin Link Builder so transactions can be attributed to `publisher_go_links.slug`.
 */
export async function resolveTrackedDestination(
  programmeId: number,
  displayUrl: string | null,
  clickThroughUrl: string | null,
  clickRef?: string
): Promise<string | null> {
  const norm = normalizeDisplayUrl(displayUrl);
  if (isAwinConfigured() && norm) {
    const built = await trackingUrlToMerchantDisplay(programmeId, norm, clickRef);
    if (built) return built;
  }
  const base = baseTargetUrl(displayUrl, clickThroughUrl);
  if (base && clickRef) return appendAwinClickRefToUrl(base, clickRef);
  return base;
}

function normalizeHref(a: string): string {
  try {
    return new URL(a.trim()).href;
  } catch {
    return a.trim();
  }
}

export function destinationsDiffer(a: string | null, b: string | null): boolean {
  if (!a || !b) return a !== b;
  return normalizeHref(a) !== normalizeHref(b);
}
