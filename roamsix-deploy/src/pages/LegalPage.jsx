// Shared shell for all ROAMSIX legal pages.
// Usage: <LegalPage title="..." lastUpdated="..."><sections /></LegalPage>
import { useEffect } from "react";
import { Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .lp {
    font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
    min-height: 100vh; font-size: 17px; line-height: 1.75;
    --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
    --teal: #4A7575; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558;
  }

  /* NAV */
  .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .lp-nav-brand { text-decoration: none; }
  .lp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .lp-nav-home { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .lp-nav-home:hover { color: var(--cream); }

  /* PAGE */
  .lp-page { padding: 120px 56px 100px; max-width: 820px; margin: 0 auto; }

  /* NOTICE BANNER */
  .lp-notice { background: rgba(74,117,117,0.08); border: 1px solid rgba(74,117,117,0.2); border-left: 3px solid var(--teal); padding: 20px 24px; margin-bottom: 48px; font-size: 15px; color: var(--cream-dim); line-height: 1.7; }

  /* TITLE BLOCK */
  .lp-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .lp-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .lp-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .lp-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(32px, 4vw, 52px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 12px; }
  .lp-updated { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 56px; }

  /* CONTENT */
  .lp-section { margin-bottom: 44px; }
  .lp-section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(181,149,88,0.15); }
  .lp-section p { font-size: 16px; color: var(--cream-dim); line-height: 1.8; margin-bottom: 14px; }
  .lp-section p:last-child { margin-bottom: 0; }
  .lp-section ul { list-style: none; margin-top: 8px; }
  .lp-section ul li { font-size: 15px; color: var(--cream-dim); line-height: 1.7; padding: 6px 0 6px 18px; border-bottom: 1px solid rgba(232,223,208,0.05); position: relative; }
  .lp-section ul li:last-child { border-bottom: none; }
  .lp-section ul li::before { content: ""; display: block; width: 5px; height: 5px; background: var(--teal); border-radius: 50%; position: absolute; left: 0; top: 14px; }
  .lp-divider { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 0 0 44px; }
  .lp-contact { background: var(--panel); border: 1px solid rgba(232,223,208,0.07); padding: 28px 32px; margin-top: 48px; }
  .lp-contact-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 10px; }
  .lp-contact p { font-size: 15px; color: var(--cream-dim); line-height: 1.7; }
  .lp-contact a { color: var(--teal-light); text-decoration: none; }
  .lp-contact a:hover { color: var(--cream); }

  /* FOOTER */
  .lp-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 40px 56px; }
  .lp-footer-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 28px; }
  .lp-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .lp-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .lp-footer-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .lp-footer-links a:hover { color: var(--cream); }
  .lp-footer-copy { font-size: 12px; color: rgba(232,223,208,0.3); border-top: 1px solid rgba(232,223,208,0.07); padding-top: 20px; }

  @media (max-width: 900px) {
    .lp-nav { padding: 0 24px; }
    .lp-page { padding: 108px 24px 72px; }
    .lp-footer { padding: 32px 24px; }
    .lp-footer-top { flex-direction: column; gap: 20px; }
  }
`;

export default function LegalPage({ title, lastUpdated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | ROAMSIX`;
    return () => { document.title = "ROAMSIX"; };
  }, [title]);

  return (
    <div className="lp">
      <style>{css}</style>

      <nav className="lp-nav">
        <a className="lp-nav-brand" href="/"><span className="lp-wordmark">ROAMSIX</span></a>
        <Link className="lp-nav-home" to="/">Home</Link>
      </nav>

      <div className="lp-page">
        <div className="lp-notice">
          These terms are provided for event participation and risk acknowledgment. By registering for a ROAMSIX event, you agree to the applicable terms, waiver, policies, and releases.
        </div>

        <div className="lp-label-row">
          <span className="lp-rule" />
          <span className="lp-label">Legal</span>
        </div>
        <h1 className="lp-title">{title}</h1>
        {lastUpdated && <p className="lp-updated">Last updated: {lastUpdated}</p>}

        {children}
      </div>

      <footer className="lp-footer">
        <div className="lp-footer-top">
          <span className="lp-footer-brand">ROAMSIX</span>
          <div className="lp-footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/waiver">Assumption of Risk</Link>
            <Link to="/media-release">Media Release</Link>
          </div>
        </div>
        <div className="lp-footer-copy">
          &copy; {new Date().getFullYear()} Reciprofy Inc. All rights reserved. ROAMSIX, Murrieta, CA
        </div>
      </footer>
    </div>
  );
}
