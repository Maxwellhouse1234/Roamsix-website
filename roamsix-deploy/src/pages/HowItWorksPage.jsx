import { useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import { Link } from 'react-router-dom';

const PILLARS = ['Move', 'Nourish', 'Recover', 'Connect', 'Explore', 'Build'];

const PATHS = {
  guest: {
    label: 'I want to attend', eyebrow: 'Your path · Attend an experience', title: 'Choose the depth that fits your life.',
    copy: 'Come for one evening, follow a subject through the year, or step into a multi-day retreat. You arrive curious. We take care of the journey from welcome to reflection.',
    steps: ['Choose a question or format', 'Meet the expert and the people around it', 'Experience the idea through place, food, movement, and conversation', 'Leave with something concrete to carry forward'],
    action: 'Find your experience', href: '/find-your-experience',
  },
  expert: {
    label: 'I have expertise to share', eyebrow: 'Your path · Collaborate with us', title: 'Turn your work into something people can enter.',
    copy: 'Bring the research, practice, craft, or question. We help translate it into a thoughtful experience without flattening its depth or turning it into a conventional lecture.',
    steps: ['Introduce your work and the question behind it', 'Identify what people should understand, feel, or practice', 'Connect your perspective with the right place and collaborators', 'Build a guided experience around the idea'],
    action: 'Introduce your work', href: '/collaborate',
  },
  organization: {
    label: 'I lead a team', eyebrow: 'Your path · Build for an organization', title: 'Start with a question your people already face.',
    copy: 'We shape a private experience around the capability, tension, or transition that matters to your team, then bring together the right faculty, environment, and practical work.',
    steps: ['Clarify the real question beneath the request', 'Design the faculty, place, pace, and format', 'Guide the team through a shared learning journey', 'Create a bridge back to work'],
    action: 'Start an organization conversation', href: '/organizations',
  },
};

export default function HowItWorksPage() {
  const [selected, setSelected] = useState('guest');
  const path = PATHS[selected];

  return (
    <SiteLayout>
      <section className="page-hero"><div className="container narrow"><p className="eyebrow">How ROAMSIX works</p><h1>We build the experience around the question.</h1><p className="page-lead">Experts bring depth. Place, people, food, movement, and conversation turn that depth into something you can understand, feel, and use.</p></div></section>

      <section className="section fog-section path-guide-section">
        <div className="container">
          <div className="path-guide-heading"><p className="eyebrow">Show me how it works</p><h2>What brings you here?</h2></div>
          <div className="path-guide-tabs" role="tablist" aria-label="Choose your ROAMSIX path">
            {Object.entries(PATHS).map(([key, option]) => <button key={key} type="button" role="tab" aria-selected={selected === key} className={selected === key ? 'active' : ''} onClick={() => setSelected(key)}>{option.label}</button>)}
          </div>
          <div className="path-guide-result" role="tabpanel">
            <div><p className="eyebrow">{path.eyebrow}</p><h3>{path.title}</h3><p>{path.copy}</p><Link className="button button-accent" to={path.href}>{path.action}</Link></div>
            <ol>{path.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol>
          </div>
        </div>
      </section>

      <section className="section light-section"><div className="container process-list">
        <article><span>01</span><div><h2>Find the question worth leaving home for.</h2><p>The subject must matter in people’s real lives or work. We identify what they want to understand, what is being misunderstood, and what can honestly be experienced.</p></div></article>
        <article><span>02</span><div><h2>Bring different perspectives together.</h2><p>A physician may explain the science. A farmer, chef, coach, artist, founder, or practitioner may reveal what the same subject looks like from another angle.</p></div></article>
        <article><span>03</span><div><h2>Involve the whole person.</h2><div className="inline-pillars">{PILLARS.map((pillar) => <span key={pillar}>{pillar}</span>)}</div><p>Explore, Nourish, Move, Recover, Connect, and Build guide what people do. The balance changes with the subject, while the goal stays constant: make the learning tangible and useful.</p></div></article>
        <article><span>04</span><div><h2>Design the sequence with purpose.</h2><p>Every detail, transition, and change of pace carries part of the story. The experience feels natural because the structure behind it is deliberate.</p></div></article>
        <article><span>05</span><div><h2>Create a bridge back to life.</h2><p>People identify what changed in their understanding and what they want to apply. Follow-up conversations help the learning and relationships continue.</p></div></article>
      </div></section>
      <section className="closing-section"><div className="container"><p className="closing-line">Come curious. Leave seeing the whole system differently.</p><Link className="button" to="/find-your-experience">Find your way in</Link></div></section>
    </SiteLayout>
  );
}
