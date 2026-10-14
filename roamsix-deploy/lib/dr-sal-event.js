import { createHash } from "node:crypto";
import { DR_SAL_GUEST_AGREEMENT } from "../src/data/drSalGuestAgreement.js";

const EVENT_BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";
const ATTENDEES_TABLE = process.env.ROAMSIX_EVENT_ATTENDEES_TABLE_ID || "tbltON9TJyq9GqBW4";

export const DR_SAL_EVENT = Object.freeze({
  id: "dr-sal-gut-brain-2026",
  packageId: "general-admission",
  name: "The gut-brain connection: food, stress, and everyday performance",
  date: "2026-10-24",
  venue: "Prayers for Peace Park / Essene Retreat Center",
  address: "29455 Pamoosa Lane, Valley Center, CA 92082",
  time: "4:00–6:00 PM",
  capacity: 25,
  priceCents: 5000,
  priceEnv: "STRIPE_DR_SAL_PRICE_ID",
  refundDeadline: "2026-10-21T17:00:00-07:00",
  refundPolicy: "Full refunds are available for cancellations requested by October 21, 2026, at 5:00 PM Pacific. After this deadline, tickets are nonrefundable but may be transferred to another adult before the event, provided the replacement attendee completes the required participation agreement. If ROAMSIX cancels the event, purchasers receive a full refund. To request a refund or transfer, guests should contact ROAMSIX using the contact information provided in their confirmation email.",
  privatePromotionCode: "ROAMSIXFRIENDS50",
  privatePromotionEnv: "STRIPE_DR_SAL_PROMOTION_ID",
  legalVersion: "ROAMSIX-OCT24-2026-DRAFT-2026-10-13",
});

const HOLD_MINUTES = 61;

export function drSalAgreementSnapshot() {
  const lines = [
    DR_SAL_GUEST_AGREEMENT.title,
    DR_SAL_GUEST_AGREEMENT.subtitle,
    DR_SAL_GUEST_AGREEMENT.status,
    ...DR_SAL_GUEST_AGREEMENT.metadata.map(([label, value]) => `${label}: ${value}`),
  ];
  for (const section of DR_SAL_GUEST_AGREEMENT.sections) {
    lines.push(section.title, ...section.paragraphs);
    if (section.bullets) lines.push(...section.bullets.map((bullet) => `- ${bullet}`));
  }
  return lines.join("\n\n");
}

