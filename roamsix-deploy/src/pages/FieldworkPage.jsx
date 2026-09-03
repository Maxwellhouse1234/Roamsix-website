import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import TopicInterestForm from '../components/TopicInterestForm';
import { FIELDWORK_PROGRAM } from '../data/fieldworkProgram';

export default function FieldworkPage() {
  const [interest, setInterest] = useState({ id: '2027-program', label: 'The complete 2027 ROAMSIX program' });
  const chooseInterest = (id, label) => {
    setInterest({ id, label });
    window.requestAnimationFrame(() => document.querySelector('#interest')?.scrollIntoView({ block: 'start' }));
  };

  return (
    <SiteLayout>
      <section className="page-hero"><div className="container narrow"><p className="eyebrow">The ROAMSIX 2027 program</p><h1>A year of questions worth experiencing.</h1><p className="page-lead">Four practical themes explored through weekly in-person conversations, monthly one-day experiences, quarterly retreats, and a year-end multi-day immersion. Join the subjects that matter to you or follow the full year.</p><button className="button" type="button" onClick={() => chooseInterest('2027-program', 'The complete 2027 ROAMSIX program')}>Get 2027 program updates</button></div></section>

      <section className="section light-section" id="quarters"><div className="container"><p className="eyebrow">Four themes for 2027</p><h2>Choose the subjects most relevant to you.</h2><div className="quarter-overview-grid">{FIELDWORK_PROGRAM.map((quarter) => <article key={quarter.slug}><p className="eyebrow">{quarter.quarter}</p><h3>{quarter.subject}</h3><p className="theme-tagline">{quarter.title}</p><p>{quarter.description}</p><p className="theme-fields">{quarter.fields}</p><div className="quarter-card-retreat"><span>Quarterly retreat · 2–3 days</span><strong>{quarter.retreat}</strong></div><div className="quarter-card-actions"><Link className="button button-secondary" to={`/events/${quarter.slug}`}>View {quarter.quarter.slice(0, 2)} details</Link><button className="button" type="button" onClick={() => chooseInterest(`${quarter.slug}-retreat`, quarter.retreat)}>I’m interested</button></div></article>)}</div></div></section>

      <section className="fieldwork-cta capstone-cta"><div className="container"><div><p className="eyebrow">The year-end journey · Multi-day immersion</p><h2>The year ends where everything connects.</h2><p>The four themes come together in one extended ROAMSIX journey. Across several days, participants experience how the microbiome, recovery, focus, and longevity influence one another, and leave with a clearer understanding of the whole system.</p></div><button className="button" type="button" onClick={() => chooseInterest('year-end-journey', 'The 2027 year-end multi-day immersion')}>Get year-end journey updates</button></div></section>

      <section className="section light-section"><div className="container feature-grid"><div className="feature-image retreat-image" role="img" aria-label="Guests gathered at a ROAMSIX experience" /><div className="feature-copy"><p className="eyebrow">First quarterly retreat · Q1</p><h2>The Microbiome in Practice</h2><p>This is the same upcoming retreat featured on our retreat page. It follows the microbiome from soil and food into energy, movement, focus, and recovery.</p><Link className="button button-secondary" to="/first-retreat">View the retreat preview</Link></div></div></section>

      <section className="section fog-section" id="interest"><div className="container form-layout"><div><p className="eyebrow">2027 program interest</p><h2>Choose what you want to hear about.</h2><p>Give us your name and email. We’ll confirm your interest now, share details as they are released, and send the calendar invitation when the event is scheduled.</p></div><TopicInterestForm interest={interest} /></div></section>
    </SiteLayout>
  );
}
