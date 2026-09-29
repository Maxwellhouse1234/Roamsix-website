import { sendTransactionalEmail } from "./transactional-email.js";
import { cohortFromMetadata } from "./membership-cohort.js";

const TIER_BY_PRICE = () => ({
  [process.env.STRIPE_MEMBERSHIP_CORE_PRICE_ID]: { name: "Core", amount: "$850", cycle: "annual", frequency: "annually" },
  [process.env.STRIPE_MEMBERSHIP_FIELD_PRICE_ID]: { name: "Field", amount: "$2,200", cycle: "annual", frequency: "annually" },
  [process.env.STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID]: { name: "Journey", amount: "$4,500", cycle: "annual", frequency: "annually" },
});

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function shell(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#0A0A0A;font-family:Arial,sans-serif;color:#E5E3E0"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#18181A"><tr><td style="padding:30px 38px;border-bottom:2px solid #B8562F"><div style="font-size:22px;font-weight:700;letter-spacing:5px;color:#FAFAF9">ROAMSIX</div><div style="margin-top:6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8562F">${escapeHtml(title)}</div></td></tr><tr><td style="padding:36px 38px;font-size:16px;line-height:1.75">${body}<p style="margin-top:32px;color:#FAFAF9">ROAMSIX<br><span style="color:#E5E3E0">Bridging knowing and doing.</span></p></td></tr></table></td></tr></table></body></html>`;
}

function portalUrl(origin = "https://www.roamsix.com") {
  return process.env.STRIPE_CUSTOMER_PORTAL_URL || `${origin}/membership/manage`;
}

function assertMembershipEmailConfig({ lifecycle = false } = {}) {
  const required = ["RESEND_API_KEY", "AIRTABLE_TOKEN"];
  if (lifecycle) required.push("STRIPE_SECRET_KEY");
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Membership email configuration missing: ${missing.join(", ")}`);
}

async function stripe(path) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured for membership lifecycle email");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Stripe ${response.status}`);
  return data;
}

function priceIdFromSubscription(subscription) {
  return subscription?.items?.data?.[0]?.price?.id || "";
}

function membershipPlan(subscription) {
  const priceId = priceIdFromSubscription(subscription);
  const plan = TIER_BY_PRICE()[priceId];
  if (plan) return { ...plan, priceId };
  const metadataTier = subscription?.metadata?.membershipTier;
  if (["Core", "Field", "Journey"].includes(metadataTier)) return {
    name: metadataTier,
    amount: subscription.metadata?.billingAmount || "the current rate",
    cycle: subscription.metadata?.billingCycle || "annual",
    frequency: subscription.metadata?.billingFrequency || "annually",
    priceId,
  };
  return null;
}

async function customerFor(value) {
  if (value && typeof value === "object") return value;
  return value ? stripe(`customers/${encodeURIComponent(value)}`) : {};
}

async function subscriptionFor(value) {
  if (value && typeof value === "object") return value;
  return value ? stripe(`subscriptions/${encodeURIComponent(value)}`) : null;
}

function invoiceSubscriptionId(invoice) {
  return invoice.subscription || invoice.parent?.subscription_details?.subscription || "";
}

function emailFor(customer, fallback = "") {
  return String(fallback || customer?.email || "").trim().toLowerCase();
}

function requiredEmail(email) {
  if (!email) throw new Error("Membership lifecycle event does not include a deliverable customer email");
  return email;
}

export async function sendMembershipCheckoutStartedEmail({ sessionId, customerName, email, tier, amount, billingFrequency, checkoutUrl }) {
  if (!sessionId || !email || !checkoutUrl) throw new Error("Membership checkout email requires a Stripe session, customer email, and checkout URL");
  const safeCheckoutUrl = escapeHtml(checkoutUrl);
  const html = shell("Complete Your Membership", `
    <p>You started a ROAMSIX Core membership and did not finish.</p>
    <p>Core is $850 for founding members, held at that rate for as long as your membership stays active. It becomes $1,100 in 2027. Founding membership closes December 31.</p>
    <p>That covers 36 gatherings in 2027 across gut health, sleep and recovery, focus and resilience, and strength and longevity. Experts we choose ourselves, in rooms of 25 to 40 people.</p>
    <img src="https://www.roamsix.com/images/homepage/roamsix-outdoor-panel-bw-v1.jpg" width="524" alt="An intimate ROAMSIX outdoor conversation" style="display:block;width:100%;max-width:524px;height:auto;margin:28px 0 22px;border:0" />
    <p style="margin:28px 0"><a href="${safeCheckoutUrl}" style="display:inline-block;background:#B8562F;color:#FAFAF9;text-decoration:none;font-weight:700;padding:14px 22px">Complete my membership · $850</a></p>
    <p>You have not been charged. This link is temporary. If it expires, start again at <a href="https://www.roamsix.com/membership" style="color:#B8562F">roamsix.com/membership</a>.</p>
    <p style="font-size:13px;color:#B9B7B3">This is an essential enrollment email, not a marketing subscription.</p>
  `);
  return sendTransactionalEmail({
    key: `stripe:${sessionId}:membership-checkout-started:${email}`,
    purpose: "membership-checkout-started",
    to: email,
    stripeSessionId: sessionId,
    subject: "Your ROAMSIX membership is ready when you are",
    html,
  });
}

