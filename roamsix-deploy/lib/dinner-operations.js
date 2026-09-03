import { airtable, findOne, formulaValue, listAll } from "./airtable-api.js";

export const DINNER = {
  name: "An Evening in the Olive Groves",
  slug: "olive-grove-dinner",
  date: "2026-09-19",
  capacity: 26,
};

export const TABLES = {
  contacts: "tblV06NCECV5m4lYf",
  events: "tblPsBXIB0TcTyny8",
  engagements: "tblkPKDz9JJ4i3VH4",
  campaigns: "tbloVfCcQYDuHvAB8",
  waitlist: "tblSnfEmKbo04Foxk",
};

function registrationQuantity(record) {
  const details = String(record.fields?.Details || "");
  const match = details.match(/quantity\s+(\d+)/i);
  return Math.max(1, Number(match?.[1] || 1));
}

export async function paidDinnerRegistrations() {
  const formula = `AND({Event Name}='${formulaValue(DINNER.name)}',{Engagement Type}='Registered',{Status}='Confirmed')`;
  const records = await listAll(TABLES.engagements, { filterByFormula: formula });
  const bySession = new Map();
  for (const record of records) {
    const key = record.fields?.["Stripe Session ID"] || record.id;
    if (!bySession.has(key)) bySession.set(key, record);
  }
  return [...bySession.values()];
}

export async function dinnerAvailability() {
  const event = await findOne(TABLES.events, `{Event Slug}='${formulaValue(DINNER.slug)}'`);
  const capacity = Number(event?.fields?.Capacity || DINNER.capacity);
  const registrations = await paidDinnerRegistrations();
  const confirmedSeats = registrations.reduce((sum, record) => sum + registrationQuantity(record), 0);
  return { capacity, confirmedSeats, remainingSeats: Math.max(0, capacity - confirmedSeats), soldOut: confirmedSeats >= capacity };
}

export async function joinDinnerWaitlist({ firstName, lastName, email, mobile, partySize }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const existing = await findOne(TABLES.waitlist, `AND({Event Slug}='${DINNER.slug}',LOWER({Email})='${formulaValue(normalizedEmail)}')`);
  if (existing) {
    if (existing.fields?.Status === "Claimed") return existing;
    return airtable(`${TABLES.waitlist}/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields: { "First Name": firstName, "Last Name": lastName, Mobile: mobile, "Party Size": partySize, Status: "Waiting" }, typecast: true }),
    });
  }
  const current = await listAll(TABLES.waitlist, { filterByFormula: `{Event Slug}='${DINNER.slug}'` });
  const priority = current.reduce((max, record) => Math.max(max, Number(record.fields?.Priority || 0)), 0) + 1;
  return airtable(TABLES.waitlist, {
    method: "POST",
    body: JSON.stringify({ fields: {
      "Waitlist Entry": `${normalizedEmail} | ${DINNER.slug}`,
      "First Name": firstName,
      "Last Name": lastName,
      Email: normalizedEmail,
      Mobile: mobile,
      "Event Slug": DINNER.slug,
      "Party Size": partySize,
      Priority: priority,
      Status: "Waiting",
      "Joined At": new Date().toISOString(),
    }, typecast: true }),
  });
}

export async function claimDinnerWaitlist(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return;
  const record = await findOne(TABLES.waitlist, `AND({Event Slug}='${DINNER.slug}',LOWER({Email})='${formulaValue(normalizedEmail)}',OR({Status}='Waiting',{Status}='Invited'))`);
  if (!record) return;
  return airtable(`${TABLES.waitlist}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Status: "Claimed", "Invitation Notes": "Registration completed and matched by purchaser email." }, typecast: true }) });
}

export function seatsForRegistration(record) {
  return registrationQuantity(record);
}
