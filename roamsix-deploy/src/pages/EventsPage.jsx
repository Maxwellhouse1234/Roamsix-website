import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { events } from "../data/events";

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Why",         "/why"],
  ["Corporate",   "/corporate"],
  ["Join",        "/priority-access"],
];

const PAST_EVENT_IMAGE = "/images/events/long-table-dinner-roamsix.jpg";

const PAST_EVENT_DESCRIPTION = [
  "Twelve guests gathered on a private farmstead in Warner Springs for dinner, movement, sunset, and conversation.",
  "By the end of the evening, strangers were exchanging numbers and asking when the next one would be.",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&family=EB+Garamond:ital,wght@1,400&display=swap');

  .evl *, .evl *::before, .evl *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .evl {
    font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
    min-height: 100vh; font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
  }

  /* NAV */
  .evl-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
  .evl-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
  .evl-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .evl-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .evl-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .evl-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .evl-nav-links a:hover { color: var(--cream); }
  .evl-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .evl-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .evl-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .evl-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .evl-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .evl-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .evl-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .evl-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .evl-mobile-menu.open { opacity: 1; pointer-events: all; }
  .evl-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .evl-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .evl-mobile-menu a:hover { color: var(--gold); }
  .evl-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

  /* PAGE */
  .evl-page { padding: 140px 56px 100px; max-width: 1100px; margin: 0 auto; }
  .evl-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .evl-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .evl-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .evl-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(36px,4.4vw,56px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 64px; }

  /* GRID */
  .evl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
  .evl-grid-single { grid-template-columns: 1fr; max-width: 600px; }

  /* CARD */
  .evl-card { background: var(--panel); border: 1px solid rgba(232,223,208,0.07); padding: 40px 36px; display: flex; flex-direction: column; transition: border-color 0.25s; }
  .evl-card:hover { border-color: rgba(74,117,117,0.3); }

  .evl-card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .evl-badge { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 5px 12px; border: 1px solid; }
  .evl-badge-open { background: rgba(181,149,88,0.1); border-color: rgba(181,149,88,0.3); color: var(--gold); }
  .evl-badge-soldout { background: rgba(232,223,208,0.05); border-color: rgba(232,223,208,0.15); color: var(--cream-muted); }
  .evl-badge-coming-soon { background: rgba(74,117,117,0.08); border-color: rgba(74,117,117,0.25); color: var(--teal-light); }
  .evl-badge-past { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; padding: 5px 0; color: var(--cream-muted); }
  .evl-card-date { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }

  .evl-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; margin-bottom: 8px; }
  .evl-card-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 1px; color: var(--gold); text-transform: uppercase; margin-bottom: 10px; }
  .evl-card-location { font-size: 14px; color: var(--cream-muted); margin-bottom: 20px; }
  .evl-card-desc { font-size: 16px; line-height: 1.75; color: var(--cream-dim); flex: 1; margin-bottom: 36px; }

  /* PAST EVENTS */
  .evl-past-list { display: flex; flex-direction: column; gap: 24px; }

  /* PAST EVENT CARD (with image) */
  .evl-card-past { padding: 0; }
  .evl-card-past-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: stretch; }
  .evl-card-past-body { padding: 40px 36px; display: flex; flex-direction: column; }
  .evl-card-desc-wrap { flex: 1; margin-bottom: 36px; }
  .evl-card-desc-wrap p { font-size: 16px; line-height: 1.75; color: var(--cream-dim); margin-bottom: 14px; }
  .evl-card-desc-wrap p:last-child { margin-bottom: 0; }
  .evl-card-past-img { width: 100%; height: 100%; min-height: 320px; object-fit: cover; display: block; }

  .evl-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: auto; border-top: 1px solid rgba(232,223,208,0.08); padding-top: 24px; }
  .evl-price { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 600; color: var(--gold); letter-spacing: 1px; }
  .evl-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; padding: 13px 28px; background: var(--teal); color: var(--cream); text-decoration: none; transition: background 0.22s; }
  .evl-btn:hover { background: var(--teal-dim); }
  .evl-sold-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }

  /* WHAT'S NEXT */
  .evl-whats-next-body { font-size: 18px; line-height: 1.8; color: var(--cream-dim); max-width: 520px; margin: 0 0 32px; }
  .evl-whats-next-body:last-of-type { margin-bottom: 36px; }
  .evl-btn-gold { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; background: var(--gold); color: var(--navy); text-decoration: none; transition: all 0.22s; border: none; cursor: pointer; }
  .evl-btn-gold:hover { background: var(--cream); color: var(--navy); }

  /* SECTION DIVIDER */
  .evl-section-head { margin-top: 0; margin-bottom: 28px; }
  .evl-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(28px,3.2vw,40px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; }
  .evl-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 56px 0 40px; }

  /* FOOTER */
  .evl-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 40px 56px; }
  .evl-footer-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .evl-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .evl-footer-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .evl-footer-link:hover { color: var(--cream); }
  .evl-footer-legal { display: flex; flex-wrap: wrap; gap: 20px; border-top: 1px solid rgba(232,223,208,0.07); padding-top: 20px; }
  .evl-footer-legal a { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: rgba(232,223,208,0.4); text-decoration: none; transition: color 0.2s; }
  .evl-footer-legal a:hover { color: var(--cream-muted); }

  @media (max-width: 900px) {
    .evl-nav-links { display: none; }
    .evl-burger { display: flex; }
    .evl-nav { padding: 0 24px; }
    .evl-page { padding: 120px 24px 72px; }
    .evl-grid { grid-template-columns: 1fr; }
    .evl-card-past-grid { grid-template-columns: 1fr; }
    .evl-card-past-img { min-height: 240px; }
    .evl-footer { padding: 32px 24px; }
    .evl-footer-top { flex-direction: column; gap: 16px; text-align: center; }
  }
