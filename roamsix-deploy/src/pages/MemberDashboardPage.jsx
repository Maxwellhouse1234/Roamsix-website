import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MemberBenefitCards } from '../components/MemberBenefits';
import SiteLayout from '../components/SiteLayout';
import { GUEST_PASS_DEFINITION, MEMBERSHIP_GUEST_PASSES } from '../data/membership';

const TOPICS = ['Microbiome & Gut Health', 'Sleep & Recovery', 'Stress & Resilience', 'Strength & Longevity'];

export default function MemberDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [topicRequest, setTopicRequest] = useState('');

  useEffect(() => {
    fetch('/api/member-dashboard').then(async (response) => {
      if (response.status === 401) return navigate('/member/login', { replace: true });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Member area could not be loaded.');
      setData(body); setProfile(body.profile); setStatus('ready');
    }).catch((error) => { setMessage(error.message); setStatus('error'); });
  }, [navigate]);

  function update(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }
  function toggleTopic(topic) {
    setProfile((current) => ({ ...current, topics: current.topics.includes(topic) ? current.topics.filter((item) => item !== topic) : [...current.topics, topic] }));
  }
  async function api(method, body) {
    const response = await fetch('/api/member-dashboard', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'The request could not be saved.');
    return result;
  }
  async function saveProfile(event) {
    event.preventDefault(); setMessage('Saving…');
    try { const result = await api('PATCH', profile); setData(result); setProfile(result.profile); setMessage('Preferences saved.'); } catch (error) { setMessage(error.message); }
  }
  async function requestBooking() {
    setMessage('Sending request…');
    try { await api('POST', { action: 'booking', eventName: 'Dr. Sal · October 24, 2026 · San Diego', message: 'Member requests first notice when registration opens.' }); setMessage('Your interest is recorded. This is not a reservation.'); } catch (error) { setMessage(error.message); }
  }
  async function requestTopic(event) {
    event.preventDefault(); setMessage('Sending request…');
    try { await api('POST', { action: 'topic', eventName: '2027 member topic request', message: topicRequest }); setTopicRequest(''); setMessage('Topic request received.'); } catch (error) { setMessage(error.message); }
  }
  async function signOut() { await fetch('/api/member-auth', { method: 'DELETE' }); navigate('/member/login', { replace: true }); }

  if (status === 'loading') return <SiteLayout><section className="member-login-page"><div className="container"><p>Opening your secure member area…</p></div></section></SiteLayout>;
  if (status === 'error') return <SiteLayout><section className="member-login-page"><div className="container member-login-card"><h1>We could not open the member area.</h1><p>{message}</p><Link className="button" to="/member/login">Return to sign in</Link></div></section></SiteLayout>;

  const tier = data.membership.tier;
  return <SiteLayout><section className="member-dashboard-hero"><div className="container"><div><p className="eyebrow">Member area</p><h1>Welcome, {profile.fullName?.split(' ')[0] || 'member'}.</h1><p>{tier} membership{data.membership.cohortLabel ? ` · ${data.membership.cohortLabel}` : ''} · <span className="status-chip confirmed">{data.membership.status}</span></p></div><button className="text-button" type="button" onClick={signOut}>Sign out</button></div></section>
    <nav className="member-section-nav" aria-label="Member area sections"><div className="container">{['calendar', 'profile', 'passes', 'benefits', 'library', 'requests', 'billing'].map((item) => <a key={item} href={`#${item}`}>{item}</a>)}</div></nav>
    {message ? <div className="container"><p className="member-notice" role="status">{message}</p></div> : null}
    <section className="section light-section" id="calendar"><div className="container member-section-head"><div><p className="eyebrow">Calendar and booking</p><h2>What is ahead.</h2></div><p>We will show booking links here as each experience is ready.</p></div><div className="container member-calendar">
      <article><span className="status-chip development">Registration not open</span><p className="eyebrow">October 24, 2026 · San Diego · Venue to be announced</p><h3>The gut-brain connection</h3><p>Food, stress, and the habits that support everyday performance with Dr. Sulaiman Bharwani.</p><button className="button button-accent" type="button" onClick={requestBooking}>Notify me when registration opens</button><p className="form-note">Joining the interest list does not reserve a place.</p></article>
      <article><span className="status-chip planned">Coming in 2027</span><h3>New perspectives across health and performance</h3><p>Dates and registration links will appear here as each experience is confirmed.</p><Link className="text-link" to="/events">Show me the four themes <span aria-hidden="true">→</span></Link></article>
    </div></section>
    <section className="section fog-section" id="profile"><div className="container member-section-head"><div><p className="eyebrow">Profile and preferences</p><h2>Help us make the calendar more useful.</h2></div><p>Share nonclinical preferences only. Do not submit diagnoses, treatment information, test results, or medical records.</p></div><form className="container member-profile-form" onSubmit={saveProfile}>
      <label>Full name<input name="fullName" value={profile.fullName} onChange={update} /></label><label>Mobile <span className="optional">optional</span><input name="mobile" value={profile.mobile} onChange={update} autoComplete="tel" /></label><label>Organization <span className="optional">optional</span><input name="organization" value={profile.organization} onChange={update} /></label>
      <fieldset><legend>Topics you want to explore</legend>{TOPICS.map((topic) => <label className="check" key={topic}><input type="checkbox" checked={profile.topics.includes(topic)} onChange={() => toggleTopic(topic)} /> {topic}</label>)}</fieldset>
      <label>Movement preference <span className="optional">examples: walking, gentle mobility, strength</span><input name="movementPreference" value={profile.movementPreference} onChange={update} /></label>
      <label>Food preference <span className="optional">nonclinical only</span><input name="foodPreference" value={profile.foodPreference} onChange={update} /></label>
      <label>Access needs <span className="optional">mobility, seating, hearing, sensory, or scheduling preferences</span><textarea name="accessNeeds" value={profile.accessNeeds} onChange={update} rows="3" /></label>
      <label>Primary communication<select name="communicationPreference" value={profile.communicationPreference} onChange={update}><option value="email">Email</option><option value="sms">SMS, when I have separately opted in</option></select></label>
      <button className="button" type="submit">Save profile and preferences</button>
    </form></section>
    <section className="section light-section" id="passes"><div className="container member-two-column"><div><p className="eyebrow">Guest passes</p><h2>{typeof MEMBERSHIP_GUEST_PASSES[tier] === 'number' ? `${MEMBERSHIP_GUEST_PASSES[tier]} passes per year` : MEMBERSHIP_GUEST_PASSES[tier]}</h2><p>{GUEST_PASS_DEFINITION} They do not include a larger member gathering, Journey travel, or a separately charged partner-hosted experience.</p></div><div><p className="eyebrow">Pass rules</p><h3>Share eligible experiences without transferring your membership.</h3><p>Each guest place is subject to the capacity, registration deadline, safety requirements, and terms published for that experience. Guests must complete their own required agreements.</p></div></div></section>
    <section className="section fog-section" id="benefits"><div className="container member-section-head"><div><p className="eyebrow">Confirmed member benefits</p><h2>Benefits available with your {tier} membership.</h2></div><p>Only signed, currently available benefits appear here. Open each benefit for redemption instructions, limits, dates, and third-party terms.</p></div><div className="container">{data.benefits?.length ? <MemberBenefitCards benefits={data.benefits} memberView /> : <div className="member-benefits-empty"><h3>No partner benefits are published yet.</h3><p>Confirmed benefits will appear here with their exact offer, value, dates, and instructions. Planned relationships are not member promises.</p></div>}</div></section>
    <section className="section ink-section" id="library"><div className="container member-two-column"><div><p className="eyebrow">Private clips and notes</p><h2>Your member library.</h2><p>No private recap has been published yet. Event notes, short clips, and practical action cards will appear here after eligible programs.</p></div><div><p className="eyebrow">Contact</p><h3>Need help from ROAMSIX?</h3><p>Email us for access, calendar, or account support.</p><a className="button button-secondary" href="mailto:info@roamsix.com?subject=Member%20support">Contact ROAMSIX</a></div></div></section>
    <section className="section fog-section" id="requests"><div className="container member-two-column"><div><p className="eyebrow">Member voice</p><h2>Request a topic.</h2><p>ROAMSIX reviews member input while retaining editorial control of the program.</p></div><form className="topic-request-form" onSubmit={requestTopic}><label>Your question or topic<textarea value={topicRequest} onChange={(event) => setTopicRequest(event.target.value)} rows="5" maxLength="3000" required /></label><button className="button" type="submit">Send topic request</button></form></div></section>
    <section className="section light-section" id="billing"><div className="container member-two-column"><div><p className="eyebrow">Billing management</p><h2>Manage renewal and payment details securely.</h2><p>Stripe handles payment information. ROAMSIX does not store your full card details.</p></div><div><Link className="button button-accent" to="/membership/manage">Open billing management</Link><p className="form-note">If offered, the larger member gathering has its own ticket price and proceeds only after its cash costs are covered. The year-end Journey and some partner-hosted or premium experiences are also separately purchased.</p></div></div></section>
  </SiteLayout>;
}
