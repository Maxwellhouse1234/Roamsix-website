import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

/*
  ROAMSIX — CorporatePage.jsx
  Route: /corporate
  Design system matches ExperiencesPage.jsx (cp- prefix)
  Form endpoint: POST /api/contact (do not modify)
*/

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Corporate",   "/corporate"],
  ["Team",        "/team"],
  ["Podcast",     "#podcast"],
];

const FORMATS = [
  {
    name: "One-Day Experience",
    ideal: "Teams of 8 to 50",
    bestFor: "Alignment days, employee appreciation, leadership development, culture work, and first engagements",
    includes: [
      "Full-day structured programming",
      "Facilitated conversations and team experiences",
      "Shared meals and hospitality",
      "Movement, recovery, or outdoor components",
      "Curated pacing and facilitation",
      "End-to-end planning and coordination",
    ],
    note: "Most popular for first engagements.",
  },
  {
    name: "Overnight Immersion",
    ideal: "Teams of 8 to 30",
    bestFor: "Leadership teams, annual planning, culture reset, deeper alignment work, and meaningful time together",
    includes: [
      "Multi-day structured programming",
      "Accommodation sourcing and coordination",
      "All meals and hospitality",
      "Recovery and movement sessions",
      "Facilitated conversations throughout",
      "End-to-end logistics management",
    ],
    note: "Recommended for leadership teams.",
  },
  {
    name: "Multi-Day Retreat",
    ideal: "Teams of 8 to 25",
    bestFor: "Executive retreats, strategic planning, significant culture work, transitions, and longer-form team development",
    includes: [
      "Custom 3 to 5 day experience design",
      "Private venue sourcing and coordination",
      "Full hospitality and meal program",
      "Expert facilitation and programming",
      "Recovery, movement, and reflection sessions",
      "Complete logistics from arrival to departure",
    ],
    note: "Our deepest format.",
  },
];

