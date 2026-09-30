import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import FormProtection, { useFormProtection } from './FormProtection';

export default function TopicInterestForm({ interest }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState(false);
  const protection = useFormProtection();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/member-context', { signal: controller.signal }).then((response) => response.json()).then((data) => {
      if (!data.activeMember) return;
      setFullName(data.profile?.fullName || '');
      setEmail(data.profile?.email || '');
      setMemberEmail(true);
    }).catch(() => {});
    return () => controller.abort();
  }, []);

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
          smsConsent: false, privacyAccepted, ...protection.fields,
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

  if (status === 'success') return <div className="form-success" role="status"><p className="eyebrow">Updates requested</p><h3>We will send you updates about {interest.label}.</h3><p>Expect the relevant dates, locations, and booking details as they are released.</p></div>;

  return (
    <form className="topic-interest-form" onSubmit={submit}>
      <p className="eyebrow">Send me updates about</p>
      <h3>{interest.label}</h3>
      <div className="form-grid two">
        <label>Name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" readOnly={memberEmail} required /></label>
      </div>
      {memberEmail ? <p className="form-note">Using the email connected to your signed-in membership.</p> : null}
      <label className="check"><input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required /><span>I agree to the <a href="/privacy">Privacy Policy</a> and want ROAMSIX updates about this part of the program.</span></label>
      <FormProtection onToken={protection.setTurnstileToken} onHoneypot={protection.setHoneypot} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send me 2027 updates'}</button>
      <p className="form-note">This does not reserve a place or require payment.</p>
    </form>
  );
}
