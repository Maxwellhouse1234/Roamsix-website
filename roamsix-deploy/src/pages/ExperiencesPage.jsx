import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function ExperiencesPage() {
  return (
    <SiteLayout>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Upcoming ROAMSIX experiences</p>
          <h1>Choose how you want to take part.</h1>
          <p className="page-lead">Join us for a dinner, experience a subject firsthand at a hands-on retreat, or follow a year of questions about how we eat, move, recover, focus, connect, and age.</p>
        </div>
      </section>

      <section className="section light-section">
        <div className="container organization-options">
          <article>
            <p className="eyebrow">Dinner · September 19, 2026</p>
            <h2>An Evening in the Olive Groves</h2>
            <p>A garden tour and farm-to-table dinner at Father’s Farmhouse in Winchester, California. Tickets are available now.</p>
            <Link className="button" to="/dinner">View dinner details</Link>
          </article>
          <article>
            <p className="eyebrow">Upcoming retreat</p>
            <h2>The Microbiome in Practice</h2>
            <p>A hands-on retreat guided by experts and grounded in emerging science, following the microbiome from soil and food into movement, focus, and recovery.</p>
            <Link className="button" to="/first-retreat">View retreat preview</Link>
          </article>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container split-copy">
          <p className="eyebrow">2027 program</p>
          <div>
            <h2>A full year of conversations, one-day experiences, and retreats.</h2>
            <p className="lead">Explore four practical themes across microbiome health, recovery, resilience, and longevity. Follow a single topic or stay with the program throughout the year.</p>
            <Link className="button button-secondary" to="/events">Explore the 2027 program</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