export async function sendMembershipPurchaseEmails({ eventId, session, sessionId, customerName, email, origin }) {
  assertMembershipEmailConfig();
  if (!eventId || !sessionId || !email) throw new Error("Membership confirmation requires Stripe event, session, and customer email");
  const tier = session.metadata?.membershipTier || "Core";
  const amount = session.metadata?.billingAmount || "$850";
  const billingCycle = session.metadata?.billingCycle || "annual";
  const billingFrequency = session.metadata?.billingFrequency || "annually";
  const cohort = cohortFromMetadata(session.metadata);
  const firstName = escapeHtml(String(customerName || "").split(" ")[0] || "there");
  const portal = portalUrl(origin);
  const cohortLine = cohort.id ? `<p>You are joining the <strong>${escapeHtml(cohort.label)}</strong>. Your cohort organizes enrollment and helps ROAMSIX manage access as programming grows.</p>` : "";
  const memberHtml = shell("Membership Confirmed", `<p style="color:#FAFAF9;font-size:19px">${firstName},</p><p>Your ROAMSIX ${escapeHtml(tier)} membership is confirmed.</p>${cohortLine}<p>Your ${escapeHtml(billingCycle)} charge of ${escapeHtml(amount)} was collected securely by Stripe and renews ${escapeHtml(billingFrequency)} until you cancel.</p><p>You may manage renewal and payment details through <a href="${portal}" style="color:#B8562F">online billing management</a> or by emailing info@roamsix.com.</p><p>If offered, the larger member gathering is reserved separately and has its own ticket price. It proceeds only after its cash costs are covered. The year-end Journey is purchased separately by every traveler. Some partner-hosted or premium experiences may also have their own price, stated before booking.</p>`);
  const internalHtml = `<p><strong>New ${escapeHtml(billingCycle)} ${escapeHtml(tier)} Membership</strong></p><p>${escapeHtml(customerName)} · ${escapeHtml(email)}</p><p>${escapeHtml(amount)} billed ${escapeHtml(billingFrequency)}</p><p>Cohort: ${escapeHtml(cohort.label || "Unassigned")} (${escapeHtml(cohort.id || "missing")})</p><p>Stripe event: ${escapeHtml(eventId)}</p><p>Stripe session: ${escapeHtml(sessionId)}</p>`;
  const common = { stripeEventId: eventId, stripeSessionId: sessionId };
  return Promise.all([
    sendTransactionalEmail({ ...common, key: `stripe:${eventId}:${sessionId}:membership-confirmation:${email}`, purpose: "membership-confirmation", to: email, subject: "Your ROAMSIX Membership is confirmed", html: memberHtml }),
    sendTransactionalEmail({ ...common, key: `stripe:${eventId}:${sessionId}:new-member:max@roamsix.com`, purpose: "new-member-notification", to: "max@roamsix.com", replyTo: email, subject: `New Member: ${customerName || email}`, html: internalHtml }),
    sendTransactionalEmail({ ...common, key: `stripe:${eventId}:${sessionId}:new-member:jackie@roamsix.com`, purpose: "new-member-notification", to: "jackie@roamsix.com", replyTo: email, subject: `New Member: ${customerName || email}`, html: internalHtml }),
  ]);
}

