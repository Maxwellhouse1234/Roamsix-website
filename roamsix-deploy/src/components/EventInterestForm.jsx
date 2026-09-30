import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import FormProtection, { useFormProtection } from './FormProtection';

export default function EventInterestForm({ eventId, eventName }) {
  const [form, setForm] = useState({ name: '', email: '', consent: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState(false);
  const protection = useFormProtection();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/member-context', { signal: controller.signal }).then((response) => response.json()).then((data) => {
      if (!data.activeMember) return;
      setForm((current) => ({ ...current, name: data.profile?.fullName || '', email: data.profile?.email || '' }));
      setMemberEmail(true);
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    const names = form.name.trim().split(/\s+/);
    const firstName = names.shift() || '';
    const lastName = names.join(' ') || 'Not provided';
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/retreat-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retreatSlug: eventId,
          firstName,
          lastName,
          email: form.email,
          role: 'Event interest subscriber',
          organization: '',
          professionalCategory: 'Other',
          challenge: `Interested in: ${eventName}`,
          paymentSource: 'unsure',
          referralSource: '',
          source: 'experience-page',
          campaign: eventId,
          landingPage: window.location.pathname,
          emailConsent: true,
          smsConsent: false,
          privacyAccepted: form.consent,
          ...protection.fields,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'We could not save your interest right now.');
      setStatus('success');
      trackEvent('event_interest_submit', { event_id: eventId });
    } catch (submissionError) {
      setStatus('error');
      setError(`${submissionError.message} Please try again or email info@roamsix.com.`);
    }
  }

  if (status === 'success') {
    return <div className="form-success compact" role="status"><p className="eyebrow">Request received</p><h3>We will send you the registration details when they are ready.</h3><p>This does not reserve a place or require payment.</p></div>;
  }

  return <form className="event-interest-form" onSubmit={submit}>
    <p className="event-interest-selection"><span>Your event interest</span><strong>{eventName}</strong></p>
    <div className="form-grid two">
      <label>Name<input name="name" value={form.name} onChange={update} autoComplete="name" required /></label>
      <label>Email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" readOnly={memberEmail} required /></label>
    </div>
    {memberEmail ? <p className="form-note">Using the email connected to your signed-in membership.</p> : null}
    <label className="check"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and want updates about this event.</span></label>
    <FormProtection onToken={protection.setTurnstileToken} onHoneypot={protection.setHoneypot} />
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Saving…' : 'Tell me when registration opens'}</button>
    <p className="form-note">No payment is required. This does not reserve a place.</p>
  </form>;
}
