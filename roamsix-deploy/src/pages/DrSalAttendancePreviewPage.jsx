import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import EventPreviewNav from '../components/EventPreviewNav';
import { DR_SAL_GUEST_AGREEMENT_VERSION } from '../data/drSalGuestAgreement';
import { AGREEMENT_LAYERS, PREVIEW_ATTENDEES } from '../data/oct24RegistrationPreview';
import { calculateEventRevenue, evaluateCheckInEligibility } from '../lib/eventRegistration';

export default function DrSalAttendancePreviewPage() {
  const revenue = calculateEventRevenue(PREVIEW_ATTENDEES);
  const completeCount = PREVIEW_ATTENDEES.filter((record) => record.agreementStatus === 'accepted').length;
  const declinedCount = PREVIEW_ATTENDEES.filter((record) => record.photoConsent === 'declined').length;
  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">AUTHORIZED PERSONNEL PREVIEW · SAMPLE DATA ONLY</p><h1>October 24 attendance readiness.</h1><p className="page-lead">This proposed private view separates payment from individual agreement status and gives the event lead and photographer only the information they need.</p></div></section>
    <EventPreviewNav />
    <section className="section light-section"><div className="container">
      <div className="event-ops-metrics"><article><span>{PREVIEW_ATTENDEES.length}</span><p>Admissions</p></article><article><span>{completeCount}</span><p>Agreements complete</p></article><article><span>{declinedCount}</span><p>Photography declined</p></article><article><span>${revenue.netCollected}</span><p>Net collected revenue after discounts and refunds</p></article><article><span>${revenue.propertyShare}</span><p>Property share at 20% of net collected revenue</p></article></div>
      <div className="event-ops-note"><strong>Agreement version</strong><span>{DR_SAL_GUEST_AGREEMENT_VERSION}</span><strong>Second-guest deadline</strong><span>October 23, 2026 at 4:00 PM Pacific</span></div>
      <div className="event-ops-table-wrap"><table className="event-ops-table"><thead><tr><th>Attendee</th><th>Admission</th><th>Payment</th><th>Agreement</th><th>Photography</th><th>Admission status</th></tr></thead><tbody>{PREVIEW_ATTENDEES.map((row) => { const eligibility = evaluateCheckInEligibility(row); return <tr key={row.id}><td>{row.attendee}</td><td>{row.admissionType}</td><td>{row.paymentStatus}</td><td><span className={`status-pill ${row.agreementStatus === 'accepted' ? 'complete' : 'pending'}`}>{row.agreementStatus}</span></td><td>{row.photoConsent}</td><td><strong>{eligibility.label}</strong></td></tr>; })}</tbody></table></div>
      <div className="event-revenue-breakdown"><article><strong>{revenue.individual}</strong><span>Individual payment transactions</span></article><article><strong>${revenue.discounts}</strong><span>Discounts</span></article><article><strong>{revenue.memberIncluded}</strong><span>Member-included admissions</span></article><article><strong>{revenue.complimentary}</strong><span>Complimentary admissions</span></article><article><strong>${revenue.refunds}</strong><span>Refunds</span></article></div>
      <div className="event-ops-guidance"><article><p className="eyebrow">Door team</p><h3>Admission status only.</h3><p>Admit only attendees marked Ready. Do not collect medical information at check-in.</p></article><article><p className="eyebrow">Photographer briefing</p><h3>Use the private consent list.</h3><p>Before filming begins, the assigned event lead privately identifies attendees who declined. No public badge or label is used.</p></article><article><p className="eyebrow">Finance</p><h3>Reconcile actual collected revenue.</h3><p>Track full-price, discounted, complimentary and refunded admissions separately. The property share is 20% of collected admission revenue after discounts and refunds, excluding separately contracted sponsorship revenue.</p></article></div>
      <div className="agreement-layer-grid">{AGREEMENT_LAYERS.map(([title, copy]) => <article key={title}><p className="eyebrow">Agreement layer</p><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <Link className="button" to="/events/dr-sal-gut-brain-2026/registration-preview">Return to registration preview</Link>
    </div></section>
  </SiteLayout>;
}
