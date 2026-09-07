import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function MembershipSuccessPage() {
  return (
    <SiteLayout>
      <section className="page-hero membership-success">
        <div className="container narrow">
          <p className="eyebrow">Founding membership confirmed</p>
          <h1>You are part of the 2027 founding year.</h1>
          <p className="page-lead">A confirmation is on its way to your email. We will share the launch calendar and activation details before the program begins.</p>
          <div className="button-row"><Link className="button" to="/events">Explore the 2027 program</Link><Link className="text-link" to="/">Return home</Link></div>
        </div>
      </section>
    </SiteLayout>
  );
}
