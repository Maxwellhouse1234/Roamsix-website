import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function MembershipSuccessPage() {
  return (
    <SiteLayout>
      <section className="page-hero membership-success">
        <div className="container narrow">
          <p className="eyebrow">Membership reserved</p>
          <h1>Your place is reserved.</h1>
          <p className="page-lead">No membership fee was charged today. Your confirmation includes your payment schedule, automatic renewal terms, and cancellation instructions. We will confirm the activation date before your first charge.</p>
          <div className="button-row"><Link className="button" to="/events">Explore the 2027 program</Link><Link className="text-link" to="/">Return home</Link></div>
        </div>
      </section>
    </SiteLayout>
  );
}
