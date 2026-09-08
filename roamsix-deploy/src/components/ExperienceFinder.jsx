import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const PURPOSES = [
  { value: 'personal', label: 'An experience for myself' },
  { value: 'team', label: 'A private experience for my team' },
  { value: 'collaborate', label: 'A way to bring my expertise into ROAMSIX' },
];
const SUBJECTS = [
  { value: 'energy and sustainable performance', label: 'Energy and sustainable performance' },
  { value: 'longevity and metabolic health', label: 'Longevity and metabolic health' },
  { value: 'nutrition, gut health, and food', label: 'Nutrition, gut health, and food' },
  { value: 'strength, mobility, and recovery', label: 'Strength, mobility, and recovery' },
  { value: 'stress, focus, and resilience', label: 'Stress, focus, and resilience' },
  { value: 'relationships, perspective, and purpose', label: 'Relationships, perspective, and purpose' },
];
const FORMATS = [
  { value: 'evening', label: 'One evening' }, { value: 'day', label: 'One day' },
  { value: 'weekend', label: 'One weekend' }, { value: 'multi-day', label: 'Several days' },
  { value: 'year', label: 'Ongoing through the year' },
];
const RESULTS = {
  team: { eyebrow: 'For your team', title: 'A private ROAMSIX experience', copy: 'We build the experts, setting, learning, movement, meals, and activities around the health and performance outcomes your team needs.', action: 'Explore organization experiences', href: '/organizations' },
  collaborate: { eyebrow: 'For experts and partners', title: 'Build an experience with ROAMSIX', copy: 'Bring your research, practice, craft, or place. We shape it into an experience people can understand and apply.', action: 'Explore collaboration', href: '/collaborate' },
  evening: { eyebrow: 'Recommended format', title: 'A dinner or fireside conversation', copy: 'Explore one important subject through expert guidance, a shared table, and focused conversation.', action: 'See upcoming experiences', href: '/experiences' },
  day: { eyebrow: 'Recommended format', title: 'An immersive learning day', copy: 'Learn the science, practice it, move, share a meal, and connect it to daily life.', action: 'Explore the 2027 program', href: '/events' },
  weekend: { eyebrow: 'Recommended format', title: 'A focused ROAMSIX retreat', copy: 'Give one subject enough time for deeper learning, practice, recovery, and connection.', action: 'Preview the first retreat', href: '/first-retreat' },
  'multi-day': { eyebrow: 'Recommended format', title: 'A deep ROAMSIX retreat', copy: 'Follow one subject across experts, places, and practices, then decide what continues at home.', action: 'Preview the first retreat', href: '/first-retreat' },
  year: { eyebrow: 'Recommended format', title: 'The 2027 ROAMSIX membership', copy: 'Keep learning and applying new practices through weekly expert conversations, community, and priority access to experiences.', action: 'Explore membership', href: '/membership' },
};

export default function ExperienceFinder({ compact = false }) {
  const [step, setStep] = useState('purpose');
  const [answers, setAnswers] = useState({ purpose: '', subject: '', format: '' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const result = RESULTS[answers.purpose === 'personal' ? answers.format : answers.purpose];
  const stepNumber = useMemo(() => step === 'purpose' ? 1 : step === 'subject' ? 2 : 3, [step]);
  const options = step === 'purpose' ? PURPOSES : step === 'subject' ? SUBJECTS : FORMATS;
  const prompt = step === 'purpose' ? 'What brings you to ROAMSIX?' : step === 'subject' ? 'Which subject matters most right now?' : 'Which format fits right now?';

  function choose(option) {
    const key = step === 'format' ? 'format' : step;
    const next = { ...answers, [key]: option.value };
    setAnswers(next);
    if (step === 'purpose' && option.value === 'personal') return setStep('subject');
    if (step === 'subject') return setStep('format');
    trackEvent('experience_finder_complete', next);
  }

  async function requestMatches(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email,
        inquiryType: answers.purpose === 'team' ? 'Organization inquiry' : answers.purpose === 'collaborate' ? 'Collaboration inquiry' : 'Experience recommendation',
        source: 'Experience Finder',
        message: `Purpose: ${answers.purpose}. Subject: ${answers.subject || 'not selected'}. Format: ${answers.format || 'not selected'}. Recommendation: ${result.title}.`,
      }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Your request could not be sent.');
      setStatus('success'); trackEvent('experience_finder_lead', answers);
    } catch (submissionError) { setStatus('error'); setError(`${submissionError.message} Please try again or email info@roamsix.com.`); }
  }

  function restart() { setStep('purpose'); setAnswers({ purpose: '', subject: '', format: '' }); setEmail(''); setStatus('idle'); setError(''); }

  return <div className={`experience-finder ${compact ? 'compact' : ''}`}>
    {!result ? <>
      <div className="finder-progress" aria-label={`Step ${stepNumber}`}><span>Step {stepNumber}{answers.purpose === 'personal' ? ' of 3' : ''}</span><div aria-hidden="true"><i style={{ width: `${stepNumber / 3 * 100}%` }} /></div></div>
      <fieldset><legend>{prompt}</legend><div className="finder-options">{options.map((option) => <button key={option.value} type="button" onClick={() => choose(option)}>{option.label}<span aria-hidden="true">→</span></button>)}</div></fieldset>
    </> : <div className="finder-result" role="status">
      <p className="eyebrow">{result.eyebrow}</p><h3>{result.title}</h3><p>{result.copy}</p>
      {answers.subject ? <p className="finder-match"><strong>Subject:</strong> {answers.subject}<br /><strong>Format:</strong> {answers.format}</p> : null}
      {status === 'success' ? <div className="finder-success"><strong>We have your request.</strong><p>We will send the most relevant ROAMSIX information to your inbox.</p></div> : <form className="finder-email" onSubmit={requestMatches}><label>Email me the relevant details<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send me the details'}</button></form>}
      <div className="finder-result-actions"><Link className="text-link" to={result.href}>{result.action} <span aria-hidden="true">→</span></Link><button className="text-link finder-restart" type="button" onClick={restart}>Start again</button></div>
    </div>}
  </div>;
}
