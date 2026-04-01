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
 * Tracked URL that lands on the merchant site (Link Builder), not the legacy `clickThroughUrl`
 * from the programmes list — that URL often hits awclick.php then redirects to a wrong third-party
 * landing configured on Awin’s side.
 */
async function trackingUrlToMerchantDisplay(programmeId: number, destinationNorm: string): Promise<string | null> {
  const key = `${programmeId}|${destinationNorm}`;
  const now = Date.now();
  const hit = linkBuilderCache.get(key);
  if (hit && hit.expires > now) return hit.url;
  try {
    const built = await generateAwinTrackingLink({
      advertiserId: programmeId,
      destinationUrl: destinationNorm,
    });
    linkBuilderCache.set(key, { url: built.url, expires: now + LINK_BUILDER_CACHE_TTL_MS });
    return built.url;
  } catch {
    return null;
  }
}

/**
 * Best destination for a standard (non–deep-link) go link: Link Builder → merchant display URL
 * when possible; else legacy click-through / display.
 */
export async function resolveTrackedDestination(
  programmeId: number,
  displayUrl: string | null,
  clickThroughUrl: string | null
): Promise<string | null> {
  const norm = normalizeDisplayUrl(displayUrl);
  if (isAwinConfigured() && norm) {
    const built = await trackingUrlToMerchantDisplay(programmeId, norm);
    if (built) return built;
  }
  return baseTargetUrl(displayUrl, clickThroughUrl);
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
