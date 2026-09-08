const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEMBERSHIP_CAP = Number(process.env.MEMBERSHIP_CAP || 100);
const ACTIVATION_UNIX = Number(process.env.MEMBERSHIP_ACTIVATION_UNIX || 1799686800);
const LEGAL_VERSION = 'ROAMSIX_MEMBERSHIP_TERMS_V3_2026-09-08';
const PLANS = {
  monthly: { env: 'STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID', amount: '$60', frequency: 'monthly' },
  quarterly: { env: 'STRIPE_MEMBERSHIP_QUARTERLY_PRICE_ID', amount: '$165', frequency: 'every three months' },
  annual: { env: 'STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID', amount: '$600', frequency: 'annually' },
};

async function stripeRequest(path, secret, params) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method: params ? 'POST' : 'GET', headers: { Authorization: `Bearer ${secret}`, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) }, body: params?.toString() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Stripe request failed (${response.status})`);
  return data;
}

async function membershipCount(secret, priceIds) {
  const params = new URLSearchParams({ status: 'all', limit: '100' });
  const data = await stripeRequest(`subscriptions?${params}`, secret);
  return (data.data || []).filter((subscription) => ['trialing', 'active', 'past_due', 'unpaid'].includes(subscription.status) && subscription.items?.data?.some((item) => priceIds.includes(item.price?.id))).length;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const name = String(req.body?.name || '').trim().slice(0, 200);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 320);
  const billingCycle = String(req.body?.billingCycle || 'annual');
  const plan = PLANS[billingCycle];
  const termsAccepted = req.body?.termsAccepted === true;
  const emailConsent = req.body?.emailConsent === true;
  const acceptedAt = String(req.body?.acceptedAt || new Date().toISOString()).slice(0, 100);
  if (!name || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide your name and a valid email address.' });
  if (!plan) return res.status(400).json({ error: 'Please select a valid payment schedule.' });
  if (!termsAccepted) return res.status(400).json({ error: 'Please review and accept the recurring membership terms.' });
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[plan.env];
  const priceIds = Object.values(PLANS).map((item) => process.env[item.env]).filter(Boolean);
  if (!secret || !priceId || priceIds.length !== 3) return res.status(503).json({ error: 'Membership billing is not available yet.' });

  try {
    if (await membershipCount(secret, priceIds) >= MEMBERSHIP_CAP) return res.status(409).json({ error: 'The founding membership is currently full.' });
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'roamsix.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;
    const params = new URLSearchParams();
    params.set('mode', 'subscription'); params.set('customer_email', email); params.set('payment_method_collection', 'always');
    params.set('success_url', `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`); params.set('cancel_url', `${origin}/membership#join`);
    params.set('line_items[0][price]', priceId); params.set('line_items[0][quantity]', '1');
    params.set('subscription_data[trial_end]', String(ACTIVATION_UNIX));
    params.set('integration_identifier', 'roamsix_membership_qvmtxkpa');
    const metadata = { purchaseType: 'foundingMembership', membershipYear: '2027', billingCycle, billingAmount: plan.amount, billingFrequency: plan.frequency, customerName: name, emailConsent: emailConsent ? 'true' : 'false', acceptedLegalVersion: LEGAL_VERSION, acceptedAt, agreedToTerms: 'true', automaticRenewalConsent: 'true' };
    Object.entries(metadata).forEach(([key, value]) => { params.set(`metadata[${key}]`, value); params.set(`subscription_data[metadata][${key}]`, value); });
    const data = await stripeRequest('checkout/sessions', secret, params);
    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Membership checkout failed:', error.message);
    return res.status(500).json({ error: 'We could not open secure checkout.' });
  }
}