export async function handleMembershipLifecycleEvent(event, origin = "https://www.roamsix.com") {
  assertMembershipEmailConfig({ lifecycle: true });
  const object = event.data?.object || {};
  const previous = event.data?.previous_attributes || {};
  const portal = portalUrl(origin);
  let subscription;
  let customer;
  let plan;
  let email;

  if (["invoice.paid", "invoice.payment_failed"].includes(event.type)) {
    subscription = await subscriptionFor(invoiceSubscriptionId(object));
    if (!subscription) return { handled: false, reason: "non-subscription-invoice" };
    plan = membershipPlan(subscription);
    if (!plan) return { handled: false, reason: "non-membership-subscription" };
    customer = await customerFor(object.customer || subscription.customer);
    email = requiredEmail(emailFor(customer, object.customer_email));
    if (event.type === "invoice.paid") {
      if (object.billing_reason !== "subscription_cycle") return { handled: false, reason: "initial-or-manual-invoice" };
      await sendTransactionalEmail({
        key: `stripe:${event.id}:membership-renewal-paid:${email}`,
        purpose: "membership-renewal-paid",
        to: email,
        stripeEventId: event.id,
        subject: "Your ROAMSIX membership has renewed",
        html: shell("Membership Renewed", `<p>Your ${escapeHtml(plan.cycle)} ROAMSIX ${escapeHtml(plan.name)} membership renewal was successful.</p><p>The amount paid was ${escapeHtml(object.amount_paid ? `$${(object.amount_paid / 100).toFixed(2)}` : plan.amount)}.</p><p>You can review billing details through <a href="${portal}" style="color:#B8562F">secure billing management</a>.</p>`),
      });
      return { handled: true, purpose: "membership-renewal-paid" };
    }
    await sendTransactionalEmail({
      key: `stripe:${event.id}:membership-payment-failed:${email}`,
      purpose: "membership-payment-failed",
      to: email,
      stripeEventId: event.id,
      subject: "Action needed for your ROAMSIX membership payment",
      html: shell("Payment Needs Attention", `<p>Stripe could not complete the latest payment for your ROAMSIX ${escapeHtml(plan.name)} membership.</p><p>Please <a href="${portal}" style="color:#B8562F">update your payment details securely</a>. Stripe may retry the payment according to the billing settings.</p><p>If you have already updated your information, no further action is needed.</p>`),
    });
    return { handled: true, purpose: "membership-payment-failed" };
  }

  subscription = object;
  plan = membershipPlan(subscription);
  if (!plan) return { handled: false, reason: "non-membership-subscription" };
  customer = await customerFor(subscription.customer);
  email = requiredEmail(emailFor(customer));

  if (event.type === "customer.subscription.deleted") {
    await sendTransactionalEmail({
      key: `stripe:${event.id}:membership-ended:${email}`,
      purpose: "membership-ended",
      to: email,
      stripeEventId: event.id,
      subject: "Your ROAMSIX membership has ended",
      html: shell("Membership Ended", `<p>Your ROAMSIX ${escapeHtml(plan.name)} membership has ended and will not renew.</p><p>If this was unexpected or you need help, reply to this email or contact info@roamsix.com.</p>`),
    });
    return { handled: true, purpose: "membership-ended" };
  }

  const sent = [];
  if (subscription.cancel_at_period_end === true && previous.cancel_at_period_end === false) {
    const endDate = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric" }) : "the end of your paid term";
    await sendTransactionalEmail({
      key: `stripe:${event.id}:membership-cancellation-scheduled:${email}`,
      purpose: "membership-cancellation-scheduled",
      to: email,
      stripeEventId: event.id,
      subject: "Your ROAMSIX membership cancellation is scheduled",
      html: shell("Cancellation Scheduled", `<p>Your ROAMSIX ${escapeHtml(plan.name)} membership is scheduled to end on ${escapeHtml(endDate)}.</p><p>You will retain access through the end of the paid membership term. You can review billing through <a href="${portal}" style="color:#B8562F">secure billing management</a>.</p>`),
    });
    sent.push("membership-cancellation-scheduled");
  }

  const oldPriceId = previous.items?.data?.[0]?.price?.id || "";
  const newPriceId = priceIdFromSubscription(subscription);
  if (oldPriceId && newPriceId && oldPriceId !== newPriceId) {
    const oldPlan = TIER_BY_PRICE()[oldPriceId];
    await sendTransactionalEmail({
      key: `stripe:${event.id}:membership-tier-change:${email}`,
      purpose: "membership-tier-change",
      to: email,
      stripeEventId: event.id,
      subject: "Your ROAMSIX membership has changed",
      html: shell("Membership Updated", `<p>Your ROAMSIX membership changed from ${escapeHtml(oldPlan?.name || "your previous tier")} to ${escapeHtml(plan.name)}.</p><p>Review the effective date, price, and billing details through <a href="${portal}" style="color:#B8562F">secure billing management</a>.</p>`),
    });
    sent.push("membership-tier-change");
  }
  return { handled: sent.length > 0, purposes: sent };
}
