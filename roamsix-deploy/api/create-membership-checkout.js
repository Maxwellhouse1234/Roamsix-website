const MEMBERSHIP_PRICE_ID = 'price_1UD96YLgUPmdquZoSQufMpuI';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const name = String(req.body?.name || '').trim().slice(0, 200);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 320);
  const termsAccepted = req.body?.termsAccepted === true;
  const emailConsent = req.body?.emailConsent === true;
  const acceptedAt = String(req.body?.acceptedAt || '').trim().slice(0, 100);

  if (!name || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide your name and a valid email address.' });
  if (!termsAccepted) return res.status(400).json({ error: 'Please review and accept the membership terms.' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe is not configured yet.' });

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'roamsix.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('customer_email', email);
  params.set('customer_creation', 'always');
  params.set('success_url', `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${origin}/membership#join`);
  params.set('line_items[0][price]', MEMBERSHIP_PRICE_ID);
  params.set('line_items[0][quantity]', '1');
  params.set('integration_identifier', 'roamsix_membership_qvmtxkpa');
  params.set('metadata[purchaseType]', 'foundingMembership');
  params.set('metadata[membershipYear]', '2027');
  params.set('metadata[customerName]', name);
  params.set('metadata[emailConsent]', emailConsent ? 'true' : 'false');
  params.set('metadata[acceptedLegalVersion]', 'ROAMSIX_MEMBERSHIP_TERMS_V1_2026-09-07');
  params.set('metadata[acceptedAt]', acceptedAt || new Date().toISOString());
  params.set('metadata[agreedToTerms]', 'true');

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await stripeResponse.json().catch(() => ({}));
    if (!stripeResponse.ok || !data.url) {
      console.error('Membership Stripe error:', data?.error?.message || stripeResponse.status);
      return res.status(400).json({ error: data?.error?.message || 'Checkout could not be started.' });
    }
    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Membership checkout failed:', error?.message || 'unknown error');
    return res.status(500).json({ error: 'We could not connect to secure checkout.' });
  }
}
