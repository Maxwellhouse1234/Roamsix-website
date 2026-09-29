import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { PublicMembershipBenefits } from '../components/MemberBenefits';
import MembershipRequestForm from '../components/MembershipRequestForm';
import { EXTRA_COST_EXPLANATION, GUEST_PASS_DEFINITION, MEMBERSHIP_TIERS } from '../data/membership';

function FoundingOffer() {
  return <div className="founding-offer">
    <p className="eyebrow">Founding membership · Closes December 31</p>
    <h2>The rate you join at is the rate you keep.</h2>
    <p>ROAMSIX opens in 2027 with 36 gatherings across four subjects. Founding members join before that year begins and hold their rate for as long as their membership stays active.</p>
    <p>The four subjects are set. Nothing else is. Founding members help choose the experts, the venues, and the questions we put to them.</p>
    <p>Core is $850 for founding members. It becomes $1,100 in 2027.</p>
    <div className="button-row"><Link className="button button-accent" to="/membership/checkout/core">Join Core · $850/year</Link><a className="text-link" href="#request-membership">Talk it through first</a></div>
  </div>;
}

export default function MembershipPage() {
  const [requestedTier, setRequestedTier] = useState('Field');

  function requestTier(tier) {
    setRequestedTier(tier);
    window.requestAnimationFrame(() => document.querySelector('#request-membership')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return <SiteLayout theme="dark">
    <section className="membership-hero"><div className="container membership-hero-copy">
      <h1>Membership</h1>
      <p className="page-lead"><strong>36 gatherings in 2027. Expert conversations, movement mornings, and vetted experts across Southern California.</strong></p>
      <div className="button-row"><Link className="button button-accent" to="/membership/checkout/core">Join Core · $850/year</Link><Link className="text-link light" to="/events">See the 2027 program</Link></div>
    </div></section>

    <section className="section light-section membership-pricing-section" id="pricing"><div className="container">
      <div className="membership-value-intro"><h2>Why this exists</h2><div>
        <p className="lead">Health information is not scarce. Usable health information is. Most people managing their own health are evaluating every claim alone, with no way to tell a real finding from a marketing cycle.</p>
        <p><strong>We do the filtering.</strong> We choose every expert and brief them ourselves. No one pays to appear.</p>
        <p><strong>Each subject gets a full quarter.</strong> Gut health, sleep and recovery, focus and resilience, strength and longevity. Three months each, not one talk and a newsletter.</p>
        <p><strong>Rooms cap at 25 to 40 people.</strong> You get to ask.</p>
      </div></div>

      <FoundingOffer />

      <div className="membership-tier-grid">{Object.entries(MEMBERSHIP_TIERS).map(([key, item]) => <article className={key === 'field' ? 'featured' : ''} key={key}>
        <h3>{item.name} · {item.priceLabel}</h3>
        <p className="tier-audience"><strong>{item.forWhom}</strong></p>
        {item.includes ? <p><strong>{item.includes}</strong></p> : null}
        <ul className="tier-feature-list">{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        {key === 'core' ? <Link className="button button-accent" to="/membership/checkout/core">{item.cta}</Link> : <button className={`button ${key === 'field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => requestTier(item.name)}>{item.cta}</button>}
        {item.note ? <p className="tier-note">{item.note}</p> : null}
      </article>)}</div>
    </div></section>

    <PublicMembershipBenefits />

    <section className="section ink-section" id="request-membership"><div className="container membership-checkout-layout"><div className="membership-offer"><p className="eyebrow">Field and Journey</p><h2>Tell us where you are</h2><div className="button-row"><button className={`button ${requestedTier === 'Field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Field')}>Field</button><button className={`button ${requestedTier === 'Journey' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Journey')}>Journey</button></div></div><MembershipRequestForm key={requestedTier} tier={requestedTier} /></div></section>

    <section className="section light-section"><div className="container faq"><p className="eyebrow">Before you join</p><h2>Practical details.</h2>
      <details><summary>Can I attend all 36?</summary><p>Every gathering is included at no extra cost. You get access and booking priority, not a reserved seat at each one. Most cap at 25 to 40 people because smaller rooms make better conversations, and Field and Journey members book first. Your guest passes let you bring the people you would want there with you.</p></details>
      <details><summary>Why join before every experience is announced?</summary><p>Membership gives you access to the developing ROAMSIX calendar, vetted learning, member benefits, and the booking privileges included with your tier. New dates are released throughout the year, and you decide which subjects and formats are relevant to you.</p></details>
      <details><summary>What does a guest pass cover?</summary><p>{GUEST_PASS_DEFINITION} Guest passes do not include a larger member gathering, Journey travel, or a separately charged partner-hosted experience.</p></details>
      <details><summary>Which experiences have their own price?</summary><p>{EXTRA_COST_EXPLANATION}</p></details>
      <details><summary>Is expert access medical care?</summary><p>No. ROAMSIX offers educational and experiential programming, not diagnosis, treatment, clinical monitoring, or individualized medical advice.</p></details>
      <details><summary>How do I manage renewal or cancel?</summary><p>Your annual charge is collected when you complete secure Stripe checkout and renews each year until you cancel. You can manage billing through the secure member area or email info@roamsix.com before your next renewal. Cancellation takes effect at the end of the paid membership period.</p></details>
    </div></section>
  </SiteLayout>;
}
