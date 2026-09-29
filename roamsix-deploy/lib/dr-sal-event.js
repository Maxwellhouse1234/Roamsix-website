const EVENT_BASE_ID = process.env.ROAMSIX_EVENT_BASE_ID || "app2b2mTCtAIMmo79";
const REGISTRATIONS_TABLE = process.env.ROAMSIX_EVENT_REGISTRATIONS_TABLE_ID || "Event Registrations";

export const DR_SAL_EVENT = Object.freeze({
  id: "dr-sal-gut-brain-2026",
  packageId: "general-admission",
  name: "The gut-brain connection: food, stress, and everyday performance",
  date: "2026-10-24",
  capacity: 25,
  priceCents: 5000,
  priceEnv: "STRIPE_DR_SAL_PRICE_ID",
  locationReleaseDate: "October 7, 2026",
  refundDeadline: "2026-10-10T23:59:59-07:00",
  legalVersion: "2026-09-29-dr-sal-v1",
});

const HOLD_MINUTES = 61;

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
    showCounter: sold >= 15,
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

export async function listConfirmedDrSalRegistrations() {
  const formula = `AND({Event}='${formulaValue(DR_SAL_EVENT.id)}',{Status}='Confirmed')`;
  const query = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
  const data = await airtable(`${encodeURIComponent(REGISTRATIONS_TABLE)}?${query}`);
  return data.records || [];
}
