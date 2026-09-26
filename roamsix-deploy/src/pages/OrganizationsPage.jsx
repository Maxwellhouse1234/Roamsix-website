import SiteLayout from '../components/SiteLayout';
import BookCallButton from '../components/BookCallButton';

const OFFERS = [
  ['A focused team session', 'Bring a small leadership or working team together around one clear priority, such as energy, recovery, focus, resilience, or connection.'],
  ['A shared team experience', 'Give a growing team time to learn from an expert, try something together, and have the conversations that daily work rarely makes room for.'],
  ['An organization-wide wellbeing experience', 'Create an engaging experience that helps more of your people understand and practice healthier ways of working.'],
  ['A learning program over time', 'Help a defined group turn expert learning into repeatable action through several sessions, shared language, and accountability.'],
];

export default function OrganizationsPage() {
  return <SiteLayout>
    <section className="page-hero organization-hero"><div className="container narrow"><p className="eyebrow">For organizations</p><h1>How do I help the people I lead live well and do their best work?</h1><p className="page-lead">Your people may already be capable and committed. What they may be missing is the space to step back, make sense of what affects their energy and recovery, and experience something useful together.</p><div className="button-row"><BookCallButton className="button button-accent">Help me choose the right format</BookCallButton><a className="text-link" href="#organization-formats">See how we can work together <span aria-hidden="true">→</span></a></div></div></section>
    <section className="section light-section" id="organization-formats"><div className="container"><p className="eyebrow">Start with what your people are carrying</p><h2>Give your team the space and guidance to live well and perform at their best for the long term.</h2><p className="section-intro">ROAMSIX combines carefully selected expertise, practical application, and shared experience around the outcome you care about. Begin with one focused session or build a path over time.</p><div className="organization-offer-grid">{OFFERS.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="button-row"><BookCallButton className="button button-accent">Help me choose the right format</BookCallButton></div></div></section>
    <section className="section fog-section"><div className="container split-copy"><p className="eyebrow">Designed around your people</p><div><h2>You know what your team is navigating. We help you create the right response.</h2><p className="lead">Tell us what you want your people to understand, experience, or do differently. We will recommend experts whose work we trust, the right format and setting, and a clear plan and price before you commit.</p><BookCallButton className="button button-accent">Build the right experience for my team</BookCallButton></div></div></section>
  </SiteLayout>;
}
