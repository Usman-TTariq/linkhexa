import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-origin";
import { AWIN_AGG_FALLBACK_CURRENCY } from "@/lib/awin/currency-default";
import { matchKnownSlug } from "@/lib/awin/slug-match";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const TXN_PAGE = 500;
const MAX_TXN_SCAN = 40_000;
const KNOWN_SLUGS_CAP = 25_000;
const SLUG_TXN_QUERY_CONCURRENCY = 8;

function clampLimit(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, Math.floor(n)), MAX_LIMIT);
}

function clampOffset(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

type SaleAgg = {
  txnCount: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

function emptyAgg(): SaleAgg {
  return { txnCount: 0, saleByCurrency: {}, commissionByCurrency: {} };
}

function addToAgg(agg: SaleAgg, row: {
  sale_amount: number | string | null;
  sale_currency: string | null;
  commission_amount: number | string | null;
  commission_currency: string | null;
}): void {
  agg.txnCount += 1;
  const sc = (row.sale_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
  const cc = (row.commission_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
  agg.saleByCurrency[sc] = (agg.saleByCurrency[sc] ?? 0) + Number(row.sale_amount ?? 0);
  agg.commissionByCurrency[cc] = (agg.commissionByCurrency[cc] ?? 0) + Number(row.commission_amount ?? 0);
}

/**
 * GET: Admin audit list of publisher go-links + attributed transaction stats.
 * Query: limit, offset, onlyWithSales=1 (links that have ≥1 attributed txn, ranked by txn count)
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const limit = clampLimit(Number(url.searchParams.get("limit")));
  const offset = clampOffset(Number(url.searchParams.get("offset")));
  const onlyWithSales = url.searchParams.get("onlyWithSales") === "1";

  const supabase = createServerSupabaseClient();
  const origin = getSiteOrigin();

  try {
    if (!onlyWithSales) {
      const { data: rows, error, count } = await supabase
        .from("publisher_go_links")
        .select("id, slug, target_url, deep_link, click_count, created_at, programme_id, publisher_id", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const links = (rows ?? []) as {
        id: string;
        slug: string;
        target_url: string;
        deep_link: boolean;
        click_count: number | null;
        created_at: string;
        programme_id: number;
        publisher_id: string;
      }[];

      const pubIds = [...new Set(links.map((l) => l.publisher_id))];
      const progIds = [...new Set(links.map((l) => l.programme_id))];

      const [profilesRes, programmesRes] = await Promise.all([
        pubIds.length
          ? supabase.from("profiles").select("id, username, email").in("id", pubIds)
          : Promise.resolve({ data: [] as { id: string; username: string; email: string }[], error: null }),
        progIds.length
          ? supabase.from("awin_programmes").select("programme_id, name").in("programme_id", progIds)
          : Promise.resolve({ data: [] as { programme_id: number; name: string | null }[], error: null }),
      ]);

      if (profilesRes.error) {
        return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
      }
      if (programmesRes.error) {
        return NextResponse.json({ error: programmesRes.error.message }, { status: 500 });
      }

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
      const programmeMap = new Map((programmesRes.data ?? []).map((p) => [p.programme_id, p.name]));

      const slugs = links.map((l) => l.slug);
      const statsBySlug = new Map<string, SaleAgg>();
      for (const s of slugs) statsBySlug.set(s, emptyAgg());

      if (slugs.length > 0) {
        const fullSlugSet = new Set(slugs);
        const uniqueSlugs = [...fullSlugSet];
        type TxnLite = {
          awin_transaction_id: string;
          go_link_slug: string | null;
          click_ref: string | null;
          sale_amount: number | string | null;
          sale_currency: string | null;
          commission_amount: number | string | null;
          commission_currency: string | null;
        };
        const merged = new Map<string, TxnLite>();

        for (let i = 0; i < uniqueSlugs.length; i += SLUG_TXN_QUERY_CONCURRENCY) {
          const slice = uniqueSlugs.slice(i, i + SLUG_TXN_QUERY_CONCURRENCY);
          const pages = await Promise.all(
            slice.map((s) =>
              supabase
                .from("awin_transactions")
                .select(
                  "awin_transaction_id, go_link_slug, click_ref, sale_amount, sale_currency, commission_amount, commission_currency"
                )
                .or(`go_link_slug.eq.${s},click_ref.ilike.%${s}%`)
            )
          );
          for (const { data, error } of pages) {
            if (error) {
              return NextResponse.json({ error: error.message }, { status: 500 });
            }
            for (const r of data ?? []) {
              const row = r as TxnLite;
              merged.set(String(row.awin_transaction_id), row);
            }
          }
        }

        for (const r of merged.values()) {
          const key = matchKnownSlug(r.go_link_slug, r.click_ref, fullSlugSet);
          if (!key) continue;
          const agg = statsBySlug.get(key) ?? emptyAgg();
          addToAgg(agg, r);
          statsBySlug.set(key, agg);
        }
      }

      const payload = links.map((l) => {
        const prof = profileMap.get(l.publisher_id);
        const stats = statsBySlug.get(l.slug) ?? emptyAgg();
        return {
          id: l.id,
          slug: l.slug,
          shortUrl: `${origin}/go/short/${l.slug}`,
          targetUrl: l.target_url,
          deepLink: l.deep_link,
          clicks: Number(l.click_count ?? 0),
          createdAt: l.created_at,
          programmeId: l.programme_id,
          brandName: programmeMap.get(l.programme_id) ?? null,
          publisher: {
            id: l.publisher_id,
            username: prof?.username ?? "—",
            email: prof?.email ?? "",
          },
          stats: {
            txnCount: stats.txnCount,
            saleByCurrency: stats.saleByCurrency,
            commissionByCurrency: stats.commissionByCurrency,
          },
        };
      });

      return NextResponse.json({
        mode: "all" as const,
        links: payload,
        total: count ?? 0,
        limit,
        offset,
      });
    }

    // onlyWithSales: rank registered slugs by attributed txn count (bounded scan).
    const { data: knownRows, error: knownErr } = await supabase
      .from("publisher_go_links")
      .select("slug")
      .limit(KNOWN_SLUGS_CAP);

    if (knownErr) {
      return NextResponse.json({ error: knownErr.message }, { status: 500 });
    }

    const knownSlugs = new Set((knownRows ?? []).map((r) => (r as { slug: string }).slug).filter(Boolean));
    const aggAll = new Map<string, SaleAgg>();

    let scanOffset = 0;
    let scanned = 0;
    let scanCapped = false;

    while (scanned < MAX_TXN_SCAN) {
      const { data: txPage, error: txErr } = await supabase
        .from("awin_transactions")
        .select(
          "go_link_slug, click_ref, sale_amount, sale_currency, commission_amount, commission_currency"
        )
        .not("publisher_id", "is", null)
        .order("transaction_date", { ascending: false })
        .range(scanOffset, scanOffset + TXN_PAGE - 1);

      if (txErr) {
        return NextResponse.json({ error: txErr.message }, { status: 500 });
      }
      if (!txPage?.length) break;

      for (const r of txPage as {
        go_link_slug: string | null;
        click_ref: string | null;
        sale_amount: number | string | null;
        sale_currency: string | null;
        commission_amount: number | string | null;
        commission_currency: string | null;
      }[]) {
        const key = matchKnownSlug(r.go_link_slug, r.click_ref, knownSlugs);
        if (!key) continue;
        const prev = aggAll.get(key) ?? emptyAgg();
        addToAgg(prev, r);
        aggAll.set(key, prev);
      }

      scanned += txPage.length;
      scanOffset += TXN_PAGE;
      if (txPage.length < TXN_PAGE) break;
    }

    if (scanned >= MAX_TXN_SCAN) scanCapped = true;

    const ranked = [...aggAll.entries()]
      .filter(([, v]) => v.txnCount > 0)
      .sort((a, b) => b[1].txnCount - a[1].txnCount);

    const total = ranked.length;
    const pageSlugs = ranked.slice(offset, offset + limit).map(([slug]) => slug);

    if (pageSlugs.length === 0) {
      return NextResponse.json({
        mode: "with_sales" as const,
        links: [],
        total,
        limit,
        offset,
        meta: { scanCapped },
      });
    }

    const { data: linkRows, error: linkErr } = await supabase
      .from("publisher_go_links")
      .select("id, slug, target_url, deep_link, click_count, created_at, programme_id, publisher_id")
      .in("slug", pageSlugs);

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    const bySlug = new Map((linkRows ?? []).map((r) => [(r as { slug: string }).slug, r as {
      id: string;
      slug: string;
      target_url: string;
      deep_link: boolean;
      click_count: number | null;
      created_at: string;
      programme_id: number;
      publisher_id: string;
    }]));

    const pubIds2 = [...new Set([...bySlug.values()].map((l) => l.publisher_id))];
    const progIds2 = [...new Set([...bySlug.values()].map((l) => l.programme_id))];

    const [profilesRes2, programmesRes2] = await Promise.all([
      supabase.from("profiles").select("id, username, email").in("id", pubIds2),
      supabase.from("awin_programmes").select("programme_id, name").in("programme_id", progIds2),
    ]);

    if (profilesRes2.error) {
      return NextResponse.json({ error: profilesRes2.error.message }, { status: 500 });
    }
    if (programmesRes2.error) {
      return NextResponse.json({ error: programmesRes2.error.message }, { status: 500 });
    }

    const profileMap2 = new Map((profilesRes2.data ?? []).map((p) => [p.id, p]));
    const programmeMap2 = new Map((programmesRes2.data ?? []).map((p) => [p.programme_id, p.name]));

    const payload = pageSlugs.map((slug) => {
      const l = bySlug.get(slug);
      if (!l) {
        return null;
      }
      const prof = profileMap2.get(l.publisher_id);
      const stats = aggAll.get(slug) ?? emptyAgg();
      return {
        id: l.id,
        slug: l.slug,
        shortUrl: `${origin}/go/short/${l.slug}`,
        targetUrl: l.target_url,
        deepLink: l.deep_link,
        clicks: Number(l.click_count ?? 0),
        createdAt: l.created_at,
        programmeId: l.programme_id,
        brandName: programmeMap2.get(l.programme_id) ?? null,
        publisher: {
          id: l.publisher_id,
          username: prof?.username ?? "—",
          email: prof?.email ?? "",
        },
        stats: {
          txnCount: stats.txnCount,
          saleByCurrency: stats.saleByCurrency,
          commissionByCurrency: stats.commissionByCurrency,
        },
      };
    }).filter((x): x is NonNullable<typeof x> => x != null);

    return NextResponse.json({
      mode: "with_sales" as const,
      links: payload,
      total,
      limit,
      offset,
      meta: { scanCapped },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
