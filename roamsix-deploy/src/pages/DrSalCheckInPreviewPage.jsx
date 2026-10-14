import { useMemo, useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import EventPreviewNav from '../components/EventPreviewNav';
import { PREVIEW_ATTENDEES } from '../data/oct24RegistrationPreview';
import { evaluateCheckInEligibility } from '../lib/eventRegistration';

export default function DrSalCheckInPreviewPage() {
  const [records, setRecords] = useState(PREVIEW_ATTENDEES);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [offline, setOffline] = useState(false);
  const filtered = useMemo(() => records.filter((record) => record.attendee.toLowerCase().includes(query.toLowerCase())), [records, query]);

  function verify(ticketId) {
    const attendee = records.find((record) => record.ticketId === ticketId);
    setResult(attendee ? { attendee, status: evaluateCheckInEligibility(attendee) } : { attendee: null, status: evaluateCheckInEligibility(null) });
  }

  function checkIn() {
    if (!result?.status.eligible) return;
    const checkedInAt = new Date().toISOString();
    setRecords((current) => current.map((record) => record.id === result.attendee.id ? { ...record, checkedInAt } : record));
    setResult({ attendee: { ...result.attendee, checkedInAt }, status: { code: 'checked_in', eligible: false, label: 'Checked in successfully' } });
  }

  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">AUTHORIZED STAFF PREVIEW · SAMPLE DATA ONLY</p><h1>Mobile event check-in.</h1><p className="page-lead">The check-in screen shows only identity, admission validity, agreement status, photography preference and eligibility.</p></div></section>
    <EventPreviewNav />
    <section className="section light-section"><div className="container event-checkin-layout">
      <div className="event-checkin-scanner">
        <div className="event-camera-frame" aria-hidden="true"><span>QR</span></div>
        <p className="form-note">Camera scanning will require an authenticated staff session and a supported device. Each scan uses the opaque code to retrieve the attendee's current registration and agreement record. The preview uses sample scan buttons.</p>
        <div className="event-scan-tests"><button className="button" type="button" onClick={() => verify(PREVIEW_ATTENDEES[0].ticketId)}>Scan ready ticket</button><button className="button button-secondary" type="button" onClick={() => verify(PREVIEW_ATTENDEES[2].ticketId)}>Scan incomplete agreement</button><button className="button button-secondary" type="button" onClick={() => verify(PREVIEW_ATTENDEES[5].ticketId)}>Scan canceled ticket</button></div>
        <label className="event-offline-toggle"><input type="checkbox" checked={offline} onChange={(event) => setOffline(event.target.checked)} /><span>Simulate connection failure</span></label>
        {offline ? <div className="event-offline-notice"><strong>Offline contingency active</strong><p>Use the encrypted roster downloaded by the authorized event lead before departure. Admit only records already marked agreement-complete and valid in that snapshot. Record check-ins locally, prevent duplicate local scans, and reconcile with the server when connectivity returns. New or unresolved agreements require connection or staff verification and cannot be bypassed.</p></div> : null}
      </div>
      <div className="event-checkin-result">
        <p className="eyebrow">Scan result</p>
        {!result ? <p>Scan a sample credential or use manual lookup.</p> : <><h2>{result.attendee?.attendee || 'Ticket not found'}</h2><p className={`event-checkin-status ${result.status.eligible ? 'ready' : 'blocked'}`}>{result.status.label}</p>{result.attendee ? <dl><div><dt>Admission</dt><dd>{result.attendee.admissionType}</dd></div><div><dt>Payment</dt><dd>{result.attendee.paymentStatus}</dd></div><div><dt>Agreement</dt><dd>{result.attendee.agreementStatus}</dd></div><div><dt>Photography</dt><dd>{result.attendee.photoConsent}</dd></div></dl> : null}{result.status.eligible ? <button className="button" type="button" onClick={checkIn}>Mark checked in</button> : null}{result.status.code === 'checked_in' ? <button className="button button-secondary" type="button" onClick={() => verify(result.attendee.ticketId)}>Test duplicate scan</button> : null}</>}
      </div>
      <div className="event-manual-lookup"><p className="eyebrow">Secure manual lookup</p><label>Attendee name<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sample roster" /></label><div>{filtered.map((record) => <button key={record.id} type="button" onClick={() => verify(record.ticketId)}><span>{record.attendee}</span><small>{record.agreementStatus} · {record.paymentStatus}</small></button>)}</div></div>
    </div></section>
  </SiteLayout>;
}
