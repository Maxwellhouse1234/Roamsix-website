import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

/*
 ROAMSIX, HomePage.jsx v9
 Do not touch API routes, backend files, or other pages.
*/

const HERO_SRC      = "/images/sunset-valley.webp";
const HERO_FALLBACK = "/images/sunset-dramatic.webp";
const STRIP_1       = "/images/gathering-dusk.webp";
const STRIP_2       = "/images/land-light.webp";
const STRIP_3       = "/images/sunset-dramatic.webp";
const RP_COVER      = "/images/redirection-point-cover.webp";

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Podcast",     "#podcast"],
  ["Corporate",   "/corporate"],
  ["About",       "/team"],
  ["Join",        "/priority-access"],
];

const TESTIMONIALS = [
  { quote: "The intentionality of ROAMSIX is unmatched.", attr: "BettyLou" },
  { quote: "Such a great night. So glad we came out.", attr: "J. Soleymani" },
  { quote: "Gratitude and appreciation for the whole experience. Looking at posts after the event got me teary eyed.", attr: "Carissa O." },
  { quote: "Absolutely phenomenal evening. Put together beautifully and top tier hospitality.", attr: "Patrick K." },
  { quote: "ROAMSIX took the vision to the next level and beyond.", attr: "Birdsong Backcountry Retreat" },
];

