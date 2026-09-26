import { timingSafeEqual } from "node:crypto";
import { getOrCreateMembershipApproval, updateMembershipApprovalSend } from "../lib/membership-approvals.js";
import { sendTransactionalEmail } from "../lib/transactional-email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authorized(req) {
  const expected = process.env.MEMBERSHIP_APPROVAL_SECRET || "";
  const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!expected || !supplied || Buffer.byteLength(expected) !== Buffer.byteLength(supplied)) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized." });
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 320);
  const tier = String(req.body?.tier || "").trim().toLowerCase();
  const approvalId = String(req.body?.approvalId || "").trim().slice(0, 200);
  const approvedBy = String(req.body?.approvedBy || "").trim().slice(0, 200);
  const name = String(req.body?.name || "").trim().slice(0, 200);
  const ttlHours = Number(req.body?.ttlHours || 168);
  if (!EMAIL_RE.test(email) || !["field", "journey"].includes(tier) || !approvalId || !approvedBy) {
    return res.status(400).json({ error: "Approval ID, approved email, Field or Journey tier, and approver are required." });
  }

  try {
    const approval = await getOrCreateMembershipApproval({ approvalId, email, tier, approvedBy, ttlHours });
    const host = req.headers["x-forwarded-host"] || req.headers.host || "www.roamsix.com";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const siteUrl = String(process.env.PUBLIC_SITE_URL || `${proto}://${host}`).replace(/\/$/, "");
    const inviteUrl = `${siteUrl}/membership/checkout/${tier}?invite=${encodeURIComponent(approval["Invitation Token"])}`;
    const displayTier = tier === "field" ? "Field" : "Journey";
    const cohortLabel = approval["Cohort Label"] || approval["Cohort ID"] || "Founding Cohort";
    const firstName = escapeHtml(name.split(" ")[0] || "there");
    const html = `<p>${firstName},</p><p>Your application for ROAMSIX ${displayTier} membership in the ${escapeHtml(cohortLabel)} has been approved.</p><p><a href="${inviteUrl}">Complete your secure ${displayTier} membership checkout</a>.</p><p>This private link is tied to ${escapeHtml(email)} and expires on ${escapeHtml(new Date(approval["Invitation Expires At"]).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "long", timeStyle: "short" }))} Pacific.</p><p>If the link expires before you use it, reply to this email so the approval can be reviewed and reissued.</p><p>ROAMSIX</p>`;
    try {
      const sent = await sendTransactionalEmail({
        key: approval["Email Key"],
        purpose: "membership-approved-invitation",
        to: email,
        subject: `Your ROAMSIX ${displayTier} membership invitation`,
        html,
      });
      await updateMembershipApprovalSend(approval.id, { status: sent.skipped ? "Already sent" : "Sent", resendMessageId: sent.id });
      return res.status(200).json({ success: true, approvalId, tier, email, cohortId: approval["Cohort ID"], cohortLabel, expiresAt: approval["Invitation Expires At"], sendStatus: sent.status });
    } catch (error) {
      await updateMembershipApprovalSend(approval.id, { status: "Failed, queued for retry", error: error.message });
      throw error;
    }
  } catch (error) {
    console.error("Membership invitation send failed:", error.message);
    return res.status(500).json({ error: "The approval was not sent. Its failure state was retained for review and retry." });
  }
}
