import { useEffect } from "react";
import { Link } from "react-router-dom";
import { events } from "../data/events";

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
  .evl-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .evl-nav-brand { text-decoration: none; }
  .evl-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .evl-nav-back { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .evl-nav-back:hover { color: var(--cream); }

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
  .evl-card-past { opacity: 0.55; }

  .evl-card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .evl-badge { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 5px 12px; border: 1px solid; }
  .evl-badge-open { background: rgba(181,149,88,0.1); border-color: rgba(181,149,88,0.3); color: var(--gold); }
  .evl-badge-soldout { background: rgba(232,223,208,0.05); border-color: rgba(232,223,208,0.15); color: var(--cream-muted); }
  .evl-badge-coming-soon { background: rgba(74,117,117,0.08); border-color: rgba(74,117,117,0.25); color: var(--teal-light); }
  .evl-card-date { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }

  .evl-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; margin-bottom: 8px; }
  .evl-card-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 1px; color: var(--gold); text-transform: uppercase; margin-bottom: 10px; }
  .evl-card-location { font-size: 14px; color: var(--cream-muted); margin-bottom: 20px; }
  .evl-card-desc { font-size: 16px; line-height: 1.75; color: var(--cream-dim); flex: 1; margin-bottom: 36px; }

  .evl-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: auto; border-top: 1px solid rgba(232,223,208,0.08); padding-top: 24px; }
  .evl-price { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 600; color: var(--gold); letter-spacing: 1px; }
  .evl-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; padding: 13px 28px; background: var(--teal); color: var(--cream); text-decoration: none; transition: background 0.22s; }
  .evl-btn:hover { background: var(--teal-dim); }
  .evl-sold-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }

  /* EMPTY STATE */
  .evl-empty { padding: 80px 0; text-align: center; }
  .evl-empty p { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; letter-spacing: 1px; color: var(--cream-muted); text-transform: uppercase; }

  /* SECTION DIVIDER */
  .evl-section-head { margin-top: 80px; margin-bottom: 32px; }
  .evl-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 72px 0 0; }

  /* FOOTER */
  .evl-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 40px 56px; display: flex; align-items: center; justify-content: space-between; }
  .evl-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .evl-footer-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .evl-footer-link:hover { color: var(--cream); }

  @media (max-width: 900px) {
    .evl-nav { padding: 0 24px; }
    .evl-page { padding: 120px 24px 72px; }
    .evl-grid { grid-template-columns: 1fr; }
    .evl-footer { padding: 32px 24px; flex-direction: column; gap: 16px; text-align: center; }
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
  return (
    <div className={`evl-card${isPast ? " evl-card-past" : ""}`}>
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
        {!isPast && event.status !== "soldout" ? (
          <Link to={`/events/${event.id}`} className="evl-btn">View Experience</Link>
        ) : event.status === "soldout" ? (
          <span className="evl-sold-label">Sold Out</span>
        ) : null}
      </div>
    </div>
  );
}

export default function EventsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) > now);
  const past = events.filter((e) => new Date(e.date) <= now);

  return (
    <div className="evl">
      <style>{css}</style>

      <nav className="evl-nav">
        <a className="evl-nav-brand" href="/"><span className="evl-wordmark">ROAMSIX</span></a>
        <a className="evl-nav-back" href="/">← Home</a>
      </nav>

      <div className="evl-page">
        <div className="evl-label-row">
          <span className="evl-rule" />
          <span className="evl-label">Experiences and Events</span>
        </div>
        <h1 className="evl-h1">Upcoming Experiences.</h1>

        {upcoming.length === 0 ? (
          <div className="evl-empty"><p>More experiences coming soon.</p></div>
        ) : (
          <div className={`evl-grid${upcoming.length === 1 ? " evl-grid-single" : ""}`}>
            {upcoming.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}

        {past.length > 0 && (
          <>
            <hr className="evl-hr" />
            <div className="evl-section-head">
              <div className="evl-label-row">
                <span className="evl-rule" />
                <span className="evl-label">Past Experiences</span>
              </div>
            </div>
            <div className={`evl-grid${past.length === 1 ? " evl-grid-single" : ""}`}>
              {past.map((ev) => <EventCard key={ev.id} event={ev} />)}
            </div>
          </>
        )}
      </div>

      <footer className="evl-footer">
        <span className="evl-footer-brand">ROAMSIX</span>
        <a className="evl-footer-link" href="/">← Back to Home</a>
      </footer>
    </div>
  );
}