const HANDLES = [
  "Venue sourcing and coordination",
  "Agenda design and facilitation",
  "Meals and hospitality",
  "Activity and experience curation",
  "Budget planning and reconciliation",
  "On-site coordination and execution",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .cp *, .cp *::before, .cp *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .cp {
    font-family: 'Barlow', sans-serif; font-weight: 400;
    background: #141C2A; color: #E8DFD0; overflow-x: hidden;
    font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
    --rp-dark: #0E0B06; --rp-gold: #C9A84C; --rp-gold-dim: #8A7438; --rp-cream: #D0BF9A;
  }
  body.cp-no-scroll { overflow: hidden; }

  /* NAV */
  .cp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
  .cp-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
  .cp-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .cp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .cp-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .cp-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .cp-nav-links a:hover { color: var(--cream); }
  .cp-nav-cta { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .cp-nav-cta:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .cp-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .cp-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .cp-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .cp-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .cp-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .cp-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .cp-mobile-menu.open { opacity: 1; pointer-events: all; }
  .cp-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .cp-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .cp-mobile-menu a:hover { color: var(--gold); }
  .cp-mobile-cta { background: transparent; color: var(--gold); margin-top: 32px; border: 1px solid var(--gold); font-size: 20px; }

  /* CHROME */
  .cp-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .cp-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .cp-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .cp-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

  /* BUTTONS */
  .cp-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; }
  .cp-btn:active { transform: scale(0.97); }
  .cp-btn-gold { background: var(--gold); color: var(--navy); border: none; }
  .cp-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .cp-btn-outline { background: transparent; color: var(--gold); border: 1px solid var(--gold); }
  .cp-btn-outline:hover { background: rgba(181,149,88,0.1); }

  /* HERO */
  .cp-hero { background: var(--navy); padding: 80px 56px 60px; }
  .cp-hero-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
  .cp-hero-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .cp-hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4.8vw, 64px); line-height: 1.05; color: var(--cream); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 28px; max-width: 960px; }
  .cp-hero-sub { font-size: 19px; line-height: 1.8; color: var(--cream-dim); max-width: 640px; margin-bottom: 28px; }
  .cp-hero-price { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }

  /* INTRO */
  .cp-intro { padding: 60px 56px; background: var(--panel); }
  .cp-intro-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(26px, 3.4vw, 46px); line-height: 1.05; color: var(--cream); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 40px; max-width: 800px; }
  .cp-intro-body p { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 22px; max-width: 720px; }
  .cp-intro-body p:last-child { margin-bottom: 0; }

  /* FORMATS */
  .cp-formats { padding: 72px 56px; background: var(--navy); }
  .cp-formats-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 0; }
  .cp-formats-subhead { font-size: 18px; line-height: 1.8; color: var(--cream-dim); max-width: 600px; margin-top: 14px; margin-bottom: 56px; }
  .cp-formats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .cp-format-card { background: var(--panel); border: 1px solid rgba(232,223,208,0.07); padding: 40px 32px; display: flex; flex-direction: column; }
  .cp-format-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 28px; line-height: 1.1; }
  .cp-format-meta-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
  .cp-format-meta-val { font-size: 15px; color: var(--cream-dim); margin-bottom: 20px; line-height: 1.6; }
  .cp-format-includes-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .cp-format-list { list-style: none; flex: 1; margin-bottom: 0; }
  .cp-format-list li { font-size: 14px; color: var(--cream-muted); padding: 7px 0; border-bottom: 1px solid rgba(232,223,208,0.06); line-height: 1.5; }
  .cp-format-list li::before { content: '\\2013'; color: var(--gold-dim); margin-right: 8px; }
  .cp-format-note { font-family: 'EB Garamond', serif; font-style: italic; font-size: 15px; color: var(--gold); margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(181,149,88,0.15); }
  .cp-format-cta { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); text-decoration: none; margin-top: 16px; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
  .cp-format-cta:hover { color: var(--cream); }

  /* WHAT WE HANDLE */
  .cp-handles { padding: 72px 56px; background: var(--panel); }
  .cp-handles-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 0; }
  .cp-handles-subhead { font-size: 18px; line-height: 1.8; color: var(--cream-dim); max-width: 480px; margin-top: 14px; margin-bottom: 52px; }
  .cp-handles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; max-width: 760px; }
  .cp-handle-item { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 500; letter-spacing: 0.5px; color: var(--cream-dim); padding: 18px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; align-items: center; gap: 14px; }
  .cp-handle-item::before { content: ''; display: block; width: 5px; height: 5px; background: var(--gold); flex-shrink: 0; }
  .cp-handles-note { font-size: 15px; color: var(--cream-muted); margin-top: 48px; max-width: 680px; line-height: 1.7; }

  /* PRICING */
  .cp-pricing { padding: 72px 56px; background: var(--navy); }
  .cp-pricing-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-top: 16px; margin-bottom: 20px; }
  .cp-pricing-body { font-size: 18px; line-height: 1.85; color: var(--cream-dim); max-width: 600px; margin-bottom: 12px; }
  .cp-pricing-price { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 40px; }

  /* CONTACT */
  .cp-contact { padding: 72px 56px; background: var(--panel); }
  .cp-contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start; }
  .cp-contact-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(26px, 3.4vw, 46px); line-height: 1.05; color: var(--cream); text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; margin-bottom: 20px; }
  .cp-contact-body { font-size: 18px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 32px; }
  .cp-contact-links a { display: block; color: var(--teal-light); text-decoration: none; font-size: 16px; margin-bottom: 12px; transition: color 0.2s; }
  .cp-contact-links a:hover { color: var(--cream); }
  .cp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .cp-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .cp-form-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }
  .cp-input, .cp-select, .cp-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; }
  .cp-input:focus, .cp-select:focus, .cp-textarea:focus { border-color: var(--teal); }
  .cp-input::placeholder, .cp-textarea::placeholder { color: rgba(232,223,208,0.3); }
  .cp-textarea { resize: vertical; min-height: 140px; }
  .cp-form-err { color: #E07070; font-size: 14px; margin-top: 8px; }
  .cp-form-success { background: rgba(74,117,117,0.12); border: 1px solid rgba(74,117,117,0.3); padding: 20px 24px; }
  .cp-form-success p { color: var(--cream-dim); font-size: 16px; line-height: 1.65; }

  /* CHECKBOX */
  .cp-checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; margin-bottom: 4px; cursor: pointer; user-select: none; }
  .cp-checkbox { width: 16px; height: 16px; accent-color: var(--gold); cursor: pointer; flex-shrink: 0; }
  .cp-checkbox-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); cursor: pointer; }

  /* FOOTER */
  .cp-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
  .cp-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  .cp-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .cp-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .cp-footer-social { display: flex; gap: 16px; }
  .cp-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
  .cp-footer-social a:hover { color: var(--cream); }
  .cp-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .cp-footer-col ul { list-style: none; }
  .cp-footer-col ul li { margin-bottom: 12px; }
  .cp-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .cp-footer-col ul a:hover { color: var(--cream); }
  .cp-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .cp-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .cp-nav-links { display: none; }
    .cp-burger { display: flex; }
    .cp-nav { padding: 0 24px; }
    .cp-hero { padding: 72px 24px 52px; }
    .cp-intro { padding: 52px 24px; }
    .cp-formats { padding: 52px 24px; }
    .cp-formats-grid { grid-template-columns: 1fr; }
    .cp-handles { padding: 52px 24px; }
    .cp-handles-grid { grid-template-columns: 1fr; }
    .cp-pricing { padding: 52px 24px; }
    .cp-contact { padding: 52px 24px; }
    .cp-contact-grid { grid-template-columns: 1fr; gap: 52px; }
    .cp-footer { padding: 56px 24px 36px; }
    .cp-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .cp-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    .cp-form-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .cp-footer-top { grid-template-columns: 1fr; }
  }
