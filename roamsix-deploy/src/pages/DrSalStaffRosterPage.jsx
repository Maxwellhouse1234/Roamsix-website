import { useState } from 'react';
import SiteLayout from '../components/SiteLayout';

export default function DrSalStaffRosterPage() {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('roamsix_event_staff_token') || '');
  const [roster, setRoster] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [transfer, setTransfer] = useState({ sessionId: '', replacementName: '', replacementEmail: '' });
  async function load(event) {
    event?.preventDefault(); setStatus('loading'); setError('');
    const response = await fetch('/api/event-roster', { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || 'Roster access failed.'); setStatus('idle'); return; }
    sessionStorage.setItem('roamsix_event_staff_token', accessToken); setRoster(data); setStatus('ready');
  }
  async function initiateTransfer(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    const response = await fetch('/api/event-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(transfer) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || 'The transfer could not be started.'); setStatus('ready'); return; }
    setTransfer({ sessionId: '', replacementName: '', replacementEmail: '' }); await load();
  }
  return <SiteLayout theme="dark"><section className="page-hero editorial-page-hero"><div className="container narrow"><p className="eyebrow">Authorized personnel only</p><h1>October 24 attendance roster.</h1><p className="page-lead">Payment, agreement, photography and admission readiness. Do not share or display this page publicly.</p></div></section><section className="section light-section"><div className="container">
    {!roster ? <form className="membership-checkout-form narrow" onSubmit={load}><label>Staff access token<input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} autoComplete="off" required /></label>{error ? <p className="form-error">{error}</p> : null}<button className="button" disabled={status === 'loading'}>{status === 'loading' ? 'Verifying…' : 'Open attendance roster'}</button></form> : <>
      <div className="event-ops-metrics"><article><span>{roster.totals.admissions}</span><p>Admissions</p></article><article><span>{roster.totals.ready}</span><p>Ready</p></article><article><span>{roster.totals.awaitingAgreement}</span><p>Awaiting agreement</p></article><article><span>${roster.totals.netCollected}</span><p>Net collected</p></article><article><span>${roster.totals.propertyShare}</span><p>Property share</p></article></div>
      <div className="event-ops-table-wrap"><table className="event-ops-table"><thead><tr><th>Attendee</th><th>Admission</th><th>Payment</th><th>Agreement</th><th>Photography</th><th>Admission status</th></tr></thead><tbody>{roster.rows.map((row) => <tr key={row.id}><td>{row.name}<br /><small>{row.email}</small></td><td>{row.admission}</td><td>{row.payment}<br />${row.amountPaid.toFixed(2)}</td><td>{row.agreement}<br /><small>{row.agreementVersion}</small></td><td>{row.photography}</td><td><strong>{row.eligibility}</strong></td></tr>)}</tbody></table></div>
      <form className="membership-checkout-form" onSubmit={initiateTransfer}><p className="eyebrow">Staff-assisted transfer</p><p>Use the Stripe Session ID from the current attendee record. The replacement attendee receives a unique agreement link and remains ineligible until acceptance is complete.</p><label>Stripe Session ID<input value={transfer.sessionId} onChange={(event) => setTransfer({ ...transfer, sessionId: event.target.value })} required /></label><label>Replacement attendee full legal name<input value={transfer.replacementName} onChange={(event) => setTransfer({ ...transfer, replacementName: event.target.value })} required /></label><label>Replacement attendee email<input type="email" value={transfer.replacementEmail} onChange={(event) => setTransfer({ ...transfer, replacementEmail: event.target.value })} required /></label>{error ? <p className="form-error">{error}</p> : null}<button className="button" disabled={status === 'loading'}>{status === 'loading' ? 'Processing…' : 'Send replacement agreement link'}</button></form>
    </>}
  </div></section></SiteLayout>;
}
