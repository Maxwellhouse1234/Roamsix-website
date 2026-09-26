import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import TopicInterestForm from '../components/TopicInterestForm';
import { getFieldworkQuarter } from '../data/fieldworkProgram';

export default function FieldworkQuarterPage({ quarterSlug: quarterSlugOverride }) {
  const { quarterSlug } = useParams();
  const quarter = getFieldworkQuarter(quarterSlugOverride || quarterSlug);
  const [interest, setInterest] = useState(quarter ? { id: `${quarter.slug}-theme`, label: quarter.subject } : { id: '', label: '' });
  if (!quarter) return <Navigate to="/events" replace />;

  const chooseInterest = (id, label) => {
    setInterest({ id, label });
    window.requestAnimationFrame(() => document.querySelector('#interest')?.scrollIntoView({ block: 'start' }));
  };
  return (
    <SiteLayout>
      <section className="page-hero quarter-page-hero"><div className="container narrow"><Link className="text-link" to="/events">← All 2027 themes</Link><p className="eyebrow">{quarter.quarter}</p><h1>{quarter.subject}</h1><p className="theme-tagline">{quarter.title}</p><p className="page-lead">{quarter.recognition}</p><p>{quarter.description}</p><p className="quarter-fields">{quarter.fields}</p></div></section>

      <section className="section ink-section"><div className="container quarter-retreat-feature"><div><p className="eyebrow">What you may take from it</p><h2>{quarter.outcome}</h2><p>Experts whose work we trust, member conversation, movement, and distinctive settings will reveal different sides of the theme. Each experience stands on its own, so you can begin wherever you are.</p></div><button className="button" type="button" onClick={() => chooseInterest(`${quarter.slug}-theme`, quarter.subject)}>Tell me when this theme opens</button></div></section>

      <section className="section light-section"><div className="container"><p className="eyebrow">Ways into the theme</p><h2>Explore the part that feels most relevant to you.</h2><div className="quarter-month-list">{quarter.months.map(([month, title, questions], monthIndex) => <article key={month}><div className="month-heading"><div><p className="eyebrow">{month} · Focus</p><h3>{title}</h3></div><button className="button button-secondary" type="button" onClick={() => chooseInterest(`${quarter.slug}-month-${monthIndex + 1}`, `${month}: ${title}`)}>Tell me when this opens</button></div><div className="fireside-list"><p className="eyebrow">What we want to make clearer</p>{questions.map((question, questionIndex) => <button type="button" key={question} onClick={() => chooseInterest(`${quarter.slug}-question-${monthIndex + 1}-${questionIndex + 1}`, `${month}: ${question}`)}><span>{String(questionIndex + 1).padStart(2, '0')}</span>{question}</button>)}</div></article>)}</div></div></section>

      <section className="section fog-section" id="interest"><div className="container form-layout"><div><p className="eyebrow">Theme updates</p><h2>Know when this theme opens.</h2><p>We will send the confirmed dates, locations, and booking details for this theme. An interest submission does not reserve a place.</p></div><TopicInterestForm interest={interest} /></div></section>
    </SiteLayout>
  );
}
