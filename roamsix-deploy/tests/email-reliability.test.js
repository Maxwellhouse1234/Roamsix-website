import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';

process.env.AIRTABLE_TOKEN = 'airtable_email_test';
process.env.RESEND_API_KEY = 'resend_email_test';
process.env.RESEND_WEBHOOK_SECRET = `whsec_${Buffer.from('resend-webhook-test-secret').toString('base64')}`;
process.env.STRIPE_SECRET_KEY = 'stripe_email_test';
process.env.STRIPE_WEBHOOK_SECRET = 'stripe-webhook-test-secret';
process.env.STRIPE_MEMBERSHIP_CORE_PRICE_ID = 'price_core';
process.env.STRIPE_MEMBERSHIP_FIELD_PRICE_ID = 'price_field';
process.env.STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID = 'price_journey';
process.env.STRIPE_CUSTOMER_PORTAL_URL = 'https://billing.example.test';
process.env.MEMBERSHIP_INVITE_SECRET = 'membership-invite-test-secret-long-enough';
process.env.MEMBERSHIP_APPROVAL_SECRET = 'membership-approval-test-secret-long-enough';
process.env.PUBLIC_SITE_URL = 'https://www.roamsix.test';
process.env.ACTIVE_MEMBERSHIP_COHORT_ID = 'founding';
process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL = 'Founding Cohort';
process.env.MEMBERSHIP_COHORT_CAPACITY = '25';

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function mockRes() {
  return {
    statusCode: 200, body: null, headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(key, value) { this.headers[key] = value; },
  };
}

function emailStore({ resendFailures = 0 } = {}) {
  const records = [];
  const resendCalls = [];
  let failuresLeft = resendFailures;

  function matchingRecords(url) {
    const formula = new URL(url).searchParams.get('filterByFormula') || '';
    if (formula.includes("{Status}='Failed'")) return records.filter((record) => record.fields.Status === 'Failed' && Number(record.fields['Retry Count'] || 0) < 5);
    const match = formula.match(/^\{(.+?)\}='(.*)'$/);
    if (!match) return records;
    const [, field, rawValue] = match;
    const value = rawValue.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    return records.filter((record) => String(record.fields[field] || '') === value);
  }

  async function fetchMock(url, options = {}) {
    const value = String(url);
    if (value.startsWith('https://api.airtable.com/v0/') && !value.includes('/meta/')) {
      const method = options.method || 'GET';
      if (method === 'GET') return response({ records: matchingRecords(value) });
      const fields = JSON.parse(options.body).fields;
      if (method === 'POST') {
        const record = { id: `rec_${records.length + 1}`, fields: { ...fields } };
        records.push(record);
        return response(record);
      }
      if (method === 'PATCH') {
        const id = value.split('/').pop();
        const record = records.find((item) => item.id === id);
        if (!record) return response({ error: 'not found' }, 404);
        Object.assign(record.fields, fields);
        return response(record);
      }
    }
    if (value === 'https://api.resend.com/emails') {
      resendCalls.push({ body: JSON.parse(options.body), headers: options.headers });
      if (failuresLeft > 0) {
        failuresLeft -= 1;
        return response({ message: 'temporary failure' }, 503);
      }
      return response({ id: `re_${resendCalls.length}` });
    }
    if (value.startsWith('https://api.resend.com/contacts') || value === 'https://api.resend.com/segments') return response({ data: [] });
    if (value.includes('/v1/checkout/sessions?')) return response({ data: [], has_more: false });
    if (value === 'https://api.stripe.com/v1/checkout/sessions') return response({ url: 'https://checkout.stripe.test/approved-membership' });
    if (value.includes('/v1/subscriptions/')) return response({
      id: 'sub_member', customer: 'cus_member', metadata: { membershipTier: 'Core', billingAmount: '$850' },
      items: { data: [{ price: { id: 'price_core' } }] },
    });
    if (value.includes('/v1/customers/')) return response({ id: 'cus_member', email: 'member@example.com' });
    throw new Error(`Unexpected URL: ${value}`);
  }

  return { records, resendCalls, fetchMock, allowResend() { failuresLeft = 0; } };
}

