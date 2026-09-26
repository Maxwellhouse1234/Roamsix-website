import { randomBytes } from "node:crypto";
import { createSignedToken } from "./member-auth.js";
import { activeMembershipCohort } from "./membership-cohort.js";

const CRM_BASE_ID = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";
const APPROVALS_TABLE = process.env.ROAMSIX_CRM_APPROVALS_TABLE_ID || "Membership Approvals";

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function formulaValue(value) {
  return clean(value, 500).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function airtable(path, options = {}) {
  if (!process.env.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN is not configured for membership approvals");
  const response = await fetch(`https://api.airtable.com/v0/${CRM_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Membership approval Airtable ${response.status}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

async function findApproval(approvalId) {
  const query = new URLSearchParams({ filterByFormula: `{Approval ID}='${formulaValue(approvalId)}'`, maxRecords: "1" });
  const data = await airtable(`${encodeURIComponent(APPROVALS_TABLE)}?${query}`);
  return data.records?.[0] || null;
}

export async function getOrCreateMembershipApproval({ approvalId, email, tier, approvedBy, ttlHours = 168 }) {
  if (!process.env.MEMBERSHIP_INVITE_SECRET) throw new Error("MEMBERSHIP_INVITE_SECRET is not configured");
  const normalizedEmail = clean(email, 320).toLowerCase();
  const normalizedTier = clean(tier, 20).toLowerCase();
  const normalizedApprovalId = clean(approvalId, 200);
  const approver = clean(approvedBy, 200);
  const cohort = activeMembershipCohort();
  if (!normalizedApprovalId || !normalizedEmail || !["field", "journey"].includes(normalizedTier) || !approver) {
    throw new Error("Approval ID, approved email, Field or Journey tier, and approver are required");
  }

  const existing = await findApproval(normalizedApprovalId);
  if (existing) {
    const fields = existing.fields || {};
    if (String(fields.Email || "").toLowerCase() !== normalizedEmail || String(fields.Tier || "").toLowerCase() !== normalizedTier) {
      throw new Error("Approval ID is already assigned to a different email or tier");
    }
    if (String(fields["Cohort ID"] || "founding") !== cohort.id) {
      throw new Error("Approval ID belongs to a different membership cohort; create a new approval ID after human review");
    }
    if (!fields["Invitation Token"] || new Date(fields["Invitation Expires At"]).getTime() <= Date.now()) {
      throw new Error("This approval invitation has expired; create a new approval ID after human review");
    }
    return { id: existing.id, ...fields, created: false };
  }

  const approvedAt = new Date().toISOString();
  const safeHours = Math.min(30 * 24, Math.max(1, Number(ttlHours) || 168));
  const expiresAt = new Date(Date.now() + safeHours * 60 * 60 * 1000).toISOString();
  const token = createSignedToken({
    email: normalizedEmail,
    tier: normalizedTier,
    purpose: "membership-invite",
    approvalId: normalizedApprovalId,
    cohortId: cohort.id,
    cohortLabel: cohort.label,
    nonce: randomBytes(12).toString("base64url"),
  }, process.env.MEMBERSHIP_INVITE_SECRET, Math.round(safeHours * 60 * 60));
  const fields = {
    "Approval ID": normalizedApprovalId,
    Email: normalizedEmail,
    Tier: normalizedTier === "field" ? "Field" : "Journey",
    "Cohort ID": cohort.id,
    "Cohort Label": cohort.label,
    "Approved By": approver,
    "Approved At": approvedAt,
    "Invitation Expires At": expiresAt,
    "Invitation Token": token,
    "Send Status": "Approved, not sent",
    "Email Key": `membership-invitation:${normalizedApprovalId}:${normalizedEmail}`,
    "Last Error": "",
  };
  const saved = await airtable(encodeURIComponent(APPROVALS_TABLE), { method: "POST", body: JSON.stringify({ fields, typecast: true }) });
  return { id: saved.id, ...saved.fields, created: true };
}

export async function updateMembershipApprovalSend(recordId, { status, resendMessageId = "", error = "" }) {
  return airtable(`${encodeURIComponent(APPROVALS_TABLE)}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        "Send Status": clean(status, 100),
        "Resend Message ID": clean(resendMessageId, 200),
        "Last Error": clean(error, 5000),
        "Last Send Attempt At": new Date().toISOString(),
      },
      typecast: true,
    }),
  });
}
