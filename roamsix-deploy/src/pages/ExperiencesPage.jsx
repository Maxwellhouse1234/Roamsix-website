import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

/*
  ROAMSIX — ExperiencesPage.jsx
  Route: /experiences
  Design system matches HomePage.jsx
  Form endpoint: POST /api/contact (do not modify)
*/

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Corporate",   "/corporate"],
  ["Team",        "/team"],
  ["Podcast",     "/#podcast"],
];

const OFFERINGS = [
  {
    label:       "Gatherings",
    title:       "Gatherings",
    description: "Curated evenings and hosted experiences designed around food, conversation, movement, and meaningful connection.",
    price:       "Starting at $95 / person",
    includes: [
      "Chef-prepared meals and refreshments",
      "Curated guest experience",
      "Fireside or guided conversation",
      "Movement or outdoor elements",
      "Thoughtfully designed atmosphere and hospitality",
    ],
    inspiration: "Some of the most meaningful conversations happen around a table, outside the pace of everyday life. ROAMSIX gatherings are designed to bring thoughtful people together through food, atmosphere, and shared experience in environments that make real connection easier.",
    cta:     "Register Now",
    ctaLink: "/events",
    bg:      "dark",
  },
  {
    label:       "Leadership Immersions",
    title:       "Leadership Immersions",
    description: "Immersive experiences for leadership teams looking to reconnect, reset perspective, and strengthen alignment outside the normal pace of work.",
    price:       "Starting at $150 / person",
    includes: [
      "Guided team experiences",
      "Structured conversations and reflection",
      "Recovery and movement sessions",
      "Shared meals and hospitality",
      "Curated pacing and facilitation",
    ],
    inspiration: "For centuries, leaders, thinkers, and builders have stepped away from their usual environment to gain perspective and think more clearly. ROAMSIX immersions are built around the idea that physical distance from routine changes how people communicate, reflect, and move forward together.",
    cta:     "Inquire to Book",
    ctaLink: "#contact",
    bg:      "navy",
  },
  {
    label:       "Private Experiences",
    title:       "Private Experiences",
    description: "Personalized experiences for individuals, couples, families, or small groups navigating transition, burnout, growth, or a season of change.",
    price:       "Starting at $250 / person",
    includes: [
      "Customized experience design",
      "Nature, movement, and recovery elements",
      "Private dining or hospitality experiences",
      "Guided conversation and reflection",
      "Optional overnight or multi-day format",
    ],
    inspiration: "Many high-performers spend years carrying responsibility without creating space to reset themselves. These experiences are designed to remove friction, reduce noise, and create the conditions for clarity, recovery, and renewed energy.",
    cta:     "Inquire to Book",
    ctaLink: "#contact",
    bg:      "dark",
  },
  {
    label:       "Journeys and Expeditions",
    title:       "Journeys and Expeditions",
    description: "Perspective-changing travel experiences designed around culture, challenge, immersion, and meaningful redirection.",
    price:       "Starting at $1,500 / person",
    includes: [
      "Curated travel and accommodations",
      "Cultural and outdoor experiences",
      "Hosted group conversations",
      "Movement and exploration",
      "Intentional pacing for reflection and connection",
    ],
    inspiration: "Some environments change the way people see their lives. Throughout history, founders, artists, athletes, and explorers have traveled in search of perspective, inspiration, and a deeper connection to the world around them. ROAMSIX journeys are designed around that same idea.",
    cta:     "Inquire to Book",
    ctaLink: "#contact",
    bg:      "navy",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .xp *, .xp *::before, .xp *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .xp {
    font-family: 'Barlow', sans-serif; font-weight: 400;
    background: #141C2A; color: #E8DFD0; overflow-x: hidden;
    font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
    --rp-dark: #0E0B06; --rp-gold: #C9A84C; --rp-gold-dim: #8A7438; --rp-cream: #D0BF9A;
  }
  body.xp-no-scroll { overflow: hidden; }

  /* NAV */
  .xp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
  .xp-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
  .xp-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .xp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .xp-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .xp-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .xp-nav-links a:hover { color: var(--cream); }
  .xp-nav-cta { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .xp-nav-cta:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .xp-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .xp-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .xp-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .xp-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .xp-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .xp-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .xp-mobile-menu.open { opacity: 1; pointer-events: all; }
  .xp-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .xp-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .xp-mobile-menu a:hover { color: var(--gold); }
  .xp-mobile-cta { background: transparent; color: var(--gold); margin-top: 32px; border: 1px solid var(--gold); font-size: 20px; }

  /* CHROME */
  .xp-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .xp-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .xp-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .xp-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

  /* BUTTONS */
  .xp-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; }
  .xp-btn:active { transform: scale(0.97); }
  .xp-btn-gold { background: var(--gold); color: var(--navy); }
  .xp-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .xp-btn-outline { background: transparent; color: var(--cream); border: 1px solid rgba(232,223,208,0.35); }
  .xp-btn-outline:hover { border-color: var(--cream-dim); }

  /* HERO */
  .xp-hero { background: var(--navy); padding: 80px 56px 60px; }
  .xp-hero-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
  .xp-hero-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .xp-hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(38px, 5vw, 68px); line-height: 1.05; color: var(--cream); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 28px; max-width: 860px; }
  .xp-hero-sub { font-size: 19px; line-height: 1.8; color: var(--cream-dim); max-width: 600px; }

  /* OFFERING SECTIONS */
  .xp-section { padding: 72px 56px; }
  .xp-section-dark { background: var(--panel); }
  .xp-section-navy { background: var(--navy); }
  .xp-offering { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .xp-offering-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 20px; }
  .xp-offering-desc { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
  .xp-offering-price { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 36px; }
  .xp-includes-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; }
  .xp-includes-list { list-style: none; margin-bottom: 40px; }
  .xp-includes-list li { font-size: 16px; color: var(--cream-muted); padding: 9px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; align-items: baseline; gap: 10px; }
  .xp-includes-list li::before { content: '\\2013'; color: var(--gold-dim); font-size: 12px; flex-shrink: 0; }
  .xp-inspiration { font-family: 'EB Garamond', serif; font-style: italic; font-size: 18px; line-height: 1.8; color: var(--cream-muted); padding-top: 20px; border-top: 1px solid rgba(232,223,208,0.08); margin-bottom: 20px; max-width: 720px; margin-left: auto; margin-right: auto; }

  /* CONTACT SECTION */
  .xp-contact { padding: 72px 56px; background: var(--panel); }
  .xp-contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start; }
  .xp-contact-intro-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: 1px; line-height: 1.05; color: var(--cream); text-transform: uppercase; font-size: clamp(34px, 4.4vw, 56px); margin-top: 16px; margin-bottom: 24px; }
  .xp-contact-body { font-size: 18px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 32px; }
  .xp-contact-links a { display: block; color: var(--teal-light); text-decoration: none; font-size: 16px; margin-bottom: 12px; transition: color 0.2s; }
  .xp-contact-links a:hover { color: var(--cream); }
  .xp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .xp-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .xp-form-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }
  .xp-input, .xp-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; }
  .xp-input:focus, .xp-textarea:focus { border-color: var(--teal); }
  .xp-input::placeholder, .xp-textarea::placeholder { color: rgba(232,223,208,0.3); }
  .xp-textarea { resize: vertical; min-height: 140px; }
  .xp-form-err { color: #E07070; font-size: 14px; margin-top: 8px; }
  .xp-form-success { background: rgba(74,117,117,0.12); border: 1px solid rgba(74,117,117,0.3); padding: 20px 24px; }
  .xp-form-success p { color: var(--cream-dim); font-size: 16px; line-height: 1.65; }

  /* FOOTER */
  .xp-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
  .xp-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  .xp-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .xp-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .xp-footer-social { display: flex; gap: 16px; }
  .xp-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
  .xp-footer-social a:hover { color: var(--cream); }
  .xp-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .xp-footer-col ul { list-style: none; }
  .xp-footer-col ul li { margin-bottom: 12px; }
  .xp-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .xp-footer-col ul a:hover { color: var(--cream); }
  .xp-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .xp-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .xp-nav-links { display: none; }
    .xp-burger { display: flex; }
    .xp-nav { padding: 0 24px; }
    .xp-hero { padding: 72px 24px 52px; }
    .xp-section { padding: 52px 24px; }
    .xp-offering { grid-template-columns: 1fr; gap: 48px; }
    .xp-contact { padding: 52px 24px; }
    .xp-contact-grid { grid-template-columns: 1fr; gap: 52px; }
    .xp-footer { padding: 56px 24px 36px; }
    .xp-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .xp-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    .xp-form-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .xp-footer-top { grid-template-columns: 1fr; }
  }
