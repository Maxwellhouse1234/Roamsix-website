import { DR_SAL_GUEST_AGREEMENT, DR_SAL_GUEST_AGREEMENT_VERSION } from '../data/drSalGuestAgreement';

export default function DrSalAgreementText() {
  return <div className="event-agreement-frame"><article className="event-agreement" aria-labelledby="agreement-title" tabIndex="0">
    <div className="event-agreement-heading">
      <div>
        <p className="eyebrow">Version {DR_SAL_GUEST_AGREEMENT_VERSION}</p>
        <h2 id="agreement-title">{DR_SAL_GUEST_AGREEMENT.title}</h2>
        <p>{DR_SAL_GUEST_AGREEMENT.subtitle}</p>
      </div>
      <span className="event-agreement-draft">Draft</span>
    </div>
    <p className="event-agreement-alert">{DR_SAL_GUEST_AGREEMENT.status}</p>
    <dl className="event-agreement-meta">
      {DR_SAL_GUEST_AGREEMENT.metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <div className="event-agreement-copy">
      {DR_SAL_GUEST_AGREEMENT.sections.map((section) => <section key={section.title}>
        <h3>{section.title}</h3>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
      </section>)}
    </div>
  </article><p className="event-agreement-scroll-hint">Scroll to review the complete agreement <span aria-hidden="true">↓</span></p></div>;
}
