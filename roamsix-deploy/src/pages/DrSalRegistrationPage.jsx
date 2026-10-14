import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import FormProtection, { useFormProtection } from '../components/FormProtection';
import DrSalAgreementText from '../components/DrSalAgreementText';
import { DR_SAL_GUEST_AGREEMENT_VERSION, DR_SAL_PHOTO_CONSENT } from '../data/drSalGuestAgreement';

const EVENT_ID = 'dr-sal-gut-brain-2026';
const VENUE_ADDRESS = '29455 Pamoosa Lane, Valley Center, CA 92082';
const MAP_QUERY = encodeURIComponent(`Essene Retreat Center, ${VENUE_ADDRESS}`);

export default function DrSalRegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', discountCode: '', termsAccepted: false, waiverAccepted: false, mediaReleaseAccepted: false });
  const [availability, setAvailability] = useState(null);
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const protection = useFormProtection();
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
          discountCode: form.discountCode,
          quantity: 1,
          eventName: 'The gut-brain connection: food, stress, and everyday performance',
          eventDate: 'October 24, 2026',
          acceptedLegalVersion: DR_SAL_GUEST_AGREEMENT_VERSION,
          acceptedAt: new Date().toISOString(),
          agreedToTerms: form.termsAccepted,
          waiverAccepted: form.waiverAccepted,
          mediaReleaseAccepted: form.mediaReleaseAccepted,
          source,
          ...protection.fields,
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
      <p className="eyebrow">OCTOBER 24, 2026 · ESSENE RETREAT CENTER · 25 SEATS</p>
      <h1>The gut-brain connection: food, stress, and everyday performance</h1>
      <p className="page-lead"><Link to="/experiences#dr-sal">Dr. Sulaiman Bharwani</Link>, pediatric gastroenterologist and founder of GutRewired, on how food, stress, and sleep interact, and which gut-health advice holds up.</p>
      {member?.activeMember ? <p><strong>Your seat is included with your active {member.tier} membership.</strong> Join us at Prayers for Peace Park / Essene Retreat Center, 29455 Pamoosa Lane, Valley Center, CA 92082, from 4:00 to 6:00 PM. Final arrival and parking details will follow by email.</p> : <p>$50 reserves your seat. Join us at Prayers for Peace Park / Essene Retreat Center, 29455 Pamoosa Lane, Valley Center, CA 92082, from 4:00 to 6:00 PM. Full refunds are available for cancellations requested by October 21, 2026, at 5:00 PM Pacific. After that deadline, tickets are nonrefundable but may be transferred to another adult with staff assistance before the event, provided the replacement attendee completes the required participation agreement. Your ticket applies toward founding membership if you join within 48 hours of the event.</p>}
      {availability?.showCounter ? <p className="event-seat-counter">{availability.remaining} of 25 seats remain.</p> : null}
    </div></section>
    <section className="section light-section"><div className="container membership-checkout-layout">
      <div className="membership-offer">
        <p className="eyebrow">Registration</p>
        <h2>{member?.activeMember ? 'Reserve my included member seat' : 'Reserve my seat · $50'}</h2>
        <p>{member?.activeMember ? 'Complete the agreements to reserve your included seat. No payment is required.' : 'Complete the agreements before opening secure Stripe payment.'}</p>
        <div className="event-location-details">
          <p className="eyebrow">Location</p>
          <h3>Essene Retreat Center</h3>
          <p>{VENUE_ADDRESS}<br />October 24, 2026 · 4:00–6:00 PM</p>
          <div className="event-location-links"><a href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noreferrer">Open in Google Maps</a><a href={`https://maps.apple.com/?q=${MAP_QUERY}`} target="_blank" rel="noreferrer">Open in Apple Maps</a></div>
          <div className="event-location-map"><iframe title="Map of Essene Retreat Center" src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          <p className="form-note">Final arrival and parking details will follow by email.</p>
        </div>
      </div>
      <form className="membership-checkout-form" onSubmit={checkout}>
        <label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" readOnly={member?.activeMember} required /></label>
        <label>Phone<input type="tel" name="phone" value={form.phone} onChange={change} autoComplete="tel" required /></label>
        {!member?.activeMember ? <label>Private admission code <span className="optional-label">Optional</span><input name="discountCode" value={form.discountCode} onChange={change} autoComplete="off" /></label> : null}
        <p className="eyebrow">Read the complete event agreement</p>
        <DrSalAgreementText />
        <div className="event-consent-panel">
          <label className="check"><input type="checkbox" name="waiverAccepted" checked={form.waiverAccepted} onChange={change} required /><span>I have read and agree to the October 24, 2026 Guest Participation Agreement and Liability Waiver shown above.</span></label>
          <p className="event-version-note">Your full legal name, email, acceptance timestamp and agreement version {DR_SAL_GUEST_AGREEMENT_VERSION} will be recorded. A copy of the accepted agreement will be emailed to you.</p>
        </div>
        <div className="event-photo-consent">
          <p className="eyebrow">Optional photography and video consent</p>
          <h3>{DR_SAL_PHOTO_CONSENT.title}</h3>
          {DR_SAL_PHOTO_CONSENT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <label className="check"><input type="checkbox" name="mediaReleaseAccepted" checked={form.mediaReleaseAccepted} onChange={change} /><span>{DR_SAL_PHOTO_CONSENT.checkbox}</span></label>
          <p className="form-note">Optional and unchecked by default. Your choice is recorded separately from the participation agreement.</p>
        </div>
        <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I accept the <Link to="/terms" target="_blank">Event Registration Terms</Link>.</span></label>
        <p className="form-note"><strong>Cancellation and Refund Policy:</strong> Full refunds are available for cancellations requested by October 21, 2026, at 5:00 PM Pacific. After this deadline, tickets are nonrefundable but may be transferred to another adult before the event, provided the replacement attendee completes the required participation agreement. If ROAMSIX cancels the event, purchasers receive a full refund. To request a refund or transfer, contact ROAMSIX using the contact information in your confirmation email. Transfers are completed with staff assistance.</p>
        <p className="form-note"><strong>Privacy notice:</strong> ROAMSIX uses the contact, registration, agreement and consent information collected here to administer this event, confirm admission and communicate essential event details. Review the <Link to="/privacy" target="_blank">Privacy Policy</Link>.</p>
        {!member?.activeMember ? <FormProtection onToken={protection.setTurnstileToken} onHoneypot={protection.setHoneypot} /> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button" type="submit" disabled={!ready || soldOut || status === 'loading'}>{soldOut ? 'Sold out' : status === 'loading' ? (member?.activeMember ? 'Reserving your seat…' : 'Opening secure payment…') : (member?.activeMember ? 'Reserve my included seat' : 'Reserve my seat · $50')}</button>
        <p className="form-note">{member?.activeMember ? 'Included with your active membership. You will not be charged.' : 'Payment is completed securely through Stripe.'}</p>
      </form>
    </div></section>
  </SiteLayout>;
}
