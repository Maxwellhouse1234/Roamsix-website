import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import OfferCta from '../components/OfferCta';
import { retreatOffer } from '../config/retreatOffer';
import ExperienceFinder from '../components/ExperienceFinder';

const PILLARS = [
  ['Explore', 'Go deeper into the subject than a talk ever could, and further outside your comfort zone than you planned on.'],
  ['Nourish', 'Understand how food, preparation, and nourishment shape the way we live and perform.'],
  ['Move', 'Put understanding into the body. Movement is how an idea stops being information and starts being something you can feel.'],
  ['Recover', 'Make space for rest, reflection, and the conditions that help learning settle.'],
  ['Connect', 'Learn alongside people who see the subject differently than you do, and build relationships that outlast the experience.'],
  ['Build', 'Take what you experienced and build forward with it, onto a stronger foundation, in a way that works differently than before.'],
];

export default function HomePage() {
  return (
    <SiteLayout theme="dark">
      <section className="hero home-hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content container">
          <p className="eyebrow">For people building full and consequential lives</p>
          <h1>You have built a full life. Make sure you are still fully living it.</h1>
          <p className="hero-copy">A high-performing life requires more than financial security. It requires the health, energy, perspective, and relationships to sustain what you are building. ROAMSIX turns expert knowledge into lived experiences that help you invest in all of it.</p>
          <div className="button-row">
            <Link className="button button-accent" to="/dinner#tickets">Reserve the September 19 dinner</Link>
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

      <section className="section light-section buyer-story-section">
        <div className="container buyer-story-intro">
          <p className="eyebrow">What success can leave unattended</p>
          <div><h2>You can be doing well and still be underinvesting in the life that makes success worth having.</h2><p className="lead">Responsibility pulls attention toward work, family, and the future. Health gets postponed. Familiar routines replace exploration. Information piles up without changing how you live. These problems are easy to miss because life still looks successful.</p></div>
        </div>
        <div className="container buyer-tensions">
          <article><span>01</span><h3>Your calendar expands. Your world repeats.</h3><p>The same routines, places, and professional circles keep you productive while limiting what challenges or renews you.</p></article>
          <article><span>02</span><h3>You know more. Your life changes less.</h3><p>Books, podcasts, and experts add information. Without the right setting and practice, very little becomes part of how you live.</p></article>
          <article><span>03</span><h3>You meet more people. Fewer expand how you think.</h3><p>A larger network does not guarantee honest conversation, meaningful relationships, or perspectives beyond your field.</p></article>
          <article><span>04</span><h3>You take time away. The same patterns return.</h3><p>Relief can restore your energy for a few days. Lasting change requires the insight, practice, and support to live differently afterward.</p></article>
        </div>
      </section>

      <section className="section ink-section home-entry-section">
        <div className="container">
          <p className="eyebrow">What brings you to ROAMSIX?</p>
          <h2>Choose where you want to begin.</h2>
          <div className="home-entry-grid">
            <article><span>01</span><h3>For yourself</h3><p>Find the subject and format that match what you want to strengthen in your health, performance, relationships, or life.</p><a className="text-link light" href="#find-your-fit">Find your experience <span aria-hidden="true">→</span></a></article>
            <article><span>02</span><h3>For your team</h3><p>Build stronger health, energy, resilience, leadership, and team performance around the needs of your organization.</p><Link className="text-link light" to="/organizations">Explore team experiences <span aria-hidden="true">→</span></Link></article>
            <article><span>03</span><h3>With your expertise</h3><p>Work with ROAMSIX to turn your research, practice, place, or craft into an experience people can apply.</p><Link className="text-link light" to="/collaborate">Explore collaboration <span aria-hidden="true">→</span></Link></article>
          </div>
        </div>
      </section>

      <section className="section fog-section home-finder-section" id="find-your-fit">
        <div className="container finder-layout">
          <div>
            <p className="eyebrow">Find your ROAMSIX experience</p>
            <h2>Start with the life you want to strengthen.</h2>
            <p className="lead">Tell us what interests you, how you prefer to learn, and how much time you can make. We will match you with a ROAMSIX curriculum and format, then send the best options to your inbox.</p>
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

      <section className="section fog-section expert-home-callout">
        <div className="container organization-callout">
          <p className="eyebrow">For scientists, doctors, and specialists</p>
          <h2>Your work deserves more than a stage and a slide deck.</h2>
          <p>Bring a consequential question, body of research, practice, or point of view. ROAMSIX can shape the place, people, and hands-on journey that help others understand it more deeply.</p>
          <Link className="button button-accent" to="/collaborate">Explore collaborating with us</Link>
        </div>
      </section>

      <section className="fieldwork-cta membership-home-cta">
        <div className="container">
          <div>
            <p className="eyebrow">Founding membership · 2027</p>
            <h2>Build better health, stronger relationships, and wider perspective across the year.</h2>
            <p>Membership includes weekly expert-led fireside conversations, a cross-disciplinary community, and priority access to selected ROAMSIX dinners, learning days, and retreats.</p>
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
          <h2>Turn better health into a business advantage.</h2>
          <p>ROAMSIX builds team experiences around applied health science, sustainable performance, leadership, communication, and the practices that help people perform better at work and at home.</p>
          <Link className="button button-secondary" to="/organizations">Explore organization experiences</Link>
        </div>
      </section>

      <section className="closing-section">
        <div className="container">
          <p className="closing-line">Bridging knowing and doing.</p>
          <Link className="button" to="/experiences">See upcoming experiences</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
