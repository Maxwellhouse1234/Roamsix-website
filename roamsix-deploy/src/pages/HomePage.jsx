import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

export default function HomePage() {
  return <SiteLayout theme="dark">
    <section className="hero home-hero"><div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /><div className="hero-content container">
      <p className="eyebrow">An ongoing membership for people who care how they live</p><h1>You can be doing a lot right and still wonder what matters most.</h1>
      <p className="hero-copy">ROAMSIX helps you make sense of health, experience useful ideas, and stay connected to the experts and people who help the learning continue.</p>
      <div className="button-row"><Link className="button button-accent" to="/membership">Explore my membership options</Link><Link className="text-link light" to="/experiences">Begin with an upcoming event <span aria-hidden="true">→</span></Link></div>
    </div></section>
    <section className="section fog-section home-finder-section" id="find-your-fit"><div className="container finder-layout"><div><p className="eyebrow">Find your starting point</p><h2>What are you hoping to understand, improve, or protect?</h2><p className="lead">Tell us what matters now. We will suggest the most relevant way to begin without assuming you need to change everything.</p></div><ExperienceFinder compact /></div></section>
    <section className="section light-section"><div className="container buyer-story-intro"><p className="eyebrow">Why ROAMSIX</p><div><h2>You do not need more information to carry. You need a clearer way to make sense of it.</h2><p className="lead">ROAMSIX brings carefully selected experts and practical experiences together so you can understand how different parts of your health affect one another.</p></div></div></section>
    <section className="section light-section"><div className="container feature-grid"><div className="feature-image sal-fireside-image" role="img" aria-label="An outdoor setting prepared for a ROAMSIX fireside event" /><div className="feature-copy">
      <p className="eyebrow">October 24, 2026 · San Diego</p><h2>Gut health is everywhere. Clear guidance is harder to find.</h2><p>Dr. Sulaiman Bharwani joins ROAMSIX for a conversation about the gut-brain connection, food, stress, and everyday performance. The venue will be announced and registration is not yet open.</p><Link className="button button-accent" to="/experiences">Tell me when registration opens</Link>
    </div></div></section>
    <section className="section fog-section"><div className="container"><p className="eyebrow">Your path into ROAMSIX</p><h2>Begin with one experience. Stay for what becomes possible over time.</h2><div className="member-path-grid">
      <article><span>01</span><h3>Start with what feels relevant.</h3><p>Join a public event or use the finder to discover the subject and format that fit you now.</p></article>
      <article><span>02</span><h3>Join for ongoing access.</h3><p>Membership opens the wider calendar, earlier booking, member gatherings, and practical updates throughout the year.</p></article>
      <article><span>03</span><h3>Choose as the path unfolds.</h3><p>You do not need every future date before joining. Enter at any point, set your interests, and participate in what serves you.</p></article>
    </div><div className="button-row"><Link className="button button-accent" to="/membership">See how membership works</Link></div></div></section>
    <section className="fieldwork-cta membership-home-cta"><div className="container"><div><p className="eyebrow">Annual membership</p><h2>The value is not only what happens at one event. It is having somewhere to return.</h2><p>Stay connected to people, ideas, and invitations throughout the year. Annual membership begins at $900.</p></div><Link className="button" to="/membership">Explore membership</Link></div></section>
    <section className="section fog-section"><div className="container organization-callout"><p className="eyebrow">For organizations</p><h2>How do I help the people I lead live well and do their best work?</h2><p className="lead">Your people can be capable and committed and still need room to think, recover, and reconnect. ROAMSIX creates that room around the outcome you care about.</p><Link className="button button-accent" to="/organizations">Explore what could help my team</Link></div></section>
  </SiteLayout>;
}
