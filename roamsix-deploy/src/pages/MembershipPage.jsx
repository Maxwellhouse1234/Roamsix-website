import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import MembershipRequestForm from '../components/MembershipRequestForm';
import { EXTRA_COST_EXPLANATION, GUEST_PASS_DEFINITION, MEMBERSHIP_TIERS } from '../data/membership';

export default function MembershipPage() {
  const [requestedTier, setRequestedTier] = useState('Field');

  function requestTier(tier) {
    setRequestedTier(tier);
    window.requestAnimationFrame(() => document.querySelector('#request-membership')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return <SiteLayout theme="dark">
    <section className="membership-hero"><div className="container membership-hero-copy">
      <p className="eyebrow">ROAMSIX membership</p><h1>A clearer way to decide what matters for your health, and what to do next.</h1>
      <p className="page-lead">ROAMSIX turns scattered health information into a coherent path through vetted expertise, practical learning, immersive experiences, and trusted ways to understand your own starting point.</p>
      <div className="button-row"><a className="button button-accent" href="#pricing">Explore membership</a><Link className="text-link light" to="/member/login">Member sign in <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section light-section"><div className="container membership-value-intro"><p className="eyebrow">Why membership</p><div><h2>Stop piecing together your health from disconnected advice.</h2><p className="lead">ROAMSIX brings research, clinical perspective, specialist knowledge, practical education, and immersive experience into one considered approach.</p></div></div><div className="container membership-benefits">
      <article><span>Interpretation</span><h3>Separate useful guidance from noise</h3><p>Learn from carefully selected experts who can explain complexity without reducing it to another trend or universal prescription.</p></article>
      <article><span>Integration</span><h3>See the whole picture</h3><p>Explore how nutrition, recovery, focus, movement, stress, and longevity shape one another in real life.</p></article>
      <article><span>Application</span><h3>Move from knowing to doing</h3><p>Use food, movement, place, hands-on experience, and credible tools to turn insight into informed action.</p></article>
    </div></section>

    <section className="section fog-section"><div className="container"><p className="eyebrow">How membership works</p><h2>Use ROAMSIX at the depth that fits your life.</h2><p className="section-intro">Programming is released throughout the year. Begin with the question that matters now, then use later experiences to build a more complete and practical understanding.</p><div className="member-path-grid">
      <article><span>01</span><h3>Clarify your priority.</h3><p>Tell us what you want to understand, improve, or sustain so the opportunities you see are more relevant.</p></article>
      <article><span>02</span><h3>Learn through the right lens.</h3><p>Move from research to clinical and specialist perspective, then into practical education that makes the subject usable.</p></article>
      <article><span>03</span><h3>Experience and apply it.</h3><p>Choose the conversations, immersive experiences, trusted resources, and objective insights that help you act with greater confidence.</p></article>
    </div><div className="membership-inclusion-notes"><p><strong>Membership opens in intentionally sized groups, generally up to 25.</strong> This helps us protect access, manage capacity, and deliver a more considered experience.</p><p>Cohorts organize enrollment. Event capacity is set separately for each format.</p></div></div></section>

    <section className="section light-section membership-pricing-section" id="pricing"><div className="container"><p className="eyebrow">Membership options</p><h2>Choose the level of access that feels right.</h2><p className="section-intro">Start with the outcome you want, then open the details only when you are ready. Core enrollment is available now. Field and Journey begin with a brief conversation so we can protect the access promised at each level.</p>
      <div className="membership-tier-grid">{Object.entries(MEMBERSHIP_TIERS).map(([key, item]) => <article className={key === 'field' ? 'featured' : ''} key={key}>
        {key === 'field' ? <span className="pricing-badge">Deeper access</span> : null}<p className="eyebrow">ROAMSIX membership</p><h3>{item.name}</h3><div className="membership-tier-price"><strong>{item.monthlyEquivalent}</strong><span>{item.monthlyEquivalentLabel}</span></div><p className="tier-audience"><strong>Best for:</strong> {item.forWhom}</p><p className="tier-outcome">{item.summary}</p>
        <details className="membership-tier-details"><summary>See what {item.name} includes</summary><ul className="tier-feature-list">{item.features.map((feature) => <li key={feature.title}><strong>{feature.title}</strong><span>{feature.copy}</span></li>)}</ul><p className="tier-boundary"><strong>Good to know:</strong> Some premium experiences and the year-end Journey are purchased separately. Every price is shown before booking.</p></details>
        {key === 'core' ? <Link className="button button-accent" to="/membership/checkout/core?billing=monthly">Choose Core</Link> : <button className={`button ${key === 'field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => requestTier(item.name)}>Explore {item.name} membership</button>}
      </article>)}
      <article className="private-tier"><p className="eyebrow">By invitation</p><h3>Private</h3><strong>Designed individually</strong><p className="tier-audience"><strong>Best for:</strong> Individuals or families seeking a more personal level of access and planning.</p><p>Private membership is tailored around the access, experiences, and support that make sense for the member. Details and pricing are discussed privately before any commitment.</p><a className="text-link" href="mailto:info@roamsix.com?subject=ROAMSIX%20Private%20membership">Ask about Private membership <span aria-hidden="true">→</span></a></article>
      </div>
    </div></section>

    <section className="section ink-section" id="request-membership"><div className="container membership-checkout-layout"><div className="membership-offer"><p className="eyebrow">Field and Journey</p><h2>Begin with a brief conversation.</h2><p>Tell us where you want more clarity, access, or depth. We will review your request personally and help you decide whether Field or Journey is the right fit.</p><p>Submitting this form does not take payment or create a membership.</p><div className="button-row"><button className={`button ${requestedTier === 'Field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Field')}>Field</button><button className={`button ${requestedTier === 'Journey' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Journey')}>Journey</button></div></div><MembershipRequestForm key={requestedTier} tier={requestedTier} /></div></section>

    <section className="section light-section"><div className="container faq"><p className="eyebrow">Before you join</p><h2>Practical details.</h2>
      <details><summary>Why join before every experience is announced?</summary><p>Membership gives you access to the developing ROAMSIX calendar, vetted learning, member benefits, and the booking privileges included with your tier. New dates are released throughout the year, and you decide which subjects and formats are relevant to you.</p></details>
      <details><summary>What is a membership cohort?</summary><p>ROAMSIX opens membership in intentionally sized groups, generally up to 25, so access and capacity remain manageable as programming grows. Cohorts organize enrollment; event capacities are set separately by format.</p></details>
      <details><summary>What does a guest pass cover?</summary><p>{GUEST_PASS_DEFINITION} Guest passes do not include a larger member gathering, Journey travel, or a separately charged partner-hosted experience.</p></details>
      <details><summary>Which experiences have their own price?</summary><p>{EXTRA_COST_EXPLANATION}</p></details>
      <details><summary>Is expert access medical care?</summary><p>No. ROAMSIX offers educational and experiential programming, not diagnosis, treatment, clinical monitoring, or individualized medical advice.</p></details>
      <details><summary>How do I manage renewal or cancel?</summary><p>Your selected monthly or annual charge is collected when you complete secure Stripe checkout and renews at that interval until you cancel. You can manage billing through the secure member area or email info@roamsix.com before your next renewal. Cancellation takes effect at the end of the paid membership period.</p></details>
    </div></section>
  </SiteLayout>;
}
