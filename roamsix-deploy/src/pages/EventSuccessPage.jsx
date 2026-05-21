import { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getEventById } from "../data/events";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&family=EB+Garamond:ital,wght@1,400&display=swap');

  .es *, .es *::before, .es *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .es {
    font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
    min-height: 100vh; font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
    --teal: #4A7575; --teal-dim: #3A5A5A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558;
  }

  /* NAV */
  .es-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .es-nav-brand { text-decoration: none; }
  .es-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .es-nav-home { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .es-nav-home:hover { color: var(--cream); }

  /* PAGE */
  .es-page { padding: 140px 56px 100px; max-width: 760px; margin: 0 auto; }
  .es-icon { width: 56px; height: 56px; background: rgba(74,117,117,0.15); border: 1px solid rgba(74,117,117,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 36px; }
  .es-checkmark { font-size: 24px; color: var(--teal); }
  .es-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .es-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .es-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .es-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(36px,4.4vw,52px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 32px; }

  /* CONFIRMATION CARD */
  .es-card { background: var(--panel); border: 1px solid rgba(232,223,208,0.08); border-left: 3px solid var(--teal); padding: 36px; margin-bottom: 40px; }
  .es-card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(232,223,208,0.07); }
  .es-card-row:last-child { border-bottom: none; padding-bottom: 0; }
  .es-card-key { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); padding-top: 2px; flex-shrink: 0; }
  .es-card-val { font-size: 16px; color: var(--cream); text-align: right; line-height: 1.5; }

  /* NEXT STEPS */
  .es-next { margin-bottom: 48px; }
  .es-next-h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .es-next-list { list-style: none; }
  .es-next-list li { font-size: 16px; line-height: 1.7; color: var(--cream-dim); padding: 10px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; gap: 14px; align-items: flex-start; }
  .es-next-list li:last-child { border-bottom: none; }
  .es-next-num { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: var(--gold); flex-shrink: 0; margin-top: 3px; }

  /* ACTIONS */
  .es-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .es-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; transition: all 0.22s; }
  .es-btn-teal { background: var(--teal); color: var(--cream); }
  .es-btn-teal:hover { background: var(--teal-dim); }
  .es-btn-outline { background: transparent; color: var(--cream); border: 1px solid rgba(232,223,208,0.25); }
  .es-btn-outline:hover { border-color: var(--cream); }

  @media (max-width: 900px) {
    .es-nav { padding: 0 24px; }
    .es-page { padding: 120px 24px 72px; }
    .es-actions { flex-direction: column; }
    .es-btn { text-align: center; }
  }
`;

function fmtPrice(cents) {
  return "$" + (cents / 100).toFixed(0);
}

export default function EventSuccessPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  const event = getEventById(eventId);
  const pkgId = searchParams.get("pkg") || "";
  const customerName = searchParams.get("name") || "";
  const isBundle = searchParams.get("bundle") === "1";

  const pkg = event ? event.packages.find((p) => p.id === pkgId) : null;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="es">
      <style>{css}</style>

      <nav className="es-nav">
        <a className="es-nav-brand" href="/"><span className="es-wordmark">ROAMSIX</span></a>
        <a className="es-nav-home" href="/">← Home</a>
      </nav>

      <div className="es-page">
        <div className="es-icon"><span className="es-checkmark">&#10003;</span></div>

        <div className="es-label-row">
          <span className="es-rule" />
          <span className="es-label">Registration Confirmed</span>
        </div>
        <h1 className="es-h1">
          {customerName ? `You're registered${customerName ? ", " + customerName.split(" ")[0] : ""}.` : "You're registered."}
        </h1>

        {event && pkg && (
          <div className="es-card">
            <div className="es-card-row">
              <span className="es-card-key">Event</span>
              <span className="es-card-val">{event.title}</span>
            </div>
            <div className="es-card-row">
              <span className="es-card-key">Package</span>
              <span className="es-card-val">{pkg.name}</span>
            </div>
            {isBundle && pkg.bundlePrice && (
              <div className="es-card-row">
                <span className="es-card-key">Option</span>
                <span className="es-card-val">Couples Bundle ({fmtPrice(pkg.bundlePrice)} for two)</span>
              </div>
            )}
            <div className="es-card-row">
              <span className="es-card-key">Date</span>
              <span className="es-card-val">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                  timeZone: "America/Los_Angeles",
                })}
              </span>
            </div>
            <div className="es-card-row">
              <span className="es-card-key">Location</span>
              <span className="es-card-val">{event.locationDetail}</span>
            </div>
          </div>
        )}

        {!event && (
          <div className="es-card">
            <div className="es-card-row">
              <span className="es-card-key">Status</span>
              <span className="es-card-val">Registration confirmed</span>
            </div>
          </div>
        )}

        <div className="es-next">
          <h3 className="es-next-h3">What happens next</h3>
          <ul className="es-next-list">
            <li>
              <span className="es-next-num">01</span>
              Check your email for a payment confirmation and receipt from Stripe.
            </li>
            <li>
              <span className="es-next-num">02</span>
              You will receive a separate confirmation from ROAMSIX with event details, directions, and what to bring.
            </li>
            <li>
              <span className="es-next-num">03</span>
              Questions before the event? Email us at info@roamsix.com.
            </li>
          </ul>
        </div>

        <div className="es-actions">
          <a href="/" className="es-btn es-btn-teal">Back to Home</a>
          <Link to="/events" className="es-btn es-btn-outline">View All Events</Link>
        </div>
      </div>
    </div>
  );
}
