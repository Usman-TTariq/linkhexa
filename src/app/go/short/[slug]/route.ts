import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { destinationsDiffer, resolveTrackedDestination } from "@/lib/go-link-target";

type Params = { params: Promise<{ slug: string }> };

type ProgRow = { display_url: string | null; click_through_url: string | null } | null;

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug || slug.length < 6 || slug.length > 32) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("publisher_go_links")
    .select("target_url, programme_id, deep_link, awin_programmes(display_url, click_through_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data?.target_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let redirectUrl = data.target_url.trim();
  const deepLink = Boolean(data.deep_link);
  const programmeId = typeof data.programme_id === "number" ? data.programme_id : Number(data.programme_id);
  const apRaw = data.awin_programmes as ProgRow | ProgRow[] | undefined;
  const ap = Array.isArray(apRaw) ? apRaw[0] ?? null : apRaw ?? null;
  const displayUrl = ap?.display_url ?? null;
  const clickThrough = ap?.click_through_url ?? null;

  if (!deepLink && Number.isFinite(programmeId)) {
    const canonical = await resolveTrackedDestination(programmeId, displayUrl, clickThrough, slug);
    if (canonical && destinationsDiffer(canonical, redirectUrl)) {
      await supabase.from("publisher_go_links").update({ target_url: canonical }).eq("slug", slug);
      redirectUrl = canonical;
    }
  }

  const { error: incErr } = await supabase.rpc("increment_publisher_go_link_click", { p_slug: slug });
  void incErr;

  return NextResponse.redirect(redirectUrl, 302);
}
