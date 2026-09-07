import { useState } from 'react';
import SiteLayout from '../components/SiteLayout';
import { trackEvent } from '../lib/analytics';

const EXPERT_TYPES = [
  'Scientist or researcher',
  'Physician or clinician',
  'Practitioner or coach',
  'Chef, farmer, or food expert',
  'Author, educator, or storyteller',
  'Place, brand, or experience partner',
  'Something else',
];

export default function CollaboratePage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', inquiryType: EXPERT_TYPES[0], message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

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
            <h2>Your expertise becomes part of a journey.</h2>
            <p className="lead">You bring depth and a point of view. We shape the place, sequence, activities, food, movement, and conversation around the question so people can encounter your work with their full attention.</p>
            <ul className="collaborate-list">
              <li>Lead a fireside conversation or hands-on learning session</li>
              <li>Join a cross-disciplinary faculty for a retreat</li>
              <li>Develop an original experience around your research or practice</li>
              <li>Offer a place, craft, ingredient, or method that makes an idea tangible</li>
            </ul>
          </div>

          {status === 'success' ? (
            <div className="form-success" role="status"><p className="eyebrow">Inquiry received</p><h2>Let’s see what could take shape.</h2><p>Thank you. We’ll review your work and respond personally.</p></div>
          ) : (
            <form className="interest-form" onSubmit={submit}>
              <p className="eyebrow">Start the conversation</p>
              <div className="form-grid two">
                <label>First name<input name="firstName" value={form.firstName} onChange={change} autoComplete="given-name" /></label>
                <label>Last name<input name="lastName" value={form.lastName} onChange={change} autoComplete="family-name" /></label>
              </div>
              <label>Email<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required /></label>
              <label>Organization or field <span className="optional">Optional</span><input name="company" value={form.company} onChange={change} /></label>
              <label>How do you see yourself contributing?<select name="inquiryType" value={form.inquiryType} onChange={change}>{EXPERT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
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
