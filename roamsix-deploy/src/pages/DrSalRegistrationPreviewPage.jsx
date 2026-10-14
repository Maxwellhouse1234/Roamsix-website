import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import DrSalAgreementText from '../components/DrSalAgreementText';
import EventPreviewNav from '../components/EventPreviewNav';
import { DR_SAL_GUEST_AGREEMENT_VERSION, DR_SAL_PHOTO_CONSENT } from '../data/drSalGuestAgreement';

const INITIAL_FORM = {
  registrationMode: 'public',
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
  const member = form.registrationMode === 'member';
  const pair = form.ticketType === 'pair';
  const price = pair ? 50 : 25;
  const guestLink = `${window.location.origin}/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest`;

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
    && (member || !pair || (form.guestLegalName && form.guestEmail));

  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow">
      <p className="eyebrow">PRIVATE IMPLEMENTATION PREVIEW · NOT LIVE REGISTRATION</p>
      <h1>October 24 guest registration and individual agreement</h1>
      <p className="page-lead">This preview shows the proposed attendee experience. Payment, emails and record creation are intentionally disabled until Max approves the implementation and Elizabeth confirms electronic acceptance.</p>
      <div className="event-preview-blockers"><strong>Publication blockers</strong><span>Property host exact legal name</span><span>Elizabeth's approval of Section 5 and electronic acceptance</span><span>Insurance requirements confirmed</span></div>
    </div></section>
    <EventPreviewNav />

    <section className="section fog-section event-preview-value"><div className="container narrow">
      <p className="eyebrow">What you are coming to experience</p>
      <h2>Ask a better question about the gut-brain connection.</h2>
      <p className="lead"><Link to="/experiences#dr-sal">Dr. Sulaiman Bharwani</Link>, a gastroenterologist, nutritionist and founder of GutRewired, will explore how food, stress, sleep, the microbiome and the gut-brain connection interact in everyday life.</p>
      <div className="event-value-points"><span>Moderated expert conversation</span><span>Audience questions in a small group</span><span>Optional fermented-food tastings</span></div>
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
        <p>Every adult completes the event-specific agreement individually. A purchaser cannot accept for another adult.</p>
      </aside>

      <form className="membership-checkout-form event-preview-form" onSubmit={review}>
        <p className="eyebrow">1 · Choose registration path</p>
        <div className="event-ticket-options" role="radiogroup" aria-label="Registration path">
          <label className={!member ? 'selected' : ''}><input type="radio" name="registrationMode" value="public" checked={!member} onChange={update} /><span><strong>Public admission</strong><small>Purchase one or two admissions</small></span></label>
          <label className={member ? 'selected' : ''}><input type="radio" name="registrationMode" value="member" checked={member} onChange={update} /><span><strong>Eligible member</strong><small>Included admission · no purchase</small></span></label>
        </div>

        {!member ? <><p className="eyebrow">2 · Choose admission</p>
          <div className="event-ticket-options" role="radiogroup" aria-label="Admission type">
            <label className={form.ticketType === 'individual' ? 'selected' : ''}><input type="radio" name="ticketType" value="individual" checked={form.ticketType === 'individual'} onChange={update} /><span><strong>Individual admission</strong><small>$25 · One adult</small></span></label>
            <label className={form.ticketType === 'pair' ? 'selected' : ''}><input type="radio" name="ticketType" value="pair" checked={form.ticketType === 'pair'} onChange={update} /><span><strong>Two admissions</strong><small>$50 · Two adults</small></span></label>
          </div></> : <div className="event-member-included"><strong>Your admission is included.</strong><p>The signed-in member account supplies the verified email and active membership status. No Stripe checkout opens. The member still completes this event-specific agreement before the seat becomes admission-ready.</p></div>}

        <p className="eyebrow">3 · Your details</p>
        <label>Your full legal name<input name="legalName" value={form.legalName} onChange={update} autoComplete="name" required /></label>
        <div className="form-grid two"><label>Your email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label><label>Your phone<input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" required /></label></div>

        {!member && pair ? <fieldset className="event-guest-fields"><legend>Second attendee</legend><p>The second attendee receives a private link and must accept the agreement themselves no later than 4:00 PM on October 23. Registrations made after that time require acceptance before arrival.</p><label>Second attendee's full legal name<input name="guestLegalName" value={form.guestLegalName} onChange={update} required /></label><label>Second attendee's individual email<input type="email" name="guestEmail" value={form.guestEmail} onChange={update} required /></label></fieldset> : null}

        <p className="eyebrow">4 · Read the complete event agreement</p>
        <DrSalAgreementText />

        <div className="event-consent-panel">
          <label className="check"><input type="checkbox" name="agreementAccepted" checked={form.agreementAccepted} onChange={update} required /><span>I have read and agree to the October 24, 2026 Guest Participation Agreement and Liability Waiver shown above.</span></label>
          <p className="event-version-note">Your full legal name, email, acceptance timestamp and agreement version {DR_SAL_GUEST_AGREEMENT_VERSION} will be recorded. A copy of the accepted agreement will be emailed to you.</p>
        </div>

        <div className="event-photo-consent">
          <p className="eyebrow">5 · Optional photography and video consent</p>
          <h3>{DR_SAL_PHOTO_CONSENT.title}</h3>
          <p>{DR_SAL_PHOTO_CONSENT.subtitle}</p>
          {DR_SAL_PHOTO_CONSENT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <label className="check"><input type="checkbox" name="photoConsent" checked={form.photoConsent} onChange={update} /><span>{DR_SAL_PHOTO_CONSENT.checkbox}</span></label>
          <p className="form-note">Optional and unchecked by default. Your choice is recorded separately from the participation agreement.</p>
        </div>

        <div className="event-registration-terms">
          <p className="eyebrow">6 · Event registration terms and privacy</p>
          <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={update} required /><span>I accept the <Link to="/terms" target="_blank">Event Registration Terms</Link>.</span></label>
          <p className="form-note"><strong>Privacy notice:</strong> ROAMSIX uses the contact, registration, agreement and consent information collected here to administer this event, confirm admission and communicate essential event details. Review the <Link to="/privacy" target="_blank">Privacy Policy</Link>. The Privacy Policy is provided as notice and is not bundled into the terms checkbox.</p>
        </div>
        <button className="button" type="submit" disabled={!complete}>{member ? 'Review my included admission' : `Review registration · $${price}`}</button>

        {reviewing ? <div className="event-preview-result" role="status">
          <p className="eyebrow">Preview review screen</p>
          <h3>{member ? 'Member-included admission · no payment' : pair ? 'Two admissions · $50' : 'Individual admission · $25'}</h3>
          <p><strong>{form.legalName}</strong>: agreement complete; photography {form.photoConsent ? 'permitted' : 'declined'}.</p>
          {!member && pair ? <><p><strong>{form.guestLegalName}</strong>: pending individual agreement. Their seat is not admission-ready until completion.</p><p className="event-preview-link"><strong>Unique guest link preview</strong><br /><Link to="/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest">{guestLink}</Link></p></> : null}
          <button className="button" type="button" disabled>{member ? 'Reserve included admission · disabled in preview' : 'Proceed to secure payment · disabled in preview'}</button>
        </div> : null}
      </form>
    </div></section>
    <section className="section ink-section"><div className="container event-preview-links"><div><p className="eyebrow">Individual guest completion</p><h2>See what the second attendee receives.</h2></div><div className="button-row"><Link className="button button-secondary" to="/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest">Second guest view</Link><Link className="button button-secondary" to="/events/dr-sal-gut-brain-2026/email-preview">Email previews</Link></div></div></section>
  </SiteLayout>;
}
