import { captureCrmActivity } from "../lib/crm.js";
import { DR_SAL_EVENT, drSalRegistrationEnabled, registerMemberForDrSal } from "../lib/dr-sal-event.js";
import { sameOrigin, sessionFromRequest } from "../lib/member-auth.js";
import { membershipForEmail } from "../lib/member-data.js";
import { sendTransactionalEmail } from "../lib/transactional-email.js";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value, 500).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function confirmationHtml(name) {
  const firstName = escapeHtml(clean(name, 200).split(/\s+/)[0] || "there");
  return `<!doctype html><html><body style="margin:0;background:#f4f2ef;font-family:Arial,sans-serif;color:#111"><div style="max-width:600px;margin:0 auto;padding:38px 24px"><div style="background:#fff;padding:38px;border-top:3px solid #b8562f"><p style="letter-spacing:4px;font-weight:700;margin:0 0 32px">ROAMSIX</p><p>${firstName},</p><h1 style="font-size:30px;line-height:1.15">Your member seat is reserved.</h1><p style="line-height:1.7">Your seat for ${escapeHtml(DR_SAL_EVENT.name)} on October 24, 2026 is included with your active ROAMSIX membership. You were not charged.</p><p style="line-height:1.7"><strong>Time:</strong> ${escapeHtml(DR_SAL_EVENT.time)}<br><strong>Location:</strong> ${escapeHtml(DR_SAL_EVENT.venue)}<br><strong>Address:</strong> ${escapeHtml(DR_SAL_EVENT.address)}</p><p style="line-height:1.7"><strong>Action required before admission:</strong> ROAMSIX will send the final participation agreement after the property requirements are approved. You must complete it before admission. If it is not completed electronically, you may complete the approved paper version at check-in. Photography and video consent will be requested separately and will remain optional.</p><p style="line-height:1.7">Final agreement, arrival, and parking details will follow by email.</p><p style="line-height:1.7">Questions? Reply to this email or contact <a href="mailto:info@roamsix.com" style="color:#0759b8">info@roamsix.com</a>.</p></div></div></body></html>`;
}

function teamHtml({ name, email, phone, tier, source, acceptedAt, purchaseTermsVersion }) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><h1>Included member seat reserved</h1><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Tier:</strong> ${escapeHtml(tier)}</p><p><strong>Source:</strong> ${escapeHtml(source)}</p><p><strong>Reservation terms:</strong> Accepted at ${escapeHtml(acceptedAt)} under ${escapeHtml(purchaseTermsVersion)}.</p><p><strong>Participation agreement:</strong> Pending.</p><p><strong>Photography consent:</strong> Pending.</p></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
  const session = sessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Sign in is required to reserve an included member seat." });

  const body = req.body || {};
  if (body.eventId !== DR_SAL_EVENT.id) return res.status(400).json({ error: "This event is not available through this member path." });
  if (!drSalRegistrationEnabled()) return res.status(503).json({ error: "October 24 registration is not open yet." });
  if (!body.agreedToTerms || !body.participationRequirementAcknowledged) {
    return res.status(400).json({ error: "Reservation terms and acknowledgment of the separate participation-agreement requirement are required." });
  }

  try {
    const membership = await membershipForEmail(session.email);
    if (!membership.eligible) return res.status(403).json({ error: "An active membership was not found." });
    const name = clean(body.customerName, 200) || session.email;
    const phone = clean(body.phone, 50);
    const source = clean(body.source, 200) || "member-event-registration";
    const acceptedAt = new Date().toISOString();
    const registration = await registerMemberForDrSal({
      name,
      email: session.email,
      phone,
      tier: membership.tier,
      source,
      acceptedAt,
      purchaseTermsVersion: DR_SAL_EVENT.purchaseTermsVersion,
    });

    const occurredAt = new Date().toISOString();
    const crm = await captureCrmActivity({
      contact: {
        fullName: name,
        email: session.email,
        mobile: phone,
        lifecycleStage: "Customer",
        relationships: ["Member", "Event Attendee"],
        topics: ["Microbiome & Gut Health"],
        sources: ["Website", "Member Portal", source],
        emailPermission: "Transactional Only",
        occurredAt,
        notes: `Included ${membership.tier} member seat for ${DR_SAL_EVENT.name}.`,
      },
      engagement: {
        engagementType: "Registered",
        status: "Confirmed",
        topic: "Microbiome & Gut Health",
        eventName: DR_SAL_EVENT.name,
        occurredAt,
        source: "Member Portal",
        amountPaid: 0,
        stripeSessionId: registration.sessionId,
        uniqueKey: `member-event:${DR_SAL_EVENT.id}:${session.email}`,
        details: `Included with active ${membership.tier} membership; reservation terms accepted; participation requirement acknowledged; participation agreement pending; photography consent pending; terms version ${DR_SAL_EVENT.purchaseTermsVersion}; accepted ${acceptedAt}; source ${source}`,
      },
    });
    if (!crm?.contact || !crm?.engagement) throw new Error("Member event CRM capture failed");

    const common = { stripeSessionId: registration.sessionId };
    await Promise.all([
      sendTransactionalEmail({ ...common, key: `member-event:${DR_SAL_EVENT.id}:${session.email}:confirmation`, purpose: "member-event-registration-confirmation", from: "ROAMSIX Events <info@roamsix.com>", to: session.email, subject: "Your ROAMSIX member seat is reserved", html: confirmationHtml(name) }),
      sendTransactionalEmail({ ...common, key: `member-event:${DR_SAL_EVENT.id}:${session.email}:max`, purpose: "member-event-registration-notification", from: "ROAMSIX Events <info@roamsix.com>", to: "max@roamsix.com", replyTo: session.email, subject: `Included Member Registration: ${name}`, html: teamHtml({ name, email: session.email, phone, tier: membership.tier, source, acceptedAt, purchaseTermsVersion: DR_SAL_EVENT.purchaseTermsVersion }) }),
    ]);
    return res.status(200).json({ success: true, alreadyRegistered: !registration.created });
  } catch (error) {
    console.error("Member event registration failed:", error.message);
    if (error.code === "SOLD_OUT") return res.status(409).json({ error: error.message });
    return res.status(500).json({ error: "Your member seat could not be reserved right now. Please try again or contact info@roamsix.com." });
  }
}
