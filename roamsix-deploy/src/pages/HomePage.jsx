import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

const PROBLEMS = [
  ['01', 'Health becomes something to address later.', 'Work and financial security receive the plan. Energy, recovery, and long-term health receive what is left.'],
  ['02', 'Familiar routines narrow perspective.', 'The same places, inputs, and professional circles make it harder to encounter what could change how you think.'],
  ['03', 'Information grows faster than behavior changes.', 'Knowing more about health and performance does not mean that knowledge has become part of daily life.'],
  ['04', 'A larger network can still lack real connection.', 'More contacts do not guarantee honest conversation, new perspectives, or relationships with depth.'],
];

export default function HomePage() {
  return <SiteLayout theme="dark">
    <section className="hero home-hero"><div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /><div className="hero-content container"><p className="eyebrow">Expert-led experiences for a better way of living</p><h1>We bring people and experts together around the subjects that shape how we live.</h1><p className="hero-copy">ROAMSIX turns guidance in health, longevity, nutrition, movement, recovery, and human performance into experiences you can practice and carry home.</p><div className="button-row"><a className="button button-accent" href="#find-your-fit">Find the right experience</a><Link className="text-link light" to="/dinner#tickets">Reserve the September 19 dinner <span aria-hidden="true">→</span></Link></div></div></section>

    <section className="dinner-deadline-strip"><div className="container"><p><strong>An Evening in the Olive Groves</strong><span>September 19 · Father’s Farmhouse · Reservations close September 14</span></p><Link className="text-link" to="/dinner#tickets">View the evening and reserve <span aria-hidden="true">→</span></Link></div></section>

    <section className="section fog-section home-finder-section" id="find-your-fit"><div className="container finder-layout"><div><p className="eyebrow">Find your way in</p><h2>Tell us why you are here.</h2><p className="lead">We will direct you to the most relevant subject, format, or ROAMSIX path.</p></div><ExperienceFinder compact /></div></section>

    <section className="section light-section buyer-story-section"><div className="container buyer-story-intro"><p className="eyebrow">The problem success can hide</p><div><h2>You can build financial security while underinvesting in the life it was meant to support.</h2><p className="lead">Health, energy, perspective, and meaningful relationships are not rewards for later. They are what make high performance sustainable and life worth building.</p></div></div><div className="container buyer-tensions">{PROBLEMS.map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="section ink-section"><div className="container process-intro"><p className="eyebrow">What ROAMSIX does</p><h2>Learn from the right people. Experience the subject. Use what changes.</h2><p className="section-intro">We combine credible expertise, distinctive settings, and practical application. Each experience draws from six elements.</p><div className="inline-pillars"><span>Explore</span><span>Nourish</span><span>Move</span><span>Recover</span><span>Connect</span><span>Build</span></div></div></section>

    <section className="section light-section"><div className="container feature-grid"><div className="feature-image retreat-image" role="img" aria-label="Guests sharing a meal at a ROAMSIX long-table experience" /><div className="feature-copy"><p className="eyebrow">Upcoming experience</p><h2>An Evening in the Olive Groves</h2><p>One long table, a working olive grove, and a conversation about the choices that shape how we live.</p><Link className="button button-accent" to="/dinner#tickets">View the evening and reserve</Link></div></div></section>

    <section className="fieldwork-cta membership-home-cta"><div className="container"><div><p className="eyebrow">2027 founding membership · limited to 100</p><h2>Keep learning, applying, and connecting throughout the year.</h2><p>Weekly expert conversations, a cross-disciplinary community, and priority access to selected experiences.</p></div><Link className="button" to="/membership">See membership options</Link></div></section>

    <section className="section fog-section"><div className="container home-entry-grid"><article><span>For organizations</span><h3>Make health and sustainable performance a business advantage.</h3><Link className="text-link" to="/organizations">Explore team experiences <span aria-hidden="true">→</span></Link></article><article><span>For experts and partners</span><h3>Turn your work, craft, or place into an experience people can apply.</h3><Link className="text-link" to="/collaborate">Explore collaboration <span aria-hidden="true">→</span></Link></article></div></section>

    <section className="closing-section"><div className="container"><p className="closing-line">Bridging knowing and doing.</p><a className="button" href="#find-your-fit">Find your ROAMSIX path</a></div></section>
  </SiteLayout>;
}
