const PLANS = {
  [process.env.STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID]: { amount: '$60', frequency: 'monthly' },
  [process.env.STRIPE_MEMBERSHIP_QUARTERLY_PRICE_ID]: { amount: '$165', frequency: 'every three months' },
  [process.env.STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID]: { amount: '$600', frequency: 'annually' },
};

async function stripe(path, options = {}) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { ...options, headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Stripe ${response.status}`);
  return data;
}

function anniversaryNoticeDue(anchor, now) {
  const anniversary = new Date(now);
  anniversary.setUTCMonth(new Date(anchor * 1000).getUTCMonth(), new Date(anchor * 1000).getUTCDate());
  if (anniversary < now) anniversary.setUTCFullYear(anniversary.getUTCFullYear() + 1);
  const days = (anniversary - now) / 86400000;
  return days >= 29 && days < 30;
}

async function sendReminder(subscription, plan) {
  const customer = subscription.customer || {};
  if (!customer.email) return false;
  const portal = process.env.STRIPE_CUSTOMER_PORTAL_URL || 'https://www.roamsix.com/membership/manage';
  const html = `<p>Your ROAMSIX membership renews automatically at ${plan.amount} ${plan.frequency} until canceled.</p><p>You can review, manage, or cancel your membership online before your next charge: <a href="${portal}">${portal}</a>.</p><p>Questions? Email info@roamsix.com.</p>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `membership-annual-reminder-${subscription.id}-${new Date().getUTCFullYear()}` }, body: JSON.stringify({ from: 'ROAMSIX <info@roamsix.com>', to: [customer.email], subject: 'Your ROAMSIX membership renewal terms', html }) });
  if (!response.ok) throw new Error(`Resend ${response.status}`);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Membership reminders are not configured' });
  try {
    const params = new URLSearchParams({ status: 'active', limit: '100' }); params.append('expand[]', 'data.customer');
    const subscriptions = await stripe(`subscriptions?${params}`);
    const now = new Date(); let sent = 0;
    for (const subscription of subscriptions.data || []) {
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const plan = PLANS[priceId];
      const anchor = subscription.billing_cycle_anchor || subscription.created;
      if (!plan || subscription.metadata?.lastAnnualReminderYear === String(now.getUTCFullYear()) || !anniversaryNoticeDue(anchor, now)) continue;
      if (await sendReminder(subscription, plan)) {
        const metadata = new URLSearchParams(); metadata.set('metadata[lastAnnualReminderYear]', String(now.getUTCFullYear()));
        await stripe(`subscriptions/${subscription.id}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: metadata.toString() }); sent += 1;
      }
    }
    return res.status(200).json({ checked: (subscriptions.data || []).length, sent });
  } catch (error) { console.error('Membership compliance cron failed:', error.message); return res.status(500).json({ error: 'Membership reminder automation failed' }); }
}
