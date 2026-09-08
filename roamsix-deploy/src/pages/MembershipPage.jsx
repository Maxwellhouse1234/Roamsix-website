import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';

const PLANS = {
  monthly: { name: 'Monthly', price: '$60', cadence: 'per month', annual: '$720 per year' },
  quarterly: { name: 'Quarterly', price: '$165', cadence: 'every three months', annual: '$660 per year' },
  annual: { name: 'Annual', price: '$600', cadence: 'per year', annual: '$50 per month equivalent' },
};

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState('annual');
  const [form, setForm] = useState({ name: '', email: '', termsAccepted: false, emailConsent: false });
  const [status, setStatus] = useState('idle'); const [error, setError] = useState('');
  const plan = PLANS[billingCycle];
  function change(event) { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); }
  function selectPlan(key) { setBillingCycle(key); document.querySelector('#join')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  async function checkout(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    try {
      const response = await fetch('/api/create-membership-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, billingCycle, acceptedAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => ({})); if (!response.ok || !data.url) throw new Error(data.error || 'Checkout could not be started.');
      trackEvent('membership_checkout_start', { membership_year: '2027', billing_cycle: billingCycle }); window.location.href = data.url;
    } catch (checkoutError) { setStatus('error'); setError(`${checkoutError.message} Please try again or email info@roamsix.com.`); }
  }

  return <SiteLayout theme="dark">
    <section className="membership-hero"><div className="container membership-hero-copy"><p className="eyebrow">2027 founding membership · limited to 100 members</p><h1>Build a year around the health, knowledge, and people that help you live and perform better.</h1><p className="page-lead">Weekly expert conversations, a cross-disciplinary community, and priority access to ROAMSIX experiences.</p><a className="button button-accent" href="#pricing">Compare payment options</a></div></section>

    <section className="membership-proof-band"><div className="container"><span>Weekly expert conversations</span><span>Cross-disciplinary community</span><span>Priority access to experiences</span></div></section>

    <section className="section light-section"><div className="container membership-value-intro"><p className="eyebrow">What membership changes</p><div><h2>Put useful knowledge into practice with people who are doing the same.</h2><p className="lead">Membership gives health, performance, and personal growth a regular place in your year.</p></div></div><div className="container membership-benefits"><article><span>01</span><h3>Learn directly from experts</h3><p>Explore health, longevity, nutrition, movement, recovery, and performance in weekly conversations.</p></article><article><span>02</span><h3>Apply what you learn</h3><p>Turn credible guidance into decisions and practices that work in daily life.</p></article><article><span>03</span><h3>Meet beyond your usual circle</h3><p>Build relationships across business, science, medicine, practice, and craft.</p></article><article><span>04</span><h3>Access experiences earlier</h3><p>Receive priority invitations to selected dinners, learning days, and retreats.</p></article></div></section>

    <section className="section fog-section membership-pricing-section" id="pricing"><div className="container"><p className="eyebrow">One membership · three ways to pay</p><h2>Choose your payment schedule.</h2><p className="section-intro">Every option includes the same membership. Membership begins when the 2027 program activates and renews automatically on the schedule you choose until you cancel.</p><div className="membership-pricing-grid">{Object.entries(PLANS).map(([key,item]) => <article className={key === 'annual' ? 'featured' : ''} key={key}>{key === 'annual' ? <span className="pricing-badge">Lowest annual price</span> : null}<h3>{item.name}</h3><strong>{item.price}</strong><p>{item.cadence}</p><small>{item.annual}</small><button className={`button ${key === 'annual' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => selectPlan(key)}>Choose {item.name.toLowerCase()}</button></article>)}</div></div></section>

    <section className="section ink-section" id="join"><div className="container membership-checkout-layout"><div className="membership-offer"><p className="eyebrow">Reserve one of 100 memberships</p><h2>{plan.price} {plan.cadence}.</h2><p>No charge today. Your first charge occurs when the membership activates, no later than March 31, 2027. You may cancel before activation at no cost.</p><p>Dinners, learning days, retreats, travel, and lodging are separately priced unless an offer states otherwise.</p></div><form className="membership-checkout-form" onSubmit={checkout}><p className="eyebrow">Continue with {plan.name.toLowerCase()} billing</p><label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label><label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label><label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I authorize ROAMSIX to charge {plan.price} {plan.cadence} beginning when membership activates. It will renew automatically at that price and frequency until I cancel. I can cancel online before the next charge. I agree to the <Link to="/terms">Membership Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label><label className="check"><input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={change} /><span>Send me optional ROAMSIX news and invitations. Membership service emails are sent regardless of this choice.</span></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Opening secure checkout…' : `Reserve with ${plan.name.toLowerCase()} billing`}</button><p className="form-note">Secure checkout by Stripe. No charge is made today.</p></form></div></section>

    <section className="section light-section"><div className="container faq"><p className="eyebrow">Membership questions</p><h2>Before you join.</h2><details><summary>When does billing begin?</summary><p>Your payment method is collected now. Billing begins when the membership activates, no later than March 31, 2027. We will confirm the activation date before the first charge.</p></details><details><summary>Does membership renew automatically?</summary><p>Yes. It renews monthly, every three months, or annually according to your selection until you cancel. We will send required renewal notices and reminders.</p></details><details><summary>How do I cancel?</summary><p>You may cancel online at any time before your next charge through membership billing management. You may also email <a href="mailto:info@roamsix.com?subject=Cancel%20ROAMSIX%20membership">info@roamsix.com</a>.</p></details><details><summary>What if the membership does not launch?</summary><p>If ROAMSIX does not activate the membership by March 31, 2027, no membership fee will be charged.</p></details><details><summary>Are dinners and retreats included?</summary><p>No. Ticketed experiences, travel, and lodging are separately priced unless a specific offer says otherwise. Members receive priority access to selected experiences.</p></details></div></section>
  </SiteLayout>;
}
