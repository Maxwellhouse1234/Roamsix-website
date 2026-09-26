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
      <p className="eyebrow">ROAMSIX membership</p><h1>Some questions are too important to leave to a single evening.</h1>
      <p className="page-lead">Membership gives you an ongoing place to make sense of health, take part in practical experiences, and build relationships across health, wellness, and human performance.</p>
      <div className="button-row"><a className="button button-accent" href="#pricing">Explore membership</a><Link className="text-link light" to="/member/login">Member sign in <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section light-section"><div className="container membership-value-intro"><p className="eyebrow">Why membership</p><div><h2>Build a clearer view of your health over time.</h2><p className="lead">ROAMSIX brings carefully selected experts and practical experiences together so you can understand how different parts of your health affect one another.</p></div></div><div className="container membership-benefits">
      <article><span>Clarity</span><h3>See how the pieces influence one another</h3><p>Make sense of nutrition, recovery, focus, movement, and longevity without treating each one as an isolated problem.</p></article>
      <article><span>Access</span><h3>Know where to turn next</h3><p>Follow a developing calendar of experts, conversations, movement, nature, and relevant opportunities with confirmed partners.</p></article>
      <article><span>Continuity</span><h3>Return instead of starting over</h3><p>Let one experience inform the next while choosing the subjects and formats that fit your life.</p></article>
    </div></section>

    <section className="section fog-section"><div className="container"><p className="eyebrow">The member journey</p><h2>Stay connected without feeling you have to do everything.</h2><p className="section-intro">New experiences open throughout the year. Join at any point and choose what feels useful now.</p><div className="member-path-grid">
      <article><span>01</span><h3>Tell us what matters to you.</h3><p>Set your nonclinical interests and preferences so the calendar and updates are more relevant to you.</p></article>
      <article><span>02</span><h3>See what is opening next.</h3><p>Receive member updates, invitations, and the booking access included with your membership.</p></article>
      <article><span>03</span><h3>Choose what fits.</h3><p>Take part when the subject, people, place, or format feels useful. Stay connected between experiences.</p></article>
    </div><div className="membership-inclusion-notes"><p><strong>Membership opens in small cohorts of up to 25.</strong> This keeps participation personal and gives relationships time to grow. The first group is the Founding Cohort; every cohort remains part of the wider ROAMSIX community.</p><p>Event capacity is set separately for each format and is not limited to one cohort.</p></div></div></section>

    <section className="section light-section membership-pricing-section" id="pricing"><div className="container"><p className="eyebrow">Annual membership options</p><h2>Choose the access that fits how you want to take part.</h2><p className="section-intro">Core is open for direct enrollment. Field and Journey begin with a brief conversation so we can protect the smaller-group access and make sure the membership matches how you want to take part.</p>
      <div className="membership-tier-grid">{Object.entries(MEMBERSHIP_TIERS).map(([key, item]) => <article className={key === 'field' ? 'featured' : ''} key={key}>
        {key === 'field' ? <span className="pricing-badge">Priority access</span> : null}<p className="eyebrow">Annual membership</p><h3>{item.name}</h3><strong>{item.price}</strong><p className="tier-audience"><strong>Best for:</strong> {item.forWhom}</p><p>{item.summary}</p><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        {key === 'core' ? <Link className="button button-secondary" to="/membership/checkout/core">Start my Core membership</Link> : <button className={`button ${key === 'field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => requestTier(item.name)}>Request {item.name} membership</button>}
      </article>)}
      <article className="private-tier"><p className="eyebrow">By invitation</p><h3>Private</h3><strong>Written scope</strong><p className="tier-audience"><strong>Best for:</strong> A tailored relationship with ROAMSIX.</p><p>Private membership is considered individually and defined through a written scope. No public price or standard package is offered.</p><a className="text-link" href="mailto:info@roamsix.com?subject=ROAMSIX%20Private%20membership">Ask about Private membership <span aria-hidden="true">→</span></a></article>
      </div>
      <div className="membership-inclusion-notes"><p><strong>Guest passes:</strong> {GUEST_PASS_DEFINITION}</p><p><strong>Experiences with a separate price:</strong> {EXTRA_COST_EXPLANATION}</p><p><strong>Expert access:</strong> Specialist access is educational, not clinical. Introductions are made only when relevant and appropriate and are not guaranteed.</p></div>
    </div></section>

    <section className="section ink-section" id="request-membership"><div className="container membership-checkout-layout"><div className="membership-offer"><p className="eyebrow">Field and Journey membership</p><h2>Begin with a brief conversation.</h2><p>Tell us what would make membership useful to you. We will follow up personally and, if the membership is a match, send you the secure annual checkout link.</p><p>Submitting this form is not a membership, does not reserve a place, and does not count as payment.</p><div className="button-row"><button className={`button ${requestedTier === 'Field' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Field')}>Request Field</button><button className={`button ${requestedTier === 'Journey' ? 'button-accent' : 'button-secondary'}`} type="button" onClick={() => setRequestedTier('Journey')}>Request Journey</button></div></div><MembershipRequestForm key={requestedTier} tier={requestedTier} /></div></section>

    <section className="section light-section"><div className="container faq"><p className="eyebrow">Before you join</p><h2>Practical details.</h2>
      <details><summary>Why join before every experience is announced?</summary><p>Membership is ongoing access to the developing ROAMSIX calendar, member benefits, and community. New dates open throughout the year, and you choose what is relevant to you.</p></details>
      <details><summary>What is a membership cohort?</summary><p>ROAMSIX membership opens in small groups of up to 25 so participation can stay personal and relationships can develop over time. Your cohort organizes part of your membership experience, but you still belong to the wider ROAMSIX community. Event capacities are set separately by format.</p></details>
      <details><summary>What does a guest pass cover?</summary><p>{GUEST_PASS_DEFINITION} Guest passes do not include a larger member gathering, Journey travel, or a separately charged partner-hosted experience.</p></details>
      <details><summary>Which experiences have their own price?</summary><p>{EXTRA_COST_EXPLANATION}</p></details>
      <details><summary>Is expert access medical care?</summary><p>No. ROAMSIX offers education and community experiences, not diagnosis, treatment, clinical monitoring, or individualized medical advice.</p></details>
      <details><summary>How do I manage renewal or cancel?</summary><p>Your annual charge is collected when you complete secure Stripe checkout and renews annually until you cancel. You can manage billing through the secure member area or email info@roamsix.com before your next renewal. Cancellation takes effect at the end of the paid membership period.</p></details>
    </div></section>
  </SiteLayout>;
}
