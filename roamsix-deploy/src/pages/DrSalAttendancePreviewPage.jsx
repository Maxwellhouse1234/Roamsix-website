import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { DR_SAL_GUEST_AGREEMENT_VERSION } from '../data/drSalGuestAgreement';

const rows = [
  { attendee: 'Purchaser preview', admission: 'Individual · paid', payment: 'Paid', waiver: 'Complete', photo: 'Declined', readiness: 'Ready' },
  { attendee: 'Pair purchaser preview', admission: 'Pair · paid', payment: 'Paid', waiver: 'Complete', photo: 'Permitted', readiness: 'Ready' },
  { attendee: 'Second guest preview', admission: 'Pair · guest', payment: 'Covered by pair', waiver: 'Pending', photo: 'Not answered', readiness: 'Do not admit' },
  { attendee: 'Complimentary preview', admission: 'Complimentary', payment: '$0', waiver: 'Complete', photo: 'Declined', readiness: 'Ready' },
];

export default function DrSalAttendancePreviewPage() {
  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">AUTHORIZED PERSONNEL PREVIEW · SAMPLE DATA ONLY</p><h1>October 24 attendance readiness.</h1><p className="page-lead">This proposed private view separates payment from individual agreement status and gives the event lead and photographer only the information they need.</p></div></section>
    <section className="section light-section"><div className="container">
      <div className="event-ops-metrics"><article><span>4</span><p>Admissions</p></article><article><span>3</span><p>Agreements complete</p></article><article><span>2</span><p>Photography declined</p></article><article><span>$75</span><p>Collected admission revenue</p></article><article><span>$15</span><p>Property share at 20%</p></article></div>
      <div className="event-ops-note"><strong>Agreement version</strong><span>{DR_SAL_GUEST_AGREEMENT_VERSION}</span><strong>Second-guest deadline</strong><span>October 23, 2026 at 4:00 PM Pacific</span></div>
      <div className="event-ops-table-wrap"><table className="event-ops-table"><thead><tr><th>Attendee</th><th>Admission</th><th>Payment</th><th>Agreement</th><th>Photography</th><th>Admission status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.attendee}><td>{row.attendee}</td><td>{row.admission}</td><td>{row.payment}</td><td><span className={`status-pill ${row.waiver === 'Complete' ? 'complete' : 'pending'}`}>{row.waiver}</span></td><td>{row.photo}</td><td><strong>{row.readiness}</strong></td></tr>)}</tbody></table></div>
      <div className="event-ops-guidance"><article><p className="eyebrow">Door team</p><h3>Admission status only.</h3><p>Admit only attendees marked Ready. Do not collect medical information at check-in.</p></article><article><p className="eyebrow">Photographer briefing</p><h3>Use the private consent list.</h3><p>Before filming begins, the assigned event lead privately identifies attendees who declined. No public badge or label is used.</p></article><article><p className="eyebrow">Finance</p><h3>Reconcile actual collected revenue.</h3><p>Track individual, pair, complimentary, discount and refunded admissions separately. The property share is 20% of collected admission revenue after discounts and refunds, excluding separately contracted sponsorship revenue.</p></article></div>
      <Link className="button" to="/events/dr-sal-gut-brain-2026/registration-preview">Return to registration preview</Link>
    </div></section>
  </SiteLayout>;
}
