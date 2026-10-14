import { DR_SAL_EVENT } from "../lib/dr-sal-event.js";
import { isAuthorizedEventStaff } from "../lib/event-staff-auth.js";

const BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";
const ATTENDEES_TABLE = process.env.ROAMSIX_EVENT_ATTENDEES_TABLE_ID || "tbltON9TJyq9GqBW4";

function formulaValue(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function list(table, formula) {
  const query = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${query}`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Roster Airtable ${response.status}`);
  return data.records || [];
}

function readiness(registration, attendee) {
  const status = String(registration?.fields?.Status || attendee?.fields?.["Registration Status"] || "").toLowerCase();
  if (status.includes("refund") || status.includes("cancel") || status.includes("transferred out")) return "Not eligible";
  if (attendee?.fields?.["Waiver Accepted"] !== "Yes") return "Awaiting agreement";
  return "Ready";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  if (!isAuthorizedEventStaff(req)) return res.status(401).json({ error: "Authorized event staff access is required." });
  if (!process.env.AIRTABLE_TOKEN) return res.status(503).json({ error: "The attendance roster is not configured." });
  try {
    const [registrations, attendees] = await Promise.all([
      list(REGISTRATIONS_TABLE, `{Event}='${formulaValue(DR_SAL_EVENT.id)}'`),
      list(ATTENDEES_TABLE, `{Event Name}='${formulaValue(DR_SAL_EVENT.name)}'`),
    ]);
    const registrationBySession = new Map(registrations.map((record) => [record.fields?.["Stripe Session ID"], record]));
    const rows = attendees.map((attendee) => {
      const fields = attendee.fields || {};
      const registration = registrationBySession.get(fields["Stripe Session ID"]);
      return {
        id: attendee.id,
        name: fields["Full Name"] || "Not provided",
        email: fields.Email || "",
        admission: registration?.fields?.Package || fields.Package || "",
        payment: registration?.fields?.Status || fields["Payment Status"] || "",
        amountPaid: Number(registration?.fields?.["Amount Paid"] ?? fields["Amount Paid"] ?? 0),
        agreement: fields["Waiver Accepted"] === "Yes" ? "Accepted" : "Pending",
        agreementVersion: fields["Legal Version"] || "",
        photography: fields["Photography Consent"] || "Not answered",
        eligibility: readiness(registration, attendee),
        sessionId: fields["Stripe Session ID"] || "",
      };
    });
    const netCollected = registrations.reduce((sum, record) => sum + Number(record.fields?.["Net Collected"] || 0), 0);
    return res.status(200).json({
      event: { id: DR_SAL_EVENT.id, name: DR_SAL_EVENT.name, date: DR_SAL_EVENT.date },
      rows,
      totals: {
        admissions: rows.length,
        ready: rows.filter((row) => row.eligibility === "Ready").length,
        awaitingAgreement: rows.filter((row) => row.eligibility === "Awaiting agreement").length,
        photographyDeclined: rows.filter((row) => row.photography === "Declined").length,
        netCollected: Number(netCollected.toFixed(2)),
        propertyShare: Number((netCollected * 0.2).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Event roster failed:", error.message);
    return res.status(500).json({ error: "The attendance roster could not be loaded." });
  }
}
