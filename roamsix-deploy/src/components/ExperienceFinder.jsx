import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const QUESTIONS = [
  {
    prompt: 'Who are you looking for?',
    options: [
      { label: 'Myself', scores: { dinner: 2, membership: 1 } },
      { label: 'Someone I care about', scores: { dinner: 2, retreat: 1 } },
      { label: 'A professional community', scores: { fireside: 2, membership: 2 } },
      { label: 'My team or organization', scores: { organization: 4 } },
    ],
  },
  {
    prompt: 'What would be most useful right now?',
    options: [
      { label: 'A memorable evening and real conversation', scores: { dinner: 4 } },
      { label: 'Ongoing ideas and relationships', scores: { membership: 4, fireside: 2 } },
      { label: 'A subject explored in depth', scores: { retreat: 4, fireside: 1 } },
      { label: 'A focused experience for people I lead', scores: { organization: 4 } },
    ],
  },
  {
    prompt: 'How much time fits your life?',
    options: [
      { label: 'One evening', scores: { dinner: 4 } },
      { label: 'About an hour each week', scores: { fireside: 4, membership: 2 } },
      { label: 'A focused day', scores: { fireside: 2, organization: 1 } },
      { label: 'Two days or more', scores: { retreat: 4, organization: 1 } },
    ],
  },
  {
    prompt: 'What are you ready to do?',
    options: [
      { label: 'Reserve something now', scores: { dinner: 4, membership: 2 } },
      { label: 'Join the full 2027 program', scores: { membership: 5 } },
      { label: 'Follow one subject as it develops', scores: { fireside: 4, retreat: 2 } },
      { label: 'Talk through a private experience', scores: { organization: 5 } },
    ],
  },
];

const RESULTS = {
  dinner: {
    eyebrow: 'Your strongest fit · One evening',
    title: 'An Evening in the Olive Groves',
    copy: 'Begin with a garden walk, a farm-to-table dinner, and one shared table at Father’s Farmhouse on September 19.',
    action: 'Reserve your seat',
    href: '/dinner#tickets',
    secondary: 'Dinner details',
  },
  fireside: {
    eyebrow: 'Your strongest fit · Weekly rhythm',
    title: 'Fireside Conversations',
    copy: 'Follow one practical theme through short, in-person conversations designed to build understanding and meaningful professional relationships over time.',
    action: 'Choose a 2027 theme',
    href: '/events',
    secondary: 'See the full program',
  },
  retreat: {
    eyebrow: 'Your strongest fit · Two days and beyond',
    title: 'The Microbiome in Practice',
    copy: 'Go beyond a talk and follow the microbiome from soil and food into energy, movement, focus, and recovery.',
    action: 'Get retreat updates',
    href: '/first-retreat#interest',
    secondary: 'Preview the retreat',
  },
  membership: {
    eyebrow: 'Your strongest fit · The full 2027 journey',
    title: 'ROAMSIX Founding Membership',
    copy: 'Stay connected across the year through weekly fireside conversations, a cross-disciplinary circle, and first access to selected experiences.',
    action: 'Explore founding membership',
    href: '/membership',
    secondary: '$600 for the 2027 founding year',
  },
  organization: {
    eyebrow: 'Your strongest fit · Built for your group',
    title: 'A Private ROAMSIX Experience',
    copy: 'Start with a question your people are already facing, then shape the faculty, setting, activities, food, and conversation around it.',
    action: 'Start a conversation',
    href: '/organizations',
    secondary: 'For teams and organizations',
  },
};

const EMPTY_SCORES = { dinner: 0, fireside: 0, retreat: 0, membership: 0, organization: 0 };

export default function ExperienceFinder({ compact = false }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState(EMPTY_SCORES);
  const [resultKey, setResultKey] = useState('');
  const result = resultKey ? RESULTS[resultKey] : null;
  const progress = useMemo(() => `${((step + 1) / QUESTIONS.length) * 100}%`, [step]);

  function choose(option) {
    const nextScores = Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, value + (option.scores[key] || 0)]),
    );
    if (step < QUESTIONS.length - 1) {
      setScores(nextScores);
      setStep((value) => value + 1);
      return;
    }
    const winner = Object.entries(nextScores).sort((a, b) => b[1] - a[1])[0][0];
    setScores(nextScores);
    setResultKey(winner);
    trackEvent('experience_finder_complete', { result: winner });
  }

  function restart() {
    setStep(0);
    setScores(EMPTY_SCORES);
    setResultKey('');
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
                <button key={option.label} type="button" onClick={() => choose(option)}>{option.label}<span aria-hidden="true">→</span></button>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="finder-result" role="status">
          <p className="eyebrow">{result.eyebrow}</p>
          <h3>{result.title}</h3>
          <p>{result.copy}</p>
          <div className="button-row">
            <Link className="button" to={result.href} onClick={() => trackEvent('experience_finder_cta', { result: resultKey })}>{result.action}</Link>
            <button className="text-link finder-restart" type="button" onClick={restart}>Start again</button>
          </div>
          <p className="finder-secondary">{result.secondary}</p>
        </div>
      )}
    </div>
  );
}
