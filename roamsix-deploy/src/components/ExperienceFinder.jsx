import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const AUDIENCES = [
  { value: 'healthy-aging', label: 'I want to stay healthy, capable, and engaged as I age' },
  { value: 'performance', label: 'I want more energy, focus, and resilience for a demanding life' },
  { value: 'transition', label: 'I am navigating a change in my health, priorities, or stage of life' },
  { value: 'practitioner', label: 'I work in health, wellness, or human performance' },
  { value: 'team', label: 'I lead a team and want to support how people live and perform' },
];
const PRIORITIES = [
  { value: 'clarity', label: 'Separate useful guidance from noise' },
  { value: 'baseline', label: 'Understand where I stand and what to focus on' },
  { value: 'application', label: 'Turn what I know into something I can actually use' },
  { value: 'prevention', label: 'Protect my health and performance for the long term' },
  { value: 'immersion', label: 'Learn through an experience, not another lecture' },
];
const TOPICS = [
  { value: 'gut', label: 'Gut health, nutrition, and the gut-brain connection' },
  { value: 'recovery', label: 'Recovery, sleep, stress, and resilience' },
  { value: 'focus', label: 'Focus, cognitive performance, and attention' },
  { value: 'longevity', label: 'Longevity, movement, and staying capable' },
  { value: 'whole', label: 'I want a more complete view before I choose' },
];
const RESULTS = {
  team: { eyebrow: 'For your organization', title: 'Build around the performance outcome that matters', copy: 'ROAMSIX brings together the right expertise, setting, and practical experience around what your people need to understand or do differently.', action: 'Explore ROAMSIX for organizations', href: '/organizations' },
  gut: { eyebrow: 'Your recommended starting point', title: 'Begin with the gut-brain conversation', copy: 'The October 24 event offers a focused way to separate credible guidance from oversimplified claims about food, stress, the gut, and everyday performance.', action: 'See the upcoming event', href: '/experiences' },
  recovery: { eyebrow: 'Your recommended starting point', title: 'Explore recovery through more than one lens', copy: 'Follow how sleep, stress, movement, environment, and physiology shape recovery, then choose the experiences that make the insight practical.', action: 'Explore the themes', href: '/events' },
  focus: { eyebrow: 'Your recommended starting point', title: 'Understand what shapes focus before willpower enters the picture', copy: 'Explore attention through science, environment, movement, recovery, and practical experience.', action: 'Explore the themes', href: '/events' },
  longevity: { eyebrow: 'Your recommended starting point', title: 'Build toward a longer, more capable life', copy: 'Explore longevity through movement, recovery, nutrition, cognitive health, and credible ways to understand your starting point.', action: 'Explore membership', href: '/membership' },
  whole: { eyebrow: 'Your recommended starting point', title: 'Start with the complete ROAMSIX approach', copy: 'Membership gives you ongoing access to vetted expertise, practical learning, immersive experiences, and relevant resources across connected areas of health.', action: 'Compare membership options', href: '/membership' },
};

export default function ExperienceFinder({ compact = false }) {
  const [step, setStep] = useState('audience');
  const [answers, setAnswers] = useState({ audience: '', priority: '', topic: '' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const result = answers.topic ? RESULTS[answers.audience === 'team' ? 'team' : answers.topic] : null;
  const stepNumber = useMemo(() => step === 'audience' ? 1 : step === 'priority' ? 2 : 3, [step]);
  const options = step === 'audience' ? AUDIENCES : step === 'priority' ? PRIORITIES : TOPICS;
  const prompt = step === 'audience' ? 'Which description is closest to where you are now?' : step === 'priority' ? 'What would be most valuable right now?' : 'Which subject are you most interested in exploring?';

  function choose(option) {
    const key = step;
    const next = { ...answers, [key]: option.value };
    setAnswers(next);
    if (step === 'audience') return setStep('priority');
    if (step === 'priority') return setStep('topic');
    trackEvent('experience_finder_complete', next);
  }

  async function requestMatches(event) {
    event.preventDefault(); setStatus('loading'); setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email,
        inquiryType: answers.audience === 'team' ? 'Organization inquiry' : 'Experience recommendation',
        source: 'Experience Finder',
        message: `Audience: ${answers.audience}. Priority: ${answers.priority}. Topic: ${answers.topic}. Recommendation: ${result.title}.`,
      }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Your request could not be sent.');
      setStatus('success'); trackEvent('experience_finder_lead', answers);
    } catch (submissionError) { setStatus('error'); setError(`${submissionError.message} Please try again or email info@roamsix.com.`); }
  }

  function restart() { setStep('audience'); setAnswers({ audience: '', priority: '', topic: '' }); setEmail(''); setStatus('idle'); setError(''); }

  return <div className={`experience-finder ${compact ? 'compact' : ''}`}>
    {!result ? <>
      <div className="finder-progress" aria-label={`Step ${stepNumber} of 3`}><span>Step {stepNumber} of 3</span><div aria-hidden="true"><i style={{ width: `${stepNumber / 3 * 100}%` }} /></div></div>
      <fieldset><legend>{prompt}</legend><div className="finder-options">{options.map((option) => <button key={option.value} type="button" onClick={() => choose(option)}>{option.label}<span aria-hidden="true">→</span></button>)}</div></fieldset>
    </> : <div className="finder-result" role="status">
      <p className="eyebrow">{result.eyebrow}</p><h3>{result.title}</h3><p>{result.copy}</p>
      {answers.topic ? <p className="finder-match"><strong>You told us:</strong> {AUDIENCES.find((item) => item.value === answers.audience)?.label}<br /><strong>Your priority:</strong> {PRIORITIES.find((item) => item.value === answers.priority)?.label}<br /><strong>Your subject:</strong> {TOPICS.find((item) => item.value === answers.topic)?.label}</p> : null}
      {status === 'success' ? <div className="finder-success"><strong>Your recommendation is on its way.</strong><p>We will send the most relevant ROAMSIX next step to your inbox.</p></div> : <form className="finder-email" onSubmit={requestMatches}><label>Where should we send your recommendation?<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Preparing…' : 'Get my personalized recommendation'}</button></form>}
      <div className="finder-result-actions"><Link className="text-link" to={result.href}>{result.action} <span aria-hidden="true">→</span></Link><button className="text-link finder-restart" type="button" onClick={restart}>Start again</button></div>
    </div>}
  </div>;
}
