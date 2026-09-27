import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function MembershipSuccessPage() {
  return (
    <SiteLayout>
      <section className="page-hero membership-success">
        <div className="container narrow">
          <p className="eyebrow">Membership confirmed</p>
          <h1>Welcome to ROAMSIX. Your path starts here.</h1>
          <p className="page-lead">Your membership payment was completed securely through Stripe. You can now open your member area, set your interests, and see new experiences as they become available.</p>
          <div className="button-row"><Link className="button" to="/member/login">Take me to my member account</Link><Link className="text-link" to="/events">Show me what is ahead</Link></div>
        </div>
      </section>
    </SiteLayout>
  );
}
