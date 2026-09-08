import SiteLayout from '../components/SiteLayout';
import { Link } from 'react-router-dom';

const PILLARS = ['Explore', 'Nourish', 'Move', 'Recover', 'Connect', 'Build'];

export default function HowItWorksPage() {
  return (
    <SiteLayout>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">How ROAMSIX works</p>
          <h1>Expert knowledge becomes a lived experience.</h1>
          <p className="page-lead">ROAMSIX starts with a subject that affects how people live or perform. We bring together the right experts, environment, activities, meals, movement, and conversation so people can understand the science, practice it, and decide what to change.</p>
        </div>
      </section>

      <section className="section light-section format-section">
        <div className="container split-copy">
          <p className="eyebrow">Choose a format</p>
          <div><h2>Start with the amount of time you can make.</h2><p className="lead">Each format is complete on its own. More time allows for more practice, exploration, and connection around the subject.</p></div>
        </div>
        <div className="container format-grid">
          <article><span>One evening</span><h3>Dinners and fireside conversations</h3><p>One focused subject explored through expert guidance, meaningful conversation, and a shared experience.</p></article>
          <article><span>One day</span><h3>Immersive learning days</h3><p>Learn the science, see it applied, practice it, move, share a meal, and connect it to your own life or work.</p></article>
          <article><span>One weekend</span><h3>Focused retreats</h3><p>Give a meaningful subject enough time for deeper learning, application, recovery, and relationships to develop.</p></article>
          <article><span>Several days</span><h3>Deep retreats and journeys</h3><p>Follow one subject across experts, places, and practices, then build a clear plan for what continues at home.</p></article>
        </div>
      </section>

      <section className="section ink-section">
        <div className="container process-intro">
          <p className="eyebrow">What ROAMSIX provides</p>
          <h2>Every part of the experience serves the outcome.</h2>
        </div>
        <div className="container journey-list">
          <article><span className="journey-number">01</span><div><h3>Define what should improve.</h3><p>We begin with a practical outcome: better energy, stronger recovery, healthier nutrition, greater longevity, clearer leadership, stronger relationships, or more sustainable performance.</p></div></article>
          <article><span className="journey-number">02</span><div><h3>Bring together the right expertise and environment.</h3><p>Scientists, physicians, practitioners, coaches, farmers, chefs, leaders, and other specialists contribute where their knowledge is most useful. The setting helps people pay attention and engage differently.</p></div></article>
          <article><span className="journey-number">03</span><div><h3>Make the learning physical and practical.</h3><div className="inline-pillars">{PILLARS.map((pillar) => <span key={pillar}>{pillar}</span>)}</div><p>People listen, question, taste, move, practice, reflect, and connect. Explore, Nourish, Move, Recover, Connect, and Build guide how the subject becomes something people can use.</p></div></article>
          <article><span className="journey-number">04</span><div><h3>Build the bridge back to daily life.</h3><p>Participants identify the practices, decisions, and conversations that matter next. Follow-up learning helps turn a memorable experience into sustainable change.</p></div></article>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container organization-callout">
          <p className="eyebrow">Find your place to begin</p>
          <h2>Choose a subject. Choose a format. We design the rest.</h2>
          <p>Use the experience finder to match your interests with an evening, a day, a weekend, a multi-day retreat, or the full 2027 membership.</p>
          <Link className="button button-accent" to="/#find-your-fit">Find your ROAMSIX experience</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
