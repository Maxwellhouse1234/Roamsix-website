import { verifySignedToken } from "../lib/member-auth.js";
import { activeMembershipCohort, cohortMatches } from "../lib/membership-cohort.js";
import { sendMembershipCheckoutStartedEmail } from "../lib/membership-emails.js";
import { eligibleEventCredit } from "../lib/event-credit.js";
import { createHash, randomBytes } from "node:crypto";
import { enforcePublicSubmission } from '../lib/form-security.js';

const LEGAL_VERSION = "2026-09-28-v13-annual";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIERS = {
  core: { name: "Core", plan: { amount: "$850", priceEnv: "STRIPE_MEMBERSHIP_CORE_PRICE_ID", frequency: "annually" } },
  field: { name: "Field", plan: { amount: "$2,200", priceEnv: "STRIPE_MEMBERSHIP_FIELD_PRICE_ID", frequency: "annually" } },
  journey: { name: "Journey", plan: { amount: "$4,500", priceEnv: "STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID", frequency: "annually" } },
};

async function stripeRequest(path, secret, params, idempotencyKey = "") {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Stripe-Version": "2026-08-26.dahlia",
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    ...(params ? { body: params } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Stripe request failed (${response.status})`);
  return data;
}

function paidMembershipKeys(session) {
  const keys = [];
  const email = String(session.customer_details?.email || session.customer_email || "").trim().toLowerCase();
  if (email) keys.push(`email:${email}`);
  if (session.customer) keys.push(`customer:${session.customer}`);
  if (session.subscription) keys.push(`subscription:${session.subscription}`);
  return keys.length ? keys : [`session:${session.id}`];
}

function integrationIdentifier() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return `roamsix_membership_${[...randomBytes(8)].map((value) => letters[value % letters.length]).join("")}`;
}

async function paidMembershipCount(secret, cohortId) {
  const parents = new Map();
  const find = (key) => {
    if (!parents.has(key)) parents.set(key, key);
    const parent = parents.get(key);
    if (parent !== key) parents.set(key, find(parent));
    return parents.get(key);
  };
  const union = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parents.set(rightRoot, leftRoot);
  };
  let startingAfter = "";
  do {
    const params = new URLSearchParams({ limit: "100" });
    if (startingAfter) params.set("starting_after", startingAfter);
    const data = await stripeRequest(`checkout/sessions?${params}`, secret);
    const sessions = data.data || [];
    sessions.forEach((session) => {
      if (
        session.status === "complete"
        && session.payment_status === "paid"
        && ["membership", "foundingMembership"].includes(session.metadata?.purchaseType)
        && ["Core", "Field", "Journey"].includes(session.metadata?.membershipTier)
        && cohortMatches(session.metadata, cohortId)
      ) {
        const keys = paidMembershipKeys(session);
        keys.forEach(find);
        keys.slice(1).forEach((key) => union(keys[0], key));
      }
    });
    if (!data.has_more || !sessions.length) break;
    startingAfter = sessions.at(-1).id;
  } while (startingAfter);
  return new Set([...parents.keys()].map(find)).size;
}

function approvedInvitation(token, tierKey, email = "", activeCohortId = activeMembershipCohort().id) {
  const secret = process.env.MEMBERSHIP_INVITE_SECRET;
  const claims = verifySignedToken(String(token || ""), secret, "membership-invite");
  if (!claims) return null;
  const approvedEmail = String(claims.email || "").trim().toLowerCase();
  const approvedTier = String(claims.tier || "").trim().toLowerCase();
  const approvedCohortId = String(claims.cohortId || "founding").trim();
  if (approvedTier !== tierKey || approvedCohortId !== activeCohortId || (email && approvedEmail !== email)) return null;
  return { email: approvedEmail, tier: approvedTier, cohortId: approvedCohortId, exp: claims.exp };
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).json({ error: "Method not allowed." });
  const input = req.method === "GET" ? req.query : req.body;
  const tierKey = String(input?.tier || "core").toLowerCase();
  const tier = TIERS[tierKey];
  const billingCycle = String(input?.billingCycle || "annual").toLowerCase();
  const plan = tier?.plan;
  const invitationToken = String(input?.invite || "");
  const cohort = activeMembershipCohort();

  if (!tier) return res.status(400).json({ error: "Please select Core, Field, or Journey." });
  if (billingCycle !== "annual") return res.status(400).json({ error: "Annual billing is the only available option." });
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    if (tierKey === "core") return res.status(200).json({ authorized: true, tier: tierKey });
    if (!process.env.MEMBERSHIP_INVITE_SECRET) {
      return res.status(503).json({ authorized: false, error: "Invitation checkout is not configured yet." });
    }
    const invitation = approvedInvitation(invitationToken, tierKey, "", cohort.id);
    if (!invitation) return res.status(403).json({ authorized: false, error: "This membership invitation is invalid or has expired." });
    return res.status(200).json({ authorized: true, email: invitation.email, tier: invitation.tier, expiresAt: invitation.exp });
  }

  if (!(await enforcePublicSubmission(req, res, { endpoint: 'membership-checkout', ipLimit: 8, repeatLimit: 3 }))) return;

  const name = String(req.body?.name || "").trim().slice(0, 200);
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 320);
  const phone = String(req.body?.phone || "").trim().slice(0, 100);
  const source = String(req.body?.source || "direct").trim().slice(0, 200);
  const renewalAccepted = req.body?.renewalAccepted === true;
  const termsAccepted = req.body?.termsAccepted === true;
  const waiverAccepted = req.body?.waiverAccepted === true;
  const mediaReleaseAccepted = req.body?.mediaReleaseAccepted === true;
  const emailConsent = req.body?.emailConsent === true;
  const acceptedAt = String(req.body?.acceptedAt || new Date().toISOString()).slice(0, 100);

  if (!name || !EMAIL_RE.test(email) || !phone) return res.status(400).json({ error: "Please provide your name, email address, and phone number." });
  if (!renewalAccepted) return res.status(400).json({ error: "Please authorize the selected recurring membership charge." });
  if (!termsAccepted) return res.status(400).json({ error: "Please review and accept the membership terms." });
  if (!waiverAccepted) return res.status(400).json({ error: "Please review and accept the participant agreement." });
  if (!mediaReleaseAccepted) return res.status(400).json({ error: "Please review and accept the media release." });
  if (tierKey !== "core") {
    if (!process.env.MEMBERSHIP_INVITE_SECRET) {
      return res.status(503).json({ error: "Invitation checkout is not configured yet." });
    }
    if (!approvedInvitation(invitationToken, tierKey, email, cohort.id)) {
      return res.status(403).json({ error: "Field and Journey membership require an approved invitation for this email address." });
    }
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[plan.priceEnv];
  if (!secret || !priceId) return res.status(503).json({ error: `Membership ${billingCycle} checkout is not configured yet.` });

  try {
    if (await paidMembershipCount(secret, cohort.id) >= cohort.capacity) {
      return res.status(409).json({
        code: "COHORT_FULL",
        error: `${cohort.label} is full. Join the interest list for the next membership cohort.`,
        cohortId: cohort.id,
        cohortLabel: cohort.label,
      });
    }
    const host = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${host}`;
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("integration_identifier", integrationIdentifier());
    params.set("customer_email", email);
    params.set("payment_method_collection", "always");
    params.set("success_url", `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", tierKey === "core" ? `${origin}/membership/checkout/core` : `${origin}/membership#request-membership`);
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    let eventCredit = { amount: 0, engagementIds: [], configured: false };
    try {
      eventCredit = await eligibleEventCredit(email);
    } catch (creditError) {
      console.error("Membership event credit lookup failed:", creditError.message);
    }
    if (eventCredit.amount > 0) {
      const couponParams = new URLSearchParams();
      couponParams.set("duration", "once");
      couponParams.set("currency", "usd");
      couponParams.set("amount_off", String(Math.round(eventCredit.amount * 100)));
      couponParams.set("name", "ROAMSIX event ticket credit");
      couponParams.set("metadata[source]", "Eligible event tickets");
      const digest = createHash("sha256").update(`${email}:${eventCredit.amount}:${eventCredit.engagementIds.join(",")}`).digest("hex").slice(0, 24);
      const coupon = await stripeRequest("coupons", secret, couponParams, `roamsix-event-credit-${digest}`);
      params.set("discounts[0][coupon]", coupon.id);
    } else {
      params.set("allow_promotion_codes", tierKey === "core" ? "true" : "false");
    }
    const metadata = {
      purchaseType: "membership", membershipTier: tier.name,
      membershipCohortId: cohort.id, membershipCohortLabel: cohort.label,
      billingCycle, billingAmount: plan.amount, billingFrequency: plan.frequency,
      customerName: name, phone, source, emailConsent: emailConsent ? "true" : "false",
      acceptedLegalVersion: LEGAL_VERSION, acceptedAt, agreedToTerms: "true", automaticRenewalConsent: renewalAccepted ? "true" : "false",
      waiverAccepted: "true", mediaReleaseAccepted: "true",
      enrollmentAuthorization: tierKey === "core" ? "public" : "approved-invitation",
      eventCreditAmount: String(eventCredit.amount || 0),
      eventCreditEngagementIds: eventCredit.engagementIds.join(",").slice(0, 500),
      eventCreditPolicy: "$50 within 48 hours after an eligible event, $100 lifetime cap",
    };
    Object.entries(metadata).forEach(([key, value]) => {
      params.set(`metadata[${key}]`, value);
      params.set(`subscription_data[metadata][${key}]`, value);
    });
    const data = await stripeRequest("checkout/sessions", secret, params);
    if (data.id && data.url) {
      try {
        await sendMembershipCheckoutStartedEmail({
          sessionId: data.id,
          customerName: name,
          email,
          tier: tier.name,
          amount: plan.amount,
          billingFrequency: plan.frequency,
          checkoutUrl: data.url,
        });
      } catch (emailError) {
        console.error("Membership checkout continuation email failed:", emailError.message);
      }
    }
    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error("Membership checkout failed:", error.message);
    return res.status(500).json({ error: "We could not open secure checkout." });
  }
}
