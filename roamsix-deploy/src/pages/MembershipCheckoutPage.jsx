import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { MEMBERSHIP_TIERS } from '../data/membership';
import { trackEvent } from '../lib/analytics';
import MembershipRequestForm from '../components/MembershipRequestForm';

export default function MembershipCheckoutPage() {
  const { tier: tierKey } = useParams();
  const [searchParams] = useSearchParams();
  const tier = MEMBERSHIP_TIERS[tierKey];
  const invite = searchParams.get('invite') || '';
  const requestedBilling = searchParams.get('billing') === 'annual' ? 'annual' : 'monthly';
  const [billingCycle, setBillingCycle] = useState(requestedBilling);
  const [form, setForm] = useState({ name: '', email: '', renewalAccepted: false, termsAccepted: false, emailConsent: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(tierKey === 'core' ? 'approved' : 'checking');
  const [cohortFull, setCohortFull] = useState(null);

  useEffect(() => {
    if (tierKey === 'core') {
      setInvitation('approved');
      return undefined;
    }
    if (!invite) {
      setInvitation('denied');
      return undefined;
    }
    const controller = new AbortController();
    setInvitation('checking');
    fetch(`/api/create-membership-checkout?tier=${encodeURIComponent(tierKey)}&invite=${encodeURIComponent(invite)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.authorized || !data.email) throw new Error(data.error || 'Invitation could not be verified.');
        setForm((current) => ({ ...current, email: data.email }));
        setInvitation('approved');
      })
      .catch((invitationError) => {
        if (invitationError.name !== 'AbortError') setInvitation('denied');
      });
    return () => controller.abort();
  }, [invite, tierKey]);

  if (!tier) return <Navigate to="/membership" replace />;

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function checkout(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/create-membership-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier: tierKey, invite, billingCycle, acceptedAt: new Date().toISOString() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409 && data.code === 'COHORT_FULL') {
        setCohortFull(data);
        setStatus('idle');
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout could not be started.');
      trackEvent('membership_checkout_start', { membership_billing: billingCycle, membership_tier: tier.name });
      window.location.href = data.url;
    } catch (checkoutError) {
      setStatus('error');
      setError(`${checkoutError.message} Please try again or email info@roamsix.com.`);
    }
  }

  if (tierKey !== 'core' && invitation !== 'approved') return <SiteLayout theme="dark">
    <section className="section ink-section"><div className="container narrow membership-access-state">
      <p className="eyebrow">{invitation === 'checking' ? 'Checking invitation' : `${tier.name} membership`}</p>
      <h1>{invitation === 'checking' ? 'Confirming your approved membership invitation.' : `${tier.name} membership begins with a conversation.`}</h1>
      <p>{invitation === 'checking' ? 'This will only take a moment.' : 'This checkout is available only through a signed invitation tied to an approved applicant and membership tier. Request membership and we will follow up personally.'}</p>
      {invitation === 'denied' ? <Link className="button button-accent" to="/membership#request-membership">Request {tier.name} membership</Link> : null}
    </div></section>
  </SiteLayout>;

  if (cohortFull) return <SiteLayout theme="dark">
    <section className="section ink-section"><div className="container membership-checkout-layout">
      <div className="membership-offer"><p className="eyebrow">{cohortFull.cohortLabel}</p><h1>This membership cohort is full.</h1><p>Membership opens in small cohorts of up to 25 to keep participation personal and meaningful. Add your name for the next cohort and we will contact you when enrollment opens.</p><p>Joining this list does not reserve a place or require payment.</p><Link className="text-link light" to="/membership">Review membership details <span aria-hidden="true">→</span></Link></div>
      <MembershipRequestForm tier={tier.name} mode="cohort-waitlist" />
    </div></section>
  </SiteLayout>;

  const selectedPlan = billingCycle === 'monthly'
    ? { price: tier.monthlyEquivalent, label: `${tier.monthlyEquivalent} per month`, frequency: 'monthly' }
    : { price: tier.price, label: `${tier.price} per year`, frequency: 'annually' };

  return <SiteLayout theme="dark">
    <section className="section ink-section"><div className="container membership-checkout-layout">
      <div className="membership-offer"><p className="eyebrow">{tier.name} membership</p><h1>{selectedPlan.label}.</h1>
        <p>You are one step away from a more considered way to learn, ask better questions, and choose what deserves your attention.</p>
        <div className="membership-checkout-steps" aria-label="Membership enrollment steps"><span><strong>01</strong> Choose your membership</span><span className="active"><strong>02</strong> Review and agree</span><span><strong>03</strong> Secure payment</span></div>
        <ul className="membership-checkout-preview">{tier.features.slice(0, 3).map((feature) => <li key={feature.title}><strong>{feature.title}</strong><span>{feature.copy}</span></li>)}</ul>
        <img className="membership-checkout-image" src="/images/homepage/roamsix-outdoor-panel-bw-v1.jpg" alt="An intimate ROAMSIX outdoor panel and audience." />
        <div className="membership-billing-choice" role="group" aria-label="Billing frequency">
          <button className={`button ${billingCycle === 'monthly' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setBillingCycle('monthly')}>{tier.monthlyEquivalent} monthly</button>
          <button className={`button ${billingCycle === 'annual' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setBillingCycle('annual')}>{tier.price} annually</button>
        </div>
        <p className="form-note">{tier.annualSavings}. You can review or cancel either option through secure billing management.</p>
        {tierKey !== 'core' ? <p>This checkout is for applicants who have been invited to complete {tier.name} membership.</p> : null}
        <Link className="text-link light" to="/membership">Review membership details <span aria-hidden="true">→</span></Link>
      </div>
      <form className="membership-checkout-form" onSubmit={checkout}>
        <p className="eyebrow">Continue with {tier.name}</p>
        <label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label>
        <label>{tierKey === 'core' ? 'Email' : 'Approved email'}<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" readOnly={tierKey !== 'core'} required /></label>
        <div className="membership-agreement-summary"><strong>Before you continue</strong><ul><li>Your membership renews at the selected price and interval until you cancel.</li><li>You can cancel online or by email before your next renewal.</li><li>Some events, travel, and premium experiences have a separate price.</li><li>Programming, dates, experts, and benefits may evolve as explained in the Membership Terms.</li><li>ROAMSIX is educational and experiential. It is not medical care.</li></ul></div>
        <label className="check"><input type="checkbox" name="renewalAccepted" checked={form.renewalAccepted} onChange={change} required /><span>I authorize ROAMSIX to charge {selectedPlan.price} now and {selectedPlan.frequency} until I cancel. I can cancel online at <Link to="/membership/manage">roamsix.com/membership/manage</Link> or by emailing info@roamsix.com before my next renewal.</span></label>
        <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I have reviewed and agree to the <Link to="/terms" target="_blank">Membership Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>. The event-specific <Link to="/waiver" target="_blank">Participant Agreement</Link> and <Link to="/media-release" target="_blank">Media Release</Link> will be presented separately before I participate in an event.</span></label>
        <label className="check"><input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={change} /><span>Send me optional ROAMSIX news and invitations. Essential membership messages are sent regardless of this choice.</span></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Opening secure payment…' : `Start my ${tier.name} membership · ${selectedPlan.label}`}</button>
        <p className="form-note">We will email you a secure link to continue if you leave before paying. No membership begins and no charge is made until Stripe confirms payment.</p>
      </form>
    </div></section>
  </SiteLayout>;
}
