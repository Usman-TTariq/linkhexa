import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug || slug.length < 6 || slug.length > 32) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("publisher_go_links")
    .select("target_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data?.target_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Track clicks on the publisher's generated tracking links.
  // (If click increment fails for any reason, we still redirect to avoid breaking user flow.)
  const { error: incErr } = await supabase.rpc("increment_publisher_go_link_click", { p_slug: slug });
  void incErr;

  return NextResponse.redirect(data.target_url, 302);
}