test('transactional email failures are persisted, retried, delivered, and idempotent', async () => {
  const store = emailStore({ resendFailures: 1 });
  global.fetch = store.fetchMock;
  const { retryFailedTransactionalEmails, sendTransactionalEmail, updateTransactionalDelivery } = await import('../lib/transactional-email.js');
  const input = { key: 'stripe:evt_1:membership-confirmation:member@example.com', purpose: 'membership-confirmation', to: 'member@example.com', stripeEventId: 'evt_1', stripeSessionId: 'cs_1', subject: 'Confirmed', html: '<p>Confirmed</p>' };
  await assert.rejects(sendTransactionalEmail(input), /Resend 503/);
  assert.equal(store.records[0].fields.Status, 'Failed');
  assert.equal(store.records[0].fields['Retry Count'], 1);
  assert.equal(store.records[0].fields['Needs Attention'], true);

  store.allowResend();
  const retry = await retryFailedTransactionalEmails();
  assert.equal(retry.sent, 1);
  assert.equal(store.records[0].fields.Status, 'Sent');
  assert.equal(store.records[0].fields['Retry Count'], 2);
  assert.equal(store.resendCalls[0].headers['Idempotency-Key'], store.resendCalls[1].headers['Idempotency-Key']);

  await sendTransactionalEmail(input);
  assert.equal(store.resendCalls.length, 2);
  await updateTransactionalDelivery({ messageId: store.records[0].fields['Resend Message ID'], type: 'email.delivered', occurredAt: new Date().toISOString() });
  assert.equal(store.records[0].fields.Status, 'Delivered');
});

test('membership purchase messages send once to the member, Max, and Jackie', async () => {
  const store = emailStore();
  global.fetch = store.fetchMock;
  const { sendMembershipPurchaseEmails } = await import('../lib/membership-emails.js');
  const input = {
    eventId: 'evt_checkout', sessionId: 'cs_member', customerName: 'Test Member', email: 'member@example.com', origin: 'https://www.roamsix.test',
    session: { metadata: { membershipTier: 'Core', membershipCohortId: 'founding', membershipCohortLabel: 'Founding Cohort', billingAmount: '$850', emailConsent: 'false' } },
  };
  await sendMembershipPurchaseEmails(input);
  await sendMembershipPurchaseEmails(input);
  assert.equal(store.resendCalls.length, 3);
  assert.deepEqual(store.resendCalls.map((call) => call.body.to[0]).sort(), ['jackie@roamsix.com', 'max@roamsix.com', 'member@example.com']);
  assert.equal(new Set(store.resendCalls.map((call) => call.headers['Idempotency-Key'])).size, 3);
});

