import { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import FormProtection, { useFormProtection } from './FormProtection';

const SEGMENTATION_OPTIONS = [
  "Everyone's health in this house runs through me",
  "I've read the research and I still don't know who to believe",
  "I'm making health decisions for my kids and my parents too",
  "I optimize everything else in my life except my own health",
  "I don't trust anything with a supplement attached to it",
];

export default function MembershipRequestForm({ tier, mode = 'request' }) {
  const isCohortWaitlist = mode === 'cohort-waitlist';
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', selections: [], other: '', specific: '', privacyAccepted: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const protection = useFormProtection();

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function toggleSelection(event) {
    const { value, checked } = event.target;
    setForm((current) => ({
      ...current,
      selections: checked ? [...current.selections, value] : current.selections.filter((selection) => selection !== value),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    const names = form.fullName.trim().split(/\s+/);
    const firstName = names.shift() || '';
    const lastName = names.join(' ') || 'Not provided';
    const responses = [
      ...form.selections,
      form.other ? `Something else: ${form.other}` : '',
      form.specific ? `Working through: ${form.specific}` : '',
    ].filter(Boolean);
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
          challenge: responses.length ? responses.join('\n') : 'No segmentation response provided.',
          paymentSource: 'self',
          referralSource: '',
          source: 'membership-request',
          campaign: isCohortWaitlist ? 'next-membership-cohort-interest' : `${tier.toLowerCase()}-membership-request`,
          landingPage: window.location.pathname,
          emailConsent: true,
          smsConsent: false,
          privacyAccepted: form.privacyAccepted,
          ...protection.fields,
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

  if (status === 'success') return <div className="form-success" role="status"><p className="eyebrow">Interest received</p><h3>{isCohortWaitlist ? 'We will contact you when the next membership cohort opens.' : `We will follow up about ${tier} membership.`}</h3><p>No payment was taken here. We will contact you with the appropriate secure next step.</p></div>;

  return <form className="membership-checkout-form" onSubmit={submit}>
    <p className="eyebrow">{isCohortWaitlist ? 'Next membership cohort' : `Apply for ${tier}`}</p>
    <label>Full name<input name="fullName" value={form.fullName} onChange={change} autoComplete="name" maxLength="100" required /></label>
    <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" maxLength="320" required /></label>
    <label>Phone <span className="optional">Optional</span><input type="tel" name="mobile" value={form.mobile} onChange={change} autoComplete="tel" maxLength="30" /></label>
    {!isCohortWaitlist ? <fieldset className="membership-segmentation"><legend>Which of these sound like you? <span className="optional">(select any)</span></legend>{SEGMENTATION_OPTIONS.map((option) => <label className="check" key={option}><input type="checkbox" value={option} checked={form.selections.includes(option)} onChange={toggleSelection} /><span>{option}</span></label>)}<label>Something else <span className="optional">(one line, optional)</span><input name="other" value={form.other} onChange={change} /></label></fieldset> : null}
    {!isCohortWaitlist ? <label>Anything specific you are working through right now? <span className="optional">(optional)</span><textarea name="specific" value={form.specific} onChange={change} rows="4" maxLength="2000" /></label> : null}
    <label className="check"><input type="checkbox" name="privacyAccepted" checked={form.privacyAccepted} onChange={change} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and want ROAMSIX to contact me about this request and relevant membership updates.</span></label>
    <FormProtection onToken={protection.setTurnstileToken} onHoneypot={protection.setHoneypot} />
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : isCohortWaitlist ? 'Join the next-cohort interest list' : `Send my ${tier} request`}</button>
    <p className="form-note">{isCohortWaitlist ? 'This is an expression of interest, not a membership or reservation. No payment is taken here.' : 'This does not take payment. We reply within two business days.'}</p>
  </form>;
}
