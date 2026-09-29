import { airtable, findOne, formulaValue } from "./airtable-api.js";

const MEMBERSHIP_TABLE = process.env.ROAMSIX_CRM_MEMBERSHIP_TABLE_ID || "Membership Records";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export async function recordMembershipPurchase({ session, email, name, tier, cohortId, cohortLabel, joinedAt }) {
  const sessionId = clean(session?.id);
  if (!sessionId || !email || !cohortId) throw new Error("Membership record requires a Stripe session, email, and cohort ID");
  const existing = await findOne(encodeURIComponent(MEMBERSHIP_TABLE), `{Stripe Session ID}='${formulaValue(sessionId)}'`);
  const fields = {
    Membership: `${clean(email, 320).toLowerCase()} | ${clean(cohortLabel || cohortId, 200)}`,
    "Member Email": clean(email, 320).toLowerCase(),
    "Member Name": clean(name, 200),
    Tier: clean(tier, 50),
    "Cohort ID": clean(cohortId, 100),
    "Cohort Label": clean(cohortLabel, 200),
    "Stripe Session ID": sessionId,
    "Stripe Customer ID": clean(session.customer),
    "Stripe Subscription ID": clean(session.subscription),
    "Event Credit Applied": Number(session.metadata?.eventCreditAmount || 0),
    "Event Credit Source": clean(session.metadata?.eventCreditAmount && Number(session.metadata.eventCreditAmount) > 0 ? "Eligible ROAMSIX event ticket" : "", 200),
    "Event Credit Engagement IDs": clean(session.metadata?.eventCreditEngagementIds, 2000),
    Status: "Paid",
    "Joined At": joinedAt || new Date().toISOString(),
  };
  if (existing) {
    return airtable(`${encodeURIComponent(MEMBERSHIP_TABLE)}/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true }),
    });
  }
  return airtable(encodeURIComponent(MEMBERSHIP_TABLE), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
}

export async function markMembershipRefunded({ subscriptionId, refundedAt = new Date().toISOString() }) {
  const cleanId = clean(subscriptionId);
  if (!cleanId) return { updated: false };
  const existing = await findOne(encodeURIComponent(MEMBERSHIP_TABLE), `{Stripe Subscription ID}='${formulaValue(cleanId)}'`);
  if (!existing) return { updated: false };
  await airtable(`${encodeURIComponent(MEMBERSHIP_TABLE)}/${existing.id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { Status: "Refunded" }, typecast: true }),
  });
  return { updated: true, recordId: existing.id };
}
