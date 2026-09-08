import { useEffect, useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import EventFaqs from '../components/EventFaqs';
import DinnerWaitlistForm from '../components/DinnerWaitlistForm';
import { oliveGroveFaqs } from '../data/eventFaqs';

const EVENT = {
  id: 'olive-grove-dinner', packageId: 'olive-grove-dinner',
  name: 'An Evening in the Olive Groves', date: '2026-09-19T17:00:00-07:00',
};

export default function OliveGroveDinnerPage() {
  const query = new URLSearchParams(window.location.search);
  const [ticketType, setTicketType] = useState(() => query.get('seats') === '2' ? 'two' : 'single');
  const [form, setForm] = useState({ name: '', guestName: '', email: '', phone: '', dietaryNotes: '', guestDietaryNotes: '' });
  const [discountCode, setDiscountCode] = useState(() => (query.get('code') || '').toUpperCase().slice(0, 80));
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);
  const isTwoTickets = ticketType === 'two';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/dinner-availability').then((response) => response.ok ? response.json() : null).then(setAvailability).catch(() => {});
  }, []);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function checkout(event) {
    event.preventDefault();
    if (isTwoTickets && !form.guestName.trim()) {
      setError('Please add the name of your second guest.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: EVENT.id, packageId: EVENT.packageId,
          customerName: form.name.trim(), customerEmail: form.email.trim(),
          isBundle: isTwoTickets, quantity: isTwoTickets ? 2 : 1,
          guestNames: isTwoTickets ? [form.guestName.trim()] : [],
          phone: form.phone.trim(), eventName: EVENT.name,
          medicalNotes: form.dietaryNotes.trim(),
          guestMedicalNotes: isTwoTickets ? form.guestDietaryNotes.trim() : '',
          eventDate: EVENT.date, acceptedLegalVersion: 'ROAMSIX_DINNER_TERMS_V2_2026-08-20',
          acceptedAt: new Date().toISOString(), agreedToTerms: 'true', ageConfirmed: 'true',
          discountCode: discountCode.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout could not be started.');
      window.location.href = data.url;
    } catch (checkoutError) {
      setStatus('error');
      setError(`${checkoutError.message} Please try again or email info@roamsix.com.`);
    }
  }

  const complete = form.name.trim() && form.email.trim() && form.phone.trim() && (!isTwoTickets || form.guestName.trim()) && ageConfirmed && legalAccepted;

  return (
    <SiteLayout theme="dark">
      <section className="dinner-hero"><div className="dinner-hero-image" aria-hidden="true" /><div className="dinner-hero-shade" aria-hidden="true" /><div className="container dinner-hero-content"><p className="eyebrow">ROAMSIX at Father’s Farmhouse</p><h1>An evening in the olive groves.</h1><p className="page-lead">A farm-to-table dinner in Winchester, beginning in the garden and ending around one shared table among the olive trees.</p><div className="dinner-facts"><span>September 19, 2026</span><span>Father’s Farmhouse</span><span>31362 Keller Rd · Winchester, CA 92596</span></div><div className="dinner-hero-action"><a className="button button-accent" href="#tickets">Reserve your seats · from $175</a><span>Limited seating · reservations close September 14</span></div></div></section>

      <a className="dinner-mobile-reserve" href="#tickets"><span>September 19 · Limited seating</span><strong>Reserve from $175</strong></a>

      <section className="section light-section"><div className="container split-copy"><p className="eyebrow">The evening</p><div><h2>From the garden to the table.</h2><p className="lead">Robert, the farmer behind Father’s Farmhouse, will welcome guests into the garden and share what is growing there. From there, the evening moves into the olive groves for a generous family-style dinner prepared by Chef Kaci.</p><p>Chef Kaci returns to the ROAMSIX table after cooking our June dinner, bringing the same care for the ingredients, the setting, and the people gathered around them.</p></div></div></section>

      <section className="section fog-section dinner-value-section"><div className="container"><p className="eyebrow">Why this evening is different</p><h2>Know where the food came from. Meet the people behind it. Share the experience with people you did not arrive with.</h2><div className="dinner-value-grid"><article><span>01</span><h3>Begin at the source</h3><p>Walk the garden with Robert and see what is growing before dinner begins.</p></article><article><span>02</span><h3>Eat with the place</h3><p>Chef Kaci prepares a family-style meal for the farm and the setting, served among the olive trees.</p></article><article><span>03</span><h3>Make the evening count</h3><p>ROAMSIX hosts the pace and introductions so the meal makes space for genuine conversation and new connections.</p></article></div></div></section>

      <section className="section light-section"><div className="container dinner-included"><div><p className="eyebrow">What’s included</p><h2>One evening, fully hosted.</h2></div><ul><li>Guided garden tour with Robert</li><li>Farm-to-table dinner by Chef Kaci</li><li>Family-style meal in the olive groves</li><li>The full ROAMSIX evening at Father’s Farmhouse</li></ul></div></section>

      <section className="section ink-section" id="tickets"><div className="container dinner-ticket-layout"><div><p className="eyebrow">September 19 · Limited seating</p><h2>Reserve your place at the table.</h2><p className="section-intro">Reserve one seat or two. Founder-Guests receive preferred pricing for either choice.</p><div className="ticket-selector"><button className={ticketType === 'single' ? 'active' : ''} type="button" onClick={() => setTicketType('single')}><span>One seat</span><strong>$175</strong><small>Founder-Guests: $148.75</small></button><button className={ticketType === 'two' ? 'active' : ''} type="button" onClick={() => setTicketType('two')}><span>Two seats</span><strong>$295</strong><small>Founder-Guests: $275</small></button></div><p className="ticket-note">Founder-Friend invitations include 10% off one individual seat. Two seats are available together for $295. Using the referral code with a two-seat reservation keeps the price at $295 and lets us thank the Founder who made the introduction.</p></div>

        {availability?.soldOut ? <DinnerWaitlistForm /> : <form className="dinner-checkout-form" onSubmit={checkout}><p className="eyebrow">Guest details</p><label>Your full name<input name="name" value={form.name} onChange={update} autoComplete="name" required /></label>{isTwoTickets && <label>Second guest’s full name<input name="guestName" value={form.guestName} onChange={update} required /></label>}<div className="form-grid two"><label>Email<input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label><label>Phone<input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" required /></label></div><label>Your food allergies or dietary limitations <span className="optional-label">Optional</span><textarea name="dietaryNotes" value={form.dietaryNotes} onChange={update} rows="3" placeholder="Please share anything Chef Kaci should know." /></label>{isTwoTickets && <label>Second guest’s food allergies or dietary limitations <span className="optional-label">Optional</span><textarea name="guestDietaryNotes" value={form.guestDietaryNotes} onChange={update} rows="3" placeholder="Please share their needs separately." /></label>}<label>Invitation or partner code <span className="optional-label">Optional</span><input name="discountCode" value={discountCode} onChange={(event) => setDiscountCode(event.target.value.toUpperCase())} autoComplete="off" placeholder="Enter your code" /></label><p className="ticket-policy-note"><strong>Dinner reservation policy:</strong> If plans change, contact us by 5:00 p.m. Pacific on Monday, September 14. You may choose one approved guest-name substitution or a one-time credit equal to the amount paid toward a future comparable dinner. Future reservations are subject to availability. After the Monday final count, we cannot promise a transfer or credit. No-shows forfeit the reservation.</p><label className="check"><input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} /><span>I confirm that I am 21 years of age or older.</span></label><label className="check"><input type="checkbox" checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} /><span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a>, <a href="/waiver" target="_blank" rel="noreferrer">Participant Agreement</a>, <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>, and <a href="/media-release" target="_blank" rel="noreferrer">Media Release</a>.</span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={!complete || status === 'loading'}>{status === 'loading' ? 'Opening secure checkout…' : isTwoTickets ? `Reserve two seats · ${['FOUNDERPAIR', 'FOUNDER15'].includes(discountCode.trim()) ? '$275' : '$295'}` : 'Reserve my seat · $175'}</button><p className="form-note">Payment is completed securely through Stripe. Invitation and partner codes are validated before secure checkout opens.</p></form>}
      </div></section>
      <EventFaqs items={oliveGroveFaqs} title="Come as you are, prepared for the setting." />
    </SiteLayout>
  );
}
