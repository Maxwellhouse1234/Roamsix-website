import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

process.env.MEMBER_AUTH_SECRET = 'test-secret-that-is-long-enough-for-signed-sessions';
process.env.MEMBERSHIP_INVITE_SECRET = 'different-test-secret-for-approved-membership-invites';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_MEMBERSHIP_CORE_PRICE_ID = 'price_core';
process.env.STRIPE_MEMBERSHIP_CORE_MONTHLY_PRICE_ID = 'price_core_monthly';
process.env.STRIPE_MEMBERSHIP_FIELD_PRICE_ID = 'price_field';
process.env.STRIPE_MEMBERSHIP_FIELD_MONTHLY_PRICE_ID = 'price_field_monthly';
process.env.STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID = 'price_journey';
process.env.STRIPE_MEMBERSHIP_JOURNEY_MONTHLY_PRICE_ID = 'price_journey_monthly';
process.env.AIRTABLE_TOKEN = 'airtable_mock';
process.env.RESEND_API_KEY = 'resend_mock';
process.env.ACTIVE_MEMBERSHIP_COHORT_ID = 'founding';
process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL = 'Founding Cohort';
process.env.MEMBERSHIP_COHORT_CAPACITY = '25';

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: null, redirectTo: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    redirect(code, url) { this.statusCode = code; this.redirectTo = url; return this; },
  };
}

test('signed member tokens reject tampering and expired purpose mismatches', async () => {
  const { createSignedToken, verifySignedToken } = await import('../lib/member-auth.js');
  const token = createSignedToken({ email: 'member@example.com', purpose: 'login' }, process.env.MEMBER_AUTH_SECRET, 60);
  assert.equal(verifySignedToken(token, process.env.MEMBER_AUTH_SECRET, 'login').email, 'member@example.com');
  assert.equal(verifySignedToken(`${token}x`, process.env.MEMBER_AUTH_SECRET, 'login'), null);
  assert.equal(verifySignedToken(token, process.env.MEMBER_AUTH_SECRET, 'session'), null);
});

test('Core checkout creates monthly or annual Stripe subscription sessions', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/checkout/sessions?')) return response({ data: [], has_more: false });
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const req = { method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', billingCycle: 'monthly', renewalAccepted: true, termsAccepted: true, emailConsent: false }, headers: { host: 'localhost:3000' } };
  const res = mockRes();
  await checkout(req, res);
  assert.equal(res.statusCode, 200);
  const checkoutBody = String(calls[1].options.body);
  assert.match(checkoutBody, /mode=subscription/);
  assert.match(checkoutBody, /price_core_monthly/);
  assert.match(checkoutBody, /billingCycle.*monthly/);
  assert.match(checkoutBody, /membershipTier.*Core/);
  assert.match(checkoutBody, /membershipCohortId.*founding/);
  assert.match(checkoutBody, /membershipCohortLabel.*Founding\+Cohort/);
  assert.match(checkoutBody, /purchaseType.*membership/);
  assert.doesNotMatch(checkoutBody, /membershipYear/);

  const annualRes = mockRes();
  await checkout({ ...req, body: { ...req.body, billingCycle: 'annual' } }, annualRes);
  assert.equal(annualRes.statusCode, 200);
  assert.match(String(calls.at(-1).options.body), /price_core/);
  assert.match(String(calls.at(-1).options.body), /billingCycle.*annual/);
});

