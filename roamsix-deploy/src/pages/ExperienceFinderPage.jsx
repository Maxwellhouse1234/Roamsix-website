import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

export default function ExperienceFinderPage() {
  return (
    <SiteLayout>
      <section className="page-hero finder-page-hero">
        <div className="container narrow">
          <p className="eyebrow">Your ROAMSIX starting point</p>
          <h1>You do not need to know which format you want. Start with what matters to you.</h1>
          <p className="page-lead">Tell us what you hope to understand, improve, or protect. We will suggest a relevant next step without assuming you need to change everything.</p>
        </div>
      </section>
      <section className="section fog-section finder-page-section">
        <div className="container"><ExperienceFinder /></div>
      </section>
    </SiteLayout>
  );
}
