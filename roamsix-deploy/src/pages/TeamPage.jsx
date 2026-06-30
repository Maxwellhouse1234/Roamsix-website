import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const MAX_SRC = "/images/max-ouellette.webp";
const JACKIE_SRC = "/images/jackie.webp";

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Why",         "/why"],
  ["Corporate",   "/corporate"],
  ["Join",        "/priority-access"],
];

const css = `
 @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&family=EB+Garamond:ital,wght@1,400&display=swap');

 .tp *, .tp *::before, .tp *::after { box-sizing: border-box; margin: 0; padding: 0; }
 .tp {
 font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
 min-height: 100vh; font-size: 18px; line-height: 1.65;
 --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
 --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
 --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
 --gold: #B59558;
 }
 body.tp-no-scroll { overflow: hidden; }

 /* NAV */
 .tp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
 .tp-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
 .tp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
 .tp-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
 .tp-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
 .tp-nav-links a:hover { color: var(--cream); }
 .tp-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
 .tp-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

 /* BURGER */
 .tp-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
 .tp-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
 .tp-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
 .tp-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
 .tp-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

 /* MOBILE MENU */
 .tp-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
 .tp-mobile-menu.open { opacity: 1; pointer-events: all; }
 .tp-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
 .tp-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
 .tp-mobile-menu a:hover { color: var(--gold); }
 .tp-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

 /* PAGE */
 .tp-page { padding: 168px 56px 100px; max-width: 1100px; margin: 0 auto; }
 .tp-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
 .tp-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
 .tp-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
 .tp-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(36px,4.4vw,56px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 12px; }
 .tp-h1-sub { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(22px,2.8vw,34px); letter-spacing: 2px; text-transform: uppercase; color: var(--gold); line-height: 1.1; margin-bottom: 64px; }

 /* BELIEF SECTION */
 .tp-belief { padding-bottom: 56px; margin-bottom: 56px; border-bottom: 1px solid rgba(181,149,88,0.1); }
 .tp-belief-body p { font-family: 'EB Garamond', serif; font-size: 19px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
 .tp-belief-body p:last-child { margin-bottom: 0; }

 /* FOUNDER CARDS */
 .tp-founders { display: flex; flex-direction: column; gap: 56px; margin-bottom: 80px; }

 /* Desktop: two-column layout, image left for Max, image right for Jackie */
 .tp-founder { display: grid; gap: 56px; align-items: start; padding: 48px 0; border-bottom: 1px solid rgba(181,149,88,0.08); }
 .tp-founder:last-child { border-bottom: none; }
 .tp-founder-left  { grid-template-columns: 300px 1fr; }
 .tp-founder-right { grid-template-columns: 1fr 300px; }
 .tp-founder-right .tp-founder-photo-wrap { order: 2; }
 .tp-founder-right .tp-founder-body      { order: 1; }

 .tp-founder-photo { width: 100%; max-width: 300px; aspect-ratio: 3/4; object-fit: cover; object-position: top; display: block; filter: brightness(0.9) contrast(1.05); }
 .tp-founder-photo-placeholder { width: 100%; max-width: 300px; aspect-ratio: 3/4; background: rgba(74,117,117,0.1); display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 48px; font-weight: 600; color: var(--teal); letter-spacing: 4px; }
 .tp-founder-body { padding: 0; }
 .tp-founder-name { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 10px; }
 .tp-founder-perspective { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; }
 .tp-founder-bio { font-family: 'EB Garamond', serif; font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 18px; }
 .tp-founder-bio:last-child { margin-bottom: 0; }

 /* CTA */
 .tp-cta { margin-top: 56px; padding-top: 48px; border-top: 1px solid rgba(232,223,208,0.08); text-align: center; }
 .tp-cta p { font-family: 'EB Garamond', serif; font-size: 19px; color: var(--cream-dim); margin-bottom: 16px; line-height: 1.8; }
 .tp-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; background: var(--gold); color: var(--navy); margin-top: 16px; }
 .tp-btn:hover { background: var(--cream); color: var(--navy); }

 /* HR */
 .tp-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 0; }

 /* FOOTER */
 .tp-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
 .tp-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
 .tp-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
 .tp-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
 .tp-footer-social { display: flex; gap: 16px; }
 .tp-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
 .tp-footer-social a:hover { color: var(--cream); }
 .tp-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
 .tp-footer-col ul { list-style: none; }
 .tp-footer-col ul li { margin-bottom: 12px; }
 .tp-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
 .tp-footer-col ul a:hover { color: var(--cream); }
 .tp-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
 .tp-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

 @media (max-width: 900px) {
 .tp-nav { padding: 0 24px; }
 .tp-nav-links { display: none; }
 .tp-burger { display: flex; }
 .tp-page { padding: 140px 24px 72px; }
 .tp-founder { grid-template-columns: 1fr !important; gap: 28px; }
 .tp-founder-right .tp-founder-photo-wrap { order: 0; }
 .tp-founder-right .tp-founder-body      { order: 0; }
 .tp-footer { padding: 56px 24px 36px; }
 .tp-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
 .tp-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
 }
 @media (max-width: 480px) {
 .tp-footer-top { grid-template-columns: 1fr; }
 }
`;

