import { randomBytes } from "node:crypto";
import { clearSessionCookie, createSignedToken, sameOrigin, sessionCookie, verifySignedToken } from "../lib/member-auth.js";
import { membershipForEmail } from "../lib/member-data.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map();

function rateLimited(key) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 5;
}

async function sendMagicLink(email, url) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ROAMSIX <info@roamsix.com>",
      to: [email],
      subject: "Your secure ROAMSIX member sign-in link",
      html: `<p>Use the secure link below to open your ROAMSIX member area.</p><p><a href="${url}">Sign in to ROAMSIX</a></p><p>This link expires in 15 minutes. If you did not request it, you can ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend login email failed (${response.status})`);
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const claims = verifySignedToken(String(req.query?.token || ""), process.env.MEMBER_AUTH_SECRET, "login");
    if (!claims) return res.redirect(302, "/member/login?error=invalid");
    const token = createSignedToken({ email: claims.email, purpose: "session" }, process.env.MEMBER_AUTH_SECRET, 60 * 60 * 24 * 7);
    res.setHeader("Set-Cookie", sessionCookie(token));
    return res.redirect(302, "/member");
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 320);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  const address = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0];
  if (rateLimited(`${address}:${email}`)) return res.status(429).json({ error: "Please wait before requesting another link." });
  if (!process.env.MEMBER_AUTH_SECRET) return res.status(503).json({ error: "Member login is not configured yet." });

  try {
    const membership = await membershipForEmail(email);
    if (membership.eligible) {
      const token = createSignedToken({ email, purpose: "login", nonce: randomBytes(12).toString("base64url") }, process.env.MEMBER_AUTH_SECRET, 15 * 60);
      const host = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
      const proto = req.headers["x-forwarded-proto"] || "https";
      await sendMagicLink(email, `${proto}://${host}/api/member-auth?token=${encodeURIComponent(token)}`);
    }
    return res.status(200).json({ success: true, message: "If that email belongs to an active member, a secure sign-in link is on its way." });
  } catch (error) {
    console.error("Member login request failed:", error.message);
    return res.status(500).json({ error: "We could not send a sign-in link right now." });
  }
}
