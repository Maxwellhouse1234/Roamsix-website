import SiteLayout from '../components/SiteLayout';

export default function MembershipManagePage() {
  const portalUrl = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL;
  return <SiteLayout><section className="page-hero membership-success"><div className="container narrow"><p className="eyebrow">Membership billing</p><h1>Manage or cancel your membership online.</h1><p className="page-lead">Use the same email address you used at checkout. Changes made before your next charge apply to the next billing period.</p><div className="button-row">{portalUrl ? <a className="button button-accent" href={portalUrl}>Open billing management</a> : <a className="button button-accent" href="mailto:info@roamsix.com?subject=Manage%20or%20cancel%20my%20ROAMSIX%20membership">Email membership support</a>}<a className="text-link" href="mailto:info@roamsix.com?subject=Cancel%20my%20ROAMSIX%20membership">Request cancellation by email <span aria-hidden="true">→</span></a></div></div></section></SiteLayout>;
}
