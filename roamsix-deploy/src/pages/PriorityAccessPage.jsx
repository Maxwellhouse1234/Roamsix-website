import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

/*
  ROAMSIX — PriorityAccessPage.jsx
  Route: /priority-access
  Form endpoint: POST /api/priority-access (do not modify)
*/

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Why",         "/why"],
  ["Corporate",   "/corporate"],
  ["Join",        "/priority-access"],
];

const INTEREST_OPTIONS = [
  "Long Table",
  "Long Game",
  "First Light",
  "Private Experiences",
  "Corporate and Team Experiences",
  "Journeys and Expeditions (Coming Soon)",
  "Podcast Guest or Collaboration",
  "Something Else",
];

const REFERRAL_OPTIONS = [
  "Friend",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Podcast",
  "Previous Guest",
  "Community Partner",
  "Google",
  "Other",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .pa *, .pa *::before, .pa *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .pa {
    font-family: 'Barlow', sans-serif; font-weight: 400;
    background: #141C2A; color: #E8DFD0; overflow-x: hidden;
    font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
  }
  body.pa-no-scroll { overflow: hidden; }

  /* NAV */
  .pa-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
  .pa-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
  .pa-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .pa-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .pa-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .pa-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .pa-nav-links a:hover { color: var(--cream); }
  .pa-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .pa-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .pa-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .pa-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .pa-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .pa-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .pa-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .pa-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .pa-mobile-menu.open { opacity: 1; pointer-events: all; }
  .pa-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .pa-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .pa-mobile-menu a:hover { color: var(--gold); }
  .pa-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

  /* CHROME */
  .pa-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .pa-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .pa-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .pa-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

  /* BUTTONS */
  .pa-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; }
  .pa-btn:active { transform: scale(0.97); }
  .pa-btn-gold { background: var(--gold); color: var(--navy); }
  .pa-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .pa-btn-gold:disabled { opacity: 0.6; cursor: default; }

  /* HERO */
  .pa-hero { background: var(--navy); padding: 120px 56px 40px; }
  .pa-hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
  .pa-hero-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
  .pa-hero-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .pa-hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(38px, 5vw, 68px); line-height: 1.05; color: var(--cream); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 28px; }
  .pa-hero-body p { font-family: 'EB Garamond', serif; font-style: italic; font-size: 19px; line-height: 1.9; color: var(--cream-muted); margin-bottom: 24px; }
  .pa-hero-body p:last-child { margin-bottom: 0; }
  .pa-hero-img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; filter: brightness(0.9) contrast(1.05); }

  /* FORM SECTION */
  .pa-form-section { padding: 64px 56px 100px; background: var(--navy); }
  .pa-form-wrap { max-width: 640px; margin: 0 auto; }
  .pa-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 26px; }
  .pa-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 0; }
  .pa-form-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
  .pa-form-note { font-size: 14px; color: var(--cream-muted); margin-top: -2px; }
  .pa-input, .pa-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 14px 16px; width: 100%; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; }
  .pa-input:focus, .pa-textarea:focus { border-color: var(--teal); }
  .pa-input::placeholder, .pa-textarea::placeholder { color: rgba(232,223,208,0.3); }
  .pa-textarea { resize: vertical; min-height: 96px; }
  .pa-select { cursor: pointer; }
  .pa-select option { background: var(--navy); color: var(--cream); }

  .pa-submit-btn { width: 100%; text-align: center; margin-top: 8px; }
  @media (min-width: 901px) {
    .pa-submit-btn { width: auto; display: block; margin: 8px auto 0; min-width: 280px; }
  }

  /* CHECKBOXES */
  .pa-check-grid { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
  .pa-check { display: flex; align-items: center; gap: 14px; cursor: pointer; }
  .pa-check input { appearance: none; -webkit-appearance: none; width: 20px; height: 20px; min-width: 20px; border: 1px solid rgba(232,223,208,0.3); background: rgba(255,255,255,0.04); cursor: pointer; position: relative; transition: border-color 0.2s; }
  .pa-check input:checked { border-color: var(--gold); background: var(--gold); }
  .pa-check input:checked::after { content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px; border: solid var(--navy); border-width: 0 2px 2px 0; transform: rotate(45deg); }
  .pa-check span { font-size: 16px; color: var(--cream-dim); }
  .pa-check span a { color: var(--gold); text-decoration: underline; }
  .pa-check span a:hover { color: var(--cream); }

  .pa-form-err { color: #E07070; font-size: 14px; margin-top: 8px; }

  /* CONFIRMATION */
  .pa-confirm-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(32px, 4.4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; margin-bottom: 28px; }
  .pa-confirm-body p { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
  .pa-confirm-body p:last-child { margin-bottom: 0; }
  .pa-referral { margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(232,223,208,0.08); }
  .pa-referral-body { font-size: 17px; line-height: 1.85; color: var(--cream-dim); margin: 20px 0 28px; }
  .pa-referral-link-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: stretch; }
  .pa-referral-link { flex: 1; min-width: 220px; background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 15px; padding: 14px 16px; }
  .pa-referral-copy { background: var(--gold); color: var(--navy); border: none; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; padding: 14px 24px; cursor: pointer; transition: background 0.2s; }
  .pa-referral-copy:hover { background: var(--cream); }
  .pa-referral-share { font-family: 'EB Garamond', serif; font-style: italic; font-size: 17px; line-height: 1.8; color: var(--cream-muted); margin-top: 24px; }

  /* FOOTER */
  .pa-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
  .pa-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  .pa-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .pa-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .pa-footer-social { display: flex; gap: 16px; }
  .pa-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
  .pa-footer-social a:hover { color: var(--cream); }
  .pa-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .pa-footer-col ul { list-style: none; }
  .pa-footer-col ul li { margin-bottom: 12px; }
  .pa-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .pa-footer-col ul a:hover { color: var(--cream); }
  .pa-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .pa-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .pa-nav-links { display: none; }
    .pa-burger { display: flex; }
    .pa-nav { padding: 0 24px; }
    .pa-hero { padding: 100px 24px 32px; }
    .pa-hero-inner { grid-template-columns: 1fr; gap: 28px; }
    .pa-form-section { padding: 48px 24px 72px; }
    .pa-form-row { grid-template-columns: 1fr; gap: 0; }
    .pa-footer { padding: 56px 24px 36px; }
    .pa-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .pa-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
  }
  @media (max-width: 480px) {
    .pa-footer-top { grid-template-columns: 1fr; }
  }
`;

export default function PriorityAccessPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", mobile: "",
    interests: [], customInterest: "",
    referralSource: "", referralName: "",
    emailConsent: false, smsConsent: false, termsAccepted: false,
  });
  const [referredBy, setReferredBy] = useState("");
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("pa-no-scroll", menuOpen);
    return () => document.body.classList.remove("pa-no-scroll");
  }, [menuOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(ref);
  }, []);

  const close = () => setMenuOpen(false);

  const toggleInterest = (label) => {
    setForm(f => {
      const has = f.interests.includes(label);
      return { ...f, interests: has ? f.interests.filter(i => i !== label) : [...f.interests, label] };
    });
  };

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.termsAccepted;

  const submit = async () => {
    if (!canSubmit) {
      setErr("Please complete the required fields and accept the Terms of Service and Privacy Policy.");
      return;
    }
    setStatus("loading"); setErr("");
    try {
      const res = await fetch("/api/priority-access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          experienceInterests: form.interests,
          customInterest: form.customInterest.trim(),
          referralSource: form.referralSource.trim(),
          referralName: form.referralName.trim(),
          emailConsent: form.emailConsent,
          smsConsent: form.smsConsent,
          termsAccepted: form.termsAccepted,
          referredBy: referredBy.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setReferralCode(data.referralCode || "");
        setStatus("success");
      } else {
        setErr(data.error || "Submission failed. Please email info@roamsix.com directly.");
        setStatus("idle");
      }
    } catch {
      setErr("Network error. Please email info@roamsix.com directly.");
      setStatus("idle");
    }
  };

  const referralLink = `roamsix.com/priority-access?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="pa">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`pa-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => {
          if (l === "Join") return <Link key={l} to={h} className="pa-mobile-join" onClick={close}>{l}</Link>;
          return (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
        })}
      </div>

      {/* NAV */}
      <nav className={`pa-nav ${scrolled ? "solid" : ""}`}>
        <Link className="pa-nav-brand" to="/"><span className="pa-wordmark">ROAMSIX</span></Link>
        <ul className="pa-nav-links">
          {NAV.map(([l, h]) => (
            <li key={l}>
              {l === "Join"
                ? <Link to={h} className="pa-nav-join">{l}</Link>
                : (h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
              }
            </li>
          ))}
        </ul>
        <button className={`pa-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* HERO */}
      <section className="pa-hero">
        <div className="pa-hero-inner">
          <div>
            <div className="pa-hero-eyebrow">Priority Access</div>
            <h1 className="pa-hero-h1">Request Priority Access.</h1>
            <div className="pa-hero-body">
              <p>ROAMSIX experiences open to the priority list before anything is shared publicly.</p>
              <p>Add your name to be considered for upcoming gatherings, podcast releases, and future invitations.</p>
              <p>If this feels like your kind of people, start here.</p>
            </div>
          </div>
          <img
            className="pa-hero-img"
            src="/images/events/oak-tree-lounge-roamsix.jpg"
            alt="A lounge area beneath oak trees at golden hour"
            loading="lazy"
          />
        </div>
      </section>

      <hr className="pa-hr"/>

      {/* FORM */}
      <section className="pa-form-section">
        <div className="pa-form-wrap">
          {status === "success" ? (
            <>
              <h2 className="pa-confirm-h2">The World Is Still Wide.</h2>
              <div className="pa-confirm-body">
                <p>Thank you for joining us.</p>
                <p>We will reach out when it is time to gather again.</p>
                <p>Until then: stay curious. Stay awake.</p>
              </div>

              {referralCode && (
                <div className="pa-referral">
                  <div className="pa-label-row"><span className="pa-rule"/><span className="pa-label">Know Someone Who Belongs Here?</span></div>
                  <p className="pa-referral-body">If someone came to mind, send them your personal invitation. ROAMSIX grows one relationship at a time.</p>
                  <div className="pa-referral-link-row">
                    <input className="pa-referral-link" readOnly value={referralLink}/>
                    <button className="pa-referral-copy" onClick={copyLink}>{copied ? "Copied" : "Copy"}</button>
                  </div>
                  <p className="pa-referral-share">If someone came to mind, send them your invitation.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="pa-label-row"><span className="pa-rule"/><span className="pa-label">Join Priority Access</span></div>

              <div className="pa-form-row" style={{ marginBottom: "26px" }}>
                <div className="pa-form-group" style={{ marginBottom: 0 }}>
                  <label className="pa-form-label">First Name *</label>
                  <input className="pa-input" placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}/>
                </div>
                <div className="pa-form-group" style={{ marginBottom: 0 }}>
                  <label className="pa-form-label">Last Name *</label>
                  <input className="pa-input" placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}/>
                </div>
              </div>

              <div className="pa-form-group">
                <label className="pa-form-label">Email Address *</label>
                <input className="pa-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/>
              </div>

              <div className="pa-form-group">
                <label className="pa-form-label">Mobile Number *</label>
                <input className="pa-input" type="tel" placeholder="Mobile number" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}/>
              </div>

              <div className="pa-form-group">
                <label className="pa-form-label">What are you most interested in?</label>
                <span className="pa-form-note">Select all that apply.</span>
                <div className="pa-check-grid">
                  {INTEREST_OPTIONS.map(opt => (
                    <label key={opt} className="pa-check">
                      <input type="checkbox" checked={form.interests.includes(opt)} onChange={() => toggleInterest(opt)}/>
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {form.interests.includes("Something Else") && (
                  <input
                    className="pa-input"
                    style={{ marginTop: "14px" }}
                    placeholder="What would you love to see ROAMSIX create?"
                    value={form.customInterest}
                    onChange={e => setForm(f => ({ ...f, customInterest: e.target.value }))}
                  />
                )}
              </div>

              <div className="pa-form-group">
                <label className="pa-form-label">How did you hear about ROAMSIX?</label>
                <select
                  className="pa-input pa-select"
                  value={form.referralSource}
                  onChange={e => setForm(f => ({ ...f, referralSource: e.target.value }))}
                >
                  <option value="">Select one</option>
                  {REFERRAL_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {(form.referralSource === "Friend" || form.referralSource === "Previous Guest") && (
                  <input
                    className="pa-input"
                    style={{ marginTop: "14px" }}
                    placeholder="Their name"
                    value={form.referralName}
                    onChange={e => setForm(f => ({ ...f, referralName: e.target.value }))}
                  />
                )}
              </div>

              <div className="pa-form-group">
                <label className="pa-check">
                  <input type="checkbox" checked={form.termsAccepted} onChange={() => setForm(f => ({ ...f, termsAccepted: !f.termsAccepted }))}/>
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
                  </span>
                </label>
                <label className="pa-check" style={{ marginTop: "14px" }}>
                  <input type="checkbox" checked={form.emailConsent} onChange={() => setForm(f => ({ ...f, emailConsent: !f.emailConsent }))}/>
                  <span>I'd like to receive invitations and occasional updates from ROAMSIX.</span>
                </label>
                <label className="pa-check" style={{ marginTop: "14px" }}>
                  <input type="checkbox" checked={form.smsConsent} onChange={() => setForm(f => ({ ...f, smsConsent: !f.smsConsent }))}/>
                  <span>I'd like to receive occasional SMS updates about invitations and experiences. Message and data rates may apply. Reply STOP to unsubscribe.</span>
                </label>
              </div>

              {err && <p className="pa-form-err">{err}</p>}

              <button className="pa-btn pa-btn-gold pa-submit-btn" onClick={submit} disabled={status === "loading" || !canSubmit}>
                {status === "loading" ? "Submitting..." : "Request Priority Access"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pa-footer">
        <div className="pa-footer-top">
          <div>
            <div className="pa-footer-wm">ROAMSIX</div>
            <p className="pa-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
            <div className="pa-footer-social">
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="pa-footer-col"><h4>Company</h4><ul>
            <li><Link to="/why">Why We Built ROAMSIX</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="pa-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><Link to="/priority-access">Priority Access</Link></li>
          </ul></div>
          <div className="pa-footer-col"><h4>Connect</h4><ul>
            <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
            <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
            <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul></div>
          <div className="pa-footer-col"><h4>Redirection Point</h4><ul>
            <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="/#podcast">About the Podcast</a></li>
          </ul></div>
          <div className="pa-footer-col"><h4>Legal</h4><ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/waiver">Assumption of Risk</Link></li>
            <li><Link to="/media-release">Media Release</Link></li>
            <li><Link to="/terms">Refund Policy</Link></li>
          </ul></div>
        </div>
        <div className="pa-footer-bottom">
          <span className="pa-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
          <span className="pa-footer-copy">ROAMSIX, Murrieta, CA</span>
        </div>
      </footer>
    </div>
  );
}
