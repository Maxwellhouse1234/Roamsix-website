import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

export default function ExperienceFinderPage() {
  return (
    <SiteLayout>
      <section className="page-hero finder-page-hero">
        <div className="container narrow">
          <p className="eyebrow">Find your ROAMSIX experience</p>
          <h1>Find the most relevant way to begin.</h1>
          <p className="page-lead">Tell us whether you are here for yourself, your team, or to collaborate. We will direct you from there.</p>
        </div>
      </section>
      <section className="section fog-section finder-page-section">
        <div className="container"><ExperienceFinder /></div>
      </section>
    </SiteLayout>
  );
}
