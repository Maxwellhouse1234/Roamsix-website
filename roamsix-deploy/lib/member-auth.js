import { createHmac, timingSafeEqual } from "node:crypto";

export const MEMBER_COOKIE = "roamsix_member_session";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSignedToken(claims, secret, ttlSeconds) {
  if (!secret) throw new Error("MEMBER_AUTH_SECRET is not configured");
  const payload = encode({ ...claims, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  return `${payload}.${signature(payload, secret)}`;
}

export function verifySignedToken(token, secret, expectedPurpose) {
  if (!secret || !token || !token.includes(".")) return null;
  const [payload, supplied] = token.split(".");
  const expected = signature(payload, secret);
  try {
    if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
    const claims = decode(payload);
    if (!claims.email || claims.exp < Math.floor(Date.now() / 1000)) return null;
    if (expectedPurpose && claims.purpose !== expectedPurpose) return null;
    return claims;
  } catch {
    return null;
  }
}

export function readCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((part) => {
    const index = part.indexOf("=");
    return index > -1 ? [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())] : ["", ""];
  }).filter(([key]) => key));
}

export function sessionFromRequest(req) {
  return verifySignedToken(readCookies(req)[MEMBER_COOKIE], process.env.MEMBER_AUTH_SECRET, "session");
}

export function sessionCookie(token, maxAge = 60 * 60 * 24 * 7) {
  return `${MEMBER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${MEMBER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}
