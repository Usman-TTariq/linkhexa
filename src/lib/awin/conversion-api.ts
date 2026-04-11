const AWIN_BASE = "https://api.awin.com";

const MAX_ORDERS_PER_BATCH = 1000;

function getConversionConfig() {
  const apiKey = process.env.AWIN_CONVERSION_API_KEY?.trim();
  const defaultAdvertiserId = process.env.AWIN_ADVERTISER_ID?.trim();
  const defaultPublisherId = process.env.AWIN_PUBLISHER_ID?.trim();
  return { apiKey, defaultAdvertiserId, defaultPublisherId };
}

/** Publisher orders API — uses x-api-key (user-scoped, publisher-authorized). */
export function isAwinConversionConfigured(): boolean {
  return Boolean(getConversionConfig().apiKey);
}

export function getDefaultAwinAdvertiserId(): string | undefined {
  return getConversionConfig().defaultAdvertiserId;
}

export function getDefaultAwinPublisherId(): string | undefined {
  return getConversionConfig().defaultPublisherId;
}

/** Maps advertiser-style `commissionGroups` to publisher API `commissionGroup`; trims ISO currency. */
export function normalizePublisherOrderPayload(order: unknown): unknown {
  if (!order || typeof order !== "object" || Array.isArray(order)) return order;
  const o = { ...(order as Record<string, unknown>) };
  if (o.commissionGroup === undefined && Array.isArray(o.commissionGroups)) {
    o.commissionGroup = o.commissionGroups;
    delete o.commissionGroups;
  }
  if (typeof o.currency === "string") {
    o.currency = o.currency.trim().toUpperCase();
  }
  if (typeof o.orderReference === "string") {
    o.orderReference = o.orderReference.trim();
  }
  return o;
}

/** Core fields per Awin publisher/advertiser orders contract. */
export function validateOrderCoreFields(order: unknown, index: number): string | null {
  if (!order || typeof order !== "object" || Array.isArray(order)) {
    return `orders[${index}]: must be an object`;
  }
  const o = order as Record<string, unknown>;
  if (typeof o.orderReference !== "string" || !o.orderReference.trim()) {
    return `orders[${index}].orderReference: required string (unique transaction or publisher reference, max 50 chars on some endpoints)`;
  }
  if (o.orderReference.length > 50) {
    return `orders[${index}].orderReference: must be at most 50 characters`;
  }
  if (typeof o.amount !== "number" || !Number.isFinite(o.amount)) {
    return `orders[${index}].amount: required finite number (transaction value)`;
  }
  if (typeof o.currency !== "string" || !/^[A-Z]{3}$/.test(o.currency.trim())) {
    return `orders[${index}].currency: required ISO 4217 code (e.g. GBP, EUR)`;
  }
  if (typeof o.transactionTime !== "number" || !Number.isInteger(o.transactionTime) || o.transactionTime < 0) {
    return `orders[${index}].transactionTime: required integer UNIX time in seconds`;
  }
  return null;
}

/**
 * POST https://api.awin.com/publishers/{publisherId}/advertiser/{advertiserId}/orders
 * Header: x-api-key
 */
export async function postAwinPublisherAdvertiserOrders(
  publisherId: string | number,
  advertiserId: string | number,
  orders: unknown[]
): Promise<{ ok: true; status: number; body: unknown } | { ok: false; status: number; text: string }> {
  const { apiKey } = getConversionConfig();
  if (!apiKey) {
    return { ok: false, status: 503, text: "AWIN_CONVERSION_API_KEY is not set" };
  }

  const pub = String(publisherId).trim();
  const adv = String(advertiserId).trim();
  if (!pub) {
    return { ok: false, status: 400, text: "publisherId is required" };
  }
  if (!adv) {
    return { ok: false, status: 400, text: "advertiserId is required" };
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return { ok: false, status: 400, text: "orders must be a non-empty array" };
  }
  if (orders.length > MAX_ORDERS_PER_BATCH) {
    return { ok: false, status: 400, text: `At most ${MAX_ORDERS_PER_BATCH} orders per batch` };
  }

  const normalizedOrders = orders.map((row) => normalizePublisherOrderPayload(row));
  for (let i = 0; i < normalizedOrders.length; i++) {
    const err = validateOrderCoreFields(normalizedOrders[i], i);
    if (err) return { ok: false, status: 400, text: err };
  }

  const url = `${AWIN_BASE}/publishers/${encodeURIComponent(pub)}/advertiser/${encodeURIComponent(adv)}/orders`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ orders: normalizedOrders }),
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const snippet = typeof parsed === "string" ? parsed : text;
    return { ok: false, status: res.status, text: snippet.slice(0, 2000) };
  }

  return { ok: true, status: res.status, body: parsed };
}
