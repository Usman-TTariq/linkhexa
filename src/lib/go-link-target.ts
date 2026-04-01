import { fetchAwinProgrammeDetails, isAwinConfigured } from "@/lib/awin/client";

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
 * True if `storedUrl` looks like a normal destination for this programme:
 * Awin tracking host or same registrable-ish host as the merchant display URL.
 */
export function isPlausibleRedirectTarget(storedUrl: string, merchantDisplayUrl: string | null): boolean {
  try {
    const u = new URL(storedUrl);
    const h = u.hostname.toLowerCase();
    const hNoWww = h.replace(/^www\./, "");
    if (hNoWww.includes("awin1.com") || hNoWww.endsWith(".awin1.com")) return true;
    if (hNoWww.includes("awin.com") && hNoWww.includes("click")) return true;

    const base = normalizeDisplayUrl(merchantDisplayUrl);
    if (!base) return true;
    const mh = new URL(base).hostname.toLowerCase().replace(/^www\./, "");
    return hNoWww === mh || hNoWww.endsWith(`.${mh}`);
  } catch {
    return true;
  }
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

/** Live programme details from Awin (same source as merchant listing). */
export async function resolveDestinationFromAwinApi(programmeId: number): Promise<string | null> {
  if (!isAwinConfigured()) return null;
  try {
    const d = await fetchAwinProgrammeDetails(programmeId, { relationship: "any" });
    const info = d.programmeInfo;
    return baseTargetUrl(info?.displayUrl ?? null, info?.clickThroughUrl ?? null);
  } catch {
    return null;
  }
}
