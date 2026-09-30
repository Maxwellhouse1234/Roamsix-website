import { SignIn, useAuth, useClerk } from '@clerk/react';
import { useEffect, useState } from 'react';
import SiteLayout from '../components/SiteLayout';

function MagicLinkLogin({ compact = false }) {
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
  return <div className={compact ? 'member-login-fallback' : 'container member-login-card'}>
    {!compact ? <><p className="eyebrow">Secure member sign in</p><h1>Sign in to your ROAMSIX membership.</h1></> : <h3>Use a secure email link instead</h3>}
    <p>Enter the email you used to join. We will send a secure, time-limited link to your member dashboard.</p>
    <form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending secure link…' : 'Email me a sign-in link'}</button>
    </form>
    {message ? <p className={status === 'error' ? 'form-error' : 'member-notice'} role="status">{message}</p> : null}
    <p className="form-note">For privacy, the confirmation is the same whether or not an active membership is found. Need help? Email <a href="mailto:info@roamsix.com">info@roamsix.com</a>.</p>
  </div>;
}

function ClerkMemberLogin() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoaded || !isSignedIn || status !== 'idle') return;
    let active = true;
    setStatus('linking');
    getToken().then(async (token) => {
      if (!token) throw new Error('Clerk did not return a secure session token.');
      const response = await fetch('/api/clerk-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Your membership could not be connected to this sign-in.');
      if (active) window.location.assign('/member');
    }).catch((error) => {
      if (active) { setMessage(error.message); setStatus('error'); }
    });
    return () => { active = false; };
  }, [getToken, isLoaded, isSignedIn, status]);

  return <SiteLayout><section className="member-login-page"><div className="container member-auth-layout">
    <div className="member-auth-intro"><p className="eyebrow">Secure member sign in</p><h1>Open your ROAMSIX membership.</h1><p>Continue with your verified email and password. Access is granted only when the email matches an active ROAMSIX membership.</p></div>
    <div className="member-clerk-panel">
      {isSignedIn && status === 'linking' ? <div className="member-auth-status"><p className="eyebrow">Verifying membership</p><h2>Opening your member area…</h2></div> : null}
      {!isSignedIn ? <SignIn routing="hash" signUpUrl="/member/login" fallbackRedirectUrl="/member/login" appearance={{ elements: { rootBox: 'clerk-root-box', cardBox: 'clerk-card-box' } }} /> : null}
      {status === 'error' ? <div className="member-auth-status"><p className="form-error" role="alert">{message}</p><p>Use the same email address you used to purchase your membership.</p><button className="text-button dark" type="button" onClick={() => signOut({ redirectUrl: '/member/login' })}>Try another account</button></div> : null}
      <details className="member-login-options"><summary>Prefer the original email link?</summary><MagicLinkLogin compact /></details>
    </div>
  </div></section></SiteLayout>;
}

export default function MemberLoginPage() {
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  return clerkEnabled ? <ClerkMemberLogin /> : <SiteLayout><section className="member-login-page"><MagicLinkLogin /></section></SiteLayout>;
}