`;

export default function ExperiencesPage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [contact,   setContact]   = useState({ first: "", last: "", email: "", company: "", message: "" });
  const [ctStatus,  setCtStatus]  = useState("idle");
  const [ctErr,     setCtErr]     = useState("");

  useEffect(() => {
    document.body.classList.toggle("xp-no-scroll", menuOpen);
    return () => document.body.classList.remove("xp-no-scroll");
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
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: contact.first.trim(), lastName: contact.last.trim(), email: contact.email.trim(), company: contact.company.trim(), inquiryType: "", message: contact.message.trim(), source: "Experiences Page Contact Form" }),
      });
      if (res.ok) { setCtStatus("success"); }
      else { const d = await res.json().catch(() => ({})); setCtErr(d.error || "Submission failed. Please email info@roamsix.com directly."); setCtStatus("idle"); }
    } catch { setCtErr("Network error. Please email info@roamsix.com directly."); setCtStatus("idle"); }
  };

  return (
    <div className="xp">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`xp-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>)}
        <a href="#contact" className="xp-mobile-cta" onClick={close}>Inquire</a>
      </div>

      {/* NAV */}
      <nav className={`xp-nav ${scrolled ? "solid" : ""}`}>
        <Link className="xp-nav-brand" to="/"><span className="xp-wordmark">ROAMSIX</span></Link>
        <ul className="xp-nav-links">
          {NAV.map(([l, h]) => <li key={l}>{(h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>}</li>)}
          <li><a href="#contact" className="xp-nav-cta">Inquire</a></li>
        </ul>
        <button className={`xp-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* HERO */}
      <section className="xp-hero">
        <div className="xp-hero-eyebrow">What We Create</div>
        <h1 className="xp-hero-h1">Experiences designed around people, place, and purpose.</h1>
        <p className="xp-hero-sub">Every offering is fully planned and executed end-to-end. You focus on your people. We handle everything else.</p>
      </section>

      <hr className="xp-hr"/>

      {/* OFFERINGS */}
      {OFFERINGS.map((o, i) => (
        <section
          key={o.title}
          className={`xp-section ${o.bg === "navy" ? "xp-section-navy" : "xp-section-dark"}`}
          id={o.title.toLowerCase().replace(/\s+/g, "-")}
        >
          <div className="xp-label-row">
            <span className="xp-rule"/>
            <span className="xp-label">{o.label}</span>
          </div>
          <div className="xp-offering">
            <div>
              <h2 className="xp-offering-name">{o.title}</h2>
              <p className="xp-offering-desc">{o.description}</p>
              <div className="xp-offering-price">{o.price}</div>
              {o.ctaLink.startsWith('#') ? <a href={o.ctaLink} className={`xp-btn ${i === 0 ? "xp-btn-gold" : "xp-btn-outline"}`}>{o.cta}</a> : <Link to={o.ctaLink} className={`xp-btn ${i === 0 ? "xp-btn-gold" : "xp-btn-outline"}`}>{o.cta}</Link>}
            </div>
            <div>
              <div className="xp-includes-label">Includes</div>
              <ul className="xp-includes-list">
                {o.includes.map(item => <li key={item}>{item}</li>)}
              </ul>
              <p className="xp-inspiration">{o.inspiration}</p>
            </div>
          </div>
        </section>
      ))}

      <hr className="xp-hr"/>

      {/* CONTACT */}
      <section className="xp-contact" id="contact">
        <div className="xp-contact-grid">
          <div>
            <div className="xp-label-row"><span className="xp-rule"/><span className="xp-label">Start Here</span></div>
            <h2 className="xp-contact-intro-h2">Start with a conversation.</h2>
            <p className="xp-contact-body">Tell us what you're envisioning. Team size, timing, type of experience, any ideas you have in mind. We will take it from there.</p>
            <div className="xp-contact-links">
              <a href="mailto:info@roamsix.com">info@roamsix.com</a>
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div>
            {ctStatus === "success" ? (
              <div className="xp-form-success">
                <p>We received your message and will follow up directly within 48 hours.</p>
              </div>
            ) : (
              <>
                <div className="xp-form-row">
                  <div className="xp-form-group">
                    <label className="xp-form-label">First Name</label>
                    <input className="xp-input" placeholder="First" value={contact.first} onChange={e => setContact(c => ({ ...c, first: e.target.value }))}/>
                  </div>
                  <div className="xp-form-group">
                    <label className="xp-form-label">Last Name</label>
                    <input className="xp-input" placeholder="Last" value={contact.last} onChange={e => setContact(c => ({ ...c, last: e.target.value }))}/>
                  </div>
                </div>
                <div className="xp-form-group">
                  <label className="xp-form-label">Email *</label>
                  <input className="xp-input" placeholder="your@email.com" type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))}/>
                </div>
                <div className="xp-form-group">
                  <label className="xp-form-label">Company or Organization</label>
                  <input className="xp-input" placeholder="Optional" value={contact.company} onChange={e => setContact(c => ({ ...c, company: e.target.value }))}/>
                </div>
                <div className="xp-form-group">
                  <label className="xp-form-label">Tell us what's going on *</label>
                  <textarea className="xp-textarea" placeholder="Tell us what you're envisioning. Team size, timing, type of experience, any ideas you have in mind. We will take it from there." value={contact.message} onChange={e => setContact(c => ({ ...c, message: e.target.value }))}/>
                </div>
                {ctErr && <p className="xp-form-err">{ctErr}</p>}
                <button className="xp-btn xp-btn-gold" style={{ width: "100%", textAlign: "center", marginTop: "8px" }} onClick={submitContact} disabled={ctStatus === "loading"}>
                  {ctStatus === "loading" ? "Sending..." : "Start a Conversation"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="xp-footer">
        <div className="xp-footer-top">
          <div>
            <div className="xp-footer-wm">ROAMSIX</div>
            <p className="xp-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
            <div className="xp-footer-social">
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="xp-footer-col"><h4>Company</h4><ul>
            <li><a href="/#founders">About</a></li>
            <li><Link to="/approach">Approach</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="xp-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><a href="/#proving-grounds">Proving Grounds</a></li>
            <li><Link to="/priority-access">Priority Access</Link></li>
            <li><a href="#contact">Inquire</a></li>
          </ul></div>
          <div className="xp-footer-col"><h4>Connect</h4><ul>
            <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
            <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
            <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul></div>
          <div className="xp-footer-col"><h4>Redirection Point</h4><ul>
            <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="/#podcast">About the Podcast</a></li>
          </ul></div>
          <div className="xp-footer-col"><h4>Legal</h4><ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/waiver">Assumption of Risk</Link></li>
            <li><Link to="/media-release">Media Release</Link></li>
            <li><Link to="/terms">Refund Policy</Link></li>
          </ul></div>
        </div>
        <div className="xp-footer-bottom">
          <span className="xp-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
          <span className="xp-footer-copy">ROAMSIX, Murrieta, CA</span>
        </div>
      </footer>
    </div>
  );
}
