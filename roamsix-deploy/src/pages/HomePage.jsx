import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import OfferCta from '../components/OfferCta';
import { retreatOffer } from '../config/retreatOffer';
import ExperienceFinder from '../components/ExperienceFinder';

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
          <p className="eyebrow">Curated in-person experiences</p>
          <h1>We bring people and experts together around the subjects that shape how we live.</h1>
          <p className="hero-copy">ROAMSIX creates hands-on retreats, dinners, and learning experiences that explore how we eat, move, recover, focus, connect, and age. Guided by experts and grounded in emerging science, each experience brings these ideas to life through distinctive places, practical activities, shared meals, and meaningful conversation.</p>
          <div className="button-row">
            <Link className="button" to="/dinner#tickets">Reserve the September 19 dinner</Link>
            <Link className="text-link light" to="/find-your-experience">Find your ROAMSIX fit <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="dinner-deadline-strip">
        <div className="container">
          <p><strong>An Evening in the Olive Groves</strong><span>September 19 · Father’s Farmhouse · Reservations close September 14</span></p>
          <Link className="text-link" to="/dinner#tickets">View the evening and reserve <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="section fog-section home-finder-section" id="find-your-fit">
        <div className="container finder-layout">
          <div>
            <p className="eyebrow">Find your ROAMSIX experience</p>
            <h2>Start with what you need.</h2>
            <p className="lead">Four short questions will point you toward the dinner, conversation, retreat, membership, or private experience that fits best.</p>
          </div>
          <ExperienceFinder compact />
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

      <section className="fieldwork-cta membership-home-cta">
        <div className="container">
          <div>
            <p className="eyebrow">Founding membership · 2027</p>
            <h2>Stay connected across the full year.</h2>
            <p>Weekly fireside conversations, a professional community, and first access to selected ROAMSIX experiences. The 2027 founding year is $600 and does not renew automatically.</p>
          </div>
          <Link className="button" to="/membership">Explore membership</Link>
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