export function drSalAgreementHash(snapshot = drSalAgreementSnapshot()) {
  return createHash("sha256").update(snapshot, "utf8").digest("hex");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

export function drSalAgreementHtml(snapshot = drSalAgreementSnapshot()) {
  return `<div style="margin-top:28px;padding:22px;border:1px solid #d8d4ce;background:#faf9f7"><p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8562f">Accepted agreement</p><p style="margin:0 0 14px;font-size:13px;line-height:1.6"><strong>Version:</strong> ${escapeHtml(DR_SAL_EVENT.legalVersion)}<br><strong>SHA-256:</strong> ${escapeHtml(drSalAgreementHash(snapshot))}</p><div style="white-space:pre-wrap;font-size:13px;line-height:1.65;color:#333">${escapeHtml(snapshot)}</div></div>`;
}

export function shouldShowSeatCounter(sold) {
  return Number(sold || 0) >= 15;
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function formulaValue(value) {
  return clean(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function airtable(path, options = {}) {
  if (!process.env.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN is not configured");
  const response = await fetch(`https://api.airtable.com/v0/${EVENT_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Event registration Airtable ${response.status}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

async function listEventRegistrations() {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();
  const formula = `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',OR({Status}='Confirmed',{Status}='Partially Refunded',{Status}='Transfer Pending',AND({Status}='Pending',IS_AFTER({Registered At},'${cutoff}'))))`;
  const records = [];
  let offset = "";
  do {
    const query = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
    if (offset) query.set("offset", offset);
    const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
    records.push(...(data.records || []));
    offset = data.offset || "";
  } while (offset);
  return records;
}

function seatNumber(record) {
  const match = String(record.fields?.Notes || "").match(/Seat allocation:\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

export async function drSalAvailability() {
  const records = await listEventRegistrations();
  const confirmed = records.filter((record) => ["Confirmed", "Partially Refunded", "Transfer Pending"].includes(record.fields?.Status));
  const pending = records.filter((record) => record.fields?.Status === "Pending");
  const sold = confirmed.reduce((sum, record) => sum + Math.max(1, Number(record.fields?.Quantity || 1)), 0);
  const held = pending.reduce((sum, record) => sum + Math.max(1, Number(record.fields?.Quantity || 1)), 0);
  const usedSeats = new Set(records.map(seatNumber).filter((seat) => seat > 0));
  let nextSeat = 0;
  for (let seat = 1; seat <= DR_SAL_EVENT.capacity; seat += 1) {
    if (!usedSeats.has(seat)) {
      nextSeat = seat;
      break;
    }
  }
  const occupied = sold + held;
  if (occupied >= DR_SAL_EVENT.capacity) nextSeat = 0;
  return {
    capacity: DR_SAL_EVENT.capacity,
    sold,
    held,
    remaining: Math.max(0, DR_SAL_EVENT.capacity - occupied),
    nextSeat,
    soldOut: occupied >= DR_SAL_EVENT.capacity,
    showCounter: shouldShowSeatCounter(sold),
  };
}

export async function saveDrSalCheckoutHold({ sessionId, name, email, seat, source }) {
  return airtable(encodeURIComponent(REGISTRATIONS_TABLE), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        Name: clean(name, 200),
        Email: clean(email, 320).toLowerCase(),
        Event: DR_SAL_EVENT.id,
        Package: DR_SAL_EVENT.packageId,
        "Amount Paid": 0,
        Quantity: 1,
        "Stripe Session ID": clean(sessionId, 200),
        Status: "Pending",
        "Registered At": new Date().toISOString(),
        Notes: `Seat allocation: ${seat}\nSource: ${clean(source, 200) || "Website"}`,
      },
      typecast: true,
    }),
  });
}

async function confirmedRegistrationForEmail(email) {
  const normalizedEmail = clean(email, 320).toLowerCase();
  const query = new URLSearchParams({
    filterByFormula: `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',{Email}='${formulaValue(normalizedEmail)}',{Status}='Confirmed')`,
    maxRecords: "1",
  });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  return data.records?.[0] || null;
}

export async function memberDrSalRegistrationStatus(email) {
  const registration = await confirmedRegistrationForEmail(email);
  return { registered: Boolean(registration), recordId: registration?.id || null };
}

async function ensureMemberAttendee({ sessionId, name, email, phone, source, acceptedAt, legalVersion, photoConsent = false }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const found = await airtable(`${encodeURIComponent(ATTENDEES_TABLE)}?${query}`);
  if (found.records?.[0]) return found.records[0];
  const agreementSnapshot = drSalAgreementSnapshot();
  return airtable(encodeURIComponent(ATTENDEES_TABLE), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        "Full Name": clean(name, 200) || "Not provided",
        Email: clean(email, 320).toLowerCase(),
        Phone: clean(phone, 50),
        "Event Name": DR_SAL_EVENT.name,
        "Event Date": "October 24, 2026",
        Package: "Member included seat",
        "Amount Paid": 0,
        "Stripe Session ID": sessionId,
        "Payment Status": "Included with active membership",
        "Legal Accepted": `Terms: Yes; Waiver: Yes; Photography Consent: ${photoConsent ? "Yes" : "No"}`,
        "Legal Version": clean(legalVersion, 100),
        "Accepted At": clean(acceptedAt, 100),
        "Event Terms Accepted": "Yes",
        "Waiver Accepted": "Yes",
        "Photography Consent": photoConsent ? "Permitted" : "Declined",
        "Agreement Text Snapshot": agreementSnapshot,
        "Agreement SHA-256": drSalAgreementHash(agreementSnapshot),
        "Acceptance Source": "member-event-registration",
        "Registration Source": clean(source, 200) || "Member Portal",
        "Registration Status": "Member included - confirmed",
        "Check-In Eligibility": "Ready",
        "Intake Completed": "No",
        "How Did You Hear About ROAMSIX": clean(source, 200) || "Member Portal",
      },
      typecast: true,
    }),
  });
}

