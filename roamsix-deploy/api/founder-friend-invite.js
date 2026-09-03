import { captureCrmActivity } from "../lib/crm.js";
import { getFounderReferral } from "../lib/founder-referrals.js";

const EVENT_NAME = "An Evening in the Olive Groves";
const EVENT_DATE = "September 19, 2026";
const BUSINESS_ADDRESS = "251 Little Falls Drive, Wilmington, DE 19808";

function clean(value, max = 320) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value, 500)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function firstName(fullName) {
  const value = clean(fullName, 200);
  if (value.includes(" and ")) return value;
  return value.split(/\s+/)[0] || "a friend";
}

function invitationHtml({ friendName, referrerName, code, preferenceToken, origin }) {
  const safeFriend = escapeHtml(friendName);
  const safeReferrer = escapeHtml(firstName(referrerName));
  const purchaseUrl = `${origin}/dinner?code=${encodeURIComponent(code)}#tickets`;
  const preferencesUrl = `${origin}/email-preferences?token=${encodeURIComponent(preferenceToken)}`;
  return `<!doctype html><html><body style="margin:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;color:#FAFAF9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#18181A;border:1px solid rgba(250,250,249,.12);">
      <tr><td style="padding:34px 40px;border-bottom:2px solid #B8562F;"><div style="font-size:22px;font-weight:700;letter-spacing:5px;">ROAMSIX</div><div style="margin-top:6px;color:#B8562F;font-size:11px;letter-spacing:3px;text-transform:uppercase;">A personal invitation</div></td></tr>
      <tr><td style="padding:42px 40px 10px;"><p style="font-size:18px;margin:0 0 24px;">${safeFriend},</p><h1 style="font-family:Georgia,serif;font-size:34px;font-weight:400;line-height:1.2;margin:0 0 24px;">${safeReferrer} thought you might need a moment to experience life the ROAMSIX way.</h1><p style="color:#E5E3E0;font-size:16px;line-height:1.8;margin:0 0 20px;">They’re extending a personal invitation to join us for an evening in the olive groves, beginning in the garden and ending around one shared table at Father’s Farmhouse.</p></td></tr>
      <tr><td style="padding:12px 40px 32px;"><div style="border-left:3px solid #B8562F;padding:8px 0 8px 20px;color:#E5E3E0;font-size:15px;line-height:1.8;"><strong style="color:#FAFAF9;">${EVENT_NAME}</strong><br>${EVENT_DATE}<br>Father’s Farmhouse · Winchester, California<br><span style="color:#B8562F;">Your private Founder-Friend invitation includes 10% off one seat.</span></div></td></tr>
      <tr><td align="center" style="padding:4px 40px 42px;"><a href="${purchaseUrl}" style="display:inline-block;background:#B8562F;color:#FAFAF9;text-decoration:none;padding:16px 30px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Accept the invitation</a><p style="font-size:12px;color:#9A9A96;margin:14px 0 0;">Your code: ${escapeHtml(code)}</p></td></tr>
      <tr><td style="padding:30px 40px;border-top:1px solid rgba(250,250,249,.12);color:#9A9A96;font-size:11px;line-height:1.7;"><p style="margin:0 0 12px;">This personal promotional invitation was sent by ROAMSIX at ${safeReferrer}’s request. We may send one reminder about this invitation. You have not been added to ongoing marketing.</p><p style="margin:0 0 12px;"><a href="${preferencesUrl}" style="color:#B8562F;">Manage email preferences</a></p><p style="margin:0;">ROAMSIX · ${BUSINESS_ADDRESS}</p></td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  const code = clean(req.method === "GET" ? req.query?.code : req.body?.code, 80).toUpperCase();
  const referral = getFounderReferral(code);
  if (!referral) return res.status(404).json({ error: "This Founder-Friend invitation is not available." });

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ referrerName: firstName(referral.referrerName), code });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const friendFirstName = clean(req.body?.friendFirstName, 100);
  const friendEmail = clean(req.body?.friendEmail, 320).toLowerCase();
  const confirmed = req.body?.confirmed === true;
  const website = clean(req.body?.website, 200);
  if (website) return res.status(200).json({ success: true });
  if (!friendFirstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
    return res.status(400).json({ error: "Please provide your friend’s first name and a valid email." });
  }
  if (!confirmed) return res.status(400).json({ error: "Please confirm that this person knows you." });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: "Invitations are temporarily unavailable." });

  const origin = "https://www.roamsix.com";
  const occurredAt = new Date().toISOString();
  try {
    const crm = await captureCrmActivity({
      contact: {
        email: friendEmail,
        firstName: friendFirstName,
        lifecycleStage: "Interested",
        emailPermission: "Unknown",
        consentSource: `One-time Founder-Friend invitation requested by ${referral.referrerName}`,
        sources: ["Referral"],
        notes: `One-time dinner invitation requested by ${referral.referrerName}. Not opted into marketing.`,
        occurredAt,
      },
      engagement: {
        email: friendEmail,
        label: `${friendEmail} | Founder-Friend invitation from ${referral.referrerName}`,
        eventName: EVENT_NAME,
        engagementType: "Referred",
        status: "Invited",
        topic: "Dinner",
        source: "Founder-Friend invitation",
        referrerCode: code,
        referrerContactId: referral.referrerContactId,
        details: `One-time email invitation requested by ${referral.referrerName}.`,
        occurredAt,
        uniqueKey: `founder-friend-invite:${code}:${friendEmail}`,
      },
    });

    if (crm?.engagement?.created !== false) {
      const preferenceToken = crm?.contact?.fields?.["Email Preference Token"];
      if (!preferenceToken) throw new Error("Preference token was not created");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "ROAMSIX <info@roamsix.com>",
          reply_to: "info@roamsix.com",
          to: [friendEmail],
          subject: `${firstName(referral.referrerName)} sent you a personal ROAMSIX invitation`,
          html: invitationHtml({ friendName: friendFirstName, referrerName: referral.referrerName, code, preferenceToken, origin }),
        }),
      });
      if (!response.ok) throw new Error(`Invitation email failed (${response.status})`);
    }

    return res.status(200).json({
      success: true,
      message: `A personal invitation has been sent to ${friendFirstName}.`,
      purchaseUrl: `${origin}/dinner?code=${encodeURIComponent(code)}#tickets`,
    });
  } catch (error) {
    console.error("Founder-Friend invitation failed:", error.message);
    return res.status(500).json({ error: "We couldn’t send the invitation. Please try again or email info@roamsix.com." });
  }
}
