import { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export default function MembershipRequestForm({ tier, mode = 'request' }) {
  const isCohortWaitlist = mode === 'cohort-waitlist';
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', reason: '', privacyAccepted: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    const names = form.fullName.trim().split(/\s+/);
    const firstName = names.shift() || '';
    const lastName = names.join(' ') || 'Not provided';
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/retreat-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retreatSlug: isCohortWaitlist ? 'next-membership-cohort-interest' : `${tier.toLowerCase()}-membership-request`,
          firstName,
          lastName,
          email: form.email,
          mobile: form.mobile,
          role: 'Prospective member',
          organization: '',
          professionalCategory: isCohortWaitlist ? 'Next membership cohort' : `${tier} membership`,
          challenge: form.reason,
          paymentSource: 'self',
          referralSource: '',
          source: 'membership-request',
          campaign: isCohortWaitlist ? 'next-membership-cohort-interest' : `${tier.toLowerCase()}-membership-request`,
          landingPage: window.location.pathname,
          emailConsent: true,
          smsConsent: false,
          privacyAccepted: form.privacyAccepted,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'We could not send your request right now.');
      setStatus('success');
      trackEvent(isCohortWaitlist ? 'membership_cohort_interest' : 'membership_request', { membership_tier: tier });
    } catch (submissionError) {
      setStatus('error');
      setError(`${submissionError.message} Please try again or email info@roamsix.com.`);
    }
  }

  if (status === 'success') return <div className="form-success" role="status"><p className="eyebrow">Interest received</p><h3>{isCohortWaitlist ? 'We will contact you when the next membership cohort opens.' : `We will follow up about ${tier} membership.`}</h3><p>This does not reserve a place and does not require payment. We will contact you about the next step.</p></div>;

  return <form className="membership-checkout-form" onSubmit={submit}>
    <p className="eyebrow">{isCohortWaitlist ? 'Next membership cohort' : `Request ${tier} membership`}</p>
    <label>Full name<input name="fullName" value={form.fullName} onChange={change} autoComplete="name" required /></label>
    <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label>
    <label>Phone <span className="optional">Optional</span><input type="tel" name="mobile" value={form.mobile} onChange={change} autoComplete="tel" /></label>
    <label>What would make this membership useful to you?<textarea name="reason" value={form.reason} onChange={change} rows="4" required /></label>
    <label className="check"><input type="checkbox" name="privacyAccepted" checked={form.privacyAccepted} onChange={change} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and want ROAMSIX to contact me about this request and relevant membership updates.</span></label>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending request…' : isCohortWaitlist ? 'Join the next-cohort interest list' : `Send my ${tier} request`}</button>
    <p className="form-note">This is an expression of interest, not a membership or reservation. No payment is taken here.</p>
  </form>;
}
