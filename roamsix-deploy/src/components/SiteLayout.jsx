import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV = [
  ['Experiences', '/experiences'],
  ['2027 program', '/events'],
  ['Membership', '/membership'],
  ['How it works', '/how-it-works'],
  ['Organizations', '/organizations'],
  ['Collaborate', '/collaborate'],
  ['About', '/about'],
];

export default function SiteLayout({ children, theme = 'light' }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    if (location.hash) {
      let secondFrame;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' }));
      });
      return () => {
        window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
      };
    } else {
      window.scrollTo({ top: 0 });
    }
    return undefined;
  }, [location.pathname, location.hash]);

  return (
    <div className={`site-shell theme-${theme}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="ROAMSIX home">
          <img src="/images/roamsix-logo-white.png" alt="ROAMSIX" />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV.map(([label, href]) => (
            <NavLink key={href} to={href}>{label}</NavLink>
          ))}
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="mobile-navigation" className={`mobile-nav ${open ? 'open' : ''}`} aria-label="Mobile navigation">
          {NAV.map(([label, href]) => (
            <NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div>
          <Link className="footer-brand" to="/">ROAMSIX</Link>
          <p>Expert-led experiences for health, performance, and a fully lived life.</p>
          <p className="footer-tagline">Bridging knowing and doing.</p>
        </div>
        <div className="footer-navigation">
          <div className="footer-social" aria-label="ROAMSIX social media">
            <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/company/roamsix" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="mailto:info@roamsix.com">Email</a>
          </div>
          <div className="footer-links" aria-label="Footer navigation">
            <Link to="/collaborate">Collaborate with us</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/membership/manage">Manage membership</Link>
            <Link to="/waiver">Waiver</Link>
            <Link to="/media-release">Media release</Link>
          </div>
        </div>
        <p className="copyright">© {new Date().getFullYear()} ROAMSIX. Southern California.</p>
      </footer>
    </div>
  );
}