const EXPERIENCES = [
  {
    name: "LONG TABLE",
    desc: "Some conversations change the direction of a year. Long Table is our signature gathering around exceptional food, carefully chosen people, and the kind of evening that continues long after the drive home.",
  },
  {
    name: "LONG GAME",
    desc: "Some decisions require distance. Long Game is a full-day experience for perspective, connection, and clarity away from the noise of everyday life.",
  },
  {
    name: "FIRST LIGHT",
    desc: "The way a day begins changes what becomes possible. First Light is a morning experience built around movement, recovery, and intentional conversation.",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .rs *, .rs *::before, .rs *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .rs {
    font-family: 'Barlow', sans-serif; font-weight: 400;
    background: #141C2A; color: #E8DFD0; overflow-x: hidden;
    font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
    --rp-black: #090705; --rp-dark: #0E0B06;
    --rp-gold: #C9A84C; --rp-gold-dim: #8A7438; --rp-cream: #D0BF9A;
  }
  body.rs-no-scroll { overflow: hidden; }

  /* NAV */
  .rs-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
  .rs-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
  .rs-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .rs-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .rs-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .rs-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .rs-nav-links a:hover { color: var(--cream); }
  .rs-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .rs-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .rs-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .rs-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .rs-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .rs-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .rs-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .rs-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .rs-mobile-menu.open { opacity: 1; pointer-events: all; }
  .rs-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .rs-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .rs-mobile-menu a:hover { color: var(--gold); }
  .rs-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

  /* BUTTONS */
  .rs-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; }
  .rs-btn:active { transform: scale(0.97); }
  .rs-btn-gold { background: var(--gold); color: var(--navy); }
  .rs-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .rs-btn-gold-outline { background: transparent; color: var(--gold); border: 1px solid var(--gold); }
  .rs-btn-gold-outline:hover { background: rgba(181,149,88,0.1); color: var(--gold); }
  .rs-btn-rp { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 26px; border: 1px solid rgba(201,168,76,0.35); color: var(--rp-gold); text-decoration: none; transition: all 0.2s; background: transparent; cursor: pointer; }
  .rs-btn-rp:hover { border-color: var(--rp-gold); }

  /* CHROME */
  .rs-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .rs-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .rs-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .rs-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: 1px; line-height: 1.05; color: var(--cream); text-transform: uppercase; font-size: clamp(34px, 4.4vw, 56px); margin-top: 16px; }
  .rs-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

  /* HERO */
  .rs-hero { min-height: 100vh; position: relative; display: flex; align-items: flex-end; overflow: hidden; }
  .rs-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 35%; }
  .rs-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(20,28,42,0.4) 0%, rgba(20,28,42,0.6) 45%, rgba(20,28,42,0.9) 85%, #141C2A 100%); }
  .rs-hero-content { position: relative; z-index: 2; padding: 0 56px 96px; max-width: 860px; width: 100%; animation: rsRise 1s cubic-bezier(0.16,1,0.3,1) forwards; }
  .rs-hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(42px,5.4vw,72px); line-height: 1.05; color: var(--cream); margin-bottom: 24px; text-transform: uppercase; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
  .rs-hero-sub { font-size: 16px; line-height: 1.7; color: var(--cream-muted); max-width: 520px; margin-bottom: 48px; text-shadow: 0 1px 6px rgba(0,0,0,0.7); letter-spacing: 1px; font-family: 'Barlow Condensed', sans-serif; font-weight: 400; text-transform: uppercase; }
  .rs-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

  /* SECTIONS */
  .rs-section { padding: 120px 56px; }
  .rs-section-dark { background: var(--panel); }
  .rs-section-mid { background: var(--navy-mid); }
  .rs-section-navy { background: var(--navy); }

  /* VISUAL PROOF STRIP */
  .rs-proof-strip { display: grid; grid-template-columns: 1fr 0.55fr 1fr; gap: 3px; background: #060A11; }
  .rs-strip-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; object-position: center; display: block; filter: brightness(0.85) contrast(1.05); transition: filter 0.4s; }
  .rs-strip-img:hover { filter: brightness(0.95); }
  .rs-strip-img-narrow { aspect-ratio: 4/5; object-position: center top; }

  /* WHAT HAPPENS HERE */
  .rs-what-lines { margin-top: 48px; display: flex; flex-direction: column; gap: 32px; }
  .rs-what-line { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(26px, 3.4vw, 44px); font-weight: 600; color: var(--cream); letter-spacing: 0.5px; line-height: 1.2; }

  /* TESTIMONIALS */
  .rs-testimonials-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 48px; }
  .rs-testimonial { background: var(--panel); padding: 36px; border: 1px solid rgba(232,223,208,0.07); }
  .rs-testimonial-quote { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 400; color: var(--cream); line-height: 1.5; margin-bottom: 20px; letter-spacing: 0.3px; }
  .rs-testimonial-attr { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
  .rs-testimonials-note { margin-top: 40px; font-family: 'EB Garamond', serif; font-style: italic; font-size: 18px; color: var(--cream-muted); line-height: 1.7; max-width: 640px; }

  /* EXPERIENCES */
  .rs-exp-cards { display: flex; flex-direction: column; gap: 2px; margin-top: 52px; }
  .rs-exp-card { background: var(--panel); padding: 48px 44px; border: 1px solid rgba(232,223,208,0.07); display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
  .rs-exp-name { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .rs-exp-desc { font-size: 17px; line-height: 1.8; color: var(--cream-dim); max-width: 640px; }

  /* FOR TEAMS */
  .rs-for-teams { max-width: 680px; }
  .rs-for-teams p { font-size: 18px; line-height: 1.8; color: var(--cream-muted); margin-bottom: 24px; }
  .rs-for-teams-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); text-decoration: none; border-bottom: 1px solid rgba(181,149,88,0.3); padding-bottom: 2px; transition: all 0.2s; }
  .rs-for-teams-link:hover { border-bottom-color: var(--gold); }

  /* PRIORITY ACCESS */
  .rs-priority-body { max-width: 560px; margin: 0 auto; text-align: center; }
  .rs-priority-body p { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
  .rs-priority-body p:last-of-type { margin-bottom: 40px; }

  /* CLOSING */
  .rs-closing { padding: 120px 56px; text-align: center; }
  .rs-closing-quote { font-family: 'EB Garamond', serif; font-style: italic; font-size: clamp(24px, 3vw, 40px); line-height: 1.55; color: var(--cream); max-width: 740px; margin: 0 auto 28px; }
  .rs-closing-attr { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }

  /* PODCAST */
  .rs-podcast { background: var(--rp-dark); border-top: 1px solid rgba(201,168,76,0.1); }
  .rs-podcast-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; padding: 120px 56px; }
  .rs-podcast-art { position: relative; background: var(--rp-black); aspect-ratio: 1; max-width: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px; border: 1px solid rgba(201,168,76,0.15); overflow: hidden; }
  .rs-podcast-frame { position: absolute; inset: 12px; border: 1px solid rgba(201,168,76,0.08); }
  .rs-podcast-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--rp-gold-dim); margin-bottom: 18px; }
  .rs-podcast-h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(38px,4.2vw,54px); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 18px; line-height: 1.05; }
  .rs-podcast-tagline { font-family: 'EB Garamond', serif; font-style: italic; font-size: 20px; color: var(--cream-muted); margin-bottom: 36px; line-height: 1.55; }
  .rs-platform { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 8px 16px; border: 1px solid rgba(232,223,208,0.25); color: var(--cream-muted); text-decoration: none; margin-right: 10px; margin-bottom: 10px; transition: all 0.2s; }
  .rs-platform:hover { border-color: var(--cream); color: var(--cream); }

  /* FOOTER */
  .rs-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
  .rs-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  .rs-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .rs-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .rs-footer-social { display: flex; gap: 16px; }
  .rs-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
  .rs-footer-social a:hover { color: var(--cream); }
  .rs-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .rs-footer-col ul { list-style: none; }
  .rs-footer-col ul li { margin-bottom: 12px; }
  .rs-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .rs-footer-col ul a:hover { color: var(--cream); }
  .rs-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .rs-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

  /* ANIMATIONS */
  @keyframes rsRise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .rs-nav-links { display: none; }
    .rs-burger { display: flex; }
    .rs-section { padding: 80px 24px; }
    .rs-hero-content { padding: 0 24px 72px; }
    .rs-proof-strip { grid-template-columns: 1fr 1fr; }
    .rs-strip-img-narrow { display: none; }
    .rs-testimonials-grid { grid-template-columns: 1fr; }
    .rs-exp-card { grid-template-columns: 1fr; gap: 28px; }
    .rs-podcast-inner { grid-template-columns: 1fr; gap: 48px; padding: 80px 24px; }
    .rs-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .rs-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    .rs-nav { padding: 0 24px; }
    .rs-footer { padding: 56px 24px 36px; }
    .rs-closing { padding: 80px 24px; }
  }
