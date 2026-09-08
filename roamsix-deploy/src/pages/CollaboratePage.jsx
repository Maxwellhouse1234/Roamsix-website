import { useRef, useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';

const CONTRIBUTIONS = [
  { title: 'Lead a fireside conversation or learning session', format: '60–90 minutes · In person', detail: 'A focused conversation or practical session built around one useful question.' },
  { title: 'Join the faculty for a retreat', format: 'Two days or more · Multi-expert', detail: 'Contribute your expertise alongside specialists from other fields.' },
  { title: 'Develop an original experience around my work', format: 'Custom format · Co-developed', detail: 'Build a dinner, learning day, retreat, or journey around your research or practice.' },
  { title: 'Contribute a place, craft, ingredient, or method', format: 'Integrated contribution · Flexible', detail: 'Bring a setting, ingredient, process, or activity that makes the subject tangible.' },
];
const EXPERT_TYPES = [...CONTRIBUTIONS.map(({ title }) => title), 'I am open to the right format'];

export default function CollaboratePage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', inquiryType: EXPERT_TYPES[0], message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const formRef = useRef(null);

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
        body: JSON.stringify({ ...form, inquiryType: `Expert collaboration · ${form.inquiryType}`, source: 'Expert Collaboration Page' }),
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
          <h1>Bring your work into the real world.</h1>
          <p className="page-lead">ROAMSIX works with scientists, physicians, practitioners, farmers, chefs, educators, artists, and other specialists whose ideas deserve to be experienced, questioned, and understood beyond a stage.</p>
        </div>
      </section>

      <section className="section fog-section">
        <div className="container collaborate-layout">
          <div>
            <p className="eyebrow">What we build together</p>
            <h2>Turn your expertise into an experience people can use.</h2>
            <p className="lead">You bring the research, practice, place, or craft. ROAMSIX designs the environment, format, activities, and supporting perspectives that help people understand it and apply it.</p>
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
                <label>First name<input name="firstName" value={form.firstName} onChange={change} autoComplete="given-name" /></label>
                <label>Last name<input name="lastName" value={form.lastName} onChange={change} autoComplete="family-name" /></label>
              </div>
              <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label>
              <label>Organization or field <span className="optional">Optional</span><input name="company" value={form.company} onChange={change} /></label>
              <label>How would you like to contribute?<select name="inquiryType" value={form.inquiryType} onChange={change}>{EXPERT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Tell us about your work and the question you want people to explore<textarea name="message" value={form.message} onChange={change} rows="6" required /></label>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Introduce your work'}</button>
              <p className="form-note">We review every inquiry personally. A thoughtful introduction is more useful than a formal pitch deck.</p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
