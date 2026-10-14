import { createSignedToken, sameOrigin } from "../lib/member-auth.js";
import { DR_SAL_EVENT } from "../lib/dr-sal-event.js";
import { isAuthorizedEventStaff } from "../lib/event-staff-auth.js";
import { sendTransactionalEmail } from "../lib/transactional-email.js";

const BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";
const ATTENDEES_TABLE = process.env.ROAMSIX_EVENT_ATTENDEES_TABLE_ID || "tbltON9TJyq9GqBW4";

function clean(value, max = 320) { return String(value || "").trim().slice(0, max); }
function formulaValue(value) { return clean(value, 500).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
function escapeHtml(value) { return clean(value, 1000).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }

async function airtable(path, options = {}) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, { ...options, headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Transfer Airtable ${response.status}`);
  return data;
}

async function findOne(table, formula) {
  const query = new URLSearchParams({ filterByFormula: formula, maxRecords: "1" });
  const data = await airtable(`${encodeURIComponent(table)}?${query}`);
  return data.records?.[0] || null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  if (!isAuthorizedEventStaff(req)) return res.status(401).json({ error: "Authorized event staff access is required." });
  if (!process.env.AIRTABLE_TOKEN || !(process.env.EVENT_TRANSFER_SECRET || process.env.MEMBER_AUTH_SECRET)) return res.status(503).json({ error: "Transfer processing is not configured." });
  if (Date.now() >= new Date("2026-10-24T16:00:00-07:00").getTime()) return res.status(409).json({ error: "Online transfer processing has closed." });
  const sessionId = clean(req.body?.sessionId, 200);
  const replacementName = clean(req.body?.replacementName, 200);
  const replacementEmail = clean(req.body?.replacementEmail).toLowerCase();
  if (!sessionId || !replacementName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replacementEmail)) return res.status(400).json({ error: "Session ID, replacement legal name and replacement email are required." });
  try {
    const registration = await findOne(REGISTRATIONS_TABLE, `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',{Stripe Session ID}='${formulaValue(sessionId)}')`);
    if (!registration || !["Confirmed", "Partially Refunded", "Transfer Pending"].includes(registration.fields?.Status)) return res.status(409).json({ error: "This admission is not eligible for transfer." });
    const pendingReplacement = await findOne(ATTENDEES_TABLE, `AND({Stripe Session ID}='${formulaValue(sessionId)}',{Email}='${formulaValue(replacementEmail)}',{Registration Status}='Awaiting agreement')`);
    const original = await findOne(ATTENDEES_TABLE, `AND({Stripe Session ID}='${formulaValue(sessionId)}',{Registration Status}!='Transferred out',{Registration Status}!='Awaiting agreement')`);
    if (pendingReplacement) {
      const secret = process.env.EVENT_TRANSFER_SECRET || process.env.MEMBER_AUTH_SECRET;
      const ttl = Math.max(900, Math.floor((new Date("2026-10-24T16:00:00-07:00").getTime() - Date.now()) / 1000));
      const token = createSignedToken({ purpose: "event-transfer", eventId: DR_SAL_EVENT.id, sessionId, email: replacementEmail, name: replacementName }, secret, ttl);
      const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"] || req.headers.host}`;
      const url = `${origin}/events/${DR_SAL_EVENT.id}/transfer?token=${encodeURIComponent(token)}`;
      await sendTransactionalEmail({ key: `event-transfer:${sessionId}:${replacementEmail}`, purpose: "event-transfer-agreement", from: "ROAMSIX Events <info@roamsix.com>", to: replacementEmail, subject: "Complete your agreement for the October 24 ROAMSIX event", html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><h1>Complete your October 24 agreement.</h1><p>${escapeHtml(replacementName)}, an admission has been transferred to you for ${escapeHtml(DR_SAL_EVENT.name)}.</p><p>You must review and accept the event-specific agreement before admission. Photography consent remains optional.</p><p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:14px 20px;text-decoration:none">Review and accept my agreement</a></p><p>This link is intended only for you.</p></body></html>`, stripeSessionId: sessionId });
      return res.status(200).json({ success: true, status: "Awaiting agreement" });
    }
    if (!original) return res.status(404).json({ error: "The current attendee record was not found." });
    const transferredAt = new Date().toISOString();
    await airtable(`${encodeURIComponent(ATTENDEES_TABLE)}/${original.id}`, { method: "PATCH", body: JSON.stringify({ fields: { "Registration Status": "Transferred out", "Check-In Eligibility": "Not eligible", "Payment Status": "Transferred out", "Transferred At": transferredAt }, typecast: true }) });
    await airtable(encodeURIComponent(ATTENDEES_TABLE), { method: "POST", body: JSON.stringify({ fields: {
      "Full Name": replacementName, Email: replacementEmail, "Event Name": DR_SAL_EVENT.name, "Event Date": "October 24, 2026", Package: "Transferred admission", "Amount Paid": 0,
      "Stripe Session ID": sessionId, "Payment Status": "Transferred admission", "Legal Accepted": "Pending replacement attendee agreement", "Legal Version": DR_SAL_EVENT.legalVersion,
      "Event Terms Accepted": "No", "Waiver Accepted": "No", "Photography Consent": "Not answered", "Acceptance Source": "staff-assisted-transfer",
      "Registration Source": "Admission transfer", "Registration Status": "Awaiting agreement", "Check-In Eligibility": "Awaiting agreement",
      "Transferred From": original.fields?.Email || original.fields?.["Full Name"] || "Prior attendee", "Transferred At": transferredAt,
    }, typecast: true }) });
    await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}/${registration.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Name: replacementName, Email: replacementEmail, Status: "Transfer Pending", Notes: `${registration.fields?.Notes || ""}\nTransfer initiated ${transferredAt}; replacement agreement required.` }, typecast: true }) });
    const secret = process.env.EVENT_TRANSFER_SECRET || process.env.MEMBER_AUTH_SECRET;
    const ttl = Math.max(900, Math.floor((new Date("2026-10-24T16:00:00-07:00").getTime() - Date.now()) / 1000));
    const token = createSignedToken({ purpose: "event-transfer", eventId: DR_SAL_EVENT.id, sessionId, email: replacementEmail, name: replacementName }, secret, ttl);
    const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const url = `${origin}/events/${DR_SAL_EVENT.id}/transfer?token=${encodeURIComponent(token)}`;
    await sendTransactionalEmail({ key: `event-transfer:${sessionId}:${replacementEmail}`, purpose: "event-transfer-agreement", from: "ROAMSIX Events <info@roamsix.com>", to: replacementEmail, subject: "Complete your agreement for the October 24 ROAMSIX event", html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><h1>Complete your October 24 agreement.</h1><p>${escapeHtml(replacementName)}, an admission has been transferred to you for ${escapeHtml(DR_SAL_EVENT.name)}.</p><p>You must review and accept the event-specific agreement before admission. Photography consent remains optional.</p><p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:14px 20px;text-decoration:none">Review and accept my agreement</a></p><p>This link is intended only for you.</p></body></html>`, stripeSessionId: sessionId });
    return res.status(200).json({ success: true, status: "Awaiting agreement" });
  } catch (error) {
    console.error("Event transfer failed:", error.message);
    return res.status(500).json({ error: "The transfer could not be completed." });
  }
}
