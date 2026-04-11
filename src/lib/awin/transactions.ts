const AWIN_BASE = "https://api.awin.com";

function getConfig() {
  const token = process.env.AWIN_API_TOKEN?.trim();
  const publisherId = process.env.AWIN_PUBLISHER_ID?.trim();
  return { token, publisherId };
}

/** Awin expects `yyyy-MM-ddThh:mm:ss` (no timezone suffix; paired with `timezone` param). */
function formatAwinDate(d: Date): string {
  const iso = d.toISOString();
  return iso.slice(0, 19);
}

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

/**
 * GET /publishers/{publisherId}/transactions/
 * @see https://success.awin.com/s/article/Publisher-API-GET-transactions-list
 */
export async function fetchAwinTransactionsRange(options: {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}): Promise<unknown[]> {
  const { token, publisherId } = getConfig();
  if (!token || !publisherId) {
    throw new Error("Missing AWIN_API_TOKEN or AWIN_PUBLISHER_ID");
  }
  const start = options.startDate.getTime();
  const end = options.endDate.getTime();
  if (end < start) {
    throw new Error("Invalid date range");
  }
  if (end - start > MAX_RANGE_MS) {
    throw new Error("Awin transactions API allows at most 31 days per request");
  }

  const tz = options.timezone ?? "UTC";
  const out: unknown[] = [];

  for (let page = 1; page <= 100; page++) {
    const url = new URL(`${AWIN_BASE}/publishers/${publisherId}/transactions/`);
    url.searchParams.set("accessToken", token);
    url.searchParams.set("startDate", formatAwinDate(options.startDate));
    url.searchParams.set("endDate", formatAwinDate(options.endDate));
    url.searchParams.set("timezone", tz);
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Awin transactions ${res.status}: ${text.slice(0, 400)}`);
    }

    const data = (await res.json()) as unknown;
    const batch = normalizeTransactionsPayload(data);
    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 200) break;
  }

  return out;
}

function normalizeTransactionsPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["data", "transactions", "results", "items"]) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export type ParsedAwinTransaction = {
  awinTransactionId: string;
  advertiserId: number | null;
  commissionStatus: string | null;
  commissionAmount: number;
  commissionCurrency: string;
  saleAmount: number;
  saleCurrency: string;
  transactionDate: string;
  clickRef: string | null;
};

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function parseMoney(obj: unknown): { amount: number; currency: string } {
  if (!obj || typeof obj !== "object") {
    return { amount: 0, currency: "GBP" };
  }
  const o = obj as Record<string, unknown>;
  const amount = num(o.amount ?? o.value);
  const cur = o.currency ?? o.currencyCode ?? "GBP";
  const currency = typeof cur === "string" && cur.trim() ? cur.trim().toUpperCase() : "GBP";
  return { amount, currency };
}

function extractClickRef(raw: Record<string, unknown>): string | null {
  const cr = raw.clickRefs ?? raw.clickrefs;
  if (!cr || typeof cr !== "object") return null;
  const o = cr as Record<string, unknown>;
  for (const k of ["clickRef", "clickRef2", "clickRef3", "clickRef4", "clickRef5", "clickRef6"]) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function parseAwinTransactionRow(row: unknown): ParsedAwinTransaction | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const idRaw = r.id ?? r.transactionId ?? r.transaction_id;
  const awinTransactionId =
    typeof idRaw === "string" ? idRaw : typeof idRaw === "number" ? String(idRaw) : null;
  if (!awinTransactionId) return null;

  const commission = parseMoney(r.commissionAmount ?? r.commission);
  const sale = parseMoney(r.saleAmount ?? r.sale);

  const dateRaw = r.transactionDate ?? r.transaction_date ?? r.date;
  const transactionDate =
    typeof dateRaw === "string" && dateRaw.trim()
      ? dateRaw.trim()
      : new Date().toISOString();

  const adv = r.advertiserId ?? r.advertiser_id;
  const advertiserId =
    typeof adv === "number"
      ? adv
      : typeof adv === "string" && adv.trim()
        ? Number(adv)
        : null;

  const commissionStatus =
    typeof r.commissionStatus === "string"
      ? r.commissionStatus
      : typeof r.commission_status === "string"
        ? r.commission_status
        : null;

  return {
    awinTransactionId,
    advertiserId: advertiserId != null && Number.isFinite(advertiserId) ? advertiserId : null,
    commissionStatus,
    commissionAmount: commission.amount,
    commissionCurrency: commission.currency,
    saleAmount: sale.amount,
    saleCurrency: sale.currency,
    transactionDate,
    clickRef: extractClickRef(r),
  };
}
