import { useRef, useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';
import FormProtection, { useFormProtection } from '../components/FormProtection';

const CONTRIBUTIONS = [
  { title: 'Lead a fireside conversation or learning session', format: '60 to 90 minutes · In person', detail: 'A focused conversation or practical session built around one meaningful subject.' },
  { title: 'Join the faculty for a retreat', format: 'Two days or more · Multi-expert', detail: 'Contribute your expertise alongside experts from other fields.' },
  { title: 'Develop an original experience around my work', format: 'Custom format · Co-developed', detail: 'Build a conversation, learning day, retreat, or journey around your research or practice.' },
  { title: 'Contribute a place, craft, ingredient, or method', format: 'Integrated contribution · Flexible', detail: 'Bring a setting, ingredient, process, or activity that makes the subject tangible.' },
  { title: 'Offer a member benefit or partner experience', format: 'Ongoing or limited allocation · Contracted', detail: 'Extend a confirmed trial, assessment, product, workspace, studio, workshop, private experience, preferred rate, or sponsored experience to ROAMSIX members.' },
];
const EXPERT_TYPES = [...CONTRIBUTIONS.map(({ title }) => title), 'I am open to the right format'];

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
            <h2>Your work deserves a format that lets people feel its relevance.</h2>
            <p className="lead">You bring the research, practice, place, or craft. ROAMSIX shapes the environment, pace, and participation around it so people can understand the idea, reflect on its meaning, and consider how it fits their lives.</p>
            <ul className="collaborate-list">
              {CONTRIBUTIONS.map(({ title, format, detail }) => <li key={title}><details><summary>{title}</summary><div className="collaborate-detail"><span>{format}</span><p>{detail}</p><button type="button" onClick={() => chooseContribution(title)}>Choose this format <span aria-hidden="true">→</span></button></div></details></li>)}
            </ul>
          </div>

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
      </section>
    </SiteLayout>
  );
}
