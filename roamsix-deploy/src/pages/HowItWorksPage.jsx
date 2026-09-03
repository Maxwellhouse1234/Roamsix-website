import SiteLayout from '../components/SiteLayout';
import { Link } from 'react-router-dom';

const PILLARS = ['Move', 'Nourish', 'Recover', 'Connect', 'Explore', 'Build'];

export default function HowItWorksPage() {
  return (
    <SiteLayout>
      <section className="page-hero"><div className="container narrow"><p className="eyebrow">How ROAMSIX works</p><h1>How we turn a subject into an experience.</h1><p className="page-lead">The experience is built around the subject, not a stage. People learn from experts, then touch, taste, move, question, make, reflect, and connect as the idea comes to life.</p></div></section>
      <section className="section light-section"><div className="container process-list">
        <article><span>01</span><div><h2>Find the question worth leaving home for.</h2><p>The subject has to matter in people’s real lives or work. We get specific about what they want to understand, what is being misunderstood, and what can honestly be experienced.</p><Link className="text-link" to="/events#quarters">Browse the 2027 themes <span aria-hidden="true">→</span></Link></div></article>
        <article><span>02</span><div><h2>Bring different perspectives together.</h2><p>A doctor may explain the science. A farmer, chef, coach, facilitator, or practitioner may reveal what the same subject looks like in another setting. Their perspectives connect the parts into a fuller understanding.</p><Link className="text-link" to="/events#quarters">See the fields we are connecting <span aria-hidden="true">→</span></Link></div></article>
        <article><span>03</span><div><h2>Involve the whole person.</h2><div className="inline-pillars">{PILLARS.map((pillar) => <span key={pillar}>{pillar}</span>)}</div><p>Explore, Nourish, Move, Recover, Connect, and Build guide what people do throughout the experience. The balance changes with the subject, but the goal stays the same: make the learning tangible and useful.</p><Link className="text-link" to="/events#quarters">Explore the 2027 themes <span aria-hidden="true">→</span></Link></div></article>
        <article><span>04</span><div><h2>Create a journey with purpose.</h2><p>Behind the scenes, every detail, sequence, pace, and transition is shaped deliberately. It is how the experience feels intentional without ever feeling scripted.</p><Link className="text-link" to="/events#quarters">See how the year builds <span aria-hidden="true">→</span></Link></div></article>
        <article><span>05</span><div><h2>Bring the learning back to work and life.</h2><p>Before people leave, they identify what changed in their understanding and what they want to apply. Follow-up conversations help the learning and the relationships continue after the experience ends.</p><Link className="text-link" to="/experiences">See upcoming experiences <span aria-hidden="true">→</span></Link></div></article>
      </div></section>
      <section className="closing-section"><div className="container"><p className="closing-line">Come curious. Leave seeing the whole system differently.</p><Link className="button" to="/experiences">See upcoming experiences</Link></div></section>
    </SiteLayout>
  );
}
