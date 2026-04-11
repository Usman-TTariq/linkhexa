import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import {
  getDefaultAwinAdvertiserId,
  getDefaultAwinPublisherId,
  isAwinConversionConfigured,
  postAwinPublisherAdvertiserOrders,
} from "@/lib/awin/conversion-api";

type Body = {
  publisherId?: string | number;
  advertiserId?: string | number;
  orders?: unknown[];
};

/**
 * Proxy: POST /publishers/{publisherId}/advertiser/{advertiserId}/orders
 * Auth: AWIN_CONVERSION_API_KEY (x-api-key).
 * Defaults: AWIN_PUBLISHER_ID, AWIN_ADVERTISER_ID.
 */
export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  if (!isAwinConversionConfigured()) {
    return NextResponse.json(
      { error: "Conversion API not configured. Set AWIN_CONVERSION_API_KEY on the server." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const publisherId = body.publisherId ?? getDefaultAwinPublisherId();
  if (publisherId === undefined || publisherId === null || String(publisherId).trim() === "") {
    return NextResponse.json(
      { error: "publisherId is required (in JSON body or env AWIN_PUBLISHER_ID)." },
      { status: 400 }
    );
  }

  const advertiserId = body.advertiserId ?? getDefaultAwinAdvertiserId();
  if (advertiserId === undefined || advertiserId === null || String(advertiserId).trim() === "") {
    return NextResponse.json(
      { error: "advertiserId is required (in JSON body or env AWIN_ADVERTISER_ID)." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.orders)) {
    return NextResponse.json({ error: "Body must include an orders array." }, { status: 400 });
  }

  const result = await postAwinPublisherAdvertiserOrders(publisherId, advertiserId, body.orders);

  if (!result.ok) {
    const s = result.status;
    const outStatus = s >= 400 && s < 500 ? s : s === 503 ? 503 : 502;
    return NextResponse.json({ error: result.text, awinStatus: s }, { status: outStatus });
  }

  return NextResponse.json({ ok: true, awinStatus: result.status, awin: result.body });
}