test('Stripe membership webhook returns a retryable failure when a required email fails', async () => {
  const store = emailStore({ resendFailures: 1 });
  global.fetch = store.fetchMock;
  const event = JSON.stringify({
    id: 'evt_webhook_failure',
    type: 'checkout.session.completed',
    data: { object: {
      id: 'cs_webhook_failure', payment_status: 'paid', amount_total: 90000,
      customer_details: { email: 'member@example.com' },
      metadata: { purchaseType: 'membership', membershipTier: 'Core', membershipCohortId: 'founding', membershipCohortLabel: 'Founding Cohort', billingAmount: '$850', customerName: 'Test Member', billingCycle: 'annual', billingFrequency: 'annually' },
    } },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${event}`, 'utf8').digest('hex');
  const req = Readable.from([event]);
  req.method = 'POST';
  req.headers = { 'stripe-signature': `t=${timestamp},v1=${signature}`, host: 'www.roamsix.test', 'x-forwarded-proto': 'https' };
  const res = mockRes();
  const { default: stripeWebhook } = await import('../api/stripe-webhook.js');
  const originalError = console.error;
  console.error = () => {};
  try {
    await stripeWebhook(req, res);
  } finally {
    console.error = originalError;
  }
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.received, false);
  assert.ok(store.records.some((record) => record.fields.Status === 'Failed' && record.fields.Purpose === 'membership-confirmation'));
  const membershipRecord = store.records.find((record) => record.fields['Stripe Session ID'] === 'cs_webhook_failure' && record.fields['Cohort ID']);
  assert.equal(membershipRecord.fields['Cohort ID'], 'founding');
  assert.equal(membershipRecord.fields.Tier, 'Core');
});

test('membership lifecycle events create renewal, failure, cancellation, ended, and tier-change emails', async () => {
  const store = emailStore();
  global.fetch = store.fetchMock;
  const { handleMembershipLifecycleEvent } = await import('../lib/membership-emails.js');
  const baseInvoice = { customer: 'cus_member', customer_email: 'member@example.com', subscription: 'sub_member', amount_paid: 90000 };
  await handleMembershipLifecycleEvent({ id: 'evt_renewed', type: 'invoice.paid', data: { object: { ...baseInvoice, billing_reason: 'subscription_cycle' } } });
  await handleMembershipLifecycleEvent({ id: 'evt_failed', type: 'invoice.payment_failed', data: { object: baseInvoice } });
  const subscription = { id: 'sub_member', customer: { email: 'member@example.com' }, cancel_at_period_end: true, current_period_end: 1800000000, metadata: { membershipTier: 'Core' }, items: { data: [{ price: { id: 'price_core' } }] } };
  await handleMembershipLifecycleEvent({ id: 'evt_cancel_scheduled', type: 'customer.subscription.updated', data: { object: subscription, previous_attributes: { cancel_at_period_end: false } } });
  await handleMembershipLifecycleEvent({ id: 'evt_ended', type: 'customer.subscription.deleted', data: { object: subscription } });
  await handleMembershipLifecycleEvent({ id: 'evt_tier', type: 'customer.subscription.updated', data: { object: { ...subscription, cancel_at_period_end: false, metadata: { membershipTier: 'Field' }, items: { data: [{ price: { id: 'price_field' } }] } }, previous_attributes: { items: { data: [{ price: { id: 'price_core' } }] } } } });
  assert.deepEqual(store.records.map((record) => record.fields.Purpose).sort(), [
    'membership-cancellation-scheduled', 'membership-ended', 'membership-payment-failed', 'membership-renewal-paid', 'membership-tier-change',
  ]);
});

test('Resend delivery webhook records a bounce and alerts Max', async () => {
  const store = emailStore();
  global.fetch = store.fetchMock;
  const { sendTransactionalEmail } = await import('../lib/transactional-email.js');
  await sendTransactionalEmail({ key: 'email-to-bounce', purpose: 'membership-confirmation', to: 'member@example.com', subject: 'Confirmed', html: '<p>Confirmed</p>' });
  const messageId = store.records[0].fields['Resend Message ID'];
  const event = JSON.stringify({ type: 'email.bounced', created_at: new Date().toISOString(), data: { email_id: messageId, reason: 'Mailbox unavailable' } });
  const webhookId = 'msg_webhook_1';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const key = Buffer.from(process.env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/, ''), 'base64');
  const signature = createHmac('sha256', key).update(`${webhookId}.${timestamp}.${event}`).digest('base64');
  const req = Readable.from([event]);
  req.method = 'POST';
  req.headers = { 'svix-id': webhookId, 'svix-timestamp': timestamp, 'svix-signature': `v1,${signature}` };
  const res = mockRes();
  const { default: resendWebhook } = await import('../api/resend-webhook.js');
  await resendWebhook(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(store.records[0].fields.Status, 'Bounced');
  assert.equal(store.records[0].fields['Needs Attention'], true);
  assert.ok(store.records.some((record) => record.fields.Purpose === 'delivery-failure-alert' && record.fields.Recipient === 'max@roamsix.com'));
});

test('human-approved membership invitation is recorded and repeat sends are idempotent', async () => {
  const store = emailStore();
  global.fetch = store.fetchMock;
  const { default: sendInvite } = await import('../api/send-membership-invite.js');
  const request = {
    method: 'POST', headers: { authorization: `Bearer ${process.env.MEMBERSHIP_APPROVAL_SECRET}`, host: 'www.roamsix.test', 'x-forwarded-proto': 'https' },
    body: { approvalId: 'approval-001', tier: 'field', email: 'approved@example.com', approvedBy: 'Max', name: 'Approved Person', ttlHours: 24 },
  };
  const first = mockRes();
  await sendInvite(request, first);
  assert.equal(first.statusCode, 200);
  const second = mockRes();
  await sendInvite(request, second);
  assert.equal(second.statusCode, 200);
  assert.equal(store.resendCalls.length, 1);
  const approval = store.records.find((record) => record.fields['Approval ID'] === 'approval-001');
  assert.equal(approval.fields.Tier, 'Field');
  assert.equal(approval.fields['Cohort ID'], 'founding');
  assert.equal(approval.fields['Approved By'], 'Max');
  assert.equal(approval.fields['Send Status'], 'Already sent');

  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const checkoutResponse = mockRes();
  await checkout({
    method: 'POST',
    body: { name: 'Approved Person', email: 'approved@example.com', tier: 'field', invite: approval.fields['Invitation Token'], termsAccepted: true },
    headers: { host: 'www.roamsix.test', 'x-forwarded-proto': 'https' },
  }, checkoutResponse);
  assert.equal(checkoutResponse.statusCode, 200);
  assert.equal(checkoutResponse.body.url, 'https://checkout.stripe.test/approved-membership');
});

test('Field request acknowledgment is transactional even without marketing consent', async () => {
  const store = emailStore();
  global.fetch = store.fetchMock;
  const { default: requestMembership } = await import('../api/retreat-interest.js');
  const res = mockRes();
  await requestMembership({
    method: 'POST',
    body: {
      retreatSlug: 'field-membership-request', firstName: 'Request', lastName: 'Applicant', email: 'request@example.com', mobile: '',
      role: 'Founder', organization: 'Example', professionalCategory: 'Field', challenge: 'I want ongoing access.', paymentSource: 'self',
      referralSource: '', source: 'membership-request', campaign: 'field-membership-request', landingPage: '/membership',
      emailConsent: false, smsConsent: false, privacyAccepted: true,
    },
    headers: {},
  }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(store.resendCalls.map((call) => call.body.to[0]).sort(), ['max@roamsix.com', 'request@example.com']);
  assert.ok(store.records.some((record) => record.fields.Purpose === 'membership-request-acknowledgment'));
});
