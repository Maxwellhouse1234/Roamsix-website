import { airtable, findOne, formulaValue } from "./airtable-api.js";
import { memberBenefitsForTier } from "./member-benefits.js";
import { cohortFromMetadata } from "./membership-cohort.js";

const CONTACTS_TABLE_ID = process.env.ROAMSIX_CRM_CONTACTS_TABLE_ID || "tblV06NCECV5m4lYf";
const ENGAGEMENTS_TABLE_ID = process.env.ROAMSIX_CRM_ENGAGEMENTS_TABLE_ID || "tblkPKDz9JJ4i3VH4";
const PROFILE_MARKER = "ROAMSIX_MEMBER_PROFILE::";

const TIER_BY_PRICE_ENV = {
  STRIPE_MEMBERSHIP_CORE_PRICE_ID: "Core",
  STRIPE_MEMBERSHIP_CORE_MONTHLY_PRICE_ID: "Core",
  STRIPE_MEMBERSHIP_FIELD_PRICE_ID: "Field",
  STRIPE_MEMBERSHIP_FIELD_MONTHLY_PRICE_ID: "Field",
  STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID: "Journey",
  STRIPE_MEMBERSHIP_JOURNEY_MONTHLY_PRICE_ID: "Journey",
  STRIPE_MEMBERSHIP_PRIVATE_PRICE_ID: "Private",
};

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function profileFromNotes(notes) {
  const line = String(notes || "").split("\n").find((item) => item.startsWith(PROFILE_MARKER));
  if (!line) return {};
  try { return JSON.parse(Buffer.from(line.slice(PROFILE_MARKER.length), "base64url").toString("utf8")); } catch { return {}; }
}

function notesWithProfile(notes, profile) {
  const lines = String(notes || "").split("\n").filter((item) => item && !item.startsWith(PROFILE_MARKER));
  lines.push(`${PROFILE_MARKER}${Buffer.from(JSON.stringify(profile)).toString("base64url")}`);
  return lines.join("\n").slice(0, 4000);
}

async function stripe(path) {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!response.ok) throw new Error(`Stripe member lookup failed (${response.status})`);
  return response.json();
}

export async function membershipForEmail(email) {
  const customerData = await stripe(`customers?email=${encodeURIComponent(email)}&limit=10`);
  if (!customerData) return { eligible: false, status: "unavailable", tier: null };
  const priceTier = new Map(Object.entries(TIER_BY_PRICE_ENV).map(([env, tier]) => [process.env[env], tier]).filter(([id]) => id));
  let fallback = null;
  for (const customer of customerData.data || []) {
    const subscriptions = await stripe(`subscriptions?customer=${encodeURIComponent(customer.id)}&status=all&limit=100`);
    for (const subscription of subscriptions?.data || []) {
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const tier = subscription.metadata?.membershipTier || priceTier.get(priceId);
      if (!tier) continue;
      const cohort = cohortFromMetadata(subscription.metadata);
      const result = {
        eligible: ["active", "trialing", "past_due"].includes(subscription.status),
        status: subscription.status,
        tier,
        cohortId: cohort.id || null,
        cohortLabel: cohort.label || null,
        currentPeriodEnd: subscription.current_period_end || null,
        customerId: customer.id,
      };
      if (result.eligible) return result;
      fallback = result;
    }
  }
  return fallback || { eligible: false, status: "not_found", tier: null };
}

export async function getMemberContact(email) {
  if (!process.env.AIRTABLE_TOKEN) return null;
  return findOne(CONTACTS_TABLE_ID, `{Email}='${formulaValue(email)}'`);
}

export async function memberDashboard(email) {
  const [membership, contact] = await Promise.all([membershipForEmail(email), getMemberContact(email)]);
  let benefits = [];
  if (membership.eligible) {
    try {
      benefits = await memberBenefitsForTier(membership.tier);
    } catch (error) {
      console.error("Member benefits lookup failed:", error.message);
    }
  }
  const fields = contact?.fields || {};
  const stored = profileFromNotes(fields.Notes);
  return {
    membership,
    benefits,
    profile: {
      fullName: fields["Full Name"] || "",
      email,
      mobile: fields.Mobile || "",
      organization: fields.Organization || "",
      topics: fields["Topic Interests"] || [],
      movementPreference: stored.movementPreference || "",
      foodPreference: stored.foodPreference || "",
      accessNeeds: stored.accessNeeds || "",
      communicationPreference: stored.communicationPreference || "email",
    },
  };
}

export async function updateMemberProfile(email, input) {
  const contact = await getMemberContact(email);
  if (!contact) throw new Error("Member CRM record was not found");
  const profile = {
    movementPreference: clean(input.movementPreference, 300),
    foodPreference: clean(input.foodPreference, 300),
    accessNeeds: clean(input.accessNeeds, 500),
    communicationPreference: ["email", "sms"].includes(input.communicationPreference) ? input.communicationPreference : "email",
  };
  const fields = {
    "Full Name": clean(input.fullName, 200) || contact.fields["Full Name"],
    Mobile: clean(input.mobile, 50),
    Organization: clean(input.organization, 200),
    "Topic Interests": Array.isArray(input.topics) ? input.topics.slice(0, 8).map((item) => clean(item, 100)).filter(Boolean) : [],
    Notes: notesWithProfile(contact.fields.Notes, profile),
    "Last Activity": new Date().toISOString(),
  };
  await airtable(`${CONTACTS_TABLE_ID}/${contact.id}`, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) });
  return memberDashboard(email);
}

export async function recordMemberAction(email, { action, eventName, message }) {
  const contact = await getMemberContact(email);
  const allowed = action === "booking" ? "Booking Request" : "Topic Request";
  const now = new Date().toISOString();
  const fields = {
    Engagement: `${email} — ${allowed}`,
    "Contact Email": email,
    "Event Name": clean(eventName || "Member request", 300),
    "Engagement Type": action === "booking" ? "Registered" : "Interested",
    Status: "Requested",
    Topic: "General",
    "Occurred At": now,
    Source: "Member Portal",
    "Legacy Record ID": `member:${action}:${email}:${Date.now()}`,
    Details: clean(message, 3000),
    ...(contact ? { Contact: [contact.id] } : {}),
  };
  await airtable(ENGAGEMENTS_TABLE_ID, { method: "POST", body: JSON.stringify({ fields, typecast: true }) });
}
