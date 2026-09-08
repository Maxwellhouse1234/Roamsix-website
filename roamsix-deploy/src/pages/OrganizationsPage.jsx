import SiteLayout from '../components/SiteLayout';
import BookCallButton from '../components/BookCallButton';

const FOCUS_AREAS = [
  ['Energy, recovery, and resilience', 'Help people understand and practice the foundations that support consistent energy, stronger recovery, and sustained output.'],
  ['Nutrition and metabolic health', 'Translate current science into practical choices that support focus, health, and performance at work and at home.'],
  ['Movement, fitness, and longevity', 'Build a more useful understanding of strength, mobility, physical capacity, and long-term performance.'],
  ['Stress, focus, and cognitive performance', 'Give people practical ways to manage pressure, protect attention, and perform without treating exhaustion as commitment.'],
  ['Leadership and communication', 'Strengthen how leaders communicate, make decisions, build trust, and create conditions where teams can perform well.'],
  ['Team connection and functioning', 'Use shared learning and purposeful activities to improve relationships, collaboration, and the way people work together.'],
];

export default function OrganizationsPage() {
  const emailHref = 'mailto:info@roamsix.com?subject=ROAMSIX%20organization%20inquiry';
  return (
    <SiteLayout>
      <section className="page-hero organization-hero">
        <div className="container narrow">
          <p className="eyebrow">For organizations</p>
          <h1>Turn better health into a business advantage.</h1>
          <p className="page-lead">ROAMSIX designs team experiences that help people build the energy, health, resilience, focus, and habits required for sustained performance. We bring together the right experts, environment, activities, and learning around the needs of your people.</p>
          <div className="button-row"><BookCallButton className="button button-accent">Discuss your team</BookCallButton><a className="text-link" href={emailHref}>Send an email <span aria-hidden="true">→</span></a></div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container organization-promise">
          <p className="eyebrow">What we build around</p>
          <div><h2>Healthier people can perform at a higher level for longer.</h2><p className="lead">Your people bring the same body and mind to work that they bring home. Experiences built around health, human performance, and stronger team practices can improve how they think, communicate, recover, and contribute.</p></div>
        </div>
        <div className="container focus-area-grid">
          {FOCUS_AREAS.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section fog-section">
        <div className="container split-copy">
          <p className="eyebrow">Built around your needs</p>
          <div><h2>We bring the experts, setting, and complete experience together.</h2><p className="lead">Start with the outcome your organization wants to improve. ROAMSIX identifies the right faculty, selects an environment that supports the work, and designs the learning, activities, movement, meals, and conversations as one connected experience.</p></div>
        </div>
        <div className="container organization-delivery-grid">
          <article><span>01</span><h3>The right experts</h3><p>Scientists, physicians, practitioners, coaches, facilitators, and leaders chosen for the subject and the needs of your team.</p></article>
          <article><span>02</span><h3>The right environment</h3><p>A distinctive place that removes routine distractions and supports attention, movement, learning, and connection.</p></article>
          <article><span>03</span><h3>The right experience</h3><p>A deliberate sequence of education and activity designed to help people understand, practice, and apply what they learn.</p></article>
        </div>
      </section>

      <section className="section ink-section organization-formats-section">
        <div className="container">
          <p className="eyebrow">Flexible formats</p>
          <h2>One day, one weekend, or a deeper team retreat.</h2>
          <p className="section-intro">ROAMSIX can build a focused learning day, a two-day offsite, or a multi-day experience. We can also place selected employees into an existing ROAMSIX program when the subject and timing are right.</p>
          <div className="button-row"><BookCallButton className="button">Discuss your team</BookCallButton><a className="text-link light" href={emailHref}>Send a quick email <span aria-hidden="true">→</span></a></div>
        </div>
      </section>
    </SiteLayout>
  );
}
