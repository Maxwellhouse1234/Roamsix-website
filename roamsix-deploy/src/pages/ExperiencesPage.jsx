import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function ExperiencesPage() {
  return <SiteLayout>
    <section className="page-hero editorial-page-hero"><div className="container narrow"><p className="eyebrow">A PLACE TO BEGIN</p><h1>Most members started with one evening.</h1><p className="page-lead">ROAMSIX events put carefully selected experts in rooms small enough to ask a question, follow up, and leave knowing what you want to look at next.</p></div></section>
    <section className="section light-section"><div className="container">
      <article className="experience-feature-card"><figure className="experience-event-image"><img src="/images/homepage/roamsix-outdoor-panel-bw-v1.jpg" alt="An intimate outdoor panel conversation with an audience." /></figure><p className="eyebrow">OCTOBER 24, 2026 · SAN DIEGO COUNTY · 25 SEATS</p><h2>The gut-brain connection: food, stress, and everyday performance</h2><p><Link to="/experiences#dr-sal">Dr. Sulaiman Bharwani</Link>, pediatric gastroenterologist and founder of GutRewired, on how food, stress, and sleep interact, and which gut-health advice holds up.</p><p>$50 holds your seat. The exact location is released October 7. Full refund if the location does not work for you. Your ticket applies toward founding membership if you join within 48 hours of the event.</p><Link className="button button-accent" to="/events/dr-sal-gut-brain-2026?source=experiences">Hold my seat · $50</Link></article>
    </div></section>
    <section className="section ink-section" id="dr-sal"><div className="container expert-profile">
      <figure className="expert-profile-photo"><img src="/images/experts/dr-sulaiman-bharwani-editorial-v1.jpg" alt="Dr. Sulaiman Bharwani." /></figure>
      <div><p className="eyebrow">Featured expert</p><h2>Dr. Sulaiman Bharwani</h2><p className="profile-role">Founder, GutRewired</p><p className="lead">Pediatric gastroenterologist and educator focused on the gut-brain connection, microbiome, nutrition, and practical strategies for long-term health. Dr. Bharwani brings decades of clinical, academic, and teaching experience to conversations that translate complex science into useful, everyday understanding.</p></div>
    </div></section>
    <section className="section fog-section"><div className="container organization-options"><article><p className="eyebrow">Explore what is ahead</p><h2>Four themes. A more complete view of your health.</h2><p>See how gut health, recovery, focus, and longevity influence one another.</p><Link className="button" to="/events">Explore the themes</Link></article><article><p className="eyebrow">Go beyond one event</p><h2>Keep credible insight within reach throughout the year.</h2><p>Membership gives you ongoing access to vetted expertise, practical learning, immersive experiences, and trusted resources across connected areas of health.</p><Link className="button button-accent" to="/membership">Compare membership options</Link></article></div></section>
  </SiteLayout>;
}
