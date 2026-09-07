import SiteLayout from '../components/SiteLayout';
import ExperienceFinder from '../components/ExperienceFinder';

export default function ExperienceFinderPage() {
  return (
    <SiteLayout>
      <section className="page-hero finder-page-hero">
        <div className="container narrow">
          <p className="eyebrow">Find your ROAMSIX experience</p>
          <h1>Start with what you need.</h1>
          <p className="page-lead">Four short questions will point you toward the dinner, conversation, retreat, membership, or private format that fits best.</p>
        </div>
      </section>
      <section className="section fog-section finder-page-section">
        <div className="container"><ExperienceFinder /></div>
      </section>
    </SiteLayout>
  );
}
