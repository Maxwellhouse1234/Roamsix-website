import { useEffect } from "react";

const css = `
 @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

 .ap *, .ap *::before, .ap *::after { box-sizing: border-box; margin: 0; padding: 0; }
 .ap {
 font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
 min-height: 100vh; font-size: 18px; line-height: 1.65;
 --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
 --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
 --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
 --gold: #B59558;
 }

 /* NAV */
 .ap-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
 .ap-nav-brand { text-decoration: none; }
 .ap-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
 .ap-nav-back { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
 .ap-nav-back:hover { color: var(--cream); }

 /* LAYOUT */
 .ap-page { padding: 140px 56px 100px; max-width: 900px; margin: 0 auto; }
 .ap-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
 .ap-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
 .ap-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
 .ap-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(36px,4.4vw,56px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 56px; }
 .ap-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(26px,3vw,36px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.1; margin-bottom: 24px; margin-top: 64px; }
 .ap-body p { font-size: 19px; line-height: 1.88; color: var(--cream-dim); margin-bottom: 24px; }
 .ap-body p:last-child { margin-bottom: 0; }
 .ap-pull { font-family: 'EB Garamond', serif; font-style: italic; font-size: 24px; line-height: 1.65; color: var(--cream); border-left: 2px solid var(--teal-dim); padding-left: 28px; margin: 40px 0; }
 .ap-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 56px 0; }

 /* PRINCIPLES */
 .ap-principles { margin-top: 56px; }
 .ap-principle { padding: 36px 0; border-bottom: 1px solid rgba(232,223,208,0.08); display: grid; grid-template-columns: 200px 1fr; gap: 48px; align-items: start; }
 .ap-principle:first-child { border-top: 1px solid rgba(232,223,208,0.08); }
 .ap-p-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cream); line-height: 1.2; padding-top: 4px; }
 .ap-p-body { font-size: 17px; line-height: 1.8; color: var(--cream-dim); }

 /* CTA */
 .ap-cta { margin-top: 72px; padding-top: 56px; border-top: 1px solid rgba(232,223,208,0.08); display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
 .ap-cta-text h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 16px; }
 .ap-cta-text p { font-size: 17px; color: var(--cream-dim); line-height: 1.75; }
 .ap-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; background: var(--teal); color: var(--cream); transition: all 0.22s; }
 .ap-btn:hover { background: var(--teal-dim); }
 .ap-btn-outline { background: transparent; color: var(--cream); border: 1px solid rgba(232,223,208,0.35); margin-top: 12px; display: inline-block; }
 .ap-btn-outline:hover { border-color: var(--cream-dim); }

 @media (max-width: 900px) {
 .ap-nav { padding: 0 24px; }
 .ap-page { padding: 120px 24px 72px; }
 .ap-principle { grid-template-columns: 1fr; gap: 12px; }
 .ap-cta { grid-template-columns: 1fr; gap: 36px; }
 }
`;

const PRINCIPLES = [
 {
 title: "Environment shapes behavior",
 body: "The setting changes what people say, what they hold back, and how they relate to each other. Most teams have never been in an environment specifically designed to produce the kind of honesty and clarity they need. That's where we start.",
 },
 {
 title: "People operate inside roles",
 body: "In most organizations, people communicate through the filter of their title, their function, and the expectations around them. That filter limits what's possible. When the environment shifts those conditions, people show how they actually think, contribute, and create value.",
 },
 {
 title: "Teams stop seeing each other clearly",
 body: "Over time, teams see functions and responsibilities , not how each person actually operates. That misalignment costs performance. The right environment creates the conditions for teams to genuinely understand each other's strengths, styles, and ways of contributing.",
 },
 {
 title: "Recovery is not optional",
 body: "High performers operating without adequate recovery and reflection make worse decisions and produce less over time. Recovery is built into every ROAMSIX experience , not as a luxury, but as a structural requirement for the kind of clarity and performance we're trying to produce.",
 },
 {
 title: "Structure reveals what's real",
 body: "The right structure surfaces what a team actually needs, not what they said they needed in the intake conversation. We design the structure around the outcome, not the comfort level.",
 },
];

export default function ApproachPage() {
 useEffect(() => { window.scrollTo(0,0); }, []);

 return (
 <div className="ap">
 <style>{css}</style>

 <nav className="ap-nav">
 <a className="ap-nav-brand" href="/"><span className="ap-wordmark">ROAMSIX</span></a>
 <a className="ap-nav-back" href="/">← Back</a>
 </nav>

 <div className="ap-page">

 <div className="ap-label-row"><span className="ap-rule"/><span className="ap-label">Our Approach</span></div>
 <h1 className="ap-h1">Why environment is the starting point.</h1>

 <div className="ap-body">
 <p>Most performance and alignment work focuses on what people do. The agenda. The workshop. The framework delivered at the end of a facilitated session.</p>
 <p>ROAMSIX focuses on the conditions under which people think and interact. Because those conditions determine what's actually possible in any given room , regardless of the agenda.</p>
 </div>

 <div className="ap-pull">
 Environment changes what people reveal, how they relate, and what they are able to see clearly.
 </div>

 <div className="ap-body">
 <p>This is not a soft idea. It is an operational one. The right environment produces outcomes that are otherwise unavailable , not because people became different people, but because the conditions finally allowed them to show up as they actually are.</p>
 </div>

 <hr className="ap-hr"/>

 <h2 className="ap-h2">What we've observed.</h2>

 <div className="ap-body">
 <p>When people step outside their daily roles and into an environment that doesn't demand performance in the way their office does, something shifts.</p>
 <p>They think differently. They communicate differently. They see each other differently. The conversations that don't happen in the office start to happen. The things people have been carrying but not saying start to surface.</p>
 <p>That is not accidental. It is the result of a deliberately designed environment. And when it happens in the context of a team, it changes how that team operates when they return to work.</p>
 </div>

 <hr className="ap-hr"/>

 <h2 className="ap-h2">How we think about the work.</h2>

 <div className="ap-principles">
 {PRINCIPLES.map(p => (
 <div className="ap-principle" key={p.title}>
 <div className="ap-p-title">{p.title}</div>
 <p className="ap-p-body">{p.body}</p>
 </div>
 ))}
 </div>

 <hr className="ap-hr"/>

 <div className="ap-body">
 <p>Every ROAMSIX engagement is built around what needs to happen , not what's easiest to design or deliver. That means the structure, the environment, the facilitation, and the pacing are all built specifically for the group and the outcome.</p>
 <p>We don't run the same experience twice. We build each one from what we learn in the initial conversation.</p>
 </div>

 {/* CTA */}
 <div className="ap-cta">
 <div className="ap-cta-text">
 <h3>Start with a conversation.</h3>
 <p>Every engagement starts by understanding what's actually going on. If there's a fit, we build from there.</p>
 </div>
 <div>
 <a href="/#contact" className="ap-btn" style={{display:"block",textAlign:"center",marginBottom:"12px"}}>Start a Conversation</a>
 <a href="/team" className="ap-btn ap-btn-outline" style={{display:"block",textAlign:"center"}}>Meet the Team</a>
 </div>
 </div>

 </div>
 </div>
 );
}
