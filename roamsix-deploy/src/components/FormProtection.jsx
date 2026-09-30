import { useEffect, useId, useRef, useState } from 'react';

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true; script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Security check failed to load.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function useFormProtection() {
  const [formStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState('');
  const [honeypot, setHoneypot] = useState('');
  return { formStartedAt, turnstileToken, setTurnstileToken, setHoneypot, fields: { formStartedAt, turnstileToken, website: honeypot } };
}

export default function FormProtection({ onToken, onHoneypot }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const container = useRef(null);
  const widgetId = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!siteKey || !container.current) return undefined;
    let cancelled = false;
    loadTurnstile().then((turnstile) => {
      if (cancelled || !turnstile || widgetId.current !== null) return;
      widgetId.current = turnstile.render(container.current, {
        sitekey: siteKey, theme: 'auto', action: 'public_form',
        callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken(''),
      });
    }).catch(() => onToken(''));
    return () => { cancelled = true; if (window.turnstile && widgetId.current !== null) window.turnstile.remove(widgetId.current); };
  }, [siteKey, onToken]);

  return <>
    <label className="form-honeypot" htmlFor={`${id}-website`} aria-hidden="true">Leave this field empty<input id={`${id}-website`} name="website" tabIndex="-1" autoComplete="off" onChange={(event) => onHoneypot?.(event.target.value)} /></label>
    {siteKey ? <div className="form-turnstile" ref={container} aria-label="Security verification" /> : null}
  </>;
}
