import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-origin";
import { AWIN_AGG_FALLBACK_CURRENCY } from "@/lib/awin/currency-default";
import { matchKnownSlug } from "@/lib/awin/slug-match";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** One `.or(go_link_slug.eq.s,click_ref.ilike.%s%)` per slug — avoids huge OR strings that PostgREST/proxies mishandle. */
const SLUG_TXN_QUERY_CONCURRENCY = 8;

type TxnRow = {
  awin_transaction_id: string;
  publisher_id: string | null;
  go_link_slug: string | null;
  click_ref: string | null;
  sale_amount: number | string | null;
  sale_currency: string | null;
  commission_amount: number | string | null;
  commission_currency: string | null;
};

type Agg = {
  txnCount: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

function emptyAgg(): Agg {
  return { txnCount: 0, saleByCurrency: {}, commissionByCurrency: {} };
}

function addToAgg(
  agg: Agg,
  row: {
    sale_amount: number | string | null;
    sale_currency: string | null;
    commission_amount: number | string | null;
    commission_currency: string | null;
  }
): void {
  agg.txnCount += 1;
  const sc = (row.sale_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
  const cc = (row.commission_currency ?? AWIN_AGG_FALLBACK_CURRENCY).toUpperCase();
  agg.saleByCurrency[sc] = (agg.saleByCurrency[sc] ?? 0) + Number(row.sale_amount ?? 0);
  agg.commissionByCurrency[cc] = (agg.commissionByCurrency[cc] ?? 0) + Number(row.commission_amount ?? 0);
}

/**
 * GET: All go-links for one publisher + Awin stats per slug.
 * Linked = rows matching this slug where publisher is this user OR publisher is not set yet
 * (same short link — still shown under Linked so sales/comm match reality). Other = different publisher_id.
 * Query: publisherId (UUID)
 */
export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const publisherId = new URL(request.url).searchParams.get("publisherId")?.trim() ?? "";
  if (!UUID_RE.test(publisherId)) {
    return NextResponse.json({ error: "Invalid publisherId" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const origin = getSiteOrigin();

  try {
    const { data: linkRows, error: linkErr } = await supabase
      .from("publisher_go_links")
      .select("id, slug, target_url, deep_link, click_count, created_at, programme_id")
      .eq("publisher_id", publisherId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    const links = (linkRows ?? []) as {
      id: string;
      slug: string;
      target_url: string;
      deep_link: boolean;
      click_count: number | null;
      created_at: string;
      programme_id: number;
    }[];

    const progIds = [...new Set(links.map((l) => l.programme_id))];
    let progMap = new Map<number, string | null>();
    if (progIds.length > 0) {
      const { data: progs, error: progErr } = await supabase
        .from("awin_programmes")
        .select("programme_id, name")
        .in("programme_id", progIds);

      if (progErr) {
        return NextResponse.json({ error: progErr.message }, { status: 500 });
      }

      progMap = new Map((progs ?? []).map((p) => [p.programme_id as number, p.name as string | null]));
    }

    const slugs = links.map((l) => l.slug);
    const linkedBySlug = new Map<string, Agg>();
    const unlinkedBySlug = new Map<string, Agg>();
    const otherBySlug = new Map<string, Agg>();
    for (const s of slugs) {
      linkedBySlug.set(s, emptyAgg());
      unlinkedBySlug.set(s, emptyAgg());
      otherBySlug.set(s, emptyAgg());
    }

    const normPubId = (id: string) => id.trim().toLowerCase();
    const publisherIdNorm = normPubId(publisherId);
    const fullSlugSet = new Set(slugs);
    const uniqueSlugs = [...fullSlugSet];

    if (uniqueSlugs.length > 0) {
      const merged = new Map<string, TxnRow>();

      for (let i = 0; i < uniqueSlugs.length; i += SLUG_TXN_QUERY_CONCURRENCY) {
        const slice = uniqueSlugs.slice(i, i + SLUG_TXN_QUERY_CONCURRENCY);
        const pages = await Promise.all(
          slice.map((s) =>
            supabase
              .from("awin_transactions")
              .select(
                "awin_transaction_id, publisher_id, go_link_slug, click_ref, sale_amount, sale_currency, commission_amount, commission_currency"
              )
              .or(`go_link_slug.eq.${s},click_ref.ilike.%${s}%`)
          )
        );

        for (const { data, error } of pages) {
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
          for (const r of data ?? []) {
            const row = r as TxnRow;
            merged.set(String(row.awin_transaction_id), row);
          }
        }
      }

      for (const r of merged.values()) {
        const key = matchKnownSlug(r.go_link_slug, r.click_ref, fullSlugSet);
        if (!key) continue;

        if (r.publisher_id && normPubId(r.publisher_id) !== publisherIdNorm) {
          const agg = otherBySlug.get(key) ?? emptyAgg();
          addToAgg(agg, r);
          otherBySlug.set(key, agg);
        } else {
          const agg = linkedBySlug.get(key) ?? emptyAgg();
          addToAgg(agg, r);
          linkedBySlug.set(key, agg);
        }
      }
    }

    const payload = links.map((l) => {
      const stats = linkedBySlug.get(l.slug) ?? emptyAgg();
      const unlinked = unlinkedBySlug.get(l.slug) ?? emptyAgg();
      const other = otherBySlug.get(l.slug) ?? emptyAgg();
      return {
        id: l.id,
        slug: l.slug,
        shortUrl: `${origin}/go/short/${l.slug}`,
        targetUrl: l.target_url,
        deepLink: l.deep_link,
        createdAt: l.created_at,
        programmeId: l.programme_id,
        brandName: progMap.get(l.programme_id) ?? null,
        clicks: Number(l.click_count ?? 0),
        stats: {
          txnCount: stats.txnCount,
          saleByCurrency: stats.saleByCurrency,
          commissionByCurrency: stats.commissionByCurrency,
          unlinkedTxnCount: unlinked.txnCount,
          unlinkedSaleByCurrency: unlinked.saleByCurrency,
          unlinkedCommissionByCurrency: unlinked.commissionByCurrency,
          otherPublisherTxnCount: other.txnCount,
          otherPublisherSaleByCurrency: other.saleByCurrency,
          otherPublisherCommissionByCurrency: other.commissionByCurrency,
        },
      };
    });

    return NextResponse.json({ publisherId, links: payload });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