`;

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("rs-no-scroll", menuOpen);
    return () => document.body.classList.remove("rs-no-scroll");
  }, [menuOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <div className="rs">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`rs-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => {
          if (l === "Join") return <Link key={l} to={h} className="rs-mobile-join" onClick={close}>{l}</Link>;
          return h.startsWith('#') ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
        })}
      </div>

      {/* NAV */}
      <nav className={`rs-nav ${scrolled ? "solid" : ""}`}>
        <Link className="rs-nav-brand" to="/"><span className="rs-wordmark">ROAMSIX</span></Link>
        <ul className="rs-nav-links">
          {NAV.map(([l, h]) => (
            <li key={l}>
              {l === "Join"
                ? <Link to={h} className="rs-nav-join">{l}</Link>
                : h.startsWith('#') ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
              }
            </li>
          ))}
        </ul>
        <button className={`rs-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="rs-hero">
        <img className="rs-hero-img" src={HERO_SRC} alt="" role="presentation" onError={e => { e.target.onerror = null; e.target.src = HERO_FALLBACK; }}/>
        <div className="rs-hero-overlay"/>
        <div className="rs-hero-content">
          <h1 className="rs-hero-h1">The right people change what's possible.</h1>
          <p className="rs-hero-sub">ROAMSIX gathers people who care deeply about how they live, what they build, and who they become.</p>
          <div className="rs-hero-actions">
            <Link to="/priority-access" className="rs-btn rs-btn-gold">Request Priority Access</Link>
            <Link to="/experiences" className="rs-btn rs-btn-gold-outline">Explore Experiences</Link>
          </div>
        </div>
      </section>

      {/* ── 2. IMAGES ── */}
      <div className="rs-proof-strip">
        <img src={STRIP_1} alt="" aria-hidden="true" loading="lazy" className="rs-strip-img" onError={e => { e.target.style.display = "none"; }}/>
        <img src={STRIP_2} alt="" aria-hidden="true" loading="lazy" className="rs-strip-img rs-strip-img-narrow" onError={e => { e.target.style.display = "none"; }}/>
        <img src={STRIP_3} alt="" aria-hidden="true" loading="lazy" className="rs-strip-img" onError={e => { e.target.style.display = "none"; }}/>
      </div>

      {/* ── 3. WHAT HAPPENS HERE ── */}
      <section className="rs-section rs-section-dark" id="what-happens-here">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">What Happens Here</span></div>
        <div className="rs-what-lines">
          <p className="rs-what-line">Conversations that don't usually happen.</p>
          <p className="rs-what-line">People you wouldn't normally meet.</p>
          <p className="rs-what-line">Perspectives that change how you see your own life.</p>
          <p className="rs-what-line">Experiences that stay with you long after the drive home.</p>
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* ── 4. TESTIMONIALS ── */}
      <section className="rs-section rs-section-navy" id="testimonials">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">What People Said</span></div>
        <div className="rs-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="rs-testimonial" key={i}>
              <p className="rs-testimonial-quote">"{t.quote}"</p>
              <div className="rs-testimonial-attr">— {t.attr}</div>
            </div>
          ))}
        </div>
        <p className="rs-testimonials-note">
          "By the end of the first dinner, strangers were exchanging numbers and asking when the next one would be."
        </p>
      </section>

      <hr className="rs-hr"/>

      {/* ── 5. EXPERIENCES ── */}
      <section className="rs-section rs-section-dark" id="experiences">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">The Experiences</span></div>
        <div className="rs-exp-cards">
          {EXPERIENCES.map((exp) => (
            <div className="rs-exp-card" key={exp.name}>
              <div>
                <div className="rs-exp-name">{exp.name}</div>
                <p className="rs-exp-desc">{exp.desc}</p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link to="/priority-access" className="rs-btn rs-btn-gold-outline">Request Priority Access</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* ── 6. PODCAST ── */}
      <section className="rs-podcast" id="podcast">
        <div className="rs-podcast-inner">
          <div className="rs-podcast-art">
            <img src={RP_COVER} alt="Redirection Point" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", position: "absolute", inset: 0 }} onError={e => { e.target.style.display = 'none'; }}/>
          </div>
          <div>
            <div className="rs-podcast-label">The Podcast</div>
            <h2 className="rs-podcast-h2">Redirection Point.</h2>
            <p className="rs-podcast-tagline">Conversations with people who decided how they live matters.</p>
            <div>
              {[["YouTube","https://www.youtube.com/@RedirectionPoint"],["Instagram","https://www.instagram.com/redirectionpoint"],["Spotify","#"],["Apple Podcasts","#"]].map(([p, url]) => (
                <a href={url} className="rs-platform" key={p} target="_blank" rel="noopener noreferrer">{p}</a>
              ))}
            </div>
            <div style={{ marginTop: "28px" }}>
              <a href="https://www.youtube.com/@RedirectionPoint" className="rs-btn-rp" target="_blank" rel="noopener noreferrer">Watch or Listen</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOR TEAMS ── */}
      <section className="rs-section rs-section-dark" id="corporate">
        <div className="rs-for-teams">
          <p>ROAMSIX also designs private experiences for leadership teams and organizations. A different kind of day than your team is used to.</p>
          <Link to="/corporate" className="rs-for-teams-link">Learn more about corporate experiences</Link>
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* ── 8. PRIORITY ACCESS ── */}
      <section className="rs-section rs-section-navy" id="priority-access" style={{ textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="rs-label-row" style={{ justifyContent: "center" }}><span className="rs-rule"/><span className="rs-label">Priority Access</span><span className="rs-rule"/></div>
          <h2 className="rs-h2">Request Priority Access</h2>
          <div style={{ marginTop: "32px", marginBottom: "40px" }}>
            <p style={{ fontSize: "18px", lineHeight: "1.85", color: "var(--cream-dim)", marginBottom: "20px" }}>
              ROAMSIX experiences open to the priority list before anything is shared publicly.
            </p>
            <p style={{ fontSize: "18px", lineHeight: "1.85", color: "var(--cream-dim)", marginBottom: "20px" }}>
              Add your name to be considered for upcoming gatherings, podcast releases, and future invitations.
            </p>
            <p style={{ fontSize: "18px", lineHeight: "1.85", color: "var(--cream-dim)" }}>
              If this feels like your kind of people, start here.
            </p>
          </div>
          <Link to="/priority-access" className="rs-btn rs-btn-gold" style={{ width: "100%", textAlign: "center", display: "block" }}>Request Priority Access</Link>
        </div>
      </section>

      {/* ── 9. CLOSING ── */}
      <section className="rs-closing">
        <p className="rs-closing-quote">
          "The world is still wide. Stay curious. Stay awake. There is more of your story left to write."
        </p>
        <div className="rs-closing-attr">— ROAMSIX</div>
      </section>

      {/* FOOTER */}
      <footer className="rs-footer">
        <div className="rs-footer-top">
          <div>
            <div className="rs-footer-wm">ROAMSIX</div>
            <p className="rs-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
            <div className="rs-footer-social">
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="rs-footer-col"><h4>Company</h4><ul>
            <li><Link to="/team">About</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="rs-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><Link to="/priority-access">Priority Access</Link></li>
          </ul></div>
          <div className="rs-footer-col"><h4>Connect</h4><ul>
            <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
            <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
            <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul></div>
          <div className="rs-footer-col"><h4>Redirection Point</h4><ul>
            <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="/#podcast">About the Podcast</a></li>
          </ul></div>
          <div className="rs-footer-col"><h4>Legal</h4><ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/waiver">Assumption of Risk</Link></li>
            <li><Link to="/media-release">Media Release</Link></li>
            <li><Link to="/terms">Refund Policy</Link></li>
          </ul></div>
        </div>
        <div className="rs-footer-bottom">
          <span className="rs-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
          <span className="rs-footer-copy">ROAMSIX, Murrieta, CA</span>
        </div>
      </footer>
    </div>
  );
}
