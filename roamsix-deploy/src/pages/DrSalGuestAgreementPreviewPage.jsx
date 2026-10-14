import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import DrSalAgreementText from '../components/DrSalAgreementText';
import EventPreviewNav from '../components/EventPreviewNav';
import { DR_SAL_GUEST_AGREEMENT_VERSION, DR_SAL_PHOTO_CONSENT } from '../data/drSalGuestAgreement';

export default function DrSalGuestAgreementPreviewPage() {
  const [form, setForm] = useState({ legalName: '', email: '', agreementAccepted: false, photoConsent: false });
  const [complete, setComplete] = useState(false);
  const tokenPresent = new URLSearchParams(window.location.search).has('token');

  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setComplete(false);
  }

  function submit(event) {
    event.preventDefault();
    setComplete(true);
  }

  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">PRIVATE GUEST-FLOW PREVIEW · NO RECORD IS SAVED</p><h1>Complete your individual guest agreement.</h1><p className="page-lead">A seat was reserved for you for the October 24 ROAMSIX event. The purchaser cannot accept this agreement for you.</p></div></section>
    <EventPreviewNav />
    <section className="section light-section"><div className="container narrow">
      {!tokenPresent ? <p className="form-error">This preview link is missing its guest token.</p> : null}
      <form className="membership-checkout-form event-preview-form" onSubmit={submit}>
        <label>Your full legal name<input name="legalName" value={form.legalName} onChange={update} autoComplete="name" required /></label>
        <label>Your individual email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label>
        <DrSalAgreementText />
        <div className="event-consent-panel"><label className="check"><input type="checkbox" name="agreementAccepted" checked={form.agreementAccepted} onChange={update} required /><span>I have read and agree to the October 24, 2026 Guest Participation Agreement and Liability Waiver shown above.</span></label><p className="event-version-note">Your identity, timestamp and agreement version {DR_SAL_GUEST_AGREEMENT_VERSION} will be recorded, and you will receive a copy by email.</p></div>
        <div className="event-photo-consent"><p className="eyebrow">Optional photography and video consent</p>{DR_SAL_PHOTO_CONSENT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<label className="check"><input type="checkbox" name="photoConsent" checked={form.photoConsent} onChange={update} /><span>{DR_SAL_PHOTO_CONSENT.checkbox}</span></label></div>
        <button className="button" type="submit" disabled={!tokenPresent || !form.legalName || !form.email || !form.agreementAccepted}>Complete my agreement</button>
        {complete ? <div className="event-preview-result" role="status"><p className="eyebrow">Preview confirmation</p><h3>Your agreement is complete.</h3><p>Photography and video preference: <strong>{form.photoConsent ? 'Permitted' : 'Declined'}</strong>.</p><p>No information was saved because this is a private implementation preview.</p><Link className="button button-secondary" to="/events/dr-sal-gut-brain-2026/registration-preview">Return to registration preview</Link></div> : null}
      </form>
    </div></section>
  </SiteLayout>;
}
