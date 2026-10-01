import { useRef, useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';
import FormProtection, { useFormProtection } from '../components/FormProtection';

const CONTRIBUTIONS = [
  'Speak or teach as an expert or practitioner',
  'Co-design a hands-on experience',
  'Host a ROAMSIX experience at my venue or property',
  'Contribute a craft, ingredient, method, or product',
  'Explore a community or nonprofit collaboration',
  'Offer a member benefit or partner experience',
  'Explore sponsorship or underwriting',
];
const EXPERT_TYPES = [...CONTRIBUTIONS, 'I am open to the right format'];

export default function CollaboratePage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', inquiryType: EXPERT_TYPES[0], message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const protection = useFormProtection();

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  function chooseContribution(inquiryType) {
    setForm((current) => ({ ...current, inquiryType }));
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inquiryType: `Collaboration · ${form.inquiryType}`, source: 'Collaboration Page', ...protection.fields }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Your inquiry could not be sent.');
      setStatus('success');
      trackEvent('expert_collaboration_inquiry', { expert_type: form.inquiryType });
    } catch (submissionError) {
      setStatus('error');
      setError(`${submissionError.message} Please email info@roamsix.com.`);
    }
  }

  return (
    <SiteLayout>
      <section className="page-hero collaborate-hero">
        <div className="container narrow">
          <p className="eyebrow">For experts and collaborators</p>
          <h1>Some ideas lose something when they stay on a stage.</h1>
          <p className="page-lead">If your work deserves participation, context, and honest conversation, ROAMSIX can help people encounter it in a more memorable and human way.</p>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container collaborate-layout">
          <div>
            <p className="eyebrow">What we build together</p>
            <h2>Bring what you know. We’ll help shape how people experience it.</h2>
            <p className="lead">ROAMSIX works with physicians, researchers, practitioners, educators, makers, venues, community organizations, and aligned brands.</p>
            <p>You bring the expertise, practice, place, craft, ingredient, or method. ROAMSIX helps shape the format, environment, and participation around it so people can ask questions, experience the idea, and understand why it matters.</p>
            <ul className="collaborate-list">
              {CONTRIBUTIONS.map((title) => <li key={title}><button type="button" onClick={() => chooseContribution(title)}>{title}<span aria-hidden="true">→</span></button></li>)}
            </ul>
          </div>

          <div>
            <p className="lead">The best ROAMSIX collaborations are educational first, participatory where possible, and built around genuine fit rather than exposure or product placement.</p>
            {status === 'success' ? (
              <div className="form-success" role="status"><p className="eyebrow">Inquiry received</p><h2>Let’s see what could take shape.</h2><p>Thank you. We’ll review your work and respond personally.</p></div>
            ) : (
              <form ref={formRef} id="collaboration-form" className="interest-form" onSubmit={submit}>
              <p className="eyebrow">Start the conversation</p>
              <div className="form-grid two">
                <label>First name<input name="firstName" value={form.firstName} onChange={change} autoComplete="given-name" maxLength="100" /></label>
                <label>Last name<input name="lastName" value={form.lastName} onChange={change} autoComplete="family-name" maxLength="100" /></label>
              </div>
              <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" maxLength="320" required /></label>
              <label>Organization or field <span className="optional">Optional</span><input name="company" value={form.company} onChange={change} maxLength="200" /></label>
              <label>How would you like to contribute?<select name="inquiryType" value={form.inquiryType} onChange={change}>{EXPERT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Tell us about your work, offering, or the question you want people to explore<textarea name="message" value={form.message} onChange={change} rows="6" maxLength="4000" required /></label>
              <FormProtection onToken={protection.setTurnstileToken} onHoneypot={protection.setHoneypot} />
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Introduce your work'}</button>
              <p className="form-note">We review every inquiry personally and choose collaborators for the quality, integrity, and relevance of their work. A considered introduction is more useful than a formal pitch deck.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
