import { useState } from 'react';

export default function DinnerWaitlistForm() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', partySize: '1', website: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault(); setStatus('loading'); setMessage('');
    try {
      const response = await fetch('/api/dinner-waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'We could not add you to the waitlist.');
      setStatus('success'); setMessage(data.message);
    } catch (error) { setStatus('error'); setMessage(error.message); }
  }
  if (status === 'success') return <div className="form-success"><p className="eyebrow">Waitlist confirmed</p><h2>We’ll keep a place in mind for you.</h2><p>{message}</p></div>;
  return <form className="dinner-checkout-form" onSubmit={submit}><p className="eyebrow">Prioritized waitlist</p><h2>The table is currently full.</h2><p>If a place opens after the Monday final count, we will invite guests in priority order and only for party sizes we can accommodate.</p><div className="form-grid two"><label>First name<input name="firstName" value={form.firstName} onChange={update} required /></label><label>Last name<input name="lastName" value={form.lastName} onChange={update} /></label></div><label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label><div className="form-grid two"><label>Mobile <span className="optional-label">Optional</span><input type="tel" name="mobile" value={form.mobile} onChange={update} /></label><label>Seats requested<select name="partySize" value={form.partySize} onChange={update}><option value="1">One seat</option><option value="2">Two seats</option></select></label></div><input className="invite-honeypot" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true" />{message && <p className="form-error" role="alert">{message}</p>}<button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining the waitlist…' : 'Join the waitlist'}</button></form>;
}
