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
        <div className="container membership-hero-copy">
          <p className="eyebrow">ROAMSIX Founding Membership · 2027</p>
          <h1>A year built around better health, wider perspective, and meaningful connection.</h1>
          <p className="page-lead">For executives, entrepreneurs, founders, business owners, independent professionals, practitioners, and high performers who want their way of living to keep pace with what they are building.</p>
          <div className="button-row">
            <a className="button button-accent" href="#included">See what membership includes</a>
            <a className="text-link light" href="#join">Join for 2027 <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="section light-section" id="included">
        <div className="container membership-value-intro">
          <p className="eyebrow">What membership includes</p>
          <div><h2>Expert learning, real relationships, and a reason to keep applying what you learn.</h2><p className="lead">Membership gives you a consistent way to explore the subjects that shape your health, performance, and life without adding another stream of information to consume alone.</p></div>
        </div>
        <div className="container membership-benefits">
          <article><span>01</span><h3>Weekly expert-led fireside conversations</h3><p>Spend an hour in person exploring health, longevity, nutrition, recovery, movement, performance, and other subjects that affect how you live and lead.</p></article>
          <article><span>02</span><h3>A cross-disciplinary community</h3><p>Build relationships with executives, founders, practitioners, scientists, physicians, creators, and people whose perspectives extend beyond your usual circles.</p></article>
          <article><span>03</span><h3>Learning you can apply</h3><p>Connect science and expert guidance to practical choices at home and at work, with recurring opportunities to test, discuss, and strengthen new practices.</p></article>
          <article><span>04</span><h3>Priority access to ROAMSIX experiences</h3><p>Receive the calendar and early invitations for selected dinners, immersive learning days, retreats, and journeys before public release.</p></article>
        </div>
      </section>

      <section className="section fog-section membership-audience-section">
        <div className="container membership-audience-layout">
          <div><p className="eyebrow">Who it is for</p><h2>People who carry responsibility and still want more from life.</h2></div>
          <div><p className="lead">You may be leading a company, advancing a field, building independently, practicing a craft, or entering a new chapter. The common thread is a willingness to take your health, growth, relationships, and contribution as seriously as your work.</p><p>Have expertise or research that belongs in a ROAMSIX experience? <Link className="text-link" to="/collaborate">Explore collaborating with us <span aria-hidden="true">→</span></Link></p></div>
        </div>
      </section>

      <section className="section ink-section" id="join">
        <div className="container membership-checkout-layout">
          <div className="membership-offer">
            <p className="eyebrow">2027 founding membership</p>
            <h2>$600 for twelve months.</h2>
            <p>Your founding year includes the ongoing member experience and weekly fireside conversations. Dinners, learning days, retreats, travel, and lodging are separately priced unless an offer states otherwise.</p>
            <p>Membership is expected to begin in the first quarter of 2027 and runs for twelve months from activation. It does not renew automatically. If ROAMSIX does not activate membership by March 31, 2027, you may request a full refund.</p>
          </div>
          <form className="membership-checkout-form" onSubmit={checkout}>
            <p className="eyebrow">Secure your membership</p>
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
