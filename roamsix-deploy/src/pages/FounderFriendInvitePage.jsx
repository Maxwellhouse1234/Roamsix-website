import { useEffect, useState } from 'react';
import SiteLayout from '../components/SiteLayout';

export default function FounderFriendInvitePage() {
  const code = new URLSearchParams(window.location.search).get('code') || '';
  const [referrerName, setReferrerName] = useState('A Founder-Guest');
  const [valid, setValid] = useState(null);
  const [form, setForm] = useState({ friendFirstName: '', friendEmail: '', website: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const purchaseUrl = `https://www.roamsix.com/dinner?code=${encodeURIComponent(code)}#tickets`;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/founder-friend-invite?code=${encodeURIComponent(code)}`)
      .then(async (response) => ({ ok: response.ok, data: await response.json().catch(() => ({})) }))
      .then(({ ok, data }) => { setValid(ok); if (ok) setReferrerName(data.referrerName); })
      .catch(() => setValid(false));
  }, [code]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    setStatus('loading'); setMessage('');
    try {
      const response = await fetch('/api/founder-friend-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...form, confirmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The invitation could not be sent.');
      setStatus('success'); setMessage(data.message);
    } catch (error) { setStatus('error'); setMessage(error.message); }
  }

  async function shareLink() {
    const text = `${referrerName} thought you might enjoy an evening at the ROAMSIX table. Your personal invitation: ${purchaseUrl}`;
    if (navigator.share) await navigator.share({ title: 'A personal ROAMSIX invitation', text, url: purchaseUrl });
    else { await navigator.clipboard.writeText(text); setMessage('The invitation message is copied and ready to text.'); }
  }

  return <SiteLayout theme="dark">
    <section className="section ink-section invite-page"><div className="container invite-layout">
      <div><p className="eyebrow">A personal ROAMSIX introduction</p><h1>Invite someone to the table.</h1><p className="page-lead">{referrerName}’s Founder-Friend invitation gives one friend 10% off an individual seat at our September dinner.</p><p>Share their first name and email, and ROAMSIX will send one thoughtful introduction in your name. They will not be added to our marketing list.</p></div>
      {valid === false ? <div className="form-success"><h2>This invitation link needs attention.</h2><p>Please return to your Founder-Guest email or contact info@roamsix.com.</p></div> :
      status === 'success' ? <div className="form-success"><p className="eyebrow">Invitation sent</p><h2>{message}</h2><p>We introduced ROAMSIX in your name and included your personal Founder-Friend code.</p><button className="button" type="button" onClick={shareLink}>Share by text instead</button></div> :
      <form className="dinner-checkout-form" onSubmit={submit}>
        <p className="eyebrow">Who came to mind?</p><label>Their first name<input name="friendFirstName" value={form.friendFirstName} onChange={update} required /></label><label>Their email<input type="email" name="friendEmail" value={form.friendEmail} onChange={update} required /></label><input className="invite-honeypot" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true" />
        <label className="check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm that this person knows me and I am asking ROAMSIX to send them one invitation.</span></label>
        {message && <p className="form-error" role="alert">{message}</p>}<button className="button" type="submit" disabled={!valid || !confirmed || status === 'loading'}>{status === 'loading' ? 'Sending your invitation…' : 'Send their personal invitation'}</button><button className="text-link invite-share-link" type="button" onClick={shareLink}>Or copy a message to text yourself →</button>
      </form>}
    </div></section>
  </SiteLayout>;
}
