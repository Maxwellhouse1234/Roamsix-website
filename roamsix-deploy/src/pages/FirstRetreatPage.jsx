import { useEffect } from 'react';
import SiteLayout from '../components/SiteLayout';
import InterestForm from '../components/InterestForm';
import OfferCta from '../components/OfferCta';
import { retreatOffer } from '../config/retreatOffer';
import { resolveOfferState } from '../lib/offerState';
import { trackEvent } from '../lib/analytics';

const JOURNEY = [
  ['01', 'Begin in the soil', 'A sustainable or regenerative farming expert introduces the microbial life and wider ecosystem that allow food to grow. The microbiome story begins before anything reaches the plate.', 'Explore · Build'],
  ['02', 'Take the harvest into the kitchen', 'A chef works with the ingredients and explains the choices that protect flavor, texture, and nutritional value from harvest through preparation.', 'Nourish · Explore'],
  ['03', 'Understand what reaches the body', 'Dr. Sal connects variety, color, prebiotics, probiotics, and the gut microbiome, with space to separate useful evidence from oversimplified claims.', 'Nourish · Build'],
  ['04', 'Put the system in motion', 'Movement makes the conversation physical. The group explores how gut health may relate to energy, performance, and the ability to sustain effort.', 'Move · Connect'],
  ['05', 'Slow down enough to recover', 'Guided recovery, mindful connection, visualization, and focus turn attention toward stress, restoration, and the gut-brain relationship.', 'Recover · Connect'],
  ['06', 'Carry it into practice', 'The experience closes by bringing the pieces back together. Participants identify what changed in their understanding and what deserves further exploration in their work and life. A follow-through touchpoint will bring the cohort back together to share what they applied and continue the relationships that began here.', 'Build · Connect'],
];

export default function FirstRetreatPage() {
  const state = resolveOfferState(retreatOffer.offerStatus);
  useEffect(() => {
    trackEvent('retreat_view', { retreat_slug: retreatOffer.slug, offer_status: retreatOffer.offerStatus });
  }, [retreatOffer.offerStatus, retreatOffer.slug]);

  return (
    <SiteLayout theme="dark">
      <section className="page-hero retreat-hero">
        <div className="container narrow">
          <p className="eyebrow">Upcoming immersive retreat · 2027 program, Q1</p>
          <h1>The Microbiome in Practice</h1>
          <p className="page-lead">Follow the microbiome from soil and food to the way you move, think, and recover. This retreat is being developed for professionals across health, wellness, fitness, food, and human performance.</p>
          <OfferCta offer={retreatOffer} position="retreat_hero" />
          <p className="status-note">{state.message}</p>
        </div>
      </section>

      <section className="section light-section">
        <div className="container split-copy">
          <p className="eyebrow">The idea</p>
          <div><h2>A living system makes more sense when you can follow the whole cycle.</h2><p className="lead">Begin with the microbes that help food grow. Follow the harvest into the kitchen. Sit with the science at the table. Then feel the subject through movement, recovery, and the gut-brain connection. Each part is experienced in the place where it becomes real.</p><a className="button button-secondary" href="#interest">Get retreat updates</a></div>
        </div>
        <div className="container idea-cycle" aria-label="The microbiome retreat journey from soil to recovery">
          {['Soil', 'Garden', 'Kitchen', 'Table', 'Movement', 'Recovery'].map((stage, index) => <div key={stage}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong></div>)}
        </div>
      </section>

      <section className="section ink-section journey-section">
        <div className="container">
          <p className="eyebrow">The working journey</p>
          <h2>From soil to self.</h2>
          <p className="section-intro">The retreat will follow this six-part arc. Dr. Sulaiman Bharwani (Dr. Sal), the gastroenterologist and nutritionist behind Gut Rewired, is the first expert involved. Additional faculty, activities, timing, and location will be announced as they are confirmed.</p>
          <div className="journey-list">
            {JOURNEY.map(([number, title, copy, pillars]) => (
              <article key={title}><span className="journey-number">{number}</span><div><h3>{title}</h3><p>{copy}</p><p className="journey-pillars">{pillars}</p></div></article>
            ))}
          </div>
          <div className="section-action"><a className="button" href="#interest">Get retreat updates</a></div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container audience-grid">
          <div><p className="eyebrow">Who it is for</p><h2>People who help others live, feel, or perform better.</h2><p>{retreatOffer.audience}</p><p>You do not need to be a microbiome specialist. Curiosity, professional responsibility, and a willingness to learn across disciplines matter more.</p><a className="button button-secondary" href="#interest">Get retreat updates</a></div>
          <div className="quiet-panel"><h3>What this will not be</h3><ul className="check-list negative"><li>A day of passive lectures</li><li>Medical diagnosis or individual treatment</li><li>A shortcut to a credential</li><li>A promise that one protocol works for everyone</li></ul></div>
        </div>
      </section>

      <section className="section fog-section" id="interest">
        <div className="container form-layout">
          <div><p className="eyebrow">Retreat updates</p><h2>Be the first to know when booking opens.</h2><p>Tell us how the subject connects to your work. We will send you the date, location, faculty, pricing, and booking details when the complete retreat is ready.</p></div>
          <InterestForm retreatSlug={retreatOffer.slug} challengeLabel="How would this subject be useful in your work?" submitLabel="Get retreat updates" successTitle="You’re on the retreat update list." />
        </div>
      </section>

      <section className="section light-section">
        <div className="container faq">
          <p className="eyebrow">A few practical questions</p>
          <details><summary>Is a date or price confirmed?</summary><p>Not yet. We will share the date, place, faculty, price, what is included, and the complete terms together rather than release partial information.</p></details>
          <details><summary>Does joining the list reserve a place?</summary><p>No. It tells us you are interested and helps us shape the group. No place is held and no payment is taken at this stage.</p></details>
          <details><summary>Could my employer pay?</summary><p>Yes, that may be possible. Once the offer is ready, we expect to support personal payment and direct employer invoicing as separate options.</p></details>
          <details><summary>Will the experience provide certification?</summary><p>No certification is currently being offered. If approved continuing education or a third-party credential becomes part of the experience, we will state exactly what it is and who recognizes it.</p></details>
        </div>
      </section>
    </SiteLayout>
  );
}
