import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import DrSalAgreementText from '../components/DrSalAgreementText';
import { DR_SAL_GUEST_AGREEMENT_VERSION, DR_SAL_PHOTO_CONSENT } from '../data/drSalGuestAgreement';

function tokenClaims(token) {
  try { return JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return {}; }
}

export default function DrSalTransferPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const claims = useMemo(() => tokenClaims(token), [token]);
  const [form, setForm] = useState({ terms: false, waiver: false, photo: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    const response = await fetch('/api/complete-event-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, agreedToTerms: form.terms, waiverAccepted: form.waiver, mediaReleaseAccepted: form.photo, acceptedLegalVersion: DR_SAL_GUEST_AGREEMENT_VERSION }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || 'The agreement could not be completed.'); setStatus('idle'); return; }
    setStatus('success');
  }
  if (status === 'success') return <SiteLayout theme="dark"><section className="member-login-page"><div className="container member-login-card"><p className="eyebrow">Admission confirmed</p><h1>Your agreement is complete.</h1><p>Your October 24 admission is ready. A confirmation email with your accepted agreement is on its way.</p><Link className="button" to="/experiences">Return to experiences</Link></div></section></SiteLayout>;
  return <SiteLayout theme="dark"><section className="page-hero editorial-page-hero"><div className="container narrow"><p className="eyebrow">Transferred admission · October 24, 2026</p><h1>Complete your individual event agreement.</h1><p className="page-lead">This admission is for {claims.name || 'the named replacement attendee'} at {claims.email || 'the invited email address'}. It cannot be accepted for another adult.</p></div></section><section className="section light-section"><div className="container narrow"><form className="membership-checkout-form" onSubmit={submit}><DrSalAgreementText /><div className="event-consent-panel"><label className="check"><input type="checkbox" checked={form.waiver} onChange={(event) => setForm({ ...form, waiver: event.target.checked })} /><span>I have read and agree to the October 24, 2026 Guest Participation Agreement and Liability Waiver shown above.</span></label></div><div className="event-photo-consent"><p className="eyebrow">Optional photography and video consent</p><h3>{DR_SAL_PHOTO_CONSENT.title}</h3>{DR_SAL_PHOTO_CONSENT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<label className="check"><input type="checkbox" checked={form.photo} onChange={(event) => setForm({ ...form, photo: event.target.checked })} /><span>{DR_SAL_PHOTO_CONSENT.checkbox}</span></label></div><label className="check"><input type="checkbox" checked={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.checked })} /><span>I accept the <Link to="/terms" target="_blank">Event Registration Terms</Link>.</span></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button" disabled={!token || !form.terms || !form.waiver || status === 'loading'}>{status === 'loading' ? 'Completing agreement…' : 'Complete my agreement'}</button></form></div></section></SiteLayout>;
}
