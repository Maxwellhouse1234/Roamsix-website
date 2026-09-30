import { createClerkClient, verifyToken } from "@clerk/backend";
import { createSignedToken, sameOrigin, sessionCookie } from "../lib/member-auth.js";
import { membershipForEmail } from "../lib/member-data.js";

function requestOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return host ? `${proto}://${host}` : "";
}

function bearerToken(req) {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  if (!process.env.CLERK_SECRET_KEY || !process.env.MEMBER_AUTH_SECRET) {
    return res.status(503).json({ error: "Social sign-in is not configured yet." });
  }
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "A Clerk session token is required." });

  try {
    const origin = requestOrigin(req);
    const configuredParties = String(process.env.CLERK_AUTHORIZED_PARTIES || "").split(",").map((value) => value.trim()).filter(Boolean);
    const authorizedParties = [...new Set([origin, ...configuredParties].filter(Boolean))];
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, authorizedParties });
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(claims.sub);
    const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId) || user.emailAddresses[0];
    const email = String(primary?.emailAddress || "").trim().toLowerCase();
    if (!email || primary?.verification?.status !== "verified") {
      return res.status(403).json({ error: "A verified email address is required." });
    }
    const membership = await membershipForEmail(email);
    if (!membership.eligible) {
      return res.status(403).json({ error: "This email is signed in, but an active ROAMSIX membership was not found." });
    }
    const session = createSignedToken({ email, clerkUserId: user.id, purpose: "session" }, process.env.MEMBER_AUTH_SECRET, 60 * 60 * 24 * 7);
    res.setHeader("Set-Cookie", sessionCookie(session));
    return res.status(200).json({ success: true, tier: membership.tier });
  } catch (error) {
    console.error("Clerk member session failed:", error.message);
    return res.status(401).json({ error: "The secure sign-in could not be verified." });
  }
}
