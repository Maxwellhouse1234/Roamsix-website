import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';

const EVENT_ID = 'dr-sal-gut-brain-2026';
const LEGAL_VERSION = '2026-09-29-dr-sal-v1';

export default function DrSalRegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', termsAccepted: false, waiverAccepted: false, mediaReleaseAccepted: false });
  const [availability, setAvailability] = useState(null);
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const source = new URLSearchParams(window.location.search).get('source') || 'direct';

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`/api/event-availability?eventId=${EVENT_ID}`, { signal: controller.signal }).then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || 'Seat availability could not be confirmed.');
          return data;
        }),
      fetch('/api/member-context', { signal: controller.signal }).then((response) => response.json()).catch(() => ({ activeMember: false })),
    ])
      .then(([availabilityData, memberData]) => {
        setAvailability(availabilityData);
        if (memberData.activeMember) {
          setMember(memberData);
          setForm((current) => ({ ...current, name: memberData.profile?.fullName || '', email: memberData.profile?.email || '', phone: memberData.profile?.mobile || '' }));
        }
      })
      .catch((availabilityError) => {
        if (availabilityError.name !== 'AbortError') setError(availabilityError.message);
      });
    return () => controller.abort();
  }, []);

  function change(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function checkout(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch(member?.activeMember ? '/api/member-event-registration' : '/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: EVENT_ID,
          packageId: 'general-admission',
          customerName: form.name,
          customerEmail: form.email,
          phone: form.phone,
          quantity: 1,
          eventName: 'The gut-brain connection: food, stress, and everyday performance',
          eventDate: 'October 24, 2026',
          acceptedLegalVersion: LEGAL_VERSION,
          acceptedAt: new Date().toISOString(),
          agreedToTerms: form.termsAccepted,
          waiverAccepted: form.waiverAccepted,
          mediaReleaseAccepted: form.mediaReleaseAccepted,
          source,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || (!member?.activeMember && !data.url)) throw new Error(data.error || 'Registration could not be completed.');
      if (member?.activeMember) setStatus('success');
      else window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError.message);
      setStatus('idle');
      fetch(`/api/event-availability?eventId=${EVENT_ID}`).then((response) => response.json()).then(setAvailability).catch(() => {});
    }
  }

  const soldOut = availability?.soldOut === true;
  const ready = availability && !error;

  if (status === 'success') return <SiteLayout theme="dark"><section className="member-login-page"><div className="container member-login-card"><p className="eyebrow">Member seat reserved</p><h1>You are registered.</h1><p>Your October 24 seat is included with your active membership. You were not charged. A confirmation email is on its way.</p><Link className="button" to="/member#calendar">Return to my member area</Link></div></section></SiteLayout>;

  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero"><div className="container narrow">
      <p className="eyebrow">OCTOBER 24, 2026 · SAN DIEGO COUNTY · 25 SEATS</p>
      <h1>The gut-brain connection: food, stress, and everyday performance</h1>
      <p className="page-lead"><Link to="/experiences#dr-sal">Dr. Sulaiman Bharwani</Link>, pediatric gastroenterologist and founder of GutRewired, on how food, stress, and sleep interact, and which gut-health advice holds up.</p>
      {member?.activeMember ? <p><strong>Your seat is included with your active {member.tier} membership.</strong> The exact location is released October 7.</p> : <p>$50 holds your seat. The exact location is released October 7. Full refund if the location does not work for you. Your ticket applies toward founding membership if you join within 48 hours of the event.</p>}
      {availability?.showCounter ? <p className="event-seat-counter">{availability.remaining} of 25 seats remain.</p> : null}
    </div></section>
    <section className="section light-section"><div className="container membership-checkout-layout">
      <div className="membership-offer">
        <p className="eyebrow">Registration</p>
        <h2>{member?.activeMember ? 'Reserve my included member seat' : 'Hold my seat · $50'}</h2>
        <p>{member?.activeMember ? 'Complete the agreements to reserve your included seat. No payment is required.' : 'Complete the agreements before opening secure Stripe payment.'}</p>
      </div>
      <form className="membership-checkout-form" onSubmit={checkout}>
        <label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" readOnly={member?.activeMember} required /></label>
        <label>Phone<input type="tel" name="phone" value={form.phone} onChange={change} autoComplete="tel" required /></label>
        <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I accept the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
        <label className="check"><input type="checkbox" name="waiverAccepted" checked={form.waiverAccepted} onChange={change} required /><span>I have read and accept the <Link to="/waiver" target="_blank">Assumption of Risk and Participant Agreement</Link>.</span></label>
        <label className="check"><input type="checkbox" name="mediaReleaseAccepted" checked={form.mediaReleaseAccepted} onChange={change} required /><span>I have read and accept the <Link to="/media-release" target="_blank">Media Release</Link>.</span></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button" type="submit" disabled={!ready || soldOut || status === 'loading'}>{soldOut ? 'Sold out' : status === 'loading' ? (member?.activeMember ? 'Reserving your seat…' : 'Opening secure payment…') : (member?.activeMember ? 'Reserve my included seat' : 'Hold my seat · $50')}</button>
        <p className="form-note">{member?.activeMember ? 'Included with your active membership. You will not be charged.' : 'Payment is completed securely through Stripe.'}</p>
      </form>
    </div></section>
  </SiteLayout>;
}
