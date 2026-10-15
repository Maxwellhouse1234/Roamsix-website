import { DR_SAL_EVENT, drSalAgreementHash, drSalAgreementHtml, drSalAgreementSnapshot, drSalParticipationAgreementEnabled } from "../lib/dr-sal-event.js";
import { sameOrigin, verifySignedToken } from "../lib/member-auth.js";
import { sendTransactionalEmail } from "../lib/transactional-email.js";

const BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";
const ATTENDEES_TABLE = process.env.ROAMSIX_EVENT_ATTENDEES_TABLE_ID || "tbltON9TJyq9GqBW4";
function clean(value, max = 500) { return String(value || "").trim().slice(0, max); }
function formulaValue(value) { return clean(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
function escapeHtml(value) { return clean(value, 1000).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
async function airtable(path, options = {}) { const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, { ...options, headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json", ...(options.headers || {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(`Transfer completion Airtable ${response.status}`); return data; }
async function findOne(table, formula) { const query = new URLSearchParams({ filterByFormula: formula, maxRecords: "1" }); const data = await airtable(`${encodeURIComponent(table)}?${query}`); return data.records?.[0] || null; }

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!drSalParticipationAgreementEnabled()) return res.status(503).json({ error: "The final participation agreement is not available yet." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  const secret = process.env.EVENT_TRANSFER_SECRET || process.env.MEMBER_AUTH_SECRET;
  const claims = verifySignedToken(clean(req.body?.token, 5000), secret, "event-transfer");
  if (!claims || claims.eventId !== DR_SAL_EVENT.id || !claims.sessionId) return res.status(401).json({ error: "This transfer link is invalid or expired." });
  if (!req.body?.agreedToTerms || !req.body?.waiverAccepted || req.body?.acceptedLegalVersion !== DR_SAL_EVENT.legalVersion) return res.status(400).json({ error: "The current event terms and agreement must be accepted." });
  try {
    const attendee = await findOne(ATTENDEES_TABLE, `AND({Stripe Session ID}='${formulaValue(claims.sessionId)}',{Email}='${formulaValue(claims.email)}',{Registration Status}='Awaiting agreement')`);
    if (!attendee) return res.status(409).json({ error: "This transfer is no longer awaiting an agreement." });
    const acceptedAt = new Date().toISOString();
    const snapshot = drSalAgreementSnapshot();
    const photoConsent = req.body?.mediaReleaseAccepted === true || req.body?.mediaReleaseAccepted === "true";
    await airtable(`${encodeURIComponent(ATTENDEES_TABLE)}/${attendee.id}`, { method: "PATCH", body: JSON.stringify({ fields: {
      "Legal Accepted": `Terms: Yes; Waiver: Yes; Photography Consent: ${photoConsent ? "Yes" : "No"}`,
      "Legal Version": DR_SAL_EVENT.legalVersion, "Accepted At": acceptedAt, "Event Terms Accepted": "Yes", "Waiver Accepted": "Yes",
      "Photography Consent": photoConsent ? "Permitted" : "Declined", "Agreement Text Snapshot": snapshot, "Agreement SHA-256": drSalAgreementHash(snapshot),
      "Acceptance Source": "event-transfer-completion", "Registration Status": "Confirmed - transferred admission", "Check-In Eligibility": "Ready",
    }, typecast: true }) });
    const registration = await findOne(REGISTRATIONS_TABLE, `{Stripe Session ID}='${formulaValue(claims.sessionId)}'`);
    if (registration) await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}/${registration.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Status: "Confirmed", Notes: `${registration.fields?.Notes || ""}\nReplacement attendee accepted agreement ${acceptedAt}.` }, typecast: true }) });
    await sendTransactionalEmail({ key: `event-transfer:${claims.sessionId}:${claims.email}:confirmed`, purpose: "event-transfer-confirmation", from: "ROAMSIX Events <info@roamsix.com>", to: claims.email, subject: "Your October 24 ROAMSIX admission is confirmed", html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><h1>Your admission is confirmed.</h1><p>${escapeHtml(claims.name)}, you are registered for ${escapeHtml(DR_SAL_EVENT.name)}.</p><p><strong>Date:</strong> October 24, 2026<br><strong>Time:</strong> ${escapeHtml(DR_SAL_EVENT.time)}<br><strong>Location:</strong> ${escapeHtml(DR_SAL_EVENT.venue)}<br><strong>Address:</strong> ${escapeHtml(DR_SAL_EVENT.address)}</p><p>Final arrival and parking instructions will follow by email.</p>${drSalAgreementHtml(snapshot)}</body></html>`, stripeSessionId: claims.sessionId });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Transfer agreement completion failed:", error.message);
    return res.status(500).json({ error: "The transfer agreement could not be completed." });
  }
}
