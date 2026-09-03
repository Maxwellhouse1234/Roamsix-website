import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import TopicInterestForm from '../components/TopicInterestForm';
import { getFieldworkQuarter } from '../data/fieldworkProgram';

export default function FieldworkQuarterPage({ quarterSlug: quarterSlugOverride }) {
  const { quarterSlug } = useParams();
  const quarter = getFieldworkQuarter(quarterSlugOverride || quarterSlug);
  const [interest, setInterest] = useState(quarter ? { id: `${quarter.slug}-retreat`, label: quarter.retreat } : { id: '', label: '' });
  if (!quarter) return <Navigate to="/events" replace />;

  const chooseInterest = (id, label) => {
    setInterest({ id, label });
    window.requestAnimationFrame(() => document.querySelector('#interest')?.scrollIntoView({ block: 'start' }));
  };

  return (
    <SiteLayout>
      <section className="page-hero quarter-page-hero"><div className="container narrow"><Link className="text-link" to="/events">← Full 2027 program</Link><p className="eyebrow">{quarter.quarter}</p><h1>{quarter.subject}</h1><p className="theme-tagline">{quarter.title}</p><p className="page-lead">{quarter.description}</p><p className="quarter-fields">{quarter.fields}</p></div></section>

      <section className="section ink-section"><div className="container quarter-retreat-feature"><div><p className="eyebrow">Quarterly retreat · 2–3 days</p><h2>{quarter.retreat}</h2><p>The quarter’s fireside conversations and field days lead into one immersive experience that brings the subject, people, and practices together.</p></div><button className="button" type="button" onClick={() => chooseInterest(`${quarter.slug}-retreat`, quarter.retreat)}>I’m interested</button></div></section>

      <section className="section light-section"><div className="container"><p className="eyebrow">Three months in the field</p><h2>Follow the quarter from question to experience.</h2><div className="quarter-month-list">{quarter.months.map(([month, title, questions], monthIndex) => <article key={month}><div className="month-heading"><div><p className="eyebrow">{month} · One-day field experience</p><h3>{title}</h3></div><button className="button button-secondary" type="button" onClick={() => chooseInterest(`${quarter.slug}-month-${monthIndex + 1}`, `${month}: ${title}`)}>Keep me updated</button></div><div className="fireside-list"><p className="eyebrow">Weekly fireside conversations · About an hour each</p>{questions.map((question, weekIndex) => <button type="button" key={question} onClick={() => chooseInterest(`${quarter.slug}-month-${monthIndex + 1}-week-${weekIndex + 1}`, `${month} fireside: ${question}`)}><span>{String(weekIndex + 1).padStart(2, '0')}</span>{question}</button>)}</div></article>)}</div></div></section>

      <section className="section fog-section" id="interest"><div className="container form-layout"><div><p className="eyebrow">Register your interest</p><h2>Stay connected to this part of the program.</h2><p>Give us your name and email. We’ll confirm your selection, share details as they are released, and send the calendar invitation when the event is scheduled.</p></div><TopicInterestForm interest={interest} /></div></section>
    </SiteLayout>
  );
}
