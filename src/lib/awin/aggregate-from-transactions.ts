import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE = 500;
const MAX_ROWS = 100_000;

/** Sum commission/sale for all rows with a publisher (when rollup table is empty or stale). */
export async function sumAttributedAwinByCurrency(supabase: SupabaseClient): Promise<{
  commissionByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
}> {
  const commissionByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("commission_currency, commission_amount, sale_currency, sale_amount")
      .not("publisher_id", "is", null)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      commissionByCurrency[cc] = (commissionByCurrency[cc] ?? 0) + Number(r.commission_amount ?? 0);
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + Number(r.sale_amount ?? 0);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { commissionByCurrency, saleByCurrency };
}

function ymdFromTimestamptz(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Rebuild publisher earnings shape from raw transactions (rollup not run yet). */
export async function publisherEarningsFromTransactions(
  supabase: SupabaseClient,
  publisherId: string,
  fromYmd: string
): Promise<{
  series: {
    date: string;
    currency: string;
    commission: number;
    sale: number;
    transactions: number;
  }[];
  commissionByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
  totalTxns: number;
}> {
  const commissionByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  const bucket = new Map<string, { commission: number; sale: number; txns: number }>();
  let totalTxns = 0;
  let offset = 0;
  let totalRead = 0;

  const fromIso = `${fromYmd}T00:00:00.000Z`;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("transaction_date, commission_currency, commission_amount, sale_currency, sale_amount")
      .eq("publisher_id", publisherId)
      .gte("transaction_date", fromIso)
      .order("transaction_date", { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      transaction_date: string;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const day = ymdFromTimestamptz(r.transaction_date);
      if (day < fromYmd) continue;
      const cur = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      const c = Number(r.commission_amount ?? 0);
      const s = Number(r.sale_amount ?? 0);
      commissionByCurrency[cur] = (commissionByCurrency[cur] ?? 0) + c;
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + s;
      totalTxns += 1;

      const key = `${day}|${cur}`;
      const agg = bucket.get(key) ?? { commission: 0, sale: 0, txns: 0 };
      agg.commission += c;
      agg.sale += s;
      agg.txns += 1;
      bucket.set(key, agg);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  const series = [...bucket.entries()]
    .map(([key, v]) => {
      const [date, currency] = key.split("|");
      return { date, currency, commission: v.commission, sale: v.sale, transactions: v.txns };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.currency.localeCompare(b.currency));

  return { series, commissionByCurrency, saleByCurrency, totalTxns };
}

/** Per-publisher commission totals for admin table when rollup is empty. */
export async function publishersCommissionFromTransactions(
  supabase: SupabaseClient,
  fromYmd: string
): Promise<Map<string, Record<string, number>>> {
  const byPub = new Map<string, Record<string, number>>();
  const fromIso = `${fromYmd}T00:00:00.000Z`;
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount")
      .not("publisher_id", "is", null)
      .gte("transaction_date", fromIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id: string;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
    }[]) {
      const pid = r.publisher_id;
      const cur = (r.commission_currency ?? "GBP").toUpperCase();
      const m = byPub.get(pid) ?? {};
      m[cur] = (m[cur] ?? 0) + Number(r.commission_amount ?? 0);
      byPub.set(pid, m);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return byPub;
}

/** Inclusive rolling window in UTC: `days` calendar days ending today. */
export function rollingUtcWindowDays(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

/**
 * Sums transactions in `awin_transactions` whose `transaction_date` falls in [start, end] (UTC instants).
 * Paginated for large windows.
 */
export async function aggregateAwinTransactionsInRange(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{
  countAll: number;
  countAttributed: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
}> {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  let countAll = 0;
  let countAttributed = 0;
  const saleByCurrency: Record<string, number> = {};
  const commissionByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("awin_transactions")
      .select("publisher_id, commission_currency, commission_amount, sale_currency, sale_amount")
      .gte("transaction_date", startIso)
      .lte("transaction_date", endIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id?: string | null;
      commission_currency?: string | null;
      commission_amount?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      countAll += 1;
      const cc = (r.commission_currency ?? "GBP").toUpperCase();
      const sc = (r.sale_currency ?? "GBP").toUpperCase();
      const c = Number(r.commission_amount ?? 0);
      const s = Number(r.sale_amount ?? 0);
      commissionByCurrency[cc] = (commissionByCurrency[cc] ?? 0) + c;
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + s;
      if (r.publisher_id) countAttributed += 1;
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { countAll, countAttributed, saleByCurrency, commissionByCurrency };
}
