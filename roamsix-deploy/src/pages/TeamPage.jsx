import { useState, useEffect } from "react";

const MAX_SRC = "/images/max-ouellette.webp";
const JACKIE_SRC = "/images/jackie.webp";

const css = `
 @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&family=EB+Garamond:ital,wght@1,400&display=swap');

 .tp *, .tp *::before, .tp *::after { box-sizing: border-box; margin: 0; padding: 0; }
 .tp {
 font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
 min-height: 100vh; font-size: 18px; line-height: 1.65;
 --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
 --teal: #4A7575; --teal-dim: #3A5A5A;
 --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
 --gold: #B59558;
 }
 body.tp-no-scroll { overflow: hidden; }

 /* NAV */
 .tp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
 .tp-nav-brand { text-decoration: none; }
 .tp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
 .tp-nav-back { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
 .tp-nav-back:hover { color: var(--cream); }

 /* PAGE */
 .tp-page { padding: 140px 56px 100px; max-width: 1100px; margin: 0 auto; }
 .tp-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
 .tp-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
 .tp-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
 .tp-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(36px,4.4vw,56px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 64px; }

 /* FOUNDER CARDS */
 .tp-founders { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 80px; }
 .tp-founder { background: var(--panel); border: 1px solid rgba(232,223,208,0.08); }
 .tp-founder-photo { width: 100%; aspect-ratio: 4/3; object-fit: cover; object-position: center top; display: block; filter: brightness(0.9) contrast(1.05); }
 .tp-founder-photo-placeholder { width: 100%; aspect-ratio: 4/3; background: rgba(74,117,117,0.1); display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 48px; font-weight: 600; color: var(--teal); letter-spacing: 4px; }
 .tp-founder-body { padding: 32px 36px 36px; }
 .tp-founder-role { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
 .tp-founder-name { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
 .tp-founder-bio { font-size: 17px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 16px; }
 .tp-founder-bio:last-child { margin-bottom: 0; }

 /* COMPANY NOTE */
 .tp-note { border-top: 1px solid rgba(181,149,88,0.1); padding-top: 56px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start; }
 .tp-note-h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px,3.2vw,40px); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; }
 .tp-note-body p { font-size: 18px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; }
 .tp-note-body p:last-child { margin-bottom: 0; }

 /* CTA */
 .tp-cta { margin-top: 56px; padding-top: 48px; border-top: 1px solid rgba(232,223,208,0.08); text-align: center; }
 .tp-cta p { font-size: 18px; color: var(--cream-dim); margin-bottom: 24px; }
 .tp-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; background: var(--teal); color: var(--cream); }
 .tp-btn:hover { background: var(--teal-dim); }

 /* HR */
 .tp-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 0; }

 @media (max-width: 900px) {
 .tp-nav { padding: 0 24px; }
 .tp-page { padding: 120px 24px 72px; }
 .tp-founders { grid-template-columns: 1fr; }
 .tp-note { grid-template-columns: 1fr; gap: 36px; }
 }
`;

export default function TeamPage() {
 const [maxErr, setMaxErr] = useState(false);
 const [jackieErr, setJackieErr] = useState(false);

 useEffect(() => { window.scrollTo(0,0); }, []);

 return (
 <div className="tp">
 <style>{css}</style>

 <nav className="tp-nav">
 <a className="tp-nav-brand" href="/"><span className="tp-wordmark">ROAMSIX</span></a>
 <a className="tp-nav-back" href="/">← Back</a>
 </nav>

 <div className="tp-page">

 <div className="tp-label-row"><span className="tp-rule"/><span className="tp-label">The Team</span></div>
 <h1 className="tp-h1">Built by people who've done the work.</h1>

 <div className="tp-founders">

 {/* MAX */}
 <div className="tp-founder">
 {maxErr ? (
 <div className="tp-founder-photo-placeholder">MO</div>
 ) : (
 <img className="tp-founder-photo" src={MAX_SRC} alt="Max Ouellette" onError={() => setMaxErr(true)}/>
 )}
 <div className="tp-founder-body">
 <div className="tp-founder-role">Co-Founder</div>
 <div className="tp-founder-name">Max Ouellette</div>
 <p className="tp-founder-bio">Former professional athlete with deep experience in performance environments, team dynamics, and experience design.</p>
 <p className="tp-founder-bio">Max leads ROAMSIX with a focus on structure, trust, and building experiences that produce real movement in people and teams. He brings a competitor's instinct for precision and a builder's understanding of what it takes to execute at a high level.</p>
 </div>
 </div>

 {/* JACKIE */}
 <div className="tp-founder">
 {jackieErr ? (
 <div className="tp-founder-photo-placeholder">JA</div>
 ) : (
 <img className="tp-founder-photo" src={JACKIE_SRC} alt="Jackie" onError={() => setJackieErr(true)}/>
 )}
 <div className="tp-founder-body">
 <div className="tp-founder-role">Co-Founder</div>
 <div className="tp-founder-name">Jackie</div>
 <p className="tp-founder-bio">Background in fitness instruction, event production, equestrian therapy, and retreat hosting.</p>
 <p className="tp-founder-bio">Jackie shapes the human side of every ROAMSIX engagement. She brings expertise in facilitation, relational dynamics, and the design of environments where people can actually show up fully. Her work ensures every experience feels intentional, personal, and well-held.</p>
 </div>
 </div>

 </div>

 {/* COMPANY NOTE */}
 <div className="tp-note">
 <div>
 <h2 className="tp-note-h2">Grounded in real-world execution.</h2>
 </div>
 <div className="tp-note-body">
 <p>ROAMSIX was built by operators who have run teams, competed at a high level, and spent years designing environments where real work happens.</p>
 <p>The work is grounded in lived experience and informed by proven principles in human performance, behavior, and team dynamics. It is not built from theory alone , it is built from having been in the room.</p>
 <p>ROAMSIX also works with individuals. Founders, executives, and high-performers navigating transitions who need a structured environment to think clearly , not a coach with a preset framework.</p>
 </div>
 </div>

 {/* CTA */}
 <div className="tp-cta">
 <p>Every engagement starts with a direct conversation.</p>
 <a href="/#contact" className="tp-btn">Start a Conversation</a>
 </div>

 </div>
 </div>
 );
}