`;

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function priceFrom(event) {
  const min = Math.min(...event.packages.map((p) => p.price));
  return "$" + (min / 100).toFixed(0);
}

function StatusBadge({ status }) {
  return (
    <span className={`evl-badge evl-badge-${status}`}>
      {status === "open" ? "Registration Open" : status === "soldout" ? "Sold Out" : "Coming Soon"}
    </span>
  );
}

function EventCard({ event }) {
  const isPast = new Date(event.date) <= new Date();

  if (isPast) {
    return (
      <div className="evl-card evl-card-past">
        <div className="evl-card-past-grid">
          <div className="evl-card-past-body">
            <div className="evl-card-meta">
              <span className="evl-badge-past">Past Experience</span>
              <span className="evl-card-date">{formatDateShort(event.date)}</span>
            </div>
            <div className="evl-card-title">{event.title}</div>
            {event.subtitle && <div className="evl-card-subtitle">{event.subtitle}</div>}
            <div className="evl-card-location">{event.location}</div>
            <div className="evl-card-desc-wrap">
              {PAST_EVENT_DESCRIPTION.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="evl-card-footer">
              <Link to="/priority-access" className="evl-btn-gold">Join Priority Access</Link>
            </div>
          </div>
          <img
            className="evl-card-past-img"
            src={PAST_EVENT_IMAGE}
            alt="Guests seated together at the long table during the first ROAMSIX dinner"
            loading="lazy"
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="evl-card">
      <div className="evl-card-meta">
        <StatusBadge status={event.status} />
        <span className="evl-card-date">{formatDateShort(event.date)}</span>
      </div>
      <div className="evl-card-title">{event.title}</div>
      {event.subtitle && <div className="evl-card-subtitle">{event.subtitle}</div>}
      <div className="evl-card-location">{event.location}</div>
      <p className="evl-card-desc">{event.description}</p>
      <div className="evl-card-footer">
        <span className="evl-price">From {priceFrom(event)}</span>
        {event.status !== "soldout" ? (
          <Link to={`/events/${event.id}`} className="evl-btn">View Experience</Link>
        ) : (
          <span className="evl-sold-label">Sold Out</span>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    document.body.classList.toggle("evl-no-scroll", menuOpen);
    return () => document.body.classList.remove("evl-no-scroll");
  }, [menuOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) > now);
  const past = events.filter((e) => new Date(e.date) <= now);

  return (
    <div className="evl">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`evl-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => {
          if (l === "Join") return <Link key={l} to={h} className="evl-mobile-join" onClick={close}>{l}</Link>;
          return (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
        })}
      </div>

      {/* NAV */}
      <nav className={`evl-nav ${scrolled ? "solid" : ""}`}>
        <Link className="evl-nav-brand" to="/"><span className="evl-wordmark">ROAMSIX</span></Link>
        <ul className="evl-nav-links">
          {NAV.map(([l, h]) => (
            <li key={l}>
              {l === "Join"
                ? <Link to={h} className="evl-nav-join">{l}</Link>
                : (h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
              }
            </li>
          ))}
        </ul>
        <button className={`evl-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      <div className="evl-page">
        <div className="evl-label-row">
          <span className="evl-rule" />
          <span className="evl-label">Experiences and Events</span>
        </div>
        <h1 className="evl-h1">Upcoming Experiences.</h1>

        {upcoming.length === 0 ? (
          <div>
            <p className="evl-whats-next-body">No dates have been announced.</p>
            <p className="evl-whats-next-body">Priority Access members receive invitations before experiences are shared publicly.</p>
            <Link to="/priority-access" className="evl-btn-gold">Join Priority Access</Link>
          </div>
        ) : (
          <div className={`evl-grid${upcoming.length === 1 ? " evl-grid-single" : ""}`}>
            {upcoming.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}

        {past.length > 0 && (
          <>
            <hr className="evl-hr" />
            <div className="evl-section-head">
              <h2 className="evl-h2">Past Experiences</h2>
            </div>
            <div className="evl-past-list">
              {past.map((ev) => <EventCard key={ev.id} event={ev} />)}
            </div>
          </>
        )}
      </div>

      <footer className="evl-footer">
        <div className="evl-footer-top">
          <span className="evl-footer-brand">ROAMSIX</span>
          <Link className="evl-footer-link" to="/">Back to Home</Link>
        </div>
        <div className="evl-footer-legal">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/waiver">Assumption of Risk</Link>
          <Link to="/media-release">Media Release</Link>
          <Link to="/terms">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
