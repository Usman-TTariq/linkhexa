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
 * Skips if a clickref-like param is already present.
 */
export function appendAwinClickRefToUrl(url: string, clickRef: string): string {
  try {
    const u = new URL(url.trim());
    const lowerKeys = [...u.searchParams.keys()].map((k) => k.toLowerCase());
    if (lowerKeys.some((k) => k === "clickref")) return u.href;
    u.searchParams.set("clickref", clickRef);
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
