import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_LIMIT = 100;

const PROGRAMME_ID_IN_CHUNK = 200;

async function fetchProgrammeNameMap(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  advertiserIds: (number | null | undefined)[]
): Promise<Map<number, string>> {
  const ids = [...new Set(advertiserIds.filter((x): x is number => typeof x === "number" && Number.isFinite(x)))];
  const out = new Map<number, string>();
  for (let i = 0; i < ids.length; i += PROGRAMME_ID_IN_CHUNK) {
    const chunk = ids.slice(i, i + PROGRAMME_ID_IN_CHUNK);
    const { data, error } = await supabase.from("awin_programmes").select("programme_id, name").in("programme_id", chunk);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) out.set(Number(r.programme_id), String(r.name ?? ""));
  }
  return out;
}

/**
 * GET: transactions with no publisher (unattributed / "lost").
 * Query: limit, offset
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

  const supabase = createServerSupabaseClient();
  const { data, error, count } = await supabase
    .from("awin_transactions")
    .select(
      "awin_transaction_id, advertiser_id, commission_status, commission_amount, commission_currency, sale_amount, sale_currency, transaction_date, click_ref, publisher_id, go_link_slug, synced_at",
      { count: "exact" }
    )
    .is("publisher_id", null)
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let programmeNames = new Map<number, string>();
  try {
    programmeNames = await fetchProgrammeNameMap(
      supabase,
      (data ?? []).map((r) => (r as { advertiser_id?: number | null }).advertiser_id)
    );
  } catch {
    /* optional */
  }

  return NextResponse.json({
    rows: (data ?? []).map((r) => {
      const adv = Number((r as { advertiser_id?: number | null }).advertiser_id ?? NaN);
      const advertiser_name = Number.isFinite(adv) ? programmeNames.get(adv) ?? null : null;
      return { ...r, advertiser_name };
    }),
    total: count ?? 0,
    limit,
    offset,
  });
}
