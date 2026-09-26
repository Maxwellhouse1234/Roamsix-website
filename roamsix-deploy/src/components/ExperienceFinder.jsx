import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const PURPOSES = [
  { value: 'energy-performance', label: 'More energy, focus, and sustainable performance' },
  { value: 'longevity', label: 'A stronger foundation for long-term health' },
  { value: 'recovery-resilience', label: 'Better recovery, resilience, and balance' },
  { value: 'connection', label: 'A place to explore health with people who share my priorities' },
  { value: 'team', label: 'Help the people I lead live well and do their best work' },
];
const SUBJECTS = [
  { value: 'trusted guidance', label: 'Guidance I can trust and use' },
  { value: 'immersive experiences', label: 'Experiences that help new habits stick' },
  { value: 'community', label: 'A community that keeps me engaged' },
  { value: 'holistic approach', label: 'A more complete view of health and performance' },
  { value: 'trusted access', label: 'A clearer baseline and trusted resources' },
];
const FORMATS = [
  { value: 'evening', label: 'One focused event' }, { value: 'day', label: 'One immersive day' },
  { value: 'weekend', label: 'Several experiences across the year' }, { value: 'multi-day', label: 'A separately priced multi-day Journey' },
  { value: 'year', label: 'Ongoing through the year' },
];
const RESULTS = {
  team: { eyebrow: 'For my team', title: 'A ROAMSIX experience built around our needs', copy: 'We start with the change you want for your team, then bring together the right expertise, setting, and practical experience.', action: 'Find my team’s starting point', href: '/organizations' },
  evening: { eyebrow: 'Your recommended starting point', title: 'Begin with one focused event', copy: 'A fireside conversation gives you a clear introduction to ROAMSIX, one timely health topic, and people exploring similar questions.', action: 'See the upcoming event', href: '/experiences' },
  day: { eyebrow: 'Your recommended starting point', title: 'Choose an immersive day', copy: 'A full day gives you room to connect expert insight with movement, food, environment, and a more personal understanding of the topic.', action: 'See experiences that fit me', href: '/events' },
  weekend: { eyebrow: 'Your recommended starting point', title: 'Follow the themes across the year', copy: 'The calendar lets you explore gut health, recovery, focus, and longevity without requiring you to attend every experience.', action: 'See the 2027 themes', href: '/events' },
  'multi-day': { eyebrow: 'Your recommended starting point', title: 'Follow the year-end Journey', copy: 'The optional Journey brings several perspectives together in a separately priced multi-day experience. It proceeds only after required deposits and minimum participation are secured.', action: 'Request Journey updates', href: '/events#interest' },
  year: { eyebrow: 'Your recommended starting point', title: 'Give yourself a place to return', copy: 'Membership means the ideas, conversations, and familiar faces do not end when one event does. You can join at any point and choose what is most relevant to you.', action: 'Find my membership', href: '/membership' },
};

export default function ExperienceFinder({ compact = false }) {
  const [step, setStep] = useState('purpose');
  const [answers, setAnswers] = useState({ purpose: '', subject: '', format: '' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const result = RESULTS[answers.purpose === 'team' ? 'team' : answers.format];
  const stepNumber = useMemo(() => step === 'purpose' ? 1 : step === 'subject' ? 2 : 3, [step]);
  const options = step === 'purpose' ? PURPOSES : step === 'subject' ? SUBJECTS : FORMATS;
  const prompt = step === 'purpose' ? 'What would you most like to improve?' : step === 'subject' ? 'What would help you make progress?' : 'What level of commitment feels right?';

  function choose(option) {
    const key = step === 'format' ? 'format' : step;
    const next = { ...answers, [key]: option.value };
    setAnswers(next);
    if (step === 'purpose' && option.value !== 'team') return setStep('subject');
    if (step === 'subject') return setStep('format');
    trackEvent('experience_finder_complete', next);
  }

  async function requestMatches(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email,
        inquiryType: answers.purpose === 'team' ? 'Organization inquiry' : 'Experience recommendation',
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
      {answers.subject ? <p className="finder-match"><strong>Your priority:</strong> {PURPOSES.find((item) => item.value === answers.purpose)?.label}<br /><strong>What would help:</strong> {SUBJECTS.find((item) => item.value === answers.subject)?.label}<br /><strong>Preferred commitment:</strong> {FORMATS.find((item) => item.value === answers.format)?.label}</p> : null}
      {status === 'success' ? <div className="finder-success"><strong>Your recommendation is on its way.</strong><p>We will send the most relevant ROAMSIX next step to your inbox.</p></div> : <form className="finder-email" onSubmit={requestMatches}><label>Where should we send your recommendation?<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Preparing…' : 'Get my personalized recommendation'}</button></form>}
      <div className="finder-result-actions"><Link className="text-link" to={result.href}>{result.action} <span aria-hidden="true">→</span></Link><button className="text-link finder-restart" type="button" onClick={restart}>Start again</button></div>
    </div>}
  </div>;
}
