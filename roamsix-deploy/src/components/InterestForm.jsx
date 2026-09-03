import { useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const INITIAL = {
  firstName: '', lastName: '', email: '', mobile: '', role: '', organization: '',
  professionalCategory: '', challenge: '', paymentSource: 'unsure', referralSource: '',
  emailConsent: false, smsConsent: false, privacyAccepted: false,
};

export default function InterestForm({
  retreatSlug,
  challengeLabel = 'What would make this experience useful in your work?',
  submitLabel = 'Submit my interest',
  successTitle = 'Your interest has been recorded.',
  successCopy = 'We will send meaningful updates and the complete written offer once the expert, format, date, place, and investment are confirmed.',
}) {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const started = useRef(false);
  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  async function submit(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch('/api/retreat-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          retreatSlug,
          source: params.get('utm_source') || 'direct',
          campaign: params.get('utm_campaign') || '',
          landingPage: window.location.pathname,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'We could not save your interest right now.');
      setStatus('success');
      trackEvent('interest_form_submit', { retreat_slug: retreatSlug, offer_status: 'discovery' });
    } catch (submissionError) {
      setError(`${submissionError.message} Please try again or email info@roamsix.com.`);
      setStatus('error');
    }
  }

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent('interest_form_start', { retreat_slug: retreatSlug });
  }

  if (status === 'success') {
    return (
      <div className="form-success" role="status" tabIndex="-1">
        <p className="eyebrow">Interest received</p>
        <h3>{successTitle}</h3>
        <p>{successCopy}</p>
      </div>
    );
  }

  return (
    <form className="interest-form" onSubmit={submit} onFocus={markStarted}>
      <div className="form-grid two">
        <label>First name<input name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" required /></label>
      </div>
      <div className="form-grid two">
        <label>Email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label>
        <label>Mobile <span className="optional">Optional</span><input type="tel" name="mobile" value={form.mobile} onChange={update} autoComplete="tel" /></label>
      </div>
      <div className="form-grid two">
        <label>Professional role<input name="role" value={form.role} onChange={update} required /></label>
        <label>Organization <span className="optional">Optional</span><input name="organization" value={form.organization} onChange={update} autoComplete="organization" /></label>
      </div>
      <label>Professional category
        <select name="professionalCategory" value={form.professionalCategory} onChange={update} required>
          <option value="">Select the closest fit</option>
          <option>Health or allied health</option><option>Wellness or coaching</option><option>Fitness or performance</option>
          <option>Nutrition or food systems</option><option>Education or research</option><option>Other</option>
        </select>
      </label>
      <label>{challengeLabel}
        <textarea name="challenge" value={form.challenge} onChange={update} rows="4" required />
      </label>
      <div className="form-grid two">
        <label>Expected payment source
          <select name="paymentSource" value={form.paymentSource} onChange={update} required>
            <option value="self">Self</option><option value="employer">Employer</option><option value="either">Either</option><option value="unsure">Unsure</option>
          </select>
        </label>
        <label>How did you hear about ROAMSIX? <span className="optional">Optional</span>
          <select name="referralSource" value={form.referralSource} onChange={update}>
            <option value="">Select one</option>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>Podcast (Redirection Point)</option>
            <option>Referral from a friend or colleague</option>
            <option>ROAMSIX member or community</option>
            <option>A ROAMSIX event or dinner</option>
            <option>Google search</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <fieldset className="consent-group">
        <legend>Communication choices</legend>
        <label className="check"><input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={update} /> Email me updates about this retreat.</label>
        <label className="check"><input type="checkbox" name="smsConsent" checked={form.smsConsent} onChange={update} /> Send me occasional text updates. Message and data rates may apply.</label>
        <label className="check"><input type="checkbox" name="privacyAccepted" checked={form.privacyAccepted} onChange={update} required /> I agree to the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</label>
      </fieldset>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting…' : submitLabel}
      </button>
      <p className="form-note">Joining the list is not a purchase or reservation. Mobile is only required if you choose text updates.</p>
    </form>
  );
}
