import { sameOrigin, sessionFromRequest } from "../lib/member-auth.js";
import { membershipForEmail } from "../lib/member-data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  const session = sessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Sign in is required." });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Billing management is not configured yet." });

  try {
    const membership = await membershipForEmail(session.email);
    if (!membership?.customerId) return res.status(404).json({ error: "A Stripe membership record was not found." });
    const host = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const params = new URLSearchParams({
      customer: membership.customerId,
      return_url: `${proto}://${host}/membership/manage`,
    });
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data?.error?.message || `Stripe ${response.status}`);
    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error("Billing portal session failed:", error.message);
    return res.status(500).json({ error: "We could not open secure billing management." });
  }
}
