/**
 * Expand Awin / tracking "click ref" values so they can match our `publisher_go_links.slug`
 * (short codes, full /go/short/{slug} URLs, query strings, etc.).
 */
export function expandClickRefVariants(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const t = raw.trim();
  const out = new Set<string>([t]);

  const noQuery = t.split(/[?#]/)[0]?.trim();
  if (noQuery) out.add(noQuery);

  const base = noQuery ?? t;
  const goShort = base.match(/\/go\/short\/([A-Za-z0-9]{6,32})\/?$/i);
  if (goShort?.[1]) out.add(goShort[1]);

  const parts = base.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && /^[A-Za-z0-9]{6,32}$/.test(last)) out.add(last);

  return [...out];
}

/** Pick which known slug (if any) this row refers to. */
export function matchKnownSlug(
  goLinkSlug: string | null,
  clickRef: string | null,
  knownSlugs: Set<string>
): string | null {
  const candidates: string[] = [];
  for (const raw of [goLinkSlug, clickRef]) {
    candidates.push(...expandClickRefVariants(raw));
  }
  const lowerToCanonical = new Map<string, string>();
  for (const s of knownSlugs) {
    lowerToCanonical.set(s.toLowerCase(), s);
  }
  for (const c of candidates) {
    if (knownSlugs.has(c)) return c;
    const canon = lowerToCanonical.get(c.toLowerCase());
    if (canon) return canon;
  }
  return null;
}

/** Resolve publisher from click ref using slug → publisher map (sync). */
export function resolvePublisherIdFromClickRef(
  clickRef: string | null,
  slugToPublisher: Map<string, string>
): string | null {
  if (!clickRef?.trim() || slugToPublisher.size === 0) return null;
  const known = new Set(slugToPublisher.keys());
  const slug = matchKnownSlug(null, clickRef, known);
  if (!slug) return null;
  return slugToPublisher.get(slug) ?? null;
}
