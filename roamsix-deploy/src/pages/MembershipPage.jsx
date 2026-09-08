import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';

const PLANS = {
  monthly: { name: 'Monthly', price: '$60', cadence: 'per month', annual: '$720 per year' },
  quarterly: { name: 'Quarterly', price: '$165', cadence: 'every three months', annual: '$660 per year' },
  annual: { name: 'Annual', price: '$600', cadence: 'per year', annual: '$50 per month equivalent' },
};

const YEAR_VALUE = [
  ['Weekly expert conversations', 'Up to 40 included', '$35 each · up to $1,400'],
  ['One ROAMSIX dinner', 'One admission included', '$175 value'],
  ['ROAMSIX learning days', '15% member savings', 'Published individually'],
  ['Quarterly retreats', '15% member savings', 'Published individually'],
  ['Year-end journey', '15% member savings', 'Published individually'],
  ['Family invitations', 'Early access and select member offers', 'Available experiences vary'],
];

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
    <section className="membership-hero"><div className="container membership-hero-copy"><p className="eyebrow">2027 founding membership · limited to 100 members</p><h1>Build a year around the health, knowledge, and people that help you live and perform better.</h1><p className="page-lead">A year-long curriculum led by scientists, physicians, practitioners, coaches, chefs, farmers, and other experts selected for the subject at hand.</p><a className="button button-accent" href="#year-included">See what your year includes</a></div></section>

    <section className="membership-proof-band"><div className="container"><span>Up to 40 expert conversations</span><span>One dinner included</span><span>15% savings on select experiences</span></div></section>

    <section className="section light-section" id="year-included"><div className="container membership-value-intro"><p className="eyebrow">Your 2027 membership</p><div><h2>Keep learning, applying, and connecting throughout the year.</h2><p className="lead">Each subject is explored through several credible perspectives, then connected to decisions and practices you can use. If 2027 is the year you want to change how you experience life, ROAMSIX gives that intention a structure.</p></div></div><div className="container membership-value-summary"><div><span>Included annual value</span><strong>$1,575</strong><p>Up to 40 expert conversations and one ROAMSIX dinner.</p></div><div><span>Plus</span><strong>15% savings</strong><p>On ROAMSIX learning days, quarterly retreats, and the year-end journey.</p></div></div><div className="container membership-inclusions" aria-label="2027 membership value"><div className="membership-inclusions-head"><span>Experience</span><span>Member benefit</span><span>Standalone value</span></div>{YEAR_VALUE.map(([experience,benefit,value]) => <div className="membership-inclusions-row" key={experience}><strong>{experience}</strong><span>{benefit}</span><span>{value}</span></div>)}</div><div className="container membership-value-footer"><p className="membership-value-note">The $1,575 figure counts only the included talks and dinner. Learning days, retreats, journeys, and family offers are priced separately, so their savings are additional.</p><a className="button button-accent" href="#pricing">See membership price</a></div></section>

    <section className="section fog-section membership-pricing-section" id="pricing"><div className="container"><p className="eyebrow">Join the 2027 founding membership</p><h2>One membership. Three ways to pay.</h2><p className="section-intro">All plans include the same year. Membership begins January 11, 2027 and renews automatically on the schedule you choose until you cancel.</p><div className="membership-pricing-grid">{Object.entries(PLANS).map(([key,item]) => <article className={key === 'annual' ? 'featured' : ''} key={key}>{key === 'annual' ? <span className="pricing-badge">Save $120</span> : null}<h3>{item.name}</h3><strong>{item.price}</strong><p>{item.cadence}</p><small>{item.annual}</small><button className={`button ${key === 'annual' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => selectPlan(key)}>Choose {item.name.toLowerCase()}</button></article>)}</div></div></section>

    <section className="section ink-section" id="join"><div className="container membership-checkout-layout"><div className="membership-offer"><p className="eyebrow">Limited to 100 founding members</p><h2>{plan.price} {plan.cadence}.</h2><p>Reserve your place now. No charge is made today. Your first charge will be January 11, 2027, when membership begins.</p><p>You may cancel at no cost before January 11. After membership begins, cancel any time before your next renewal to stop future charges.</p></div><form className="membership-checkout-form" onSubmit={checkout}><p className="eyebrow">Continue with {plan.name.toLowerCase()} billing</p><label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label><label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label><label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I authorize ROAMSIX to charge {plan.price} {plan.cadence} beginning January 11, 2027. It will renew automatically at that price and frequency until I cancel. I can cancel online before the next charge. I agree to the <Link to="/terms">Membership Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label><label className="check"><input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={change} /><span>Send me optional ROAMSIX news and invitations. Membership service emails are sent regardless of this choice.</span></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Opening secure checkout…' : `Reserve with ${plan.name.toLowerCase()} billing`}</button><p className="form-note">Secure checkout by Stripe. No charge is made today.</p></form></div></section>

    <section className="section light-section"><div className="container faq"><p className="eyebrow">Membership questions</p><h2>Before you join.</h2><details><summary>When does membership and billing begin?</summary><p>Membership begins January 11, 2027. Your payment method is collected when you reserve, but your first charge is not made until January 11.</p></details><details><summary>Does membership renew automatically?</summary><p>Yes. It renews monthly, every three months, or annually according to your selection until you cancel. We will send required renewal notices and reminders.</p></details><details><summary>How do I cancel?</summary><p>You may cancel online at any time before your next charge through membership billing management. You may also email <a href="mailto:info@roamsix.com?subject=Cancel%20ROAMSIX%20membership">info@roamsix.com</a>.</p></details><details><summary>What is included?</summary><p>Membership includes up to 40 expert conversations and one ROAMSIX dinner. Members also save 15% on ROAMSIX learning days, quarterly retreats, and the year-end journey, with early access and select offers for family experiences. Travel and lodging are separate.</p></details></div></section>
  </SiteLayout>;
}
