import { createHash } from "node:crypto";

const EVENT_BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";
const ATTENDEES_TABLE = process.env.ROAMSIX_EVENT_ATTENDEES_TABLE_ID || "tbltON9TJyq9GqBW4";

export const DR_SAL_EVENT = Object.freeze({
  id: "dr-sal-gut-brain-2026",
  packageId: "general-admission",
  name: "The gut-brain connection: food, stress, and everyday performance",
  date: "2026-10-24",
  venue: "Essene Retreat Center",
  address: "29455 Pamoosa Lane, Valley Center, CA 92082",
  time: "4:00–6:00 PM",
  capacity: 25,
  priceCents: 5000,
  priceEnv: "STRIPE_DR_SAL_PRICE_ID",
  refundDeadline: "2026-10-10T23:59:59-07:00",
  legalVersion: "2026-09-29-dr-sal-v1",
});

const HOLD_MINUTES = 61;

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
  const formula = `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',OR({Status}='Confirmed',AND({Status}='Pending',IS_AFTER({Registered At},'${cutoff}'))))`;
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
  const confirmed = records.filter((record) => record.fields?.Status === "Confirmed");
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

async function ensureMemberAttendee({ sessionId, name, email, phone, source, acceptedAt, legalVersion }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const found = await airtable(`${encodeURIComponent(ATTENDEES_TABLE)}?${query}`);
  if (found.records?.[0]) return found.records[0];
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
        "Legal Accepted": "Terms: Yes; Waiver: Yes; Media Release: Yes",
        "Legal Version": clean(legalVersion, 100),
        "Accepted At": clean(acceptedAt, 100),
        "Intake Completed": "No",
        "How Did You Hear About ROAMSIX": clean(source, 200) || "Member Portal",
      },
      typecast: true,
    }),
  });
}

export async function registerMemberForDrSal({ name, email, phone, tier, source, acceptedAt, legalVersion }) {
  const normalizedEmail = clean(email, 320).toLowerCase();
  const existing = await confirmedRegistrationForEmail(normalizedEmail);
  if (existing) {
    const sessionId = existing.fields?.["Stripe Session ID"] || "";
    await ensureMemberAttendee({ sessionId, name, email: normalizedEmail, phone, source, acceptedAt, legalVersion });
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
  const legalSummary = `Terms: Yes; Waiver: Yes; Media Release: Yes; Version: ${clean(legalVersion, 100)}; Accepted: ${clean(acceptedAt, 100)}`;
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

  await ensureMemberAttendee({ sessionId, name, email: normalizedEmail, phone, source, acceptedAt, legalVersion });

  return { created: true, record, sessionId, seat: availability.nextSeat };
}

export async function confirmDrSalRegistration({ sessionId, name, email, amountPaid, registeredAt, source }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  const existing = data.records?.[0];
  const fields = {
    Name: clean(name, 200) || "Not provided",
    Email: clean(email, 320).toLowerCase(),
    Event: DR_SAL_EVENT.id,
    Package: DR_SAL_EVENT.packageId,
    "Amount Paid": Number(amountPaid || 0),
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

export async function refundDrSalRegistration({ sessionId, refundedAt = new Date().toISOString() }) {
  const query = new URLSearchParams({
    filterByFormula: `{Stripe Session ID}='${formulaValue(sessionId)}'`,
    maxRecords: "1",
  });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  const existing = data.records?.[0];
  if (!existing) return { updated: false };
  const notes = String(existing.fields?.Notes || "");
  await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}/${existing.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        Status: "Refunded",
        "Amount Paid": 0,
        Notes: `${notes}${notes ? "\n" : ""}Refunded through Stripe: ${refundedAt}`,
      },
      typecast: true,
    }),
  });
  return { updated: true, recordId: existing.id };
}

export async function listConfirmedDrSalRegistrations() {
  const formula = `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',{Status}='Confirmed')`;
  const query = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  return data.records || [];
}
