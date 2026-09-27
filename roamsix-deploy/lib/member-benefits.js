import { listAll } from "./airtable-api.js";

const BENEFITS_TABLE_ID = process.env.ROAMSIX_CRM_MEMBER_BENEFITS_TABLE_ID || "";
const ALLOWED_TIERS = new Set(["Core", "Field", "Journey", "Private"]);

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function safeUrl(value) {
  const input = clean(value, 1000);
  if (!input) return "";
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function dateValue(value) {
  const input = clean(value, 100);
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function tiersFrom(value) {
  const values = Array.isArray(value) ? value : clean(value).split(",");
  return values.map((item) => clean(item, 50)).filter((item) => ALLOWED_TIERS.has(item));
}

function isChecked(value) {
  return value === true || value === 1 || String(value).toLowerCase() === "true";
}

export function visibleBenefitFromRecord(record, { audience = "member", tier = null, now = new Date() } = {}) {
  const fields = record?.fields || {};
  if (clean(fields.Status, 50) !== "Confirmed") return null;
  if (audience === "public" && !isChecked(fields["Publicly Listed"])) return null;
  if (audience === "member" && !isChecked(fields["Member Visible"])) return null;

  const eligibleTiers = tiersFrom(fields["Eligible Tiers"]);
  if (!eligibleTiers.length || (tier && !eligibleTiers.includes(tier))) return null;

  const startsAt = dateValue(fields["Starts At"]);
  const expiresAt = dateValue(fields["Expires At"]);
  if (startsAt && startsAt > now) return null;
  if (expiresAt && expiresAt < now) return null;

  const title = clean(fields.Benefit, 200);
  const exactOffer = clean(fields["Exact Offer"], 500);
  const approvedWebsiteLanguage = clean(fields["Approved Website Language"], 1000);
  if (!title || !exactOffer) return null;
  if (audience === "public" && !approvedWebsiteLanguage) return null;

  const shared = {
    id: record.id,
    title,
    partner: clean(fields.Partner, 200),
    category: clean(fields.Category, 100),
    exactOffer,
    summary: audience === "public" ? approvedWebsiteLanguage : clean(fields["Public Summary"], 1000) || approvedWebsiteLanguage,
    retailValue: Number(fields["Retail Value"]) || null,
    retailValueLabel: clean(fields["Retail Value Label"], 100),
    eligibleTiers,
    logoUrl: safeUrl(fields["Partner Logo URL"]),
    benefitUrl: safeUrl(fields["Benefit URL"]),
    startsAt: startsAt?.toISOString() || null,
    expiresAt: expiresAt?.toISOString() || null,
    disclaimer: clean(fields["Third Party Disclaimer"], 1500),
    sortOrder: Number(fields["Sort Order"]) || 999,
  };

  if (audience === "public") return shared;
  return {
    ...shared,
    redemptionsPerMember: Number(fields["Redemptions Per Member"]) || null,
    redemptionMethod: clean(fields["Redemption Method"], 100),
    redemptionUrl: safeUrl(fields["Redemption URL"]),
    redemptionInstructions: clean(fields["Redemption Instructions"], 2000),
    bookingRules: clean(fields["Booking Rules"], 2000),
    blackoutRules: clean(fields["Blackout Rules"], 2000),
  };
}

export async function memberBenefitsForTier(tier, { audience = "member", now = new Date() } = {}) {
  if (!BENEFITS_TABLE_ID || !process.env.AIRTABLE_TOKEN) return [];
  const records = await listAll(BENEFITS_TABLE_ID);
  return records
    .map((record) => visibleBenefitFromRecord(record, { audience, tier, now }))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function publicMemberBenefits() {
  return memberBenefitsForTier(null, { audience: "public" });
}
