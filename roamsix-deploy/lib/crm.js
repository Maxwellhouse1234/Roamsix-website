import { randomBytes } from "node:crypto";

const CRM_BASE_ID = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";
const CONTACTS_TABLE_ID = process.env.ROAMSIX_CRM_CONTACTS_TABLE_ID || "tblV06NCECV5m4lYf";
const EVENTS_TABLE_ID = process.env.ROAMSIX_CRM_EVENTS_TABLE_ID || "tblPsBXIB0TcTyny8";
const ENGAGEMENTS_TABLE_ID = process.env.ROAMSIX_CRM_ENGAGEMENTS_TABLE_ID || "tblkPKDz9JJ4i3VH4";

const RESEND_SEGMENTS = [
  "Past Dinner Guests",
  "Microbiome Interest",
  "Sleep Interest",
  "Stress & Resilience Interest",
  "Strength & Longevity Interest",
  "Collaborators",
  "Speakers",
  "Proving Grounds",
  "All Opted-In Contacts",
];

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function formulaValue(value) {
  return clean(value, 500).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function permissionAfter(existing, incoming) {
  if (incoming === "Opted In") return "Opted In";
  if (existing === "Unsubscribed") return "Unsubscribed";
  if (existing === "Opted In") return "Opted In";
  if (incoming === "Unsubscribed") return "Unsubscribed";
  return incoming || existing || "Unknown";
}

async function airtable(path, options = {}) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error("AIRTABLE_TOKEN is not configured");
  const response = await fetch(`https://api.airtable.com/v0/${CRM_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CRM Airtable ${response.status}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

async function findOne(tableId, formula) {
  const query = new URLSearchParams({ filterByFormula: formula, maxRecords: "1" });
  const data = await airtable(`${tableId}?${query}`);
  return data.records?.[0] || null;
}

function resendSegmentNames({ relationships, topics, permission }) {
  const names = [];
  if (relationships.includes("Dinner Guest")) names.push("Past Dinner Guests");
  if (relationships.includes("Collaborator")) names.push("Collaborators");
  if (relationships.includes("Speaker")) names.push("Speakers");
  if (relationships.includes("Proving Grounds") || topics.includes("Proving Grounds")) names.push("Proving Grounds");
  if (topics.includes("Microbiome & Gut Health")) names.push("Microbiome Interest");
  if (topics.includes("Sleep & Recovery")) names.push("Sleep Interest");
  if (topics.includes("Stress & Resilience")) names.push("Stress & Resilience Interest");
  if (topics.includes("Strength & Longevity")) names.push("Strength & Longevity Interest");
  if (permission === "Opted In") names.push("All Opted-In Contacts");
  return unique(names);
}

async function resend(path, options = {}) {
  if (!process.env.RESEND_API_KEY) return null;
  const response = await fetch(`https://api.resend.com/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Resend ${response.status}: ${body.slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

async function syncResendContact({ email, firstName, lastName, relationships, topics, permission }) {
  if (!process.env.RESEND_API_KEY) return;
  const unsubscribed = permission !== "Opted In";
  try {
    await resend("contacts", {
      method: "POST",
      body: JSON.stringify({
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        unsubscribed,
      }),
    });
  } catch (error) {
    if (error.status !== 409) throw error;
    await resend(`contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed }),
    });
  }

  const wanted = resendSegmentNames({ relationships, topics, permission });
  if (!wanted.length) return;
  const listed = await resend("segments");
  const byName = new Map((listed?.data || []).map((segment) => [segment.name, segment.id]));
  for (const name of wanted) {
    if (!RESEND_SEGMENTS.includes(name)) continue;
    let id = byName.get(name);
    if (!id) {
      const created = await resend("segments", { method: "POST", body: JSON.stringify({ name }) });
      id = created?.id;
      if (id) byName.set(name, id);
    }
    if (id) {
      try {
        await resend(`contacts/${encodeURIComponent(email)}/segments/${id}`, { method: "POST" });
      } catch (error) {
        if (error.status !== 409) throw error;
      }
    }
  }
}

export async function upsertCrmContact(input) {
  const email = clean(input.email, 320).toLowerCase();
  if (!email) return null;
  const existing = await findOne(CONTACTS_TABLE_ID, `{Email}='${formulaValue(email)}'`);
  const old = existing?.fields || {};
  const relationships = unique([...(old["Relationship Types"] || []), ...(input.relationships || [])]);
  const topics = unique([...(old["Topic Interests"] || []), ...(input.topics || [])]);
  const sources = unique([...(old.Source || []), ...(input.sources || ["Website"])]);
  const permission = permissionAfter(old["Email Permission"], input.emailPermission);
  const now = input.occurredAt || new Date().toISOString();
  const fullName = clean(input.fullName || [input.firstName, input.lastName].filter(Boolean).join(" "), 200);
  const preferenceToken = old["Email Preference Token"] || randomBytes(24).toString("base64url");
  const marketingBasis = permission === "Opted In"
    ? "Express Opt-In"
    : permission === "Unsubscribed"
      ? "No Marketing"
      : old["Marketing Basis"] || "Unknown";
  const fields = {
    "Full Name": fullName || old["Full Name"] || email,
    "First Name": clean(input.firstName, 100) || old["First Name"] || "",
    "Last Name": clean(input.lastName, 100) || old["Last Name"] || "",
    Email: email,
    Mobile: clean(input.mobile, 50) || old.Mobile || "",
    Organization: clean(input.organization, 200) || old.Organization || "",
    "Role or Title": clean(input.role, 200) || old["Role or Title"] || "",
    "Lifecycle Stage": input.lifecycleStage || old["Lifecycle Stage"] || "Interested",
    "Relationship Types": relationships,
    "Topic Interests": topics,
    "Email Permission": permission,
    "Marketing Basis": marketingBasis,
    "Consent Updated At": input.consentUpdatedAt || old["Consent Updated At"] || now,
    "Consent Source": clean(input.consentSource, 500) || old["Consent Source"] || clean(input.sources?.[0], 500) || "Website",
    "Email Preference Token": preferenceToken,
    "SMS Permission": input.smsPermission || old["SMS Permission"] || "Unknown",
    Source: sources,
    "First Seen": old["First Seen"] || now,
    "Last Activity": now,
    Notes: unique([old.Notes, clean(input.notes, 4000)]).join("\n"),
  };
  const saved = existing
    ? await airtable(`${CONTACTS_TABLE_ID}/${existing.id}`, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) })
    : await airtable(CONTACTS_TABLE_ID, { method: "POST", body: JSON.stringify({ fields, typecast: true }) });

  try {
    await syncResendContact({
      email,
      firstName: fields["First Name"],
      lastName: fields["Last Name"],
      relationships,
      topics,
      permission,
    });
  } catch (error) {
    console.error("CRM Resend contact sync failed:", error.message);
  }
  return { id: saved.id, fields };
}

export async function createCrmEngagement(input) {
  const email = clean(input.email, 320).toLowerCase();
  if (!email) return null;
  const uniqueKey = clean(input.uniqueKey, 500);
  if (uniqueKey) {
    const existing = await findOne(ENGAGEMENTS_TABLE_ID, `{Legacy Record ID}='${formulaValue(uniqueKey)}'`);
    if (existing) return { record: existing, created: false };
  }
  const contact = await findOne(CONTACTS_TABLE_ID, `{Email}='${formulaValue(email)}'`);
  const eventName = clean(input.eventName, 300);
  const event = eventName ? await findOne(EVENTS_TABLE_ID, `{Event Name}='${formulaValue(eventName)}'`) : null;
  const fields = {
    Engagement: clean(input.label || `${email} — ${eventName || input.engagementType}`, 500),
    "Contact Email": email,
    "Event Name": eventName,
    "Engagement Type": input.engagementType || "Interested",
    Status: input.status || "Active",
    Topic: input.topic || "General",
    "Occurred At": input.occurredAt || new Date().toISOString(),
    Source: input.source || "Website",
    "Amount Paid": Number(input.amountPaid || 0),
    "Stripe Session ID": clean(input.stripeSessionId, 500),
    "Discount Code": clean(input.discountCode, 100),
    "Discount Type": input.discountType || "None",
    "Stripe Promotion ID": clean(input.stripePromotionId, 200),
    "Referrer Code": clean(input.referrerCode, 100),
    "Discount Amount": Number(input.discountAmount || 0),
    "Legacy Record ID": uniqueKey,
    Details: clean(input.details, 5000),
    ...(contact ? { Contact: [contact.id] } : {}),
    ...(event ? { Event: [event.id] } : {}),
    ...(input.referrerContactId ? { "Referrer Contact": [input.referrerContactId] } : {}),
  };
  const saved = await airtable(ENGAGEMENTS_TABLE_ID, { method: "POST", body: JSON.stringify({ fields, typecast: true }) });
  return { record: saved, created: true };
}

export async function recordReferralConversion({ referrerContactId, amountPaid }) {
  const recordId = clean(referrerContactId, 100);
  if (!recordId) return;
  const contact = await airtable(`${CONTACTS_TABLE_ID}/${recordId}`);
  const currentConversions = Number(contact.fields?.["Referral Conversions"] || 0);
  const currentRevenue = Number(contact.fields?.["Referral Revenue"] || 0);
  return airtable(`${CONTACTS_TABLE_ID}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        "Referral Conversions": currentConversions + 1,
        "Referral Revenue": Number((currentRevenue + Number(amountPaid || 0)).toFixed(2)),
      },
      typecast: true,
    }),
  });
}

export async function captureCrmActivity({ contact, engagement }) {
  if (!process.env.AIRTABLE_TOKEN) return;
  try {
    const savedContact = await upsertCrmContact(contact);
    const savedEngagement = await createCrmEngagement({ ...engagement, email: contact.email });
    return { contact: savedContact, engagement: savedEngagement };
  } catch (error) {
    console.error("CRM capture failed:", error.message);
    return null;
  }
}
