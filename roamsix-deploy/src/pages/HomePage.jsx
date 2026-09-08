import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';
import DinnerCountdown from '../components/DinnerCountdown';

const PROBLEMS = [
  ['01', 'Your health keeps moving to next week.'],
  ['02', 'You learn more, but your daily life stays the same.'],
  ['03', 'Your world gets busier and less varied.'],
  ['04', 'You meet more people, but make fewer meaningful connections.'],
];

export default function HomePage() {
  return <SiteLayout theme="dark">
    <section className="hero home-hero"><div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /><div className="hero-content container"><p className="eyebrow">Expert-led experiences for a better way of living</p><h1>We bring people and experts together around the subjects that shape how we live.</h1><p className="hero-copy">ROAMSIX helps high-performing professionals turn guidance in health, longevity, nutrition, movement, recovery, and human performance into experiences they can practice and carry home.</p><div className="button-row"><a className="button button-accent" href="#find-your-fit">Find the right experience</a><Link className="text-link light" to="/dinner#tickets">Reserve the September 19 dinner <span aria-hidden="true">→</span></Link></div></div></section>

    <section className="dinner-deadline-strip"><div className="container"><div className="dinner-deadline-copy"><p><strong>An Evening in the Olive Groves</strong><span>September 19 · Father’s Farmhouse · Reservations close September 14</span></p><DinnerCountdown /></div><Link className="text-link" to="/dinner#tickets">View the evening and reserve <span aria-hidden="true">→</span></Link></div></section>

    <section className="section fog-section home-finder-section" id="find-your-fit"><div className="container finder-layout"><div><p className="eyebrow">Find your way in</p><h2>Tell us why you are here.</h2><p className="lead">We will direct you to the most relevant subject, format, or ROAMSIX path.</p></div><ExperienceFinder compact /></div></section>

    <section className="section light-section buyer-story-section"><div className="container buyer-story-intro"><p className="eyebrow">What success can leave unattended</p><div><h2>You plan for financial security. Your health, energy, and time deserve the same attention.</h2></div></div><div className="container buyer-tensions">{PROBLEMS.map(([number,title]) => <article key={number}><span>{number}</span><h3>{title}</h3></article>)}</div></section>

    <section className="section ink-section"><div className="container process-intro"><p className="eyebrow">What ROAMSIX does</p><h2>Learn from experts. Experience first-hand. Live differently.</h2><p className="section-intro">We combine credible expertise, distinctive settings, and practical application. Each experience draws from six elements.</p><div className="inline-pillars"><span>Explore</span><span>Nourish</span><span>Move</span><span>Recover</span><span>Connect</span><span>Build</span></div></div></section>

    <section className="section light-section"><div className="container feature-grid"><div className="feature-image retreat-image" role="img" aria-label="Guests sharing a meal at a ROAMSIX long-table experience" /><div className="feature-copy"><p className="eyebrow">Upcoming experience</p><h2>An Evening in the Olive Groves</h2><p>One long table, a working olive grove, and a conversation about the choices that shape how we live.</p><Link className="button button-accent" to="/dinner#tickets">View the evening and reserve</Link></div></div></section>

    <section className="fieldwork-cta membership-home-cta"><div className="container"><div><p className="eyebrow">2027 founding membership · limited to 100</p><h2>Keep learning, applying, and connecting throughout the year.</h2><p>Weekly expert conversations, a cross-disciplinary community, and priority access to selected experiences.</p></div><Link className="button" to="/membership">See membership options</Link></div></section>

    <section className="section fog-section"><div className="container home-entry-grid"><article><span>For organizations</span><h3>Make health and sustainable performance a business advantage.</h3><Link className="text-link" to="/organizations">Explore team experiences <span aria-hidden="true">→</span></Link></article><article><span>For experts and partners</span><h3>Turn your work, craft, or place into an experience people can apply.</h3><Link className="text-link" to="/collaborate">Explore collaboration <span aria-hidden="true">→</span></Link></article></div></section>

    <section className="closing-section"><div className="container"><p className="closing-line">Bridging knowing and doing.</p><a className="button" href="#find-your-fit">Find your ROAMSIX path</a></div></section>
  </SiteLayout>;
}
