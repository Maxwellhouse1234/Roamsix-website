import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import DrSalAgreementText from '../components/DrSalAgreementText';
import { DR_SAL_GUEST_AGREEMENT_VERSION, DR_SAL_PHOTO_CONSENT } from '../data/drSalGuestAgreement';

const INITIAL_FORM = {
  ticketType: 'individual',
  legalName: '',
  email: '',
  phone: '',
  guestLegalName: '',
  guestEmail: '',
  termsAccepted: false,
  agreementAccepted: false,
  photoConsent: false,
};

export default function DrSalRegistrationPreviewPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [reviewing, setReviewing] = useState(false);
  const pair = form.ticketType === 'pair';
  const price = pair ? 50 : 25;
  const guestLink = useMemo(() => `${window.location.origin}/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest`, []);

  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setReviewing(false);
  }

  function review(event) {
    event.preventDefault();
    setReviewing(true);
  }

  const complete = form.legalName && form.email && form.phone && form.termsAccepted && form.agreementAccepted
    && (!pair || (form.guestLegalName && form.guestEmail));

  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow">
      <p className="eyebrow">PRIVATE IMPLEMENTATION PREVIEW · NOT LIVE REGISTRATION</p>
      <h1>October 24 guest registration and individual agreement</h1>
      <p className="page-lead">This preview shows the proposed attendee experience. Payment, emails and record creation are intentionally disabled until Max approves the implementation and Elizabeth confirms electronic acceptance.</p>
      <div className="event-preview-blockers"><strong>Publication blockers</strong><span>ROAMSIX operating legal entity</span><span>Property host exact legal name</span><span>Elizabeth's approval of Section 5 and electronic acceptance</span></div>
    </div></section>

    <section className="section light-section"><div className="container event-registration-preview-grid">
      <aside className="event-preview-summary">
        <p className="eyebrow">Event details</p>
        <h2>The gut-brain connection: food, stress, and everyday performance</h2>
        <dl>
          <div><dt>Date</dt><dd>October 24, 2026</dd></div>
          <div><dt>Time</dt><dd>4:00–6:00 PM</dd></div>
          <div><dt>Location</dt><dd>Prayers for Peace Park / Essene Retreat Center<br />29455 Pamoosa Lane<br />Valley Center, CA 92082</dd></div>
        </dl>
        <p>Every adult completes this agreement individually. A purchaser cannot accept for another adult.</p>
      </aside>

      <form className="membership-checkout-form event-preview-form" onSubmit={review}>
        <p className="eyebrow">1 · Choose admission</p>
        <div className="event-ticket-options" role="radiogroup" aria-label="Admission type">
          <label className={form.ticketType === 'individual' ? 'selected' : ''}><input type="radio" name="ticketType" value="individual" checked={form.ticketType === 'individual'} onChange={update} /><span><strong>Individual admission</strong><small>$25 · One adult</small></span></label>
          <label className={form.ticketType === 'pair' ? 'selected' : ''}><input type="radio" name="ticketType" value="pair" checked={form.ticketType === 'pair'} onChange={update} /><span><strong>Two admissions</strong><small>$50 · Two adults</small></span></label>
        </div>

        <p className="eyebrow">2 · Your details</p>
        <label>Your full legal name<input name="legalName" value={form.legalName} onChange={update} autoComplete="name" required /></label>
        <div className="form-grid two"><label>Your email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label><label>Your phone<input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" required /></label></div>

        {pair ? <fieldset className="event-guest-fields"><legend>Second attendee</legend><p>The second attendee receives a private link and must accept the agreement themselves no later than 4:00 PM on October 23. Registrations made after that time require acceptance before arrival.</p><label>Second attendee's full legal name<input name="guestLegalName" value={form.guestLegalName} onChange={update} required /></label><label>Second attendee's individual email<input type="email" name="guestEmail" value={form.guestEmail} onChange={update} required /></label></fieldset> : null}

        <p className="eyebrow">3 · Read the complete agreement</p>
        <DrSalAgreementText />

        <div className="event-consent-panel">
          <label className="check"><input type="checkbox" name="agreementAccepted" checked={form.agreementAccepted} onChange={update} required /><span>I confirm that I am at least 18 years old. I have read and understand this agreement. I understand the nature of the event and the risks described. I am voluntarily agreeing to its terms.</span></label>
          <p className="event-version-note">Your full legal name, email, acceptance timestamp and agreement version {DR_SAL_GUEST_AGREEMENT_VERSION} will be recorded. A copy of the accepted agreement will be emailed to you.</p>
        </div>

        <div className="event-photo-consent">
          <p className="eyebrow">4 · Optional photography and video consent</p>
          <h3>{DR_SAL_PHOTO_CONSENT.title}</h3>
          <p>{DR_SAL_PHOTO_CONSENT.subtitle}</p>
          {DR_SAL_PHOTO_CONSENT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <label className="check"><input type="checkbox" name="photoConsent" checked={form.photoConsent} onChange={update} /><span>{DR_SAL_PHOTO_CONSENT.checkbox}</span></label>
          <p className="form-note">Optional and unchecked by default. Your choice is recorded separately from the participation agreement.</p>
        </div>

        <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={update} required /><span>I accept the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
        <button className="button" type="submit" disabled={!complete}>Review registration · ${price}</button>

        {reviewing ? <div className="event-preview-result" role="status">
          <p className="eyebrow">Preview review screen</p>
          <h3>{pair ? 'Two admissions · $50' : 'Individual admission · $25'}</h3>
          <p><strong>{form.legalName}</strong>: agreement complete; photography {form.photoConsent ? 'permitted' : 'declined'}.</p>
          {pair ? <><p><strong>{form.guestLegalName}</strong>: pending individual agreement. Their seat is not admission-ready until completion.</p><p className="event-preview-link"><strong>Unique guest link preview</strong><br /><Link to="/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest">{guestLink}</Link></p></> : null}
          <button className="button" type="button" disabled>Proceed to secure payment · disabled in preview</button>
        </div> : null}
      </form>
    </div></section>
    <section className="section ink-section"><div className="container event-preview-links"><div><p className="eyebrow">Complete workflow preview</p><h2>Review the other side of the process.</h2></div><div className="button-row"><Link className="button button-secondary" to="/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest">Second guest view</Link><Link className="button button-secondary" to="/events/dr-sal-gut-brain-2026/attendance-preview">Private staff view</Link></div></div></section>
  </SiteLayout>;
}
