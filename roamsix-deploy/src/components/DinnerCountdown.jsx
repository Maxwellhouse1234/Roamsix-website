import { useEffect, useState } from 'react';

const DINNER_START = new Date('2026-09-19T17:00:00-07:00').getTime();

function timeRemaining() {
  const remaining = Math.max(0, DINNER_START - Date.now());
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    started: remaining === 0,
  };
}

export default function DinnerCountdown() {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(timeRemaining()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (time.started) return <p className="dinner-countdown-complete">The evening has begun.</p>;

  return (
    <div className="dinner-countdown" aria-label={`${time.days} days, ${time.hours} hours, and ${time.minutes} minutes until the dinner`}>
      <span><strong>{time.days}</strong>days</span>
      <span><strong>{String(time.hours).padStart(2, '0')}</strong>hours</span>
      <span><strong>{String(time.minutes).padStart(2, '0')}</strong>minutes</span>
    </div>
  );
}
