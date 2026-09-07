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
            <h1>Spend a year around ideas and people that move you forward.</h1>
            <p className="page-lead">For founders, leaders, creators, practitioners, experts, and deeply curious people who want more than another room full of small talk. Follow consequential questions across disciplines, meet the people shaping them, and turn what you learn into how you live and lead.</p>
            <a className="button button-accent" href="#join">Become a founding member</a>
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
          <p className="eyebrow">What the year opens</p>
          <div>
            <h2>A place to keep becoming more informed, connected, and fully engaged.</h2>
            <div className="membership-benefits">
              <article><span>01</span><h3>Weekly fireside conversations</h3><p>Spend an hour in person with doctors, scientists, founders, makers, and practitioners exploring questions that affect how we live, work, lead, and age.</p></article>
              <article><span>02</span><h3>A cross-disciplinary circle</h3><p>Build real relationships with people whose work and perspective would rarely place them in the same room.</p></article>
              <article><span>03</span><h3>First access to what comes next</h3><p>Receive the calendar, early invitations, and priority opportunities for selected dinners, learning days, retreats, and journeys.</p></article>
              <article><span>04</span><h3>A hand in shaping ROAMSIX</h3><p>Founding members will help us identify the questions, people, and experiences worth building as the 2027 program develops.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="section light-section membership-audience-section">
        <div className="container">
          <p className="eyebrow">Who this is for</p>
          <h2>Different fields. Shared appetite.</h2>
          <p className="lead">You may be building a company, leading people, advancing a field, practicing a craft, changing careers, or simply refusing to let curiosity disappear from adult life. What matters is the way you enter the room.</p>
          <div className="membership-audience-grid">
            <article><h3>Builders and leaders</h3><p>Founders, executives, operators, and creators looking for sharper perspective and more substantial relationships.</p></article>
            <article><h3>Experts and practitioners</h3><p>Scientists, physicians, coaches, educators, chefs, farmers, and specialists who value exchange across disciplines.</p></article>
            <article><h3>Curious people in motion</h3><p>People drawn to better questions, lived experiences, and a community that asks more of life than passive consumption.</p></article>
          </div>
          <p className="membership-expert-note">Have expertise or research you want people to encounter differently? <Link className="text-link" to="/collaborate">Explore collaborating with ROAMSIX <span aria-hidden="true">→</span></Link></p>
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
            <h2>Help shape the first year.</h2>
            <p>Pay $600 today for the complete founding year. You will join the earliest circle around ROAMSIX and receive the launch calendar and activation details before the program begins. This purchase does not renew automatically.</p>
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
