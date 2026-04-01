import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

function signPayload(payload: string, secret: string): string {
  return payload + "." + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export function signAdminToken(): string {
  const secret = process.env.ADMIN_SECRET || "linkhexa-admin-dev-secret";
  return signPayload("admin_ok", secret);
}

export function verifyAdminToken(token: string): boolean {
  try {
    const secret = process.env.ADMIN_SECRET || "linkhexa-admin-dev-secret";
    const [payload, sig] = token.split(".");
    if (!payload || !sig || payload !== "admin_ok") return false;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return safeEqualHex(sig, expected);
  } catch {
    return false;
  }
}

export function getAdminTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!value || !verifyAdminToken(value)) return null;
  return value;
}

/**
 * Cookie `admin_session` (browser) or `Authorization: Bearer <same token>` (e.g. Postman).
 */
export function adminRequestIsAuthorized(request: Request): boolean {
  if (getAdminTokenFromCookieHeader(request.headers.get("cookie")) !== null) return true;
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim();
  return Boolean(token && verifyAdminToken(token));
}

