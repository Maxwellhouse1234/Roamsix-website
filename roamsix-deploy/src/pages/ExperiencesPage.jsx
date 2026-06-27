import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

/*
  ROAMSIX, ExperiencesPage.jsx
  Route: /experiences
  Design system matches HomePage.jsx
*/

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Why",         "/why"],
  ["Corporate",   "/corporate"],
  ["Join",        "/priority-access"],
];

const EXPERIENCE_CARDS = [
  {
    id:       "long-table",
    label:    "Long Table",
    headline: "Long Table",
    subhead:  "Some conversations change the direction of a year.",
    body: [
      "Long Table is our signature gathering.",
      "Thoughtfully prepared food. Carefully curated guests. Beautiful environments. Unhurried conversation.",
      "People arrive as strangers.",
      "They rarely leave that way.",
      "Whether around a farm table, beneath the trees, or overlooking the coast, every detail exists to make conversation feel natural.",
    ],
    perfectFor: [
      "Meeting thoughtful people",
      "Celebrating meaningful milestones",
      "Slowing down",
      "Expanding your circle",
      "Sharing exceptional food",
    ],
    cta:     "Join Priority Access",
    ctaLink: "/priority-access",
    bg:      "dark",
    imageAfter: {
      src: "/images/events/barrel-lounge-golden-hour-roamsix.jpg",
      alt: "A lounge area set beneath oak trees at golden hour",
    },
  },
  {
    id:       "first-light",
    label:    "First Light",
    headline: "First Light",
    subhead:  "The way a day begins changes what becomes possible.",
    body: [
      "First Light begins before the world gets loud.",
      "Movement.",
      "Recovery.",
      "Coffee.",
      "Conversation.",
      "An environment that invites clarity before demands begin competing for your attention.",
      "You leave carrying more than a workout.",
      "You leave seeing your day differently.",
    ],
    perfectFor: [
      "Creating better routines",
      "Meeting people who value health",
      "Reflection and recovery",
      "Starting with intention",
    ],
    cta:     "Join Priority Access",
    ctaLink: "/priority-access",
    bg:      "navy",
  },
  {
    id:       "long-game",
    label:    "Long Game",
    headline: "Long Game",
    subhead:  "Some decisions deserve more than another meeting.",
    body: [
      "Long Game is a full-day experience for people navigating growth, transition, or important decisions.",
      "Distance creates perspective.",
      "Movement changes conversations.",
      "Shared meals build trust.",
      "The agenda is intentionally light so the conversations can become meaningful.",
      "Many people arrive looking for answers.",
      "Most leave with better questions.",
    ],
    perfectFor: [
      "Major decisions",
      "Life transitions",
      "Teams that need perspective",
      "Couples",
      "People carrying meaningful responsibility",
    ],
    cta:     "Request Priority Access",
    ctaLink: "/priority-access",
    bg:      "dark",
  },
  {
    id:       "journeys",
    label:    "Journeys",
    headline: "Journeys",
    subhead:  "Some places change the way you see your life.",
    body: [
      "Throughout history, people have traveled in search of perspective.",
      "Not to escape life.",
      "To return to it differently.",
      "Our journeys combine culture, nature, movement, exceptional hospitality, and conversation into experiences designed to leave a lasting imprint.",
      "The destination matters.",
      "So does the person you become while you are there.",
    ],
    perfectFor: [
      "Exploration",
      "Adventure",
      "Cultural immersion",
      "Renewal",
      "Shared experiences",
    ],
    cta:     "Request Priority Access",
    ctaLink: "/priority-access",
    bg:      "navy",
    imageAfter: {
      src: "/images/events/warner-springs-golden-hour-roamsix.jpg",
      alt: "Golden hour landscape near Warner Springs",
    },
  },
  {
    id:       "corporate-experiences",
    label:    "Corporate Experiences",
    headline: "Corporate Experiences",
    subhead:  "Better teams begin with better environments.",
    body: [
      "People communicate differently when they step outside the roles they occupy every day.",
      "Conversations become more honest.",
      "Strengths become more visible.",
      "Perspective becomes easier to find.",
      "Every corporate experience is designed specifically for the people in the room and the outcome they are trying to create.",
      "No two teams receive the same experience.",
      "Because no two teams need the same thing.",
    ],
    perfectFor: [
      "Leadership teams",
      "Team resets",
      "Culture and alignment",
      "High-stakes transitions",
      "Groups that need a different kind of conversation",
    ],
    cta:     "Learn More",
    ctaLink: "/corporate",
    bg:      "dark",
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
  .xp-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .xp-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

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
  .xp-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

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
  .xp-hero-question { font-family: 'EB Garamond', serif; font-style: italic; font-size: clamp(20px, 2.2vw, 26px); line-height: 1.6; color: var(--cream-muted); max-width: 640px; margin-bottom: 32px; }
  .xp-hero-body { max-width: 600px; margin-bottom: 32px; }
  .xp-hero-body p { font-size: 19px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 10px; }
  .xp-hero-body p:last-child { margin-bottom: 0; }
  .xp-hero-supporting { font-size: 18px; line-height: 1.85; color: var(--cream-dim); max-width: 680px; margin-bottom: 28px; }
  .xp-hero-invite { font-family: 'EB Garamond', serif; font-style: italic; font-size: 19px; line-height: 1.7; color: var(--gold); max-width: 600px; }

  /* EXPERIENCE CARD SECTIONS */
  .xp-section { padding: 72px 56px; }
  .xp-section-dark { background: var(--panel); }
  .xp-section-navy { background: var(--navy); }
  .xp-card { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .xp-card-headline { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px, 4vw, 54px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 16px; }
  .xp-card-subhead { font-family: 'EB Garamond', serif; font-style: italic; font-size: 19px; line-height: 1.6; color: var(--cream-muted); margin-bottom: 24px; max-width: 520px; }
  .xp-card-body p { font-size: 17px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 14px; max-width: 540px; }
  .xp-card-body p:last-child { margin-bottom: 0; }
  .xp-perfect-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; }
  .xp-perfect-list { list-style: none; margin-bottom: 36px; }
  .xp-perfect-list li { font-size: 16px; color: var(--cream-muted); padding: 9px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; align-items: baseline; gap: 10px; }
  .xp-perfect-list li::before { content: '\\2013'; color: var(--gold-dim); font-size: 12px; flex-shrink: 0; }

  /* IMAGE BREAK */
  .xp-image-break { width: 100%; aspect-ratio: 21/9; object-fit: cover; display: block; }
  @media (max-width: 600px) { .xp-image-break { aspect-ratio: 4/3; } }

  /* PRIORITY ACCESS SECTION */
  .xp-priority { padding: 96px 56px; background: var(--panel); text-align: center; }
  .xp-priority-inner { max-width: 640px; margin: 0 auto; }
  .xp-priority-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: 1px; line-height: 1.1; color: var(--cream); text-transform: uppercase; font-size: clamp(30px, 3.6vw, 48px); margin-top: 16px; margin-bottom: 28px; }
  .xp-priority-body p { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
  .xp-priority-body p:last-child { margin-bottom: 40px; }

  /* CLOSING */
  .xp-closing { padding: 96px 56px; text-align: center; background: var(--navy); }
  .xp-closing-quote { font-family: 'EB Garamond', serif; font-style: italic; font-size: clamp(22px, 2.8vw, 36px); line-height: 1.55; color: var(--cream); max-width: 720px; margin: 0 auto 28px; }
  .xp-closing-attr { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }

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
    .xp-card { grid-template-columns: 1fr; gap: 36px; }
    .xp-priority { padding: 64px 24px; }
    .xp-closing { padding: 64px 24px; }
    .xp-footer { padding: 56px 24px 36px; }
    .xp-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .xp-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
  }
  @media (max-width: 480px) {
    .xp-footer-top { grid-template-columns: 1fr; }
  }
`;

export default function ExperiencesPage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  return (
    <div className="xp">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`xp-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => {
          if (l === "Join") return <Link key={l} to={h} className="xp-mobile-join" onClick={close}>{l}</Link>;
          return (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
        })}
      </div>

      {/* NAV */}
      <nav className={`xp-nav ${scrolled ? "solid" : ""}`}>
        <Link className="xp-nav-brand" to="/"><span className="xp-wordmark">ROAMSIX</span></Link>
        <ul className="xp-nav-links">
          {NAV.map(([l, h]) => (
            <li key={l}>
              {l === "Join"
                ? <Link to={h} className="xp-nav-join">{l}</Link>
                : (h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
              }
            </li>
          ))}
        </ul>
        <button className={`xp-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* HERO */}
      <section className="xp-hero">
        <div className="xp-hero-eyebrow">Experiences</div>
        <h1 className="xp-hero-h1">Every experience begins with the same question.</h1>
        <p className="xp-hero-question">What has become harder than it needs to be?</p>
        <div className="xp-hero-body">
          <p>Sometimes it is making time to think.</p>
          <p>Sometimes it is reconnecting with a partner, a team, or yourself.</p>
          <p>Sometimes it is remembering what originally made your work meaningful.</p>
          <p>The experience changes.</p>
          <p>The intention does not.</p>
        </div>
        <p className="xp-hero-supporting">Every ROAMSIX experience is designed around people, place, and purpose. We create the conditions for better conversations, fresh perspective, and genuine connection by carefully choosing the environment, the people, the pace, and every detail in between.</p>
        <p className="xp-hero-invite">Choose the experience that feels most like where you are today.</p>
      </section>

      <hr className="xp-hr"/>

      {/* EXPERIENCE CARDS */}
      {EXPERIENCE_CARDS.map((c) => (
        <div key={c.id}>
          <section
            className={`xp-section ${c.bg === "navy" ? "xp-section-navy" : "xp-section-dark"}`}
            id={c.id}
          >
            <div className="xp-label-row">
              <span className="xp-rule"/>
              <span className="xp-label">{c.label}</span>
            </div>
            <div className="xp-card">
              <div>
                <h2 className="xp-card-headline">{c.headline}</h2>
                <p className="xp-card-subhead">{c.subhead}</p>
                <div className="xp-card-body">
                  {c.body.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
              <div>
                <div className="xp-perfect-label">Perfect For</div>
                <ul className="xp-perfect-list">
                  {c.perfectFor.map(item => <li key={item}>{item}</li>)}
                </ul>
                <Link to={c.ctaLink} className="xp-btn xp-btn-gold">{c.cta}</Link>
              </div>
            </div>
          </section>
          {c.imageAfter && (
            <img className="xp-image-break" src={c.imageAfter.src} alt={c.imageAfter.alt} loading="lazy"/>
          )}
        </div>
      ))}

      <hr className="xp-hr"/>

      {/* PRIORITY ACCESS */}
      <section className="xp-priority" id="priority-access">
        <div className="xp-priority-inner">
          <div className="xp-label-row" style={{ justifyContent: "center" }}><span className="xp-rule"/><span className="xp-label">Priority Access</span><span className="xp-rule"/></div>
          <h2 className="xp-priority-h2">The next experience begins long before the invitation.</h2>
          <div className="xp-priority-body">
            <p>Every ROAMSIX gathering opens to the Priority Access community before it is announced publicly.</p>
            <p>Members receive early invitations, limited opportunities, and updates as new experiences are released.</p>
            <p>If these feel like your kind of people, start here.</p>
          </div>
          <Link to="/priority-access" className="xp-btn xp-btn-gold" style={{ width: "100%", textAlign: "center", display: "block" }}>Join Priority Access</Link>
        </div>
      </section>

      {/* CLOSING */}
      <section className="xp-closing">
        <p className="xp-closing-quote">
          "Your world is wider. Stay curious. Stay awake."
        </p>
        <div className="xp-closing-attr">— ROAMSIX</div>
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
            <li><Link to="/why">Why We Built ROAMSIX</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="xp-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><Link to="/priority-access">Priority Access</Link></li>
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
