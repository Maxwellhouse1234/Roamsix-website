import { useState } from 'react';
import SiteLayout from '../components/SiteLayout';

export default function MemberLoginPage() {
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(params.get('error') ? 'error' : 'idle');
  const [message, setMessage] = useState(params.get('error') ? 'That sign-in link is invalid or has expired.' : '');
  async function submit(event) {
    event.preventDefault(); setStatus('loading'); setMessage('');
    try {
      const response = await fetch('/api/member-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Sign-in could not be started.');
      setStatus('success'); setMessage(data.message);
    } catch (error) { setStatus('error'); setMessage(error.message); }
  }
  return <SiteLayout><section className="member-login-page"><div className="container member-login-card">
    <p className="eyebrow">Secure member sign in</p><h1>Sign in to your ROAMSIX membership.</h1>
    <p>Enter the email you used to join. We will send a secure, time-limited link to your member dashboard. No password is required.</p>
    <form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending secure link…' : 'Email me a sign-in link'}</button>
    </form>
    {message ? <p className={status === 'error' ? 'form-error' : 'member-notice'} role="status">{message}</p> : null}
    <p className="form-note">For privacy, the confirmation is the same whether or not an active membership is found. Need help? Email <a href="mailto:info@roamsix.com">info@roamsix.com</a>.</p>
  </div></section></SiteLayout>;
}
