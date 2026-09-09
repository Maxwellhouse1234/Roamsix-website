import SiteLayout from '../components/SiteLayout';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="page-hero about-hero"><div className="container narrow"><p className="eyebrow">About ROAMSIX</p><h1>We built ROAMSIX for people who want to understand health by living it, not only hearing about it.</h1><p className="page-lead">The idea is simple: bring the right people into a real place, build a thoughtful journey around one subject, and let experience do part of the teaching.</p></div></section>

      <section className="section light-section"><div className="container founder-grid">
        <img src="/images/maxime-ouellette-founder.webp" alt="Maxime Ouellette, founder and CEO of ROAMSIX" />
        <div><p className="eyebrow">Founder and CEO</p><h2>Maxime Ouellette</h2><p>Maxime’s path has always crossed performance, health, coaching, and sustainability. He holds a degree in Business Administration and also studied psychology and kinesiology on a pre-med track. He pursued professional baseball, worked as a trainer, built businesses, and spent eight years leading people and operating at scale in the fitness industry. Living in several countries and speaking multiple languages also shaped his belief that better ideas emerge when different cultures and perspectives meet.</p><p>ROAMSIX grew from something more personal. His father’s health story changed the way Maxime thought about the distance between having information and knowing how to live it. He began imagining a place where credible people could connect the pieces, challenge one another, and make better health something people could experience firsthand.</p></div>
      </div></section>

      <section className="section fog-section"><div className="container founder-grid reverse">
        <img src="/images/jackie.webp" alt="Jackie Slot, co-founder and head of experience design at ROAMSIX" />
        <div><p className="eyebrow">Co-founder and head of experience design</p><h2>Jackie Slot</h2><p>Jackie designs experiences around the moment a person feels safe enough to set aside the role they play and show up as they are. For her, the activity is only the opening. What matters is whether it creates curiosity, confidence, connection, or the courage to take a meaningful next step.</p><p>Her approach is grounded in years of coaching and movement. Jackie is a NASM Certified Personal Trainer, Corrective Exercise Specialist, and Fitness Nutrition Specialist, with additional training in integrative nutrition. At ROAMSIX, she brings that understanding to the full guest journey, shaping the details that help people feel cared for, fully present, and open to possibility.</p></div>
      </div></section>

      <section className="section light-section"><div className="container split-copy"><p className="eyebrow">What we believe</p><div><h2>The place, the pace, and the people are part of what is being taught.</h2><p className="lead">ROAMSIX starts with the journey we want people to take. We bring the experts, food, movement, environment, and conversations together around that journey so every part deepens the same idea.</p></div></div></section>

      <section className="closing-section"><div className="container"><p className="closing-line">The right people change what’s possible.</p><Link className="button" to="/experiences">See upcoming experiences</Link></div></section>
    </SiteLayout>
  );
}
