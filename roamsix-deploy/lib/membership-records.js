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
