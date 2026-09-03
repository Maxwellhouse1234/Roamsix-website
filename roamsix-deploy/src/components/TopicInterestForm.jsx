import { useState } from 'react';
import { trackEvent } from '../lib/analytics';

export default function TopicInterestForm({ interest }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const names = fullName.trim().split(/\s+/);
    const firstName = names.shift() || '';
    const lastName = names.join(' ') || 'Not provided';
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/retreat-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retreatSlug: 'fieldwork-curriculum', firstName, lastName, email,
          role: 'Fieldwork subscriber', professionalCategory: 'Other',
          challenge: `Interested in: ${interest.label}`,
          paymentSource: 'unsure', referralSource: '',
          source: 'fieldwork-calendar', campaign: interest.id,
          landingPage: window.location.pathname, emailConsent: true,
          smsConsent: false, privacyAccepted,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'We could not record your interest right now.');
      setStatus('success');
      trackEvent('fieldwork_topic_interest', { topic: interest.id });
    } catch (submissionError) {
      setStatus('error');
      setError(`${submissionError.message} Please try again or email info@roamsix.com.`);
    }
  }

  if (status === 'success') return <div className="form-success" role="status"><p className="eyebrow">Interest confirmed</p><h3>You’re connected to {interest.label}.</h3><p>We’ll email you as details are released and send the calendar invitation when an event in this area is scheduled.</p></div>;

  return (
    <form className="topic-interest-form" onSubmit={submit}>
      <p className="eyebrow">Your selection</p>
      <h3>{interest.label}</h3>
      <div className="form-grid two">
        <label>Name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      </div>
      <label className="check"><input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required /> I agree to the <a href="/privacy">Privacy Policy</a> and want updates about this topic.</label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Submitting…' : 'Sign up for updates'}</button>
      <p className="form-note">No payment is required. This does not reserve a seat.</p>
    </form>
  );
}
