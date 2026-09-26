import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

export default function HomePage() {
  return <SiteLayout theme="dark">
    <section className="hero home-hero"><div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /><div className="hero-content container">
      <p className="eyebrow">Vetted expertise · immersive learning · a clearer way forward</p><h1>Health advice is everywhere. Knowing what deserves your attention is harder.</h1>
      <p className="hero-copy">ROAMSIX brings research, clinical perspective, specialist expertise, practical education, immersive experiences, and objective insight into one coherent path so you can make better decisions about how you live, feel, and perform.</p>
      <div className="button-row"><Link className="button button-accent" to="/membership">Explore membership</Link><Link className="text-link light" to="/experiences">Attend an upcoming event <span aria-hidden="true">→</span></Link></div>
    </div></section>
    <section className="section fog-section home-finder-section" id="find-your-fit"><div className="container finder-layout"><div><p className="eyebrow">Find the right way in</p><h2>Tell us who you are and what matters now.</h2><p className="lead">We will point you toward the ROAMSIX subject, experience, or membership path most relevant to you.</p></div><ExperienceFinder compact /></div></section>
    <section className="section light-section"><div className="container buyer-story-intro"><p className="eyebrow">Why ROAMSIX</p><div><h2>The problem is not a lack of health information. It is knowing what is credible, relevant, and worth acting on.</h2><p className="lead">ROAMSIX connects vetted expertise with practical education, immersive experience, and credible ways to understand where you stand, so insight becomes useful in your life.</p></div></div></section>
    <section className="section light-section"><div className="container feature-grid"><figure className="feature-image sal-fireside-image"><img src="/images/homepage/roamsix-outdoor-panel-bw-v1.jpg" alt="An intimate outdoor panel conversation with an audience." /></figure><div className="feature-copy">
      <p className="eyebrow">October 24, 2026 · San Diego</p><h2>Gut-health advice is everywhere. Clear guidance is harder to find.</h2><p>Dr. Sulaiman Bharwani joins ROAMSIX for a conversation about the gut-brain connection, food, stress, and everyday performance. The venue will be announced and registration is not yet open.</p><Link className="button button-accent" to="/experiences">Tell me when registration opens</Link>
    </div></div></section>
    <section className="section fog-section"><div className="container"><p className="eyebrow">Your path into ROAMSIX</p><h2>Start with a question. Build toward a clearer understanding.</h2><div className="member-path-grid">
      <article><span>01</span><h3>Begin with what matters now.</h3><p>Choose a timely subject or event rather than trying to solve every part of your health at once.</p></article>
      <article><span>02</span><h3>Learn through a complete lens.</h3><p>Move from evidence and expert interpretation into practical education and firsthand experience.</p></article>
      <article><span>03</span><h3>Use the insight.</h3><p>Identify the next decision, resource, assessment, or experience that can move you forward.</p></article>
    </div><div className="button-row"><Link className="button button-accent" to="/membership">See how membership works</Link></div></div></section>
    <section className="fieldwork-cta membership-home-cta"><div className="container"><div><p className="eyebrow">ROAMSIX membership</p><h2>Stay current without chasing every new health claim.</h2><p>Membership gives you ongoing access to vetted insight, practical education, immersive experiences, and trusted ways to understand your own starting point. Core annual membership is $850.</p></div><Link className="button" to="/membership">Compare membership options</Link></div></section>
    <section className="section fog-section"><div className="container organization-callout"><p className="eyebrow">For organizations</p><h2>You optimize systems. Human performance deserves the same intention.</h2><p className="lead">Your people can be capable and committed while still needing better ways to understand energy, recovery, focus, resilience, and long-term performance. ROAMSIX builds the right expert-led experience around the outcome you care about.</p><Link className="button button-accent" to="/organizations">Explore what could help my team</Link></div></section>
  </SiteLayout>;
}
