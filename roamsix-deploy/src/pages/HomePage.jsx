import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import OfferCta from '../components/OfferCta';
import { retreatOffer } from '../config/retreatOffer';

const PILLARS = [
  ['Explore', 'Go deeper into the subject than a talk ever could, and further outside your comfort zone than you planned on.'],
  ['Nourish', 'Understand how food, preparation, and nourishment shape the way we live and perform.'],
  ['Move', 'Put understanding into the body. Movement is how an idea stops being information and starts being something you can feel.'],
  ['Recover', 'Create room for rest, reflection, and the conditions that help learning settle.'],
  ['Connect', 'Learn alongside people who see the subject differently than you do, and build the kind of relationships that outlast the room.'],
  ['Build', 'Take what you experienced and build forward with it, onto a stronger foundation, in a way that works differently than before.'],
];

export default function HomePage() {
  return (
    <SiteLayout theme="dark">
      <section className="hero home-hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content container">
          <p className="eyebrow">Immersive professional learning in distinctive places</p>
          <h1>Learn from experts. Experience the subject firsthand.</h1>
          <p className="hero-copy">ROAMSIX creates hands-on retreats, dinners, and learning experiences for people working across health, wellness, fitness, food, and human performance. Each experience connects expert knowledge with real places, practical activities, and thoughtful conversation.</p>
          <div className="button-row">
            <Link className="button" to="/experiences">See upcoming experiences</Link>
            <Link className="text-link light" to="/how-it-works">How ROAMSIX works <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container split-copy">
          <p className="eyebrow">Why ROAMSIX</p>
          <div>
            <h2>Most learning stops just before the part that matters.</h2>
            <p className="lead">We learn from the expert, then bring the subject to life. ROAMSIX builds a journey around the idea so people can see it, taste it, move through it, question it, and decide how it belongs in their own work and life.</p>
          </div>
        </div>
      </section>

      <section className="section ink-section pillars-section">
        <div className="container">
          <p className="eyebrow">What every experience includes</p>
          <h2>Learning that involves the whole person.</h2>
          <p className="section-intro">Every ROAMSIX experience draws from six elements: Explore, Nourish, Move, Recover, Connect, and Build. The balance changes with the subject, but each element helps turn information into something people can understand, feel, and use.</p>
          <div className="pillar-grid">
            {PILLARS.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container feature-grid">
          <div className="feature-image retreat-image" role="img" aria-label="Guests sharing a meal at a ROAMSIX long-table experience" />
          <div className="feature-copy">
            <p className="eyebrow">Upcoming retreat</p>
            <h2>{retreatOffer.name}</h2>
            <p>We plan to follow one living system through a complete cycle: from the microbes in the soil, to the food those systems produce, to the way it is prepared, absorbed, and expressed through energy, movement, focus, and recovery.</p>
            <p className="quiet"><strong>Who it is for:</strong> {retreatOffer.audience}</p>
            <OfferCta offer={retreatOffer} position="home_retreat_module" />
          </div>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container split-copy">
          <p className="eyebrow">How it comes together</p>
          <div>
            <h2>Every experience is designed as a journey.</h2>
            <p className="lead">Whether it unfolds over an evening, a full day, or several days, every ROAMSIX experience follows a deliberate rhythm from arrival to departure. The faculty, food, movement, place, and conversations all carry part of the same story.</p>
            <Link className="text-link" to="/how-it-works">See how the journey is built <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container organization-callout">
          <p className="eyebrow">For organizations</p>
          <h2>Give your people something they can bring back with them.</h2>
          <p>Organizations may support an individual’s place or speak with us about a future experience built around a question their people are already facing.</p>
          <Link className="button button-secondary" to="/organizations">Start a conversation</Link>
        </div>
      </section>

      <section className="closing-section">
        <div className="container">
          <p className="closing-line">The right people change what’s possible.</p>
          <Link className="button" to="/experiences">See upcoming experiences</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
