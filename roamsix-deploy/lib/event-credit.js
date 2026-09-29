import { airtable, formulaValue, listAll } from "./airtable-api.js";
import { DR_SAL_EVENT } from "./dr-sal-event.js";

const ENGAGEMENTS_TABLE = process.env.ROAMSIX_CRM_ENGAGEMENTS_TABLE_ID || "tblkPKDz9JJ4i3VH4";
const MEMBERSHIP_TABLE = process.env.ROAMSIX_CRM_MEMBERSHIP_TABLE_ID || "Membership Records";
const LIFETIME_CAP = 100;

function number(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function eligibleEventCredit(email, now = new Date()) {
  const startsAt = process.env.DR_SAL_EVENT_CREDIT_START;
  const endsAt = process.env.DR_SAL_EVENT_CREDIT_DEADLINE;
  if (!startsAt || !endsAt || now < new Date(startsAt) || now > new Date(endsAt)) {
    return { amount: 0, engagementIds: [], configured: Boolean(startsAt && endsAt) };
  }
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const eventFormula = `AND({Contact Email}='${formulaValue(normalizedEmail)}',{Event Name}='${formulaValue(DR_SAL_EVENT.name)}',{Engagement Type}='Registered',{Status}='Confirmed')`;
  const membershipFormula = `{Member Email}='${formulaValue(normalizedEmail)}'`;
  const [registrations, memberships] = await Promise.all([
    listAll(ENGAGEMENTS_TABLE, { filterByFormula: eventFormula }),
    listAll(encodeURIComponent(MEMBERSHIP_TABLE), { filterByFormula: membershipFormula }),
  ]);
  const previouslyApplied = memberships.reduce((sum, record) => sum + number(record.fields?.["Event Credit Applied"]), 0);
  const remainingCap = Math.max(0, LIFETIME_CAP - previouslyApplied);
  const available = registrations.reduce((sum, record) => sum + Math.min(50, number(record.fields?.["Amount Paid"])), 0);
  return {
    amount: Math.min(remainingCap, available),
    engagementIds: registrations.map((record) => record.id),
    configured: true,
  };
}

export async function markEventCreditApplied({ engagementIds = [], membershipSessionId = "", amount = 0 }) {
  const applied = number(amount);
  if (!applied || !engagementIds.length) return;
  for (const recordId of engagementIds) {
    const current = await airtable(`${ENGAGEMENTS_TABLE}/${recordId}`);
    const details = String(current.fields?.Details || "");
    if (details.includes(`membership session ${membershipSessionId}`)) continue;
    await airtable(`${ENGAGEMENTS_TABLE}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: {
          Details: `${details}${details ? "\n" : ""}Event credit applied: $${applied.toFixed(2)} to membership session ${membershipSessionId}.`,
        },
      }),
    });
  }
}