`;

export default function CorporatePage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [contact,   setContact]   = useState({ first: "", last: "", email: "", company: "", teamSize: "", format: "", message: "", stayInLoop: false });
  const [ctStatus,  setCtStatus]  = useState("idle");
  const [ctErr,     setCtErr]     = useState("");

  useEffect(() => {
    document.body.classList.toggle("cp-no-scroll", menuOpen);
    return () => document.body.classList.remove("cp-no-scroll");
  }, [menuOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  /* ── FORM HANDLER — DO NOT MODIFY ───────────────────────────────────────── */
  const submitContact = async () => {
    if (!contact.email.trim() || !contact.message.trim()) { setCtErr("Please enter your email and message."); return; }
    setCtStatus("loading"); setCtErr("");
    try {
      const metaLines = [
        contact.teamSize   && `Team Size: ${contact.teamSize}`,
        contact.format     && `Preferred Format: ${contact.format}`,
        contact.stayInLoop && `Stay in the Loop: Yes`,
      ].filter(Boolean);
      const fullMessage = metaLines.length > 0
        ? `${metaLines.join("\n")}\n\n---\n\n${contact.message.trim()}`
        : contact.message.trim();
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: contact.first.trim(), lastName: contact.last.trim(), email: contact.email.trim(), company: contact.company.trim(), inquiryType: "Corporate Experience", message: fullMessage, source: "Corporate Page Contact Form" }),
      });
      if (res.ok) { setCtStatus("success"); }
      else { const d = await res.json().catch(() => ({})); setCtErr(d.error || "Submission failed. Please email info@roamsix.com directly."); setCtStatus("idle"); }
    } catch { setCtErr("Network error. Please email info@roamsix.com directly."); setCtStatus("idle"); }
  };

  return (
    <div className="cp">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`cp-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => h.startsWith('#') ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>)}
        <a href="#contact" className="cp-mobile-cta" onClick={close}>Inquire</a>
      </div>

      {/* NAV */}
      <nav className={`cp-nav ${scrolled ? "solid" : ""}`}>
        <Link className="cp-nav-brand" to="/"><span className="cp-wordmark">ROAMSIX</span></Link>
        <ul className="cp-nav-links">
          {NAV.map(([l, h]) => <li key={l}>{h.startsWith('#') ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>}</li>)}
          <li><a href="#contact" className="cp-nav-cta">Inquire</a></li>
        </ul>
        <button className={`cp-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* HERO */}
      <section className="cp-hero">
        <div className="cp-hero-eyebrow">Corporate Experiences</div>
        <h1 className="cp-hero-h1">Built around your team. Designed around what needs to move.</h1>
        <p className="cp-hero-sub">ROAMSIX plans and executes fully customized experiences for leadership teams, companies, and organizations. Every engagement is shaped around your people, your goals, and the outcomes that need to carry back into work.</p>
        <div className="cp-hero-price">Starting at $449 per person per day.</div>
        <button
          className="cp-btn cp-btn-gold"
          style={{ marginTop: "28px" }}
          onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
        >
          Request a Proposal
        </button>
      </section>

      <hr className="cp-hr"/>

      {/* INTRO */}
      <section className="cp-intro">
        <h2 className="cp-intro-h2">This is not a standard offsite.</h2>
        <div className="cp-intro-body">
          <p>Most offsites are planned around logistics first. A location. A schedule. A few sessions. Some activities. People show up, spend the day together, and return to the same patterns.</p>
          <p>ROAMSIX starts with what your team actually needs. Clearer direction. Stronger communication. Better trust. Real alignment. Then we design the experience around that.</p>
        </div>
      </section>

      <hr className="cp-hr"/>

      {/* FORMATS */}
      <section className="cp-formats">
        <div className="cp-label-row"><span className="cp-rule"/><span className="cp-label">Experience Formats</span></div>
        <h2 className="cp-formats-h2">Three formats. Fully customized.</h2>
        <p className="cp-formats-subhead">Every engagement is scoped and priced based on your team size, location, goals, and level of support needed.</p>
        <div className="cp-formats-grid">
          {FORMATS.map(f => (
            <div className="cp-format-card" key={f.name}>
              <div className="cp-format-name">{f.name}</div>
              <div className="cp-format-meta-label">Ideal for</div>
              <div className="cp-format-meta-val">{f.ideal}</div>
              <div className="cp-format-meta-label">Best for</div>
              <div className="cp-format-meta-val">{f.bestFor}</div>
              <div className="cp-format-includes-label">Includes</div>
              <ul className="cp-format-list">
                {f.includes.map(item => <li key={item}>{item}</li>)}
              </ul>
              <p className="cp-format-note">{f.note}</p>
              <a
                href="#contact"
                className="cp-format-cta"
                onClick={e => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }}
              >
                Request a Proposal
              </a>
            </div>
          ))}
        </div>
      </section>

      <hr className="cp-hr"/>

      {/* WHAT WE HANDLE */}
      <section className="cp-handles">
        <div className="cp-label-row"><span className="cp-rule"/><span className="cp-label">End-to-End</span></div>
        <h2 className="cp-handles-h2">We handle everything.</h2>
        <p className="cp-handles-subhead">You focus on your people. We take care of the rest.</p>
        <div className="cp-handles-grid">
          {HANDLES.map(item => (
            <div className="cp-handle-item" key={item}>{item}</div>
          ))}
        </div>
        <p className="cp-handles-note">We work with teams across industries including technology, construction, healthcare, finance, and professional services.</p>
      </section>

      <hr className="cp-hr"/>

      {/* PRICING */}
      <section className="cp-pricing">
        <div className="cp-label-row"><span className="cp-rule"/><span className="cp-label">Investment</span></div>
        <h2 className="cp-pricing-h2">Custom scoped. Clear proposal.</h2>
        <p className="cp-pricing-body">Every engagement is priced based on team size, format, location, and scope. We build a clear proposal after a discovery call so your team knows exactly what is included.</p>
        <div className="cp-pricing-price">Starting at $449 per person per day.</div>
        <a href="#contact" className="cp-btn cp-btn-gold">Request a Proposal</a>
      </section>

      <hr className="cp-hr"/>

      {/* CONTACT */}
      <section className="cp-contact" id="contact">
        <div className="cp-contact-grid">
          <div>
            <div className="cp-label-row"><span className="cp-rule"/><span className="cp-label">Start Here</span></div>
            <h2 className="cp-contact-h2">Tell us about your team.</h2>
            <p className="cp-contact-body">We will be in touch within one business day to schedule a discovery call.</p>
            <div className="cp-contact-links">
              <a href="mailto:info@roamsix.com">info@roamsix.com</a>
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div>
            {ctStatus === "success" ? (
              <div className="cp-form-success">
                <p>We received your message and will follow up within one business day.</p>
              </div>
            ) : (
              <>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-form-label">First Name</label>
                    <input className="cp-input" placeholder="First" value={contact.first} onChange={e => setContact(c => ({ ...c, first: e.target.value }))}/>
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-form-label">Last Name</label>
                    <input className="cp-input" placeholder="Last" value={contact.last} onChange={e => setContact(c => ({ ...c, last: e.target.value }))}/>
                  </div>
                </div>
                <div className="cp-form-group">
                  <label className="cp-form-label">Email *</label>
                  <input className="cp-input" placeholder="your@email.com" type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))}/>
                </div>
                <div className="cp-form-group">
                  <label className="cp-form-label">Company or Organization</label>
                  <input className="cp-input" placeholder="Optional" value={contact.company} onChange={e => setContact(c => ({ ...c, company: e.target.value }))}/>
                </div>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-form-label">Team Size</label>
                    <select className="cp-select" value={contact.teamSize} onChange={e => setContact(c => ({ ...c, teamSize: e.target.value }))}>
                      <option value="">Select</option>
                      <option value="Under 10">Under 10</option>
                      <option value="10 to 25">10 to 25</option>
                      <option value="25 to 50">25 to 50</option>
                      <option value="50 or more">50 or more</option>
                    </select>
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-form-label">Preferred Format</label>
                    <select className="cp-select" value={contact.format} onChange={e => setContact(c => ({ ...c, format: e.target.value }))}>
                      <option value="">Select</option>
                      <option value="One-Day">One-Day</option>
                      <option value="Overnight">Overnight</option>
                      <option value="Multi-Day">Multi-Day</option>
                      <option value="Not Sure Yet">Not Sure Yet</option>
                    </select>
                  </div>
                </div>
                <div className="cp-form-group">
                  <label className="cp-form-label">Tell us what you are working on *</label>
                  <textarea className="cp-textarea" placeholder="Tell us what you are working on. Goals, challenges, team context, and any ideas you already have. We will take it from there." value={contact.message} onChange={e => setContact(c => ({ ...c, message: e.target.value }))}/>
                </div>
                <label className="cp-checkbox-row">
                  <input type="checkbox" className="cp-checkbox" checked={contact.stayInLoop} onChange={e => setContact(c => ({ ...c, stayInLoop: e.target.checked }))}/>
                  <span className="cp-checkbox-label">Stay in the Loop</span>
                </label>
                {ctErr && <p className="cp-form-err">{ctErr}</p>}
                <button className="cp-btn cp-btn-gold" style={{ width: "100%", textAlign: "center", marginTop: "8px" }} onClick={submitContact} disabled={ctStatus === "loading"}>
                  {ctStatus === "loading" ? "Sending..." : "Request a Proposal"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cp-footer">
        <div className="cp-footer-top">
          <div>
            <div className="cp-footer-wm">ROAMSIX</div>
            <p className="cp-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
            <div className="cp-footer-social">
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="cp-footer-col"><h4>Company</h4><ul>
            <li><a href="/#founders">About</a></li>
            <li><Link to="/approach">Approach</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="cp-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><Link to="/corporate">Corporate</Link></li>
            <li><a href="#contact">Inquire</a></li>
          </ul></div>
          <div className="cp-footer-col"><h4>Connect</h4><ul>
            <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
            <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
            <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul></div>
          <div className="cp-footer-col"><h4>Redirection Point</h4><ul>
            <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="/#podcast">About the Podcast</a></li>
          </ul></div>
        </div>
        <div className="cp-footer-bottom">
          <span className="cp-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
          <span className="cp-footer-copy">ROAMSIX, Murrieta, CA</span>
        </div>
      </footer>
    </div>
  );
}
