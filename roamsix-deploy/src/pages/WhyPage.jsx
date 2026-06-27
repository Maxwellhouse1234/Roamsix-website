import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const NAV = [
  ["Experiences", "/experiences"],
  ["Events",      "/events"],
  ["Why",         "/why"],
  ["Corporate",   "/corporate"],
  ["Join",        "/priority-access"],
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

  .wy *, .wy *::before, .wy *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .wy {
    font-family: 'Barlow', sans-serif; font-weight: 400;
    background: #141C2A; color: #E8DFD0; overflow-x: hidden;
    font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
  }
  body.wy-no-scroll { overflow: hidden; }

  /* NAV */
  .wy-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .wy-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .wy-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
  .wy-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
  .wy-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
  .wy-nav-links a:hover { color: var(--cream); }
  .wy-nav-join { background: transparent; color: var(--gold); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border: 1px solid var(--gold); transition: all 0.2s; }
  .wy-nav-join:hover { background: rgba(181,149,88,0.1); color: var(--gold); }

  /* BURGER */
  .wy-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
  .wy-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
  .wy-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .wy-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .wy-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  /* MOBILE MENU */
  .wy-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .wy-mobile-menu.open { opacity: 1; pointer-events: all; }
  .wy-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
  .wy-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
  .wy-mobile-menu a:hover { color: var(--gold); }
  .wy-mobile-join { background: transparent; color: var(--gold) !important; margin-top: 32px; border: 1px solid var(--gold); font-size: 20px !important; }

  /* CHROME */
  .wy-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; margin-top: 64px; }
  .wy-label-row:first-of-type { margin-top: 0; }
  .wy-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .wy-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .wy-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

  /* PAGE */
  .wy-page { padding: 140px 56px 100px; }
  .wy-article { max-width: 700px; margin: 0 auto; }
  .wy-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(34px,4.6vw,58px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; margin-bottom: 48px; }
  .wy-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(24px,2.8vw,34px); letter-spacing: 0.5px; text-transform: uppercase; color: var(--cream); line-height: 1.15; margin-bottom: 24px; }
  .wy-p { font-family: 'EB Garamond', serif; font-size: 19px; line-height: 1.9; color: var(--cream-dim); margin-bottom: 24px; }
  .wy-p:last-child { margin-bottom: 0; }
  .wy-intro .wy-p { font-style: italic; color: var(--cream-muted); }

  /* IMAGE BREAKS */
  .wy-image-break { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; margin: 56px 0; }

  /* PEOPLE */
  .wy-people { margin-top: 56px; padding-top: 40px; border-top: 1px solid rgba(232,223,208,0.06); }
  .wy-people-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 16px; }
  .wy-people-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); text-decoration: none; border-bottom: 1px solid rgba(181,149,88,0.3); padding-bottom: 2px; transition: all 0.2s; }
  .wy-people-link:hover { border-bottom-color: var(--gold); color: var(--cream); }

  /* CLOSING */
  .wy-closing { margin-top: 80px; padding-top: 48px; border-top: 1px solid rgba(232,223,208,0.08); text-align: center; }
  .wy-closing-line { font-family: 'EB Garamond', serif; font-style: italic; font-size: clamp(22px, 2.6vw, 30px); line-height: 1.5; color: var(--cream); margin-bottom: 24px; }
  .wy-closing-attr { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }

  /* FOOTER */
  .wy-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
  .wy-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  .wy-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
  .wy-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .wy-footer-social { display: flex; gap: 16px; }
  .wy-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
  .wy-footer-social a:hover { color: var(--cream); }
  .wy-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
  .wy-footer-col ul { list-style: none; }
  .wy-footer-col ul li { margin-bottom: 12px; }
  .wy-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .wy-footer-col ul a:hover { color: var(--cream); }
  .wy-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .wy-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .wy-nav-links { display: none; }
    .wy-burger { display: flex; }
    .wy-nav { padding: 0 24px; }
    .wy-page { padding: 120px 24px 72px; }
    .wy-footer { padding: 56px 24px 36px; }
    .wy-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
    .wy-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
  }
  @media (max-width: 480px) {
    .wy-footer-top { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .wy-image-break { margin: 40px 0; aspect-ratio: 4/3; }
  }
`;

export default function WhyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("wy-no-scroll", menuOpen);
    return () => document.body.classList.remove("wy-no-scroll");
  }, [menuOpen]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const close = () => setMenuOpen(false);

  return (
    <div className="wy">
      <style>{css}</style>

      {/* MOBILE MENU */}
      <div className={`wy-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {NAV.map(([l, h]) => {
          if (l === "Join") return <Link key={l} to={h} className="wy-mobile-join" onClick={close}>{l}</Link>;
          return (h.startsWith('#') || h.startsWith('/#')) ? <a key={l} href={h} onClick={close}>{l}</a> : <Link key={l} to={h} onClick={close}>{l}</Link>;
        })}
      </div>

      {/* NAV */}
      <nav className="wy-nav">
        <Link className="wy-nav-brand" to="/"><span className="wy-wordmark">ROAMSIX</span></Link>
        <ul className="wy-nav-links">
          {NAV.map(([l, h]) => (
            <li key={l}>
              {l === "Join"
                ? <Link to={h} className="wy-nav-join">{l}</Link>
                : (h.startsWith('#') || h.startsWith('/#')) ? <a href={h}>{l}</a> : <Link to={h}>{l}</Link>
              }
            </li>
          ))}
        </ul>
        <button className={`wy-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span/><span/><span/>
        </button>
      </nav>

      <div className="wy-page">
        <div className="wy-article">

          <h1 className="wy-h1">Why We Built ROAMSIX</h1>

          <div className="wy-intro">
            <p className="wy-p">You've been there before.</p>
            <p className="wy-p">The ones with good food, a decent speaker, and a mixer at the end where people trade cards and check their phones on the way home.</p>
            <p className="wy-p">You drove there hoping something might happen.</p>
            <p className="wy-p">You left remembering less than you expected.</p>
            <p className="wy-p">Not because anything went wrong. Because very little was designed to stay with you.</p>
          </div>

          <img className="wy-image-break" src="/images/events/barrel-lounge-golden-hour-roamsix.jpg" alt="A lounge area beneath oak trees at golden hour, set before guests arrive" loading="lazy"/>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">Why the environment matters</span></div>
          <h2 className="wy-h2">Why the environment matters</h2>
          <p className="wy-p">You have walked into a room and felt it before anyone spoke.</p>
          <p className="wy-p">The difference between a space that was considered and one that was not. The difference between food with a story and food without one. The difference between a place that earns your attention and one that just fills it.</p>
          <p className="wy-p">When you arrive somewhere that was clearly cared for, something shifts. You slow down. You notice things. You start asking questions you would not have thought to ask anywhere else.</p>
          <p className="wy-p">The setting is never just a backdrop.</p>
          <p className="wy-p">It changes what you notice. It changes what you say. It changes what you remember.</p>
          <p className="wy-p">Sometimes that place is a farm. Sometimes a coastline at first light. Sometimes a mountain trail. Sometimes a long table under the open sky.</p>
          <p className="wy-p">The place becomes part of the conversation.</p>

          <img className="wy-image-break" src="/images/events/empty-table-setting-roamsix.jpg" alt="A long table set with flowers and place settings before guests arrive" loading="lazy"/>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">Why movement matters</span></div>
          <h2 className="wy-h2">Why movement matters</h2>
          <p className="wy-p">You have sat in a conference room for six hours and left knowing less about the person beside you than when you arrived.</p>
          <p className="wy-p">Something different happens when you walk uphill with a stranger.</p>
          <p className="wy-p">The agenda disappears. You arrive at the top and the scenery does the talking. People stop looking at each other. They look in the same direction.</p>
          <p className="wy-p">Some people open up over food. Others open up in motion. By moving through different environments, everyone finds their moment.</p>
          <p className="wy-p">Everyone finds the edge of their comfort zone somewhere. And that is usually where the real conversation starts.</p>

          <img className="wy-image-break" src="/images/events/warner-springs-golden-hour-roamsix.jpg" alt="Sunset over the high desert landscape near Warner Springs" loading="lazy"/>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">Why the room matters</span></div>
          <h2 className="wy-h2">Why the room matters</h2>
          <p className="wy-p">You have been in rooms where conversation felt effortless.</p>
          <p className="wy-p">You have been in rooms where it never quite happened.</p>
          <p className="wy-p">The difference rarely announced itself.</p>
          <p className="wy-p">It was already there the moment everyone walked in.</p>
          <p className="wy-p">Not their credentials. Not their titles. The standard underneath. The way they move through the world.</p>
          <p className="wy-p">That is what curation protects. Every person in the room changes the experience for everyone else. Getting that right is the whole job.</p>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">Titles can wait</span></div>
          <h2 className="wy-h2">Titles can wait</h2>
          <p className="wy-p">You have learned a lot about what someone does without ever learning who they are.</p>
          <p className="wy-p">The introduction comes first. The profession comes later. By the time it does, it usually stops mattering.</p>
          <p className="wy-p">The person comes before the introduction.</p>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">The first proof</span></div>
          <h2 className="wy-h2">The first proof</h2>
          <p className="wy-p">Twelve people arrived at a private farmstead in Warner Springs, California as strangers.</p>
          <p className="wy-p">They started at a mocktail bar on the land. Then moved to a flower station where they slowed down and worked with their hands. Then to a long table where a chef-prepared dinner had been built from ingredients sourced from the property. Then onto a trail as the sun dropped behind the hills. Then to an oak tree lit at dusk where dessert and tea were waiting.</p>
          <p className="wy-p">Every transition served a purpose.</p>
          <p className="wy-p">By the end of the evening, people from completely different worlds were exchanging numbers, planning collaborations, and asking when the next one would be. One guest looked at the photos the next day and cried.</p>
          <p className="wy-p">Nothing about the conversations was scripted.</p>
          <p className="wy-p">The environment was.</p>

          <div className="wy-label-row"><span className="wy-rule"/><span className="wy-label">What stays the same</span></div>
          <h2 className="wy-h2">What stays the same</h2>
          <p className="wy-p">The places will change.</p>
          <p className="wy-p">The formats will evolve.</p>
          <p className="wy-p">The people will be different.</p>
          <p className="wy-p">The intention will not.</p>
          <p className="wy-p">Because dinner was never the point.</p>
          <p className="wy-p">It has always been to create the conditions where ordinary moments become the ones people remember.</p>
          <p className="wy-p">Every detail is intentional.</p>
          <p className="wy-p">What stays with people is never ours to decide.</p>
          <p className="wy-p">That has always been the point.</p>

          <div className="wy-people">
            <h2 className="wy-people-h2">The People Behind ROAMSIX</h2>
            <p className="wy-p">ROAMSIX is carried forward by people who believe environment, hospitality, movement, and conversation can change what people notice and what they carry home.</p>
            <Link to="/team" className="wy-people-link">Meet the Team</Link>
          </div>

          <img className="wy-image-break" src="/images/events/guests-table-golden-hour-roamsix.jpg" alt="Guests gathered at the table under string lights at golden hour" loading="lazy"/>

          <div className="wy-closing">
            <p className="wy-closing-line">Your world is wider. Stay curious. Stay awake.</p>
            <div className="wy-closing-attr">— ROAMSIX</div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="wy-footer">
        <div className="wy-footer-top">
          <div>
            <div className="wy-footer-wm">ROAMSIX</div>
            <p className="wy-footer-tag">Curated experiences for people looking for depth, perspective, and real connection.</p>
            <div className="wy-footer-social">
              <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="wy-footer-col"><h4>Company</h4><ul>
            <li><Link to="/why">Why We Built ROAMSIX</Link></li>
            <li><Link to="/team">Team</Link></li>
          </ul></div>
          <div className="wy-footer-col"><h4>Experiences</h4><ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/experiences">All Experiences</Link></li>
            <li><Link to="/priority-access">Priority Access</Link></li>
          </ul></div>
          <div className="wy-footer-col"><h4>Connect</h4><ul>
            <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
            <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
            <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul></div>
          <div className="wy-footer-col"><h4>Redirection Point</h4><ul>
            <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="/#podcast">About the Podcast</a></li>
          </ul></div>
          <div className="wy-footer-col"><h4>Legal</h4><ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/waiver">Assumption of Risk</Link></li>
            <li><Link to="/media-release">Media Release</Link></li>
            <li><Link to="/terms">Refund Policy</Link></li>
          </ul></div>
        </div>
        <div className="wy-footer-bottom">
          <span className="wy-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
          <span className="wy-footer-copy">ROAMSIX, Murrieta, CA</span>
        </div>
      </footer>
    </div>
  );
}