test('direct Field and Journey checkout requests are rejected without an approved invitation', async () => {
  let stripeCalled = false;
  global.fetch = async () => { stripeCalled = true; return response({}); };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  for (const tier of ['field', 'journey']) {
    const validation = mockRes();
    await checkout({ method: 'GET', query: { tier }, headers: {} }, validation);
    assert.equal(validation.statusCode, 403);
    assert.equal(validation.body.authorized, false);

    const res = mockRes();
    await checkout({ method: 'POST', body: { name: 'Unapproved Applicant', email: 'applicant@example.com', tier, renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.error, /approved invitation/);
  }
  assert.equal(stripeCalled, false);
});

test('approved invitation authorizes only its email and Field tier', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/checkout/sessions?')) return response({ data: [], has_more: false });
    return response({ url: 'https://checkout.stripe.test/field-session' });
  };
  const { createSignedToken } = await import('../lib/member-auth.js');
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const invite = createSignedToken({ email: 'approved@example.com', tier: 'field', purpose: 'membership-invite' }, process.env.MEMBERSHIP_INVITE_SECRET, 60);

  const validation = mockRes();
  await checkout({ method: 'GET', query: { tier: 'field', invite }, headers: {} }, validation);
  assert.equal(validation.statusCode, 200);
  assert.equal(validation.body.email, 'approved@example.com');

  const approved = mockRes();
  await checkout({ method: 'POST', body: { name: 'Approved Applicant', email: 'approved@example.com', tier: 'field', invite, renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, approved);
  assert.equal(approved.statusCode, 200);
  assert.equal(approved.body.url, 'https://checkout.stripe.test/field-session');
  assert.match(String(calls.at(-1).options.body), /price_field_monthly/);
  assert.match(String(calls.at(-1).options.body), /approved-invitation/);

  const wrongTier = mockRes();
  await checkout({ method: 'POST', body: { name: 'Approved Applicant', email: 'approved@example.com', tier: 'journey', invite, renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, wrongTier);
  assert.equal(wrongTier.statusCode, 403);

  const wrongEmail = mockRes();
  await checkout({ method: 'POST', body: { name: 'Approved Applicant', email: 'other@example.com', tier: 'field', invite, renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, wrongEmail);
  assert.equal(wrongEmail.statusCode, 403);

  const expiredInvite = createSignedToken({ email: 'approved@example.com', tier: 'field', purpose: 'membership-invite' }, process.env.MEMBERSHIP_INVITE_SECRET, -1);
  const expired = mockRes();
  await checkout({ method: 'GET', query: { tier: 'field', invite: expiredInvite }, headers: {} }, expired);
  assert.equal(expired.statusCode, 403);

  const wrongCohortInvite = createSignedToken({ email: 'approved@example.com', tier: 'field', cohortId: 'cohort-02', purpose: 'membership-invite' }, process.env.MEMBERSHIP_INVITE_SECRET, 60);
  const wrongCohort = mockRes();
  await checkout({ method: 'GET', query: { tier: 'field', invite: wrongCohortInvite }, headers: {} }, wrongCohort);
  assert.equal(wrongCohort.statusCode, 403);
});

test('active cohort checkout closes after 25 unique completed paid memberships', async () => {
  let checkoutCreated = false;
  global.fetch = async (url) => {
    if (String(url).includes('/checkout/sessions?')) return response({
      data: Array.from({ length: 25 }, (_, index) => ({
        id: `cs_paid_${index}`,
        status: 'complete',
        payment_status: 'paid',
        metadata: { purchaseType: 'membership', membershipTier: 'Core', membershipCohortId: 'founding' },
      })),
      has_more: false,
    });
    checkoutCreated = true;
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const res = mockRes();
  await checkout({ method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, 'COHORT_FULL');
  assert.match(res.body.error, /Founding Cohort is full/);
  assert.equal(checkoutCreated, false);
});

test('only completed paid memberships count toward active cohort capacity', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('/checkout/sessions?')) return response({
      data: [
        ...Array.from({ length: 24 }, (_, index) => ({
          id: `cs_paid_${index}`,
          status: 'complete',
          payment_status: 'paid',
          metadata: { purchaseType: 'membership', membershipTier: index % 2 ? 'Field' : 'Core', membershipCohortId: 'founding' },
        })),
        { id: 'cs_unpaid', status: 'complete', payment_status: 'unpaid', metadata: { purchaseType: 'membership', membershipTier: 'Journey', membershipCohortId: 'founding' } },
        { id: 'cs_incomplete', status: 'open', payment_status: 'unpaid', metadata: { purchaseType: 'membership', membershipTier: 'Core', membershipCohortId: 'founding' } },
        { id: 'cs_request', status: 'complete', payment_status: 'paid', metadata: { purchaseType: 'membershipRequest', membershipTier: 'Field' } },
      ],
      has_more: false,
    });
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const res = mockRes();
  await checkout({ method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.url, 'https://checkout.stripe.test/session');
});

test('duplicate paid purchases by the same email consume one cohort place', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('/checkout/sessions?')) return response({
      data: [
        ...Array.from({ length: 24 }, (_, index) => ({
          id: `cs_unique_${index}`,
          status: 'complete',
          payment_status: 'paid',
          customer: `cus_${index}`,
          customer_details: { email: `member${index}@example.com` },
          metadata: { purchaseType: 'membership', membershipTier: 'Core', membershipCohortId: 'founding' },
        })),
        {
          id: 'cs_duplicate',
          status: 'complete',
          payment_status: 'paid',
          customer: 'cus_duplicate_email',
          customer_details: { email: 'MEMBER0@example.com' },
          metadata: { purchaseType: 'membership', membershipTier: 'Field', membershipCohortId: 'founding' },
        },
        {
          id: 'cs_same_customer_new_email',
          status: 'complete',
          payment_status: 'paid',
          customer: 'cus_0',
          customer_details: { email: 'changed-address@example.com' },
          metadata: { purchaseType: 'membership', membershipTier: 'Journey', membershipCohortId: 'founding' },
        },
      ],
      has_more: false,
    });
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const res = mockRes();
  await checkout({ method: 'POST', body: { name: 'Next Member', email: 'next@example.com', tier: 'core', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
  assert.equal(res.statusCode, 200);
});

test('a full prior cohort does not consume places after intentional cohort rollover', async (t) => {
  const previousId = process.env.ACTIVE_MEMBERSHIP_COHORT_ID;
  const previousLabel = process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL;
  process.env.ACTIVE_MEMBERSHIP_COHORT_ID = 'cohort-02';
  process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL = 'Cohort 02';
  t.after(() => {
    process.env.ACTIVE_MEMBERSHIP_COHORT_ID = previousId;
    process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL = previousLabel;
  });
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/checkout/sessions?')) return response({
      data: Array.from({ length: 25 }, (_, index) => ({
        id: `cs_founding_${index}`,
        status: 'complete',
        payment_status: 'paid',
        customer_details: { email: `founding${index}@example.com` },
        metadata: { purchaseType: 'membership', membershipTier: index % 2 ? 'Field' : 'Core', membershipCohortId: 'founding' },
      })),
      has_more: false,
    });
    return response({ url: 'https://checkout.stripe.test/cohort-02' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const res = mockRes();
  await checkout({ method: 'POST', body: { name: 'Second Cohort Member', email: 'next@example.com', tier: 'core', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
  assert.equal(res.statusCode, 200);
  const body = String(calls.at(-1).options.body);
  assert.match(body, /membershipCohortId.*cohort-02/);
  assert.match(body, /membershipTier.*Core/);
});

test('checkout fails closed when Stripe cannot verify cohort capacity', async () => {
  let checkoutCreated = false;
  global.fetch = async (url) => {
    if (String(url).includes('/checkout/sessions?')) return response({ error: { message: 'Stripe unavailable' } }, 503);
    checkoutCreated = true;
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const res = mockRes();
  await checkout({ method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(checkoutCreated, false);
});

test('shared membership language matches the approved founding offer', async () => {
  const { EXTRA_COST_EXPLANATION, MEMBERSHIP_TIERS } = await import('../src/data/membership.js');
  assert.match(MEMBERSHIP_TIERS.core.forWhom, /clarity without chasing every health trend/);
  assert.deepEqual(
    Object.values(MEMBERSHIP_TIERS).map(({ monthlyEquivalent, monthlyEquivalentLabel, annualBilling }) => ({ monthlyEquivalent, monthlyEquivalentLabel, annualBilling })),
    [
      { monthlyEquivalent: '$75', monthlyEquivalentLabel: 'per month', annualBilling: '$850 billed annually' },
      { monthlyEquivalent: '$185', monthlyEquivalentLabel: 'per month', annualBilling: '$2,200 billed annually' },
      { monthlyEquivalent: '$395', monthlyEquivalentLabel: 'per month', annualBilling: '$4,500 billed annually' },
    ],
  );
  assert.ok(MEMBERSHIP_TIERS.core.features.some((feature) => feature.title === 'Vetted guidance'));
  assert.ok(MEMBERSHIP_TIERS.field.features.some((feature) => feature.title === 'Closer expert access'));
  assert.match(EXTRA_COST_EXPLANATION, /^If offered, the larger member gathering is reserved separately and has its own ticket price\./);
});

test('public pricing emphasizes monthly pricing, moves details behind interaction, and keeps the cohort capped at 25', async () => {
  const [membership, checkout] = await Promise.all([
    readFile(new URL('../src/pages/MembershipPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/MembershipCheckoutPage.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(membership, /See what \{item\.name\} includes/);
  assert.match(membership, /Choose Core/);
  assert.doesNotMatch(membership, /item\.annualBilling/);
  assert.doesNotMatch(membership, /Join Core annually/);
  assert.match(membership, /intentionally sized groups, generally up to 25/);
  assert.doesNotMatch(membership, /Founding (100|150)/i);
  assert.match(checkout, /billingCycle/);
  assert.match(checkout, /name="renewalAccepted"/);
  assert.match(checkout, /I authorize ROAMSIX to charge \{selectedPlan\.price\} now and \{selectedPlan\.frequency\} until I cancel\./);
  assert.match(checkout, /Participant Agreement/);
  assert.match(checkout, /Media Release/);
  assert.match(checkout, /Start my \$\{tier\.name\} membership · \$\{selectedPlan\.label\}/);
});

test('Dr. Sal public and member-facing references use the confirmed October 24, 2026 event identity', async () => {
  const [home, experiences, dashboard, fieldwork] = await Promise.all([
    readFile(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/ExperiencesPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/MemberDashboardPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/FieldworkPage.jsx', import.meta.url), 'utf8'),
  ]);
  for (const source of [home, experiences, dashboard]) {
    assert.doesNotMatch(source, /October 24, 2027/);
    assert.match(source, /October 24, 2026/);
  }
  assert.match(experiences, /dr-sal-gut-brain-2026/);
  assert.doesNotMatch(experiences, /dr-sal-gut-brain-2027/);
  assert.match(home, /roamsix-outdoor-panel-bw-v1\.jpg/);
  assert.match(experiences, /roamsix-outdoor-panel-bw-v1\.jpg/);
  assert.match(home, /An intimate outdoor panel conversation with an audience\./);
  assert.match(experiences, /dr-sulaiman-bharwani-editorial-v1\.jpg/);
  assert.match(fieldwork, /roamsix-journey-mediterranean-v2\.jpg/);
  assert.match(dashboard, /Dr\. Sal · October 24, 2026 · San Diego/);
});

test('active member receives a generic magic-link response and the email is sent', async () => {
  let sentEmail = false;
  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes('/customers?')) return response({ data: [{ id: 'cus_1' }] });
    if (value.includes('/subscriptions?')) return response({ data: [{ status: 'active', metadata: { membershipTier: 'Field' }, items: { data: [{ price: { id: 'price_field' } }] } }] });
    if (value.includes('api.resend.com')) { sentEmail = true; return response({ id: 'email_1' }); }
    throw new Error(`Unexpected URL ${value}`);
  };
  const { default: auth } = await import('../api/member-auth.js');
  const req = { method: 'POST', body: { email: 'member@example.com' }, headers: { host: 'roamsix.test', origin: 'https://roamsix.test', 'x-forwarded-proto': 'https' }, socket: { remoteAddress: '127.0.0.1' } };
  const res = mockRes();
  await auth(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(sentEmail, true);
  assert.match(res.body.message, /If that email belongs/);
});

test('valid magic link becomes a secure member session', async () => {
  const { createSignedToken } = await import('../lib/member-auth.js');
  const { default: auth } = await import('../api/member-auth.js');
  const token = createSignedToken({ email: 'member@example.com', purpose: 'login' }, process.env.MEMBER_AUTH_SECRET, 60);
  const res = mockRes();
  await auth({ method: 'GET', query: { token }, headers: {} }, res);
  assert.equal(res.redirectTo, '/member');
  assert.match(res.headers['Set-Cookie'], /HttpOnly/);
  assert.match(res.headers['Set-Cookie'], /SameSite=Lax/);
});

test('dashboard returns Stripe status and the existing Airtable member profile', async () => {
  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes('/customers?')) return response({ data: [{ id: 'cus_1' }] });
    if (value.includes('/subscriptions?')) return response({ data: [{ status: 'active', metadata: { membershipTier: 'Journey', membershipCohortId: 'founding', membershipCohortLabel: 'Founding Cohort' }, current_period_end: 1800000000, items: { data: [{ price: { id: 'price_journey' } }] } }] });
    if (value.includes('tblV06NCECV5m4lYf?')) return response({ records: [{ id: 'rec_member', fields: { 'Full Name': 'Test Member', Email: 'member@example.com', 'Topic Interests': ['Sleep & Recovery'] } }] });
    throw new Error(`Unexpected URL ${value}`);
  };
  const { createSignedToken, sessionCookie } = await import('../lib/member-auth.js');
  const { default: dashboard } = await import('../api/member-dashboard.js');
  const token = createSignedToken({ email: 'member@example.com', purpose: 'session' }, process.env.MEMBER_AUTH_SECRET, 60);
  const res = mockRes();
  await dashboard({ method: 'GET', headers: { cookie: sessionCookie(token) } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.membership.tier, 'Journey');
  assert.equal(res.body.membership.cohortId, 'founding');
  assert.equal(res.body.membership.cohortLabel, 'Founding Cohort');
  assert.equal(res.body.profile.fullName, 'Test Member');
});

test('member booking request requires a signed session and writes to existing CRM', async () => {
  const writes = [];
  global.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('tblV06NCECV5m4lYf?')) return response({ records: [{ id: 'rec_member', fields: { Email: 'member@example.com' } }] });
    if (value.endsWith('/tblkPKDz9JJ4i3VH4')) { writes.push(JSON.parse(options.body)); return response({ id: 'rec_booking' }); }
    throw new Error(`Unexpected URL ${value}`);
  };
  const { createSignedToken, sessionCookie } = await import('../lib/member-auth.js');
  const { default: dashboard } = await import('../api/member-dashboard.js');
  const token = createSignedToken({ email: 'member@example.com', purpose: 'session' }, process.env.MEMBER_AUTH_SECRET, 60);
  const req = { method: 'POST', body: { action: 'booking', eventName: 'Dr. Sal · October 24, 2026 · San Diego', message: 'Please notify me.' }, headers: { host: 'roamsix.test', origin: 'https://roamsix.test', cookie: sessionCookie(token) } };
  const res = mockRes();
  await dashboard(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].fields.Status, 'Requested');
  assert.equal(writes[0].fields['Event Name'], 'Dr. Sal · October 24, 2026 · San Diego');
});
