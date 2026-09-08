import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const QUESTIONS = [
  {
    key: 'interest',
    prompt: 'What would you like to strengthen?',
    options: [
      { value: 'sustainable performance', label: 'Energy and sustainable performance' },
      { value: 'health and longevity', label: 'Health and longevity' },
      { value: 'nutrition and metabolic health', label: 'Nutrition and metabolic health' },
      { value: 'movement and recovery', label: 'Movement, fitness, and recovery' },
      { value: 'perspective and connection', label: 'Perspective, relationships, and purpose' },
      { value: 'team performance', label: 'Leadership and team performance' },
    ],
  },
  {
    key: 'style',
    prompt: 'How would you most like to explore it?',
    options: [
      { value: 'conversation', label: 'Expert conversation around one subject' },
      { value: 'practice', label: 'Hands-on learning and practical activities' },
      { value: 'outdoors', label: 'Movement, food, and time outdoors' },
      { value: 'immersion', label: 'A deeper experience with time to apply what I learn' },
    ],
  },
  {
    key: 'duration',
    prompt: 'How much time can you make for it?',
    options: [
      { value: 'evening', label: 'One evening' },
      { value: 'day', label: 'One day' },
      { value: 'weekend', label: 'One weekend' },
      { value: 'multi-day', label: 'Several days' },
      { value: 'year', label: 'Ongoing through the year' },
    ],
  },
];

const FORMAT_RESULTS = {
  evening: {
    eyebrow: 'Your recommended format · One evening',
    title: 'A dinner or fireside conversation',
    copy: 'Begin with an expert-led subject, a shared table, and a focused experience that fits into one evening.',
    action: 'See upcoming experiences',
    href: '/experiences',
  },
  day: {
    eyebrow: 'Your recommended format · One day',
    title: 'An immersive learning day',
    copy: 'Spend a full day learning from experts, practicing what you learn, moving, sharing food, and connecting the subject to your life.',
    action: 'Explore the 2027 program',
    href: '/events',
  },
  weekend: {
    eyebrow: 'Your recommended format · One weekend',
    title: 'A focused ROAMSIX retreat',
    copy: 'Give one subject enough time to move from information into practice through expert guidance, place, movement, food, and reflection.',
    action: 'Preview the first retreat',
    href: '/first-retreat',
  },
  'multi-day': {
    eyebrow: 'Your recommended format · Several days',
    title: 'A deep ROAMSIX retreat',
    copy: 'Step away from routine long enough to examine one subject from several perspectives and build changes you can carry home.',
    action: 'Preview the first retreat',
    href: '/first-retreat',
  },
  year: {
    eyebrow: 'Your recommended format · Ongoing',
    title: 'The 2027 ROAMSIX membership',
    copy: 'Follow expert-led subjects across the year, develop stronger practices, and build relationships with people who care about living and performing well.',
    action: 'Explore membership',
    href: '/membership',
  },
};

const TEAM_RESULT = {
  eyebrow: 'Your recommended format · Built for your team',
  title: 'A private ROAMSIX experience',
  copy: 'We can build around your team’s needs and combine applied health science, sustainable performance, leadership, communication, and practical activities in the right environment.',
  action: 'Explore organization experiences',
  href: '/organizations',
};

export default function ExperienceFinder({ compact = false }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ interest: '', style: '', duration: '' });
  const [complete, setComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const result = complete
    ? answers.interest === 'team performance'
      ? TEAM_RESULT
      : FORMAT_RESULTS[answers.duration]
    : null;
  const progress = useMemo(() => `${((step + 1) / QUESTIONS.length) * 100}%`, [step]);

  function choose(option) {
    const question = QUESTIONS[step];
    const nextAnswers = { ...answers, [question.key]: option.value };
    setAnswers(nextAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setComplete(true);
    trackEvent('experience_finder_complete', {
      interest: nextAnswers.interest,
      style: nextAnswers.style,
      duration: nextAnswers.duration,
    });
  }

  async function requestMatches(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inquiryType: answers.interest === 'team performance' ? 'Organization inquiry' : 'Experience recommendation',
          source: 'Homepage Experience Finder',
          message: `Interest: ${answers.interest}. Preferred learning style: ${answers.style}. Available time: ${answers.duration}. Recommended format: ${result.title}.`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Your request could not be sent.');
      setStatus('success');
      trackEvent('experience_finder_lead', { interest: answers.interest, duration: answers.duration });
    } catch (submissionError) {
      setStatus('error');
      setError(`${submissionError.message} Please try again or email info@roamsix.com.`);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({ interest: '', style: '', duration: '' });
    setComplete(false);
    setEmail('');
    setStatus('idle');
    setError('');
  }

  return (
    <div className={`experience-finder ${compact ? 'compact' : ''}`}>
      {!result ? (
        <>
          <div className="finder-progress" aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}>
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <div aria-hidden="true"><i style={{ width: progress }} /></div>
          </div>
          <fieldset>
            <legend>{QUESTIONS[step].prompt}</legend>
            <div className="finder-options">
              {QUESTIONS[step].options.map((option) => (
                <button key={option.value} type="button" onClick={() => choose(option)}>{option.label}<span aria-hidden="true">→</span></button>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="finder-result" role="status">
          <p className="eyebrow">{result.eyebrow}</p>
          <h3>{result.title}</h3>
          <p>{result.copy}</p>
          <p className="finder-match"><strong>Built around:</strong> {answers.interest}<br /><strong>Your preferred approach:</strong> {answers.style}</p>
          {status === 'success' ? (
            <div className="finder-success"><strong>We have your request.</strong><p>Watch your inbox for ROAMSIX information that matches your interests.</p></div>
          ) : (
            <form className="finder-email" onSubmit={requestMatches}>
              <label>Email me the best matches<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send my recommendations'}</button>
            </form>
          )}
          <div className="finder-result-actions">
            <Link className="text-link" to={result.href}>{result.action} <span aria-hidden="true">→</span></Link>
            <button className="text-link finder-restart" type="button" onClick={restart}>Start again</button>
          </div>
        </div>
      )}
    </div>
  );
}
