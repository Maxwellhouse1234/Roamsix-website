import SiteLayout from '../components/SiteLayout';
import BookCallButton from '../components/BookCallButton';

const OUTCOMES = [
  ['01', 'Sustainable performance', 'Improve energy, focus, recovery, resilience, and the capacity to perform well over time.'],
  ['02', 'Health in practice', 'Apply useful guidance in nutrition, metabolic health, movement, fitness, and longevity.'],
  ['03', 'Stronger teams', 'Strengthen leadership, communication, trust, and how people work together.'],
];

export default function OrganizationsPage() {
  const emailHref = 'mailto:info@roamsix.com?subject=ROAMSIX%20organization%20inquiry';
  return <SiteLayout>
    <section className="page-hero organization-hero"><div className="container narrow"><p className="eyebrow">For organizations</p><h1>Help your team perform better, stay healthier, and sustain both.</h1><p className="page-lead">ROAMSIX creates private experiences around the health, performance, and team outcomes your people need.</p><div className="button-row"><BookCallButton className="button button-accent">Build a private team experience</BookCallButton><a className="text-link" href={emailHref}>Send an email <span aria-hidden="true">→</span></a></div></div></section>
    <section className="section light-section"><div className="container organization-promise"><p className="eyebrow">What we can improve</p><div><h2>Health becomes a business advantage when people know how to use it.</h2><p className="lead">We focus the experience on three connected outcomes.</p></div></div><div className="container organization-delivery-grid">{OUTCOMES.map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="section fog-section"><div className="container split-copy"><p className="eyebrow">What ROAMSIX provides</p><div><h2>The right experts, environment, and complete experience.</h2><p className="lead">You identify the need. We select the faculty and setting, then design the learning, movement, meals, activities, and conversation around it.</p><p>Available as a focused day, a two-day offsite, or a multi-day retreat.</p><BookCallButton className="button button-accent">Build an experience for your team</BookCallButton></div></div></section>
  </SiteLayout>;
}