export async function registerMemberForDrSal({ name, email, phone, tier, source, acceptedAt, legalVersion, photoConsent = false }) {
  const normalizedEmail = clean(email, 320).toLowerCase();
  const existing = await confirmedRegistrationForEmail(normalizedEmail);
  if (existing) {
    const sessionId = existing.fields?.["Stripe Session ID"] || "";
    await ensureMemberAttendee({ sessionId, name, email: normalizedEmail, phone, source, acceptedAt, legalVersion, photoConsent });
    return { created: false, record: existing, sessionId };
  }

  const availability = await drSalAvailability();
  if (availability.soldOut || !availability.nextSeat) {
    const error = new Error("This event is sold out.");
    error.code = "SOLD_OUT";
    throw error;
  }

  const memberReference = createHash("sha256").update(`${DR_SAL_EVENT.id}:${normalizedEmail}`).digest("hex").slice(0, 24);
  const sessionId = `member_${memberReference}`;
  const legalSummary = `Terms: Yes; Waiver: Yes; Photography Consent: ${photoConsent ? "Yes" : "No"}; Version: ${clean(legalVersion, 100)}; Accepted: ${clean(acceptedAt, 100)}`;
  const record = await airtable(encodeURIComponent(REGISTRATIONS_TABLE), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        Name: clean(name, 200) || "Not provided",
        Email: normalizedEmail,
        Event: DR_SAL_EVENT.id,
        Package: "member-included-seat",
        "Amount Paid": 0,
        Quantity: 1,
        "Stripe Session ID": sessionId,
        Status: "Confirmed",
        "Registered At": new Date().toISOString(),
        Notes: `Seat allocation: ${availability.nextSeat}\nIncluded with ${clean(tier, 50)} membership\nSource: ${clean(source, 200) || "Member Portal"}\n${legalSummary}`,
      },
      typecast: true,
    }),
  });

  await ensureMemberAttendee({ sessionId, name, email: normalizedEmail, phone, source, acceptedAt, legalVersion, photoConsent });

  return { created: true, record, sessionId, seat: availability.nextSeat };
}

export async function confirmDrSalRegistration({ sessionId, name, email, amountPaid, grossAmount, discountAmount = 0, promotionCode = "", stripePromotionId = "", registeredAt, source }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  const existing = data.records?.[0];
  const netCollected = Math.max(0, Number(amountPaid || 0));
  const gross = Math.max(netCollected, Number(grossAmount || 0));
  const discount = Math.max(0, Number(discountAmount || 0));
  const fields = {
    Name: clean(name, 200) || "Not provided",
    Email: clean(email, 320).toLowerCase(),
    Event: DR_SAL_EVENT.id,
    Package: DR_SAL_EVENT.packageId,
    "Amount Paid": netCollected,
    "Gross Amount": gross,
    "Discount Amount": discount,
    "Refund Amount": 0,
    "Net Collected": netCollected,
    "Promotion Code": clean(promotionCode, 100),
    "Stripe Promotion ID": clean(stripePromotionId, 200),
    "Property Share": Number((netCollected * 0.2).toFixed(2)),
    Quantity: 1,
    "Stripe Session ID": clean(sessionId, 200),
    Status: "Confirmed",
    "Registered At": registeredAt || new Date().toISOString(),
    Notes: `${existing?.fields?.Notes || ""}${existing?.fields?.Notes ? "\n" : ""}Member credit eligibility: $50 within 48 hours after the event, subject to the $100 lifetime cap.\nSource: ${clean(source, 200) || "Website"}`,
  };
  return airtable(existing ? `${encodeURIComponent(REGISTRATIONS_TABLE)}/${existing.id}` : encodeURIComponent(REGISTRATIONS_TABLE), {
    method: existing ? "PATCH" : "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
}

export async function refundDrSalRegistration({ sessionId, grossAmount = 0, refundedAmount = 0, refundedAt = new Date().toISOString() }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  const existing = data.records?.[0];
  if (!existing) return { updated: false };
  const notes = String(existing.fields?.Notes || "");
  const gross = Math.max(0, Number(existing.fields?.["Gross Amount"] || grossAmount || existing.fields?.["Amount Paid"] || 0));
  const discount = Math.max(0, Number(existing.fields?.["Discount Amount"] || 0));
  const charged = Math.max(0, gross - discount);
  const refunded = Math.max(0, Number(refundedAmount || 0));
  const net = Math.max(0, charged - refunded);
  const fullyRefunded = charged > 0 && refunded >= charged;
  await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}/${existing.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        Status: fullyRefunded ? "Refunded" : "Partially Refunded",
        "Amount Paid": net,
        "Refund Amount": refunded,
        "Net Collected": net,
        "Property Share": Number((net * 0.2).toFixed(2)),
        Notes: `${notes}${notes ? "\n" : ""}Stripe refund: $${refunded.toFixed(2)} of $${charged.toFixed(2)} charged at ${refundedAt}. Net collected: $${net.toFixed(2)}.`,
      },
      typecast: true,
    }),
  });
  return { updated: true, recordId: existing.id, fullyRefunded, grossAmount: gross, discountAmount: discount, refundedAmount: refunded, netCollected: net };
}

export async function listConfirmedDrSalRegistrations() {
  const formula = `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',{Status}='Confirmed')`;
  const query = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  return data.records || [];
}
