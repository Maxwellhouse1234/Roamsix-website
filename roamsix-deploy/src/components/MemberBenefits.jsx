import { useEffect, useState } from 'react';

function BenefitCard({ benefit, memberView = false }) {
  const hasDetails = benefit.summary || benefit.bookingRules || benefit.blackoutRules || benefit.redemptionInstructions || benefit.disclaimer;
  return <article className="member-benefit-card">
    {benefit.logoUrl ? <img src={benefit.logoUrl} alt={`${benefit.partner || benefit.title} logo`} loading="lazy" /> : null}
    <p className="eyebrow">{benefit.category || 'Member benefit'}</p>
    <h3>{benefit.title}</h3>
    {benefit.partner ? <p className="member-benefit-partner">With {benefit.partner}</p> : null}
    <p className="member-benefit-offer">{benefit.exactOffer}</p>
    {benefit.retailValueLabel ? <p className="member-benefit-value">{benefit.retailValueLabel}</p> : null}
    {hasDetails ? <details><summary>{memberView ? 'Redemption and terms' : 'Offer details'}</summary><div className="member-benefit-details">
      {benefit.summary ? <p>{benefit.summary}</p> : null}
      {memberView && benefit.redemptionsPerMember ? <p><strong>Included uses:</strong> {benefit.redemptionsPerMember} per membership year</p> : null}
      {memberView && benefit.redemptionInstructions ? <p><strong>How to use it:</strong> {benefit.redemptionInstructions}</p> : null}
      {memberView && benefit.bookingRules ? <p><strong>Booking:</strong> {benefit.bookingRules}</p> : null}
      {memberView && benefit.blackoutRules ? <p><strong>Limitations:</strong> {benefit.blackoutRules}</p> : null}
      {benefit.expiresAt ? <p><strong>Available through:</strong> {new Date(benefit.expiresAt).toLocaleDateString()}</p> : null}
      {benefit.disclaimer ? <p className="form-note">{benefit.disclaimer}</p> : null}
      {memberView && benefit.redemptionUrl ? <a className="text-link" href={benefit.redemptionUrl} target="_blank" rel="noreferrer">Use this benefit <span aria-hidden="true">→</span></a> : null}
      {!memberView && benefit.benefitUrl ? <a className="text-link" href={benefit.benefitUrl} target="_blank" rel="noreferrer">Learn about the partner <span aria-hidden="true">→</span></a> : null}
    </div></details> : null}
  </article>;
}

export function MemberBenefitCards({ benefits = [], memberView = false }) {
  if (!benefits.length) return null;
  return <div className="member-benefits-grid">{benefits.map((benefit) => <BenefitCard key={benefit.id} benefit={benefit} memberView={memberView} />)}</div>;
}

export function PublicMembershipBenefits() {
  const [benefits, setBenefits] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/member-benefits', { signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : { benefits: [] })
      .then((body) => setBenefits(Array.isArray(body.benefits) ? body.benefits : []))
      .catch((error) => { if (error.name !== 'AbortError') setBenefits([]); });
    return () => controller.abort();
  }, []);

  if (!benefits?.length) return null;
  return <section className="section fog-section membership-network-section"><div className="container membership-value-intro"><p className="eyebrow">Beyond the ROAMSIX calendar</p><div><h2>Membership grows with the community.</h2><p className="lead">We are building a network of trusted studios, practitioners, workspaces, farms, makers, wellness businesses, and experience partners who can extend what members are able to explore throughout the year.</p><p>Every benefit is clearly described before you use it. We publish a benefit only after its value, availability, and delivery terms are confirmed.</p></div></div>
    <div className="container current-benefits"><p className="eyebrow">Current confirmed benefits</p><MemberBenefitCards benefits={benefits} /></div>
  </section>;
}