export default function TeamPage() {
 const [menuOpen, setMenuOpen] = useState(false);
 const [maxErr, setMaxErr] = useState(false);
 const [jackieErr, setJackieErr] = useState(false);

 useEffect(() => {
  document.body.classList.toggle("tp-no-scroll", menuOpen);
  return () => document.body.classList.remove("tp-no-scroll");
 }, [menuOpen]);

 useEffect(() => { window.scrollTo(0, 0); }, []);

 const close = () => setMenuOpen(false);

 return (
  <div className="tp">
   <style>{css}</style>

   {/* MOBILE MENU */}
   <div className={`tp-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
    {NAV.map(([l, h]) => {
     if (l === "Join") return <Link key={l} to={h} className="tp-mobile-join" onClick={close}>{l}</Link>;
     return (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
    })}
   </div>

   {/* NAV */}
   <nav className="tp-nav">
    <Link className="tp-nav-brand" to="/"><span className="tp-wordmark">ROAMSIX</span></Link>
    <ul className="tp-nav-links">
     {NAV.map(([l, h]) => (
      <li key={l}>
       {l === "Join"
        ? <Link to={h} className="tp-nav-join">{l}</Link>
        : (h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
       }
      </li>
     ))}
    </ul>
    <button className={`tp-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
     <span/><span/><span/>
    </button>
   </nav>

   <div className="tp-page">

    <div className="tp-label-row"><span className="tp-rule"/><span className="tp-label">The Team</span></div>
    <h1 className="tp-h1">THE TEAM</h1>
    <div className="tp-h1-sub">BUILT FROM A BELIEF.</div>

    {/* BELIEF */}
    <div className="tp-belief">
     <div className="tp-belief-body">
      <p>We did not set out to build another event company.</p>
      <p>We became fascinated by a different question: why do some environments change people while others leave almost nothing behind?</p>
      <p>ROAMSIX is the result of that question.</p>
     </div>
    </div>

    <div className="tp-founders">

     {/* MAX */}
     <div className="tp-founder tp-founder-left">
      <div className="tp-founder-photo-wrap">
       {maxErr ? (
        <div className="tp-founder-photo-placeholder">MO</div>
       ) : (
        <img className="tp-founder-photo" src={MAX_SRC} alt="Max Ouellette" onError={() => setMaxErr(true)}/>
       )}
      </div>
      <div className="tp-founder-body">
       <div className="tp-founder-name">MAX OUELLETTE</div>
       <div className="tp-founder-perspective">Perspective</div>
       <p className="tp-founder-bio">Max has spent much of his life stepping into unfamiliar environments.</p>
       <p className="tp-founder-bio">New countries. New cultures. New careers. New seasons of life.</p>
       <p className="tp-founder-bio">Again and again, he found the same thing waiting for him. The people willing to share a meal, a conversation, or a piece of their world shaped him far more than the places themselves.</p>
       <p className="tp-founder-bio">ROAMSIX grew from that conviction.</p>
       <p className="tp-founder-bio">Every experience is built around a simple idea: when the right people come together in the right environment, perspective expands. And when perspective expands, so does the future people imagine for themselves.</p>
      </div>
     </div>

     {/* JACKIE */}
     <div className="tp-founder tp-founder-right">
      <div className="tp-founder-photo-wrap">
       {jackieErr ? (
        <div className="tp-founder-photo-placeholder">JS</div>
       ) : (
        <img className="tp-founder-photo" src={JACKIE_SRC} alt="Jackie Slot" onError={() => setJackieErr(true)}/>
       )}
      </div>
      <div className="tp-founder-body">
       <div className="tp-founder-name">JACKIE SLOT</div>
       <div className="tp-founder-perspective">Presence</div>
       <p className="tp-founder-bio">Jackie Slot is drawn to the moments when people stop performing and start showing up as themselves.</p>
       <p className="tp-founder-bio">She believes the way someone feels in an environment determines what becomes possible there. When people feel genuinely welcomed, supported, and safe, conversations become more honest, confidence begins to grow, and meaningful connection follows.</p>
       <p className="tp-founder-bio">That belief shapes every ROAMSIX experience. From the rhythm of the evening to the smallest details of hospitality, her work is guided by one question:</p>
       <p className="tp-founder-bio">What helps someone feel safe enough to be fully present?</p>
       <p className="tp-founder-bio">She hopes people leave with more than a memory.</p>
       <p className="tp-founder-bio">She hopes they leave feeling more like themselves.</p>
      </div>
     </div>

    </div>

    {/* CTA */}
    <div className="tp-cta">
     <p>Some people leave with new ideas.</p>
     <p>Some leave with new friendships.</p>
     <p>Some leave seeing their own lives differently.</p>
     <p>That possibility is why ROAMSIX exists.</p>
     <Link to="/priority-access" className="tp-btn">REQUEST PRIORITY ACCESS</Link>
    </div>

   </div>

   {/* FOOTER */}
   <footer className="tp-footer">
    <div className="tp-footer-top">
     <div>
      <div className="tp-footer-wm">ROAMSIX</div>
      <p className="tp-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
      <div className="tp-footer-social">
       <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
       <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
     </div>
     <div className="tp-footer-col"><h4>Company</h4><ul>
      <li><Link to="/why">Why We Built ROAMSIX</Link></li>
      <li><Link to="/team">Team</Link></li>
     </ul></div>
     <div className="tp-footer-col"><h4>Experiences</h4><ul>
      <li><Link to="/events">Events</Link></li>
      <li><Link to="/experiences">All Experiences</Link></li>
      <li><Link to="/corporate">Corporate</Link></li>
      <li><Link to="/priority-access">Priority Access</Link></li>
     </ul></div>
     <div className="tp-footer-col"><h4>Connect</h4><ul>
      <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
      <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
      <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
     </ul></div>
     <div className="tp-footer-col"><h4>Redirection Point</h4><ul>
      <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
      <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
      <li><a href="/#podcast">About the Podcast</a></li>
     </ul></div>
     <div className="tp-footer-col"><h4>Legal</h4><ul>
      <li><Link to="/terms">Terms of Service</Link></li>
      <li><Link to="/privacy">Privacy Policy</Link></li>
      <li><Link to="/waiver">Assumption of Risk</Link></li>
      <li><Link to="/media-release">Media Release</Link></li>
      <li><Link to="/terms">Refund Policy</Link></li>
     </ul></div>
    </div>
    <div className="tp-footer-bottom">
     <span className="tp-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
     <span className="tp-footer-copy">ROAMSIX, Murrieta, CA</span>
    </div>
   </footer>
  </div>
 );
}
