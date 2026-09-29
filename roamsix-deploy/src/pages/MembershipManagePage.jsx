import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

export default function MembershipManagePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  async function openPortal() {
    setStatus('loading'); setMessage('');
    try {
      const response = await fetch('/api/create-billing-portal-session', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return navigate('/member/login?next=/membership/manage');
      if (!response.ok || !data.url) throw new Error(data.error || 'Billing management could not be opened.');
      window.location.assign(data.url);
    } catch (error) { setMessage(error.message); setStatus('error'); }
  }
  return <SiteLayout><section className="page-hero membership-success"><div className="container narrow"><p className="eyebrow">Membership billing</p><h1>Manage renewal and payment details securely.</h1><p className="page-lead">Sign in with the email address you used at checkout. Changes made before your next annual renewal apply to the next membership period.</p><div className="button-row"><button className="button button-accent" type="button" onClick={openPortal} disabled={status === 'loading'}>{status === 'loading' ? 'Opening secure billing…' : 'Open Stripe billing management'}</button><a className="text-link" href="mailto:info@roamsix.com?subject=Cancel%20my%20ROAMSIX%20membership">Request cancellation by email <span aria-hidden="true">→</span></a></div>{message && <p className="form-error" role="alert">{message}</p>}</div></section></SiteLayout>;
}
