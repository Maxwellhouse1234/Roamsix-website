import SiteLayout from '../components/SiteLayout';
import { Link } from 'react-router-dom';
import { PUBLIC_CONTENT_APPROVALS } from '../config/publicContent';

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="page-hero about-hero"><div className="container narrow"><p className="eyebrow">About ROAMSIX</p><h1>ROAMSIX began with a question we could not answer from another article, podcast, or protocol.</h1><p className="page-lead">How do you know what matters for the life you are trying to build? We created ROAMSIX as a place to explore that question with trusted perspectives, memorable experiences, and people who care about many of the same things.</p></div></section>

      <section className="section light-section"><div className="container founder-grid">
        <img src="/images/maxime-ouellette-founder.webp" alt="Maxime Ouellette, founder and CEO of ROAMSIX" />
        <div><p className="eyebrow">Founder and CEO</p><h2>Maxime Ouellette</h2><p>ROAMSIX grew from something personal. His father’s health story changed the way Maxime thought about the distance between having information and knowing what to do with it. He began imagining a place where carefully selected experts could help people connect the pieces, think for themselves, and experience important ideas firsthand.</p><p>That question brought together a career across performance, health, coaching, and sustainability. Maxime holds a degree in Business Administration and studied psychology and kinesiology on a pre-med track. He pursued professional baseball, worked as a trainer, built businesses, and spent eight years leading people and operating at scale in the fitness industry. Living in several countries also shaped his belief that better ideas emerge when different perspectives meet.</p></div>
      </div></section>

      <section className="section fog-section"><div className="container founder-grid reverse">
        <img src="/images/jackie.webp" alt="Jackie Slot, co-founder and head of experience design at ROAMSIX" />
        <div><p className="eyebrow">Co-founder and head of experience design</p><h2>Jackie Slot</h2><p>Jackie designs experiences around the moment a person feels safe enough to set aside the role they play and show up as they are. For her, the activity is only the opening. What matters is whether it creates curiosity, confidence, connection, or the courage to take a meaningful next step.</p><p>Her approach is grounded in years of coaching and movement. Jackie is a NASM Certified Personal Trainer, Corrective Exercise Specialist, and Fitness Nutrition Specialist, with additional training in integrative nutrition. At ROAMSIX, she brings that understanding to the full guest journey, shaping the details that help people feel cared for, fully present, and open to possibility.</p></div>
      </div></section>

      {PUBLIC_CONTENT_APPROVALS.hollyBeckProfile ? <section className="section light-section"><div className="container founder-grid">
        <img className="profile-photo" src="/images/team/holly-beck-profile-bw.jpg" alt="Holly Beck, Partnerships and Programming Lead at ROAMSIX" />
        <div><p className="eyebrow">Partnerships &amp; Programming Lead</p><h2>Holly Beck</h2><p>Holly brings people, ideas, and perspectives together around a simple belief: learning becomes meaningful when it can be explored, experienced, and carried into everyday life.</p><p>Her perspective is shaped by a decades-long personal health journey and work across health coaching, integrative wellness, herbalism, podcasting, hospitality, and guest experience. At ROAMSIX, Holly cultivates collaborations, brings complementary perspectives into the room, and helps shape programming around questions that matter to people’s lives.</p></div>
      </div></section> : null}

      <section className="section fog-section"><div className="container split-copy"><p className="eyebrow">What we believe</p><div><h2>You deserve more than another answer without context.</h2><p className="lead">Good information matters. So does the space to understand it, question it, and decide what belongs in your life. ROAMSIX brings research, experts whose work we trust, and shared experience together to make that possible.</p></div></div></section>

      <section className="closing-section"><div className="container"><p className="closing-line">Learn what matters. Experience what works. Carry it forward.</p><Link className="button" to="/experiences">Show me the next experience</Link></div></section>
    </SiteLayout>
  );
}
