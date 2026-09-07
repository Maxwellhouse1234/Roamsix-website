import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';

export default function MembershipPage() {
  const [form, setForm] = useState({ name: '', email: '', termsAccepted: false, emailConsent: true });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function checkout(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/create-membership-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, acceptedAt: new Date().toISOString() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout could not be started.');
      trackEvent('membership_checkout_start', { membership_year: '2027', value: 600 });
      window.location.href = data.url;
    } catch (checkoutError) {
      setStatus('error');
      setError(`${checkoutError.message} Please try again or email info@roamsix.com.`);
    }
  }

  return (
    <SiteLayout theme="dark">
      <section className="membership-hero">
        <div className="container membership-hero-grid">
          <div>
            <p className="eyebrow">ROAMSIX Founding Membership · 2027</p>
            <h1>Stay with the questions that shape your work and life.</h1>
            <p className="page-lead">A year for people building the future of health, wellness, fitness, food, and human performance. Follow practical subjects over time, meet the people working beside them, and take part as ROAMSIX grows.</p>
            <a className="button" href="#join">Secure founding membership</a>
          </div>
          <aside className="membership-price" aria-label="Membership price">
            <span>2027 founding year</span>
            <strong>$600</strong>
            <p>Paid once today. Membership begins in early 2027. No automatic renewal.</p>
          </aside>
        </div>
      </section>

      <section className="section light-section">
        <div className="container split-copy">
          <p className="eyebrow">What membership opens</p>
          <div>
            <h2>A consistent place to keep learning and connecting.</h2>
            <div className="membership-benefits">
              <article><span>01</span><h3>Weekly fireside conversations</h3><p>About an hour in person, following questions across microbiome health, recovery, resilience, and longevity.</p></article>
              <article><span>02</span><h3>The professional community</h3><p>Build relationships with thoughtful people working across health, wellness, fitness, food, and human performance.</p></article>
              <article><span>03</span><h3>First access</h3><p>Receive calendars, invitations, and reservation opportunities for selected ROAMSIX experiences before they are shared more broadly.</p></article>
              <article><span>04</span><h3>A voice in what grows</h3><p>Founding members will be invited to give direct feedback as the membership experience and 2027 program take shape.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container membership-boundaries">
          <div><p className="eyebrow">Clear from the beginning</p><h2>Membership creates the through-line.</h2></div>
          <div>
            <p>Membership covers the ongoing member experience and weekly fireside conversations. Dinners, one-day learning experiences, quarterly retreats, travel, and lodging are separately priced unless an offer specifically says they are included.</p>
            <p>The founding year is expected to begin during the first quarter of 2027 and runs for 12 months from activation. If ROAMSIX does not activate the membership by March 31, 2027, you may request a full refund.</p>
          </div>
        </div>
      </section>

      <section className="section ink-section" id="join">
        <div className="container membership-checkout-layout">
          <div>
            <p className="eyebrow">Founding membership</p>
            <h2>Secure your place for 2027.</h2>
            <p>Pay $600 today for the complete founding year. This purchase does not renew automatically. We will send the launch calendar and activation details before the program begins.</p>
          </div>
          <form className="membership-checkout-form" onSubmit={checkout}>
            <label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label>
            <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label>
            <label className="check"><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={change} required /><span>I understand the 2027 activation timing, what membership includes, and agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label>
            <label className="check"><input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={change} /><span>Send me member updates, calendars, and invitations related to the 2027 ROAMSIX program. I can unsubscribe from marketing emails at any time.</span></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Opening secure checkout…' : 'Continue to secure checkout · $600'}</button>
            <p className="form-note">Payment is processed securely by Stripe. ROAMSIX does not store your card details.</p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
