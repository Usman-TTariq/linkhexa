import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { fetchAwinProgrammes, generateAwinTrackingLink, isAwinConfigured } from "@/lib/awin/client";
import { getSiteOrigin } from "@/lib/site-origin";

const SLUG_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const SLUG_LEN = 10;
const MAX_SLUG_TRIES = 8;

function makeSlug(): string {
  const buf = randomBytes(SLUG_LEN);
  let s = "";
  for (let i = 0; i < SLUG_LEN; i++) {
    s += SLUG_CHARS[buf[i]! % SLUG_CHARS.length];
  }
  return s;
}

function normalizeDisplayUrl(display: string | null): string | null {
  if (!display?.trim()) return null;
  const t = display.trim();
  return t.startsWith("http") ? t : `https://${t}`;
}

function baseTargetUrl(display: string | null, clickThrough: string | null): string | null {
  if (clickThrough?.trim()) return clickThrough.trim();
  return normalizeDisplayUrl(display);
}

function resolveLandingInput(raw: string, displayUrl: string | null): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) {
    try {
      return new URL(t).toString();
    } catch {
      return null;
    }
  }
  const base = normalizeDisplayUrl(displayUrl);
  if (!base) return null;
  try {
    const path = t.startsWith("/") ? t : `/${t}`;
    return new URL(path, base).toString();
  } catch {
    return null;
  }
}

function hostMatchesMerchant(landing: string, displayUrl: string | null): boolean {
  let landHost: string;
  try {
    landHost = new URL(landing).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return false;
  }
  const base = normalizeDisplayUrl(displayUrl);
  if (!base) return false;
  try {
    const h = new URL(base).hostname.toLowerCase().replace(/^www\./, "");
    return landHost === h || landHost.endsWith(`.${h}`);
  } catch {
    return false;
  }
}

async function assertBrandAccess(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  programmeId: number
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const { data: app } = await supabase
    .from("publisher_awin_applications")
    .select("status")
    .eq("publisher_id", userId)
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (app) return { ok: true };

  try {
    const joined = await fetchAwinProgrammes({ relationship: "joined" });
    const ids = new Set(joined.map((p) => p.id));
    if (ids.has(programmeId)) return { ok: true };
  } catch {
    return { ok: false, status: 502, message: "Could not verify programme access with Awin." };
  }

  return { ok: false, status: 404, message: "Not found" };
}

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("programmeId");
  const supabase = createServerSupabaseClient();
  const origin = getSiteOrigin();

  /** Dashboard: all short links for this publisher (newest first). */
  if (raw == null || raw.trim() === "") {
    const { data, error } = await supabase
      .from("publisher_go_links")
      .select("slug, target_url, deep_link, created_at, click_count, programme_id, awin_programmes(name)")
      .eq("publisher_id", pub.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const links = (data ?? []).map((row) => {
      const ap = row.awin_programmes as { name?: string } | null | undefined;
      return {
        slug: row.slug,
        shortUrl: `${origin}/go/short/${row.slug}`,
        targetUrl: row.target_url,
        deepLink: row.deep_link,
        createdAt: row.created_at,
        clickCount: row.click_count,
        programmeId: row.programme_id,
        brandName: ap?.name ?? null,
      };
    });

    return NextResponse.json({ links });
  }

  const programmeId = Number(raw);
  if (!Number.isFinite(programmeId)) {
    return NextResponse.json({ error: "Invalid programmeId" }, { status: 400 });
  }

  const access = await assertBrandAccess(supabase, pub.userId, programmeId);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  const { data, error } = await supabase
    .from("publisher_go_links")
    .select("slug, target_url, deep_link, created_at, click_count")
    .eq("publisher_id", pub.userId)
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const links = (data ?? []).map((row) => ({
    slug: row.slug,
    shortUrl: `${origin}/go/short/${row.slug}`,
    targetUrl: row.target_url,
    deepLink: row.deep_link,
    createdAt: row.created_at,
    clickCount: row.click_count,
  }));

  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let body: { programmeId?: unknown; deepLink?: unknown; landingPage?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const programmeId = typeof body.programmeId === "number" ? body.programmeId : Number(body.programmeId);
  if (!Number.isFinite(programmeId)) {
    return NextResponse.json({ error: "programmeId required" }, { status: 400 });
  }

  const deepLink = Boolean(body.deepLink);
  const landingRaw = typeof body.landingPage === "string" ? body.landingPage : "";

  const supabase = createServerSupabaseClient();

  const { data: app } = await supabase
    .from("publisher_awin_applications")
    .select("status")
    .eq("publisher_id", pub.userId)
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (!app || app.status !== "approved") {
    return NextResponse.json({ error: "You need an approved application for this programme to create links." }, { status: 403 });
  }

  const access = await assertBrandAccess(supabase, pub.userId, programmeId);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  const { data: row, error: rowErr } = await supabase
    .from("awin_programmes")
    .select("programme_id, display_url, click_through_url")
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (rowErr) {
    return NextResponse.json({ error: rowErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Programme not found" }, { status: 404 });
  }

  const displayUrl = row.display_url as string | null;
  const clickThrough = row.click_through_url as string | null;

  let targetUrl: string | null = null;

  if (deepLink && landingRaw.trim()) {
    const resolved = resolveLandingInput(landingRaw, displayUrl);
    if (!resolved) {
      return NextResponse.json({ error: "Enter a valid landing page URL or path for this store." }, { status: 400 });
    }
    if (!hostMatchesMerchant(resolved, displayUrl)) {
      return NextResponse.json(
        { error: "Landing page must use the same domain as this programme’s store URL." },
        { status: 400 }
      );
    }
    if (!isAwinConfigured()) {
      return NextResponse.json(
        {
          error:
            "Deep links with proper Awin tracking need AWIN_API_TOKEN and AWIN_PUBLISHER_ID on the server. Turn off deep link to use the stored click-through URL instead.",
        },
        { status: 503 }
      );
    }
    try {
      const built = await generateAwinTrackingLink({
        advertiserId: programmeId,
        destinationUrl: resolved,
      });
      targetUrl = built.url;
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json(
        {
          error:
            "Awin could not build a tracking link for this landing page. Some programmes disable link builder, or the URL may be invalid for this advertiser. Try without deep link or another path.",
          detail,
        },
        { status: 502 }
      );
    }
  } else {
    targetUrl = baseTargetUrl(displayUrl, clickThrough);
  }

  if (!targetUrl) {
    return NextResponse.json(
      { error: "No destination URL available. Ask an admin to sync this programme so click-through or store URL is set." },
      { status: 400 }
    );
  }

  let slug = "";
  let insertErr: { code?: string; message: string } | null = null;

  for (let i = 0; i < MAX_SLUG_TRIES; i++) {
    slug = makeSlug();
    const { error } = await supabase.from("publisher_go_links").insert({
      slug,
      publisher_id: pub.userId,
      programme_id: programmeId,
      target_url: targetUrl,
      deep_link: deepLink && Boolean(landingRaw.trim()),
    });
    if (!error) {
      insertErr = null;
      break;
    }
    if (error.code === "23505") {
      insertErr = error;
      continue;
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (insertErr) {
    return NextResponse.json({ error: "Could not allocate a unique short code. Try again." }, { status: 500 });
  }

  const origin = getSiteOrigin();
  const shortUrl = `${origin}/go/short/${slug}`;

  return NextResponse.json({ ok: true, slug, shortUrl, targetUrl });
}
