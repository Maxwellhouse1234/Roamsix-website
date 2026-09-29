import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

process.env.MEMBER_AUTH_SECRET = 'test-secret-that-is-long-enough-for-signed-sessions';
process.env.MEMBERSHIP_INVITE_SECRET = 'different-test-secret-for-approved-membership-invites';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_MEMBERSHIP_CORE_PRICE_ID = 'price_core';
process.env.STRIPE_MEMBERSHIP_FIELD_PRICE_ID = 'price_field';
process.env.STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID = 'price_journey';
process.env.STRIPE_DR_SAL_PRICE_ID = 'price_dr_sal';
process.env.AIRTABLE_TOKEN = 'airtable_mock';
process.env.RESEND_API_KEY = 'resend_mock';
process.env.ACTIVE_MEMBERSHIP_COHORT_ID = 'founding';
process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL = 'Founding Cohort';
process.env.MEMBERSHIP_COHORT_CAPACITY = '25';
process.env.ROAMSIX_CRM_MEMBER_BENEFITS_TABLE_ID = 'tblBenefits';

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

test('Core checkout creates annual Stripe subscription sessions and rejects monthly billing', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).includes('/checkout/sessions?')) return response({ data: [], has_more: false });
    return response({ url: 'https://checkout.stripe.test/session' });
  };
  const { default: checkout } = await import('../api/create-membership-checkout.js');
  const monthlyRes = mockRes();
  await checkout({ method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', billingCycle: 'monthly', renewalAccepted: true, termsAccepted: true }, headers: { host: 'localhost:3000' } }, monthlyRes);
  assert.equal(monthlyRes.statusCode, 400);
  assert.match(monthlyRes.body.error, /Annual billing is the only available option/);
  assert.equal(calls.length, 0);

  const req = { method: 'POST', body: { name: 'Test Member', email: 'member@example.com', tier: 'core', billingCycle: 'annual', renewalAccepted: true, termsAccepted: true, emailConsent: false }, headers: { host: 'localhost:3000' } };
  const res = mockRes();
  await checkout(req, res);
  assert.equal(res.statusCode, 200);
  const checkoutBody = String(calls.at(-1).options.body);
  assert.match(checkoutBody, /mode=subscription/);
  assert.match(checkoutBody, /price_core/);
  assert.match(checkoutBody, /billingCycle.*annual/);
  assert.match(checkoutBody, /membershipTier.*Core/);
  assert.match(checkoutBody, /membershipCohortId.*founding/);
  assert.match(checkoutBody, /membershipCohortLabel.*Founding\+Cohort/);
  assert.match(checkoutBody, /purchaseType.*membership/);
  assert.doesNotMatch(checkoutBody, /membershipYear/);

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
  assert.match(String(calls.at(-1).options.body), /price_field/);
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

test('Dr. Sal checkout requires separate legal acceptance and creates one tracked seat hold', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('Event%20Registrations?')) return response({ records: [] });
    if (String(url) === 'https://api.stripe.com/v1/checkout/sessions') return response({ id: 'cs_dr_sal', url: 'https://checkout.stripe.test/dr-sal' });
    if (String(url).endsWith('/Event%20Registrations') && options.method === 'POST') return response({ id: 'rec_hold', fields: JSON.parse(options.body).fields });
    throw new Error(`Unexpected URL ${url}`);
  };
  const { default: checkout } = await import('../api/create-checkout-session.js');
  const baseBody = {
    eventId: 'dr-sal-gut-brain-2026', packageId: 'general-admission', customerName: 'Test Guest', customerEmail: 'guest@example.com', phone: '555-555-5555',
    agreedToTerms: true, waiverAccepted: true, mediaReleaseAccepted: true, acceptedLegalVersion: '2026-09-29-dr-sal-v1', acceptedAt: new Date().toISOString(), source: 'homepage',
  };

  const missingWaiver = mockRes();
  await checkout({ method: 'POST', body: { ...baseBody, waiverAccepted: false }, headers: { host: 'roamsix.test', 'x-forwarded-proto': 'https' } }, missingWaiver);
  assert.equal(missingWaiver.statusCode, 400);
  assert.match(missingWaiver.body.error, /Assumption of Risk/);

  const res = mockRes();
  await checkout({ method: 'POST', body: baseBody, headers: { host: 'roamsix.test', 'x-forwarded-proto': 'https' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.url, 'https://checkout.stripe.test/dr-sal');
  const stripeCall = calls.find((call) => call.url === 'https://api.stripe.com/v1/checkout/sessions');
  assert.equal(stripeCall.options.headers['Idempotency-Key'].includes('dr-sal-gut-brain-2026-seat-1'), true);
  assert.match(String(stripeCall.options.body), /price_dr_sal/);
  assert.match(String(stripeCall.options.body), /waiverAccepted.*true/);
  assert.match(String(stripeCall.options.body), /mediaReleaseAccepted.*true/);
  const holdCall = calls.find((call) => call.url.endsWith('/Event%20Registrations') && call.options.method === 'POST');
  assert.equal(JSON.parse(holdCall.options.body).fields.Status, 'Pending');
  assert.match(JSON.parse(holdCall.options.body).fields.Notes, /Seat allocation: 1/);
});

test('Dr. Sal checkout stops before Stripe when all 25 seats are occupied', async () => {
  let stripeCalled = false;
  global.fetch = async (url) => {
    if (String(url).includes('Event%20Registrations?')) return response({
      records: Array.from({ length: 25 }, (_, index) => ({ id: `rec_${index + 1}`, fields: { Status: 'Confirmed', Quantity: 1, Notes: `Seat allocation: ${index + 1}` } })),
    });
    stripeCalled = true;
    return response({ id: 'should_not_exist', url: 'https://checkout.stripe.test/oversold' });
  };
  const { default: checkout } = await import('../api/create-checkout-session.js');
  const res = mockRes();
  await checkout({
    method: 'POST',
    body: { eventId: 'dr-sal-gut-brain-2026', packageId: 'general-admission', customerName: 'Late Guest', customerEmail: 'late@example.com', agreedToTerms: true, waiverAccepted: true, mediaReleaseAccepted: true },
    headers: { host: 'roamsix.test', 'x-forwarded-proto': 'https' },
  }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(stripeCalled, false);
});

test('shared membership language matches the approved founding offer', async () => {
  const { EXTRA_COST_EXPLANATION, MEMBERSHIP_TIERS } = await import('../src/data/membership.js');
  assert.equal(MEMBERSHIP_TIERS.core.forWhom, 'For the person who is tired of evaluating every health claim alone.');
  assert.deepEqual(
    Object.values(MEMBERSHIP_TIERS).map(({ price, priceLabel }) => ({ price, priceLabel })),
    [
      { price: '$850', priceLabel: '$850 for the first year' },
      { price: '$2,200', priceLabel: '$2,200 for the first year' },
      { price: '$4,500', priceLabel: '$4,500 for the first year' },
    ],
  );
  assert.ok(MEMBERSHIP_TIERS.core.features.includes('36 gatherings in 2027: 18 fireside conversations, 18 movement and nature mornings'));
  assert.ok(MEMBERSHIP_TIERS.field.features.includes('4 small-group sessions with experts, capped for real conversation'));
  assert.ok(MEMBERSHIP_TIERS.journey.features.includes('Two expert introductions per year'));
  assert.match(EXTRA_COST_EXPLANATION, /^If offered, the larger member gathering is reserved separately and has its own ticket price\./);
});

test('public pricing is annual-only and uses the approved founding language', async () => {
  const [membership, checkout] = await Promise.all([
    readFile(new URL('../src/pages/MembershipPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/MembershipCheckoutPage.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(membership, /36 gatherings in 2027\. Expert conversations, movement mornings, and vetted experts across Southern California\./);
  assert.match(membership, /Join Core · \$850\/year/);
  assert.match(membership, /The rate you join at is the rate you keep\./);
  assert.doesNotMatch(membership, /per month|monthly|quarterly/i);
  assert.doesNotMatch(checkout, /membership-billing-choice/);
  assert.match(checkout, /name="renewalAccepted"/);
  assert.match(checkout, /I authorize ROAMSIX to charge \$850 today and \$850 each year on this date until I cancel\./);
  assert.match(checkout, /I accept the/);
  assert.match(checkout, /Start my Core membership · \$850/);
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
    assert.match(source, /October 24, 2026/i);
  }
  assert.match(experiences, /dr-sal-gut-brain-2026/);
  assert.doesNotMatch(experiences, /dr-sal-gut-brain-2027/);
  assert.match(home, /roamsix-outdoor-panel-bw-v1\.jpg/);
  assert.match(experiences, /roamsix-outdoor-panel-bw-v1\.jpg/);
  assert.match(home, /An intimate outdoor panel conversation with an audience\./);
  assert.match(experiences, /dr-sulaiman-bharwani-editorial-v1\.jpg/);
  assert.match(fieldwork, /roamsix-journey-mediterranean-v2\.jpg/);
  assert.match(dashboard, /OCTOBER 24, 2026 · SAN DIEGO COUNTY · 25 SEATS/);
  assert.match(dashboard, /Hold my seat · \$50/);
  assert.doesNotMatch(dashboard, /registration is not open|interest list/i);
});

test('Round 2 copy separates the homepage thesis from the membership offer', async () => {
  const [home, membership, membershipData, experiences, fieldwork, howItWorks] = await Promise.all([
    readFile(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/MembershipPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/membership.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/ExperiencesPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/FieldworkPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/HowItWorksPage.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(home, /An experiential health discovery membership/);
  assert.match(home, /SOUTHERN CALIFORNIA · 2027/);
  assert.match(home, /<h1>An experiential health discovery membership\.<\/h1>/);
  assert.doesNotMatch(home, /Health is too important to understand in fragments\./);
  assert.match(home, /Every month brings a new rule, a new supplement, and a new reason to worry\./);
  assert.match(home, /Across 36 gatherings in Southern California, ROAMSIX gives you a year with experts worth listening to/);
  assert.match(home, /<h2>What we are not<\/h2>/);
  assert.match(home, /Not a clinic\./);
  assert.match(home, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(home, /to="\/experiences#dr-sal">Dr\. Sulaiman Bharwani/);
  assert.doesNotMatch(home, /one coherent path/);
  assert.ok(home.indexOf('What we are not') < home.indexOf('OCTOBER 24, 2026'));
  assert.ok(home.indexOf('OCTOBER 24, 2026') < home.indexOf('Your path into ROAMSIX'));
  assert.ok(home.indexOf('For organizations') < home.indexOf('Find the right way in'));

  assert.match(membership, /We choose every expert and brief them ourselves\. No one pays to appear\./);
  assert.match(membership, /Each subject gets a full quarter\./);
  assert.match(membership, /The four subjects are set\. Nothing else is\./);
  assert.match(membershipData, /For the person with specific questions who wants time with the experts\./);
  assert.match(membershipData, /For the person who wants the experts working on their questions, not only answering them in a room\./);
  assert.match(experiences, /ROAMSIX events put carefully selected experts in rooms small enough to ask a question, follow up, and leave knowing what you want to look at next\./);
  assert.match(experiences, /Most members started with one evening\./);
  assert.match(experiences, /Hold my seat · \$50/);
  assert.doesNotMatch(experiences, /Tell me when registration opens|Registration is not open yet|Joining the interest list does not reserve a place|Confirmed so far/i);
  assert.match(experiences, /id="dr-sal"/);

  assert.match(fieldwork, /<h2>Four subjects, one system<\/h2>/);
  assert.match(fieldwork, /The year follows all four because that is how your body works\./);
  assert.doesNotMatch(fieldwork, /Why follow more than one theme/);
  assert.match(fieldwork, /<h2>The year ends somewhere else\.<\/h2>/);
  assert.match(howItWorks, /<h2>Most people start with one evening<\/h2>/);
  assert.match(howItWorks, /Hear nuanced perspectives that help separate useful evidence from noise and oversimplification\./);
  assert.match(howItWorks, />See membership<\/Link>/);
  assert.match(howItWorks, />See the next event<\/Link>/);
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
    if (value.includes('tblBenefits?')) return response({ records: [{ id: 'rec_benefit', fields: { Benefit: 'Private studio introduction', Partner: 'Example Studio', Status: 'Confirmed', 'Member Visible': true, 'Eligible Tiers': 'Journey', 'Exact Offer': 'One confirmed introductory session', 'Retail Value Label': '$125 stated partner value', 'Redemption Instructions': 'Use the secure partner link.', 'Redemption URL': 'https://partner.example/redeem', 'ROAMSIX Cost': 25 } }] });
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
  assert.equal(res.body.benefits.length, 1);
  assert.equal(res.body.benefits[0].title, 'Private studio introduction');
  assert.equal(res.body.benefits[0]['ROAMSIX Cost'], undefined);
});

test('member-benefit publishing gates exclude hypothetical, inactive, and wrong-tier offers', async () => {
  const { visibleBenefitFromRecord } = await import('../lib/member-benefits.js');
  const now = new Date('2027-06-01T12:00:00.000Z');
  const fields = {
    Benefit: 'Confirmed assessment',
    Partner: 'Example Partner',
    Status: 'Confirmed',
    'Member Visible': true,
    'Publicly Listed': true,
    'Eligible Tiers': 'Field, Journey',
    'Exact Offer': 'One assessment',
    'Retail Value': 200,
    'Retail Value Label': '$200 stated partner value',
    'Approved Website Language': 'A confirmed assessment with clearly stated terms.',
    'Partner Logo URL': 'https://partner.example/logo.png',
    'Redemption URL': 'https://partner.example/redeem',
    'ROAMSIX Cost': 75,
    'Member Data Handling': 'Internal only',
    'Starts At': '2027-01-01T00:00:00.000Z',
    'Expires At': '2027-12-31T23:59:59.000Z',
  };
  const fieldBenefit = visibleBenefitFromRecord({ id: 'rec_confirmed', fields }, { tier: 'Field', now });
  assert.equal(fieldBenefit.title, 'Confirmed assessment');
  assert.equal(fieldBenefit.redemptionUrl, 'https://partner.example/redeem');
  assert.equal(fieldBenefit['ROAMSIX Cost'], undefined);
  assert.equal(fieldBenefit['Member Data Handling'], undefined);
  assert.equal(visibleBenefitFromRecord({ id: 'rec_core', fields }, { tier: 'Core', now }), null);
  assert.equal(visibleBenefitFromRecord({ id: 'rec_draft', fields: { ...fields, Status: 'Negotiating' } }, { tier: 'Field', now }), null);
  assert.equal(visibleBenefitFromRecord({ id: 'rec_future', fields: { ...fields, 'Starts At': '2028-01-01T00:00:00.000Z' } }, { tier: 'Field', now }), null);
  assert.equal(visibleBenefitFromRecord({ id: 'rec_hidden', fields: { ...fields, 'Publicly Listed': false } }, { audience: 'public', now }), null);
  const publicBenefit = visibleBenefitFromRecord({ id: 'rec_public', fields: { ...fields, 'Redemption URL': 'http://unsafe.example/redeem' } }, { audience: 'public', now });
  assert.equal(publicBenefit.redemptionUrl, undefined);
  assert.equal(publicBenefit['ROAMSIX Cost'], undefined);
});

test('public member-benefit endpoint returns confirmed public fields only', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('tblBenefits?')) return response({ records: [
      { id: 'rec_public', fields: { Benefit: 'Partner trial', Status: 'Confirmed', 'Publicly Listed': true, 'Eligible Tiers': 'Core, Field, Journey', 'Exact Offer': 'A confirmed introductory trial', 'Approved Website Language': 'Try a confirmed partner experience with clearly stated terms.', 'ROAMSIX Cost': 10 } },
      { id: 'rec_draft', fields: { Benefit: 'Possible gift box', Status: 'Negotiating', 'Publicly Listed': true, 'Eligible Tiers': 'Journey' } },
    ] });
    throw new Error(`Unexpected URL ${url}`);
  };
  const { default: benefitsApi } = await import('../api/member-benefits.js');
  const res = mockRes();
  await benefitsApi({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.benefits.length, 1);
  assert.equal(res.body.benefits[0].title, 'Partner trial');
  assert.equal(res.body.benefits[0]['ROAMSIX Cost'], undefined);
  assert.match(res.headers['Cache-Control'], /s-maxage=300/);
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
