import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '../components/SiteLayout';

export default function EmailPreferencesPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const [state, setState] = useState({ loading: true, firstName: '', permission: '', error: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setState((current) => ({ ...current, loading: false, error: 'This preference link is incomplete.' }));
      return;
    }
    fetch(`/api/email-preferences?token=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This preference link is not available.');
        setState({ loading: false, firstName: data.firstName || '', permission: data.permission || '', error: '', message: '' });
      })
      .catch((error) => setState((current) => ({ ...current, loading: false, error: error.message })));
  }, [token]);

  async function save(choice) {
    setSaving(true);
    setState((current) => ({ ...current, error: '', message: '' }));
    try {
      const response = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, choice }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We couldn’t update your preference.');
      setState((current) => ({ ...current, permission: data.permission, message: data.message }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <section className="preference-page">
        <div className="preference-card">
          <p className="eyebrow">Email preferences</p>
          <h1>{state.firstName ? `${state.firstName}, choose what feels right.` : 'Choose what feels right.'}</h1>
          <p>ROAMSIX sends occasional invitations and updates about upcoming dinners, talks, and field experiences. Choose whether you’d like to receive them.</p>

          {state.loading && <p className="preference-status" role="status">Loading your preferences…</p>}
          {state.error && <p className="preference-error" role="alert">{state.error}</p>}
          {state.message && <p className="preference-success" role="status">{state.message}</p>}

          {!state.loading && !state.error && (
            <div className="preference-actions" aria-label="Email preference choices">
              <button className="button" type="button" disabled={saving} onClick={() => save('opt_in')}>
                Yes, keep me informed
              </button>
              <button className="button button-secondary" type="button" disabled={saving} onClick={() => save('opt_out')}>
                No marketing emails
              </button>
            </div>
          )}

          <p className="preference-note">You can change this choice at any time. Registration receipts and other messages needed to complete a purchase may still be sent.</p>
        </div>
      </section>
    </SiteLayout>
  );
}
