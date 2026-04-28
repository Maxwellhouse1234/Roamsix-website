import { useState, useEffect } from "react";

/*
 ROAMSIX , HomePage.jsx v7
 Copy: outcome-led, mechanism layered underneath
 New pages: /team and /approach wired in nav
 Backend: all API routes, form handlers, Airtable untouched

 Asset paths:
 /public/images/homepage/roamsix-hero.webp
 /public/images/homepage/proving-grounds.webp
 /public/images/homepage/team-outlook.webp
 /public/images/homepage/field-notes.webp
 /public/images/max-ouellette.webp
 /public/images/jackie.webp
 /public/images/roamsix-logo.png
 /public/images/redirection-point-logo.png

 Video placeholders (add when ready):
 /public/videos/homepage/roamsix-hero.mp4
 /public/videos/homepage/proving-grounds.mp4

 Form endpoints (do not modify):
 Contact → POST /api/contact
 PG → POST /api/pg-interest
*/

const HERO_SRC = "/images/homepage/roamsix-hero.webp";
const PG_SRC = "/images/homepage/proving-grounds.webp";
const TEAM_SRC = "/images/homepage/team-outlook.webp";
const NOTES_SRC = "/images/homepage/field-notes.webp";
const MAX_SRC = "/images/max-ouellette.webp";
const JACKIE_SRC = "/images/jackie.webp";
const HERO_FALLBACK = "/images/homepage/team-outlook.webp";
const RP_LOGO = "/images/redirection-point-logo.png";

const NAV = [
 ["Experiences", "#how-we-work"],
 ["Proving Grounds", "#proving-grounds"],
 ["Team", "/team"],
 ["Approach", "/approach"],
 ["Podcast", "#podcast"],
];

const HOW_WE_WORK = [
 { title: "Leadership Offsites", desc: "Multi-day experiences built around decisions and execution." },
 { title: "Team Sessions", desc: "Single or multi-day environments for alignment and forward movement." },
 { title: "Individual and Small Group", desc: "For people carrying decisions they haven't had space to think through clearly." },
 { title: "Proving Grounds", desc: "Structured environments to observe how your team actually operates." },
];

const WHAT_PRODUCES = [
 "Clear decisions.",
 "Alignment that holds after the experience ends.",
 "Conversations that don't usually happen inside the office.",
 "A team that returns with energy, not just a plan.",
];

const FOUNDERS = [
 { name: "Max Ouellette", role: "Co-Founder", photo: MAX_SRC, initials: "MO",
 bio: "Former professional athlete with deep experience in performance, team environments, and experience design. Max leads ROAMSIX with a focus on structure, trust, and building experiences that produce real movement in people and teams." },
 { name: "Jackie", role: "Co-Founder", photo: JACKIE_SRC, initials: "JA",
 bio: "Background in fitness instruction, event production, equestrian therapy, and retreat hosting. Jackie shapes the human side of every ROAMSIX engagement so the experience feels intentional, personal, and well-held." },
];

const css = `
 @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

 .rs *, .rs *::before, .rs *::after { box-sizing: border-box; margin: 0; padding: 0; }
 .rs {
 font-family: 'Barlow', sans-serif; font-weight: 400;
 background: #141C2A; color: #E8DFD0; overflow-x: hidden;
 font-size: 18px; line-height: 1.65;
 --navy: #141C2A; --navy-mid: #1A2337; --panel: #0C1220;
 --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
 --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
 --gold: #B59558; --gold-dim: #876F3E;
 --rp-black: #090705; --rp-dark: #0E0B06;
 --rp-gold: #C9A84C; --rp-gold-dim: #8A7438; --rp-cream: #D0BF9A;
 }
 body.rs-no-scroll { overflow: hidden; }

 /* NAV */
 .rs-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; border-bottom: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
 .rs-nav.solid { background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom-color: rgba(181,149,88,0.12); }
 .rs-nav-brand { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
 .rs-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; line-height: 1; }
 .rs-nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin-left: 48px; }
 .rs-nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #CEC7BC; text-decoration: none; transition: color 0.2s; }
 .rs-nav-links a:hover { color: var(--cream); }
 .rs-nav-cta { background: var(--teal); color: var(--cream); padding: 9px 22px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; transition: background 0.2s; }
 .rs-nav-cta:hover { background: var(--teal-dim); color: var(--cream); }

 /* BURGER */
 .rs-burger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 44px; height: 44px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: 16px; }
 .rs-burger span { display: block; width: 24px; height: 1.5px; background: var(--cream); transition: all 0.3s ease; transform-origin: center; }
 .rs-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
 .rs-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
 .rs-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

 /* MOBILE MENU */
 .rs-mobile-menu { position: fixed; inset: 0; z-index: 490; background: rgba(6,10,18,0.99); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
 .rs-mobile-menu.open { opacity: 1; pointer-events: all; }
 .rs-mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 20px 40px; border-bottom: 1px solid rgba(232,223,208,0.07); width: 100%; text-align: center; transition: color 0.2s; }
 .rs-mobile-menu a:first-child { border-top: 1px solid rgba(232,223,208,0.07); }
 .rs-mobile-menu a:hover { color: var(--gold); }
 .rs-mobile-cta { background: var(--teal); color: var(--cream); margin-top: 32px; border: none; }

 /* BUTTONS */
 .rs-btn { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 15px 34px; text-decoration: none; cursor: pointer; border: none; transition: all 0.22s; }
 .rs-btn:active { transform: scale(0.97); }
 .rs-btn-teal { background: var(--teal); color: var(--cream); }
 .rs-btn-teal:hover { background: var(--teal-dim); }
 .rs-btn-outline { background: transparent; color: var(--cream); border: 1px solid rgba(232,223,208,0.35); }
 .rs-btn-outline:hover { border-color: var(--cream-dim); }
 .rs-btn-gold { background: var(--gold); color: var(--navy); }
 .rs-btn-gold:hover { background: var(--cream); color: var(--navy); }
 .rs-btn-rp { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 26px; border: 1px solid rgba(201,168,76,0.35); color: var(--rp-gold); text-decoration: none; transition: all 0.2s; background: transparent; cursor: pointer; }
 .rs-btn-rp:hover { border-color: var(--rp-gold); }

 /* CHROME */
 .rs-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
 .rs-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
 .rs-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
 .rs-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: 1px; line-height: 1.05; color: var(--cream); text-transform: uppercase; font-size: clamp(34px, 4.4vw, 56px); margin-top: 16px; }
 .rs-pull { font-family: 'EB Garamond', serif; font-style: italic; font-size: 22px; line-height: 1.65; color: var(--cream); }
 .rs-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); }

 /* HERO */
 .rs-hero { min-height: 100vh; position: relative; display: flex; align-items: flex-end; overflow: hidden; }
 .rs-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 35%; }
 .rs-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(20,28,42,0.4) 0%, rgba(20,28,42,0.6) 45%, rgba(20,28,42,0.9) 85%, #141C2A 100%); }
 .rs-hero-content { position: relative; z-index: 2; padding: 0 56px 96px; max-width: 860px; width: 100%; animation: rsRise 1s cubic-bezier(0.16,1,0.3,1) forwards; }
 .rs-hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(42px,5.4vw,72px); line-height: 1.05; color: var(--cream); margin-bottom: 24px; text-transform: uppercase; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
 .rs-hero-sub { font-size: 19px; line-height: 1.8; color: #E8DFD0; max-width: 560px; margin-bottom: 48px; text-shadow: 0 1px 6px rgba(0,0,0,0.7); }
 .rs-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

 /* SECTIONS */
 .rs-section { padding: 100px 56px; }
 .rs-section-dark { background: var(--panel); }
 .rs-section-mid { background: var(--navy-mid); }
 .rs-section-navy { background: var(--navy); }

 /* SECTION 2 , SCRATCH */
 .rs-scratch { display: grid; grid-template-columns: 1fr 1.1fr; gap: 80px; align-items: start; }
 .rs-scratch-body p { font-size: 19px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 22px; }
 .rs-scratch-body p:last-child { margin-bottom: 0; }
 .rs-scratch-pull { border-left: 2px solid var(--teal-dim); padding-left: 28px; margin: 32px 0; }

 /* SECTION 3 , FIT */
 .rs-fit-alts { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; margin: 36px 0; }
 .rs-fit-alt { background: var(--panel); padding: 28px 22px; border: 1px solid rgba(232,223,208,0.06); font-size: 15px; color: var(--cream-muted); line-height: 1.55; }
 .rs-fit-friction { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(20px,2.6vw,30px); font-weight: 600; color: var(--cream); letter-spacing: 0.5px; line-height: 1.3; border-left: 3px solid var(--gold); padding-left: 24px; margin: 40px 0; }
 .rs-fit-body p { font-size: 19px; line-height: 1.85; color: var(--cream-dim); margin-bottom: 20px; max-width: 720px; }
 .rs-fit-body p:last-child { margin-bottom: 0; }

 /* SECTION 4 , ENVIRONMENT */
 .rs-env { display: grid; grid-template-columns: 1fr 1.1fr; gap: 80px; align-items: start; }
 .rs-env-body p { font-size: 19px; line-height: 1.9; color: var(--cream-dim); margin-bottom: 22px; }
 .rs-env-shift { background: rgba(74,117,117,0.07); border: 1px solid rgba(74,117,117,0.18); border-left: 3px solid var(--teal); padding: 28px; margin-top: 36px; }
 .rs-env-shift p { font-size: 17px; line-height: 1.75; color: var(--cream-dim); margin-bottom: 14px; }
 .rs-env-shift p:last-child { margin-bottom: 0; }

 /* VISUAL PROOF STRIP */
 .rs-proof-strip { display: grid; grid-template-columns: 1fr 0.55fr 1fr; gap: 3px; background: #060A11; }
 .rs-strip-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; object-position: center; display: block; filter: brightness(0.85) contrast(1.05); transition: filter 0.4s; }
 .rs-strip-img:hover { filter: brightness(0.95); }
 .rs-strip-img-narrow { aspect-ratio: 4/5; object-position: center top; }

 /* SECTION 5 , HOW WE WORK */
 .rs-work-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2px; margin-top: 52px; }
 .rs-work-card { background: var(--panel); padding: 40px 36px; border: 1px solid rgba(232,223,208,0.07); transition: border-color 0.25s; }
 .rs-work-card:hover { border-color: rgba(74,117,117,0.3); }
 .rs-work-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 600; letter-spacing: 1px; color: var(--cream); text-transform: uppercase; margin-bottom: 12px; }
 .rs-work-desc { font-size: 16px; line-height: 1.75; color: var(--cream-dim); }

 /* SECTION 6 , PROVING GROUNDS */
 .rs-pg { position: relative; overflow: hidden; }
 .rs-pg-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 0.18; filter: brightness(0.8) contrast(1.1); }
 .rs-pg-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(4,7,14,0.96) 35%, rgba(4,7,14,0.80) 100%); }
 .rs-pg-inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; padding: 100px 56px; }
 .rs-pg-event-tag { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 6px 14px; background: rgba(181,149,88,0.12); border: 1px solid rgba(181,149,88,0.25); color: var(--gold); margin-bottom: 28px; }
 .rs-pg-body { font-size: 17px; line-height: 1.8; color: var(--cream-dim); margin-top: 24px; }
 .rs-pg-body p { margin-bottom: 18px; }
 .rs-pg-body p:last-child { margin-bottom: 0; }
 .rs-pg-stations { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
 .rs-pg-station { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border: 1px solid rgba(181,149,88,0.3); color: var(--gold); }
 .rs-pg-form-box { background: rgba(4,7,14,0.85); border: 1px solid rgba(232,223,208,0.1); padding: 40px; }
 .rs-pg-form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--cream); margin-bottom: 8px; }
 .rs-pg-form-sub { font-size: 14px; color: var(--cream-muted); margin-bottom: 28px; }
 .rs-pg-input, .rs-pg-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; margin-bottom: 12px; }
 .rs-pg-input:focus, .rs-pg-select:focus { border-color: var(--gold); }
 .rs-pg-input::placeholder { color: rgba(232,223,208,0.3); }
 .rs-pg-submit { width: 100%; padding: 15px; background: var(--gold); color: var(--navy); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.22s; margin-top: 4px; }
 .rs-pg-submit:hover { background: var(--cream); }
 .rs-pg-submit:disabled { opacity: 0.6; cursor: not-allowed; }
 .rs-pg-note { font-size: 13px; color: var(--cream-muted); margin-top: 12px; text-align: center; }

 /* SECTION 7 , PRODUCES */
 .rs-produces { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
 .rs-produces-list { list-style: none; margin-top: 8px; }
 .rs-produces-list li { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 400; letter-spacing: 0.5px; color: var(--cream); padding: 22px 0; border-bottom: 1px solid rgba(232,223,208,0.1); line-height: 1.4; }
 .rs-produces-list li:first-child { border-top: 1px solid rgba(232,223,208,0.1); }

 /* SECTION 8 , FOUNDERS */
 .rs-founders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 52px; }
 .rs-founder-card { background: var(--navy-mid); border: 1px solid rgba(232,223,208,0.07); padding: 36px; display: flex; gap: 28px; align-items: flex-start; }
 .rs-founder-photo-wrap { width: 100px; height: 130px; flex-shrink: 0; overflow: hidden; background: rgba(74,117,117,0.12); }
 .rs-founder-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
 .rs-founder-init { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 600; letter-spacing: 2px; color: var(--teal); }
 .rs-founder-role { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
 .rs-founder-name { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--cream); margin-bottom: 14px; }
 .rs-founder-bio { font-size: 15px; line-height: 1.75; color: var(--cream-dim); }
 .rs-founders-note { margin-top: 40px; padding-top: 36px; border-top: 1px solid rgba(232,223,208,0.08); }
 .rs-founders-note p { font-size: 17px; color: var(--cream-dim); line-height: 1.8; margin-bottom: 16px; max-width: 680px; }

 /* PODCAST */
 .rs-podcast { background: var(--rp-dark); border-top: 1px solid rgba(201,168,76,0.1); }
 .rs-podcast-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; padding: 100px 56px; }
 .rs-podcast-art { position: relative; background: var(--rp-black); aspect-ratio: 1; max-width: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px; border: 1px solid rgba(201,168,76,0.15); overflow: hidden; }
 .rs-podcast-frame { position: absolute; inset: 12px; border: 1px solid rgba(201,168,76,0.08); }
 .rs-rp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--rp-gold); text-align: center; line-height: 1.2; position: relative; z-index: 1; }
 .rs-rp-sub { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--rp-gold-dim); margin-top: 8px; position: relative; z-index: 1; }
 .rs-rp-divider { width: 40px; height: 1px; background: var(--rp-gold-dim); margin: 16px auto; }
 .rs-rp-tag { font-size: 13px; color: var(--rp-cream); letter-spacing: 1px; font-style: italic; font-family: 'EB Garamond', serif; position: relative; z-index: 1; }
 .rs-podcast-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--rp-gold-dim); margin-bottom: 18px; }
 .rs-podcast-h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(38px,4.2vw,54px); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--rp-gold); margin-bottom: 18px; line-height: 1.05; }
 .rs-podcast-tagline { font-family: 'EB Garamond', serif; font-style: italic; font-size: 20px; color: var(--rp-cream); margin-bottom: 24px; line-height: 1.55; }
 .rs-podcast-desc { font-size: 17px; line-height: 1.8; color: rgba(208,191,154,0.75); margin-bottom: 36px; }
 .rs-platform { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 8px 16px; border: 1px solid rgba(201,168,76,0.25); color: var(--rp-gold-dim); text-decoration: none; margin-right: 10px; margin-bottom: 10px; transition: all 0.2s; }
 .rs-platform:hover { border-color: var(--rp-gold); color: var(--rp-gold); }

 /* CONTACT */
 .rs-contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start; }
 .rs-contact-intro p { font-size: 18px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 20px; }
 .rs-contact-links { margin-top: 32px; }
 .rs-contact-links a { display: block; color: var(--teal-light); text-decoration: none; font-size: 16px; margin-bottom: 12px; transition: color 0.2s; }
 .rs-contact-links a:hover { color: var(--cream); }
 .rs-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
 .rs-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
 .rs-form-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }
 .rs-input, .rs-select, .rs-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; }
 .rs-input:focus, .rs-select:focus, .rs-textarea:focus { border-color: var(--teal); }
 .rs-input::placeholder, .rs-textarea::placeholder { color: rgba(232,223,208,0.3); }
 .rs-textarea { resize: vertical; min-height: 120px; }
 .rs-form-err { color: #E07070; font-size: 14px; margin-top: 8px; }
 .rs-form-success { background: rgba(74,117,117,0.12); border: 1px solid rgba(74,117,117,0.3); padding: 20px 24px; }
 .rs-form-success p { color: var(--cream-dim); font-size: 16px; line-height: 1.65; }

 /* FOOTER */
 .rs-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 72px 56px 48px; }
 .rs-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
 .rs-footer-wm { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; margin-bottom: 16px; }
 .rs-footer-tag { font-size: 15px; color: var(--cream-dim); line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
 .rs-footer-social { display: flex; gap: 16px; }
 .rs-footer-social a { font-size: 13px; color: var(--teal-light); text-decoration: none; transition: color 0.2s; }
 .rs-footer-social a:hover { color: var(--cream); }
 .rs-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream); margin-bottom: 20px; }
 .rs-footer-col ul { list-style: none; }
 .rs-footer-col ul li { margin-bottom: 12px; }
 .rs-footer-col ul a { font-size: 14px; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
 .rs-footer-col ul a:hover { color: var(--cream); }
 .rs-footer-bottom { border-top: 1px solid rgba(232,223,208,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
 .rs-footer-copy { font-size: 13px; color: rgba(232,223,208,0.3); }

 /* ANIMATIONS */
 @keyframes rsRise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

 /* RESPONSIVE */
 @media (max-width: 900px) {
 .rs-nav-links { display: none; }
 .rs-burger { display: flex; }
 .rs-section { padding: 72px 24px; }
 .rs-hero-content { padding: 0 24px 72px; }
 .rs-scratch { grid-template-columns: 1fr; gap: 40px; }
 .rs-fit-alts { grid-template-columns: 1fr 1fr; }
 .rs-env { grid-template-columns: 1fr; gap: 40px; }
 .rs-work-grid { grid-template-columns: 1fr; }
 .rs-proof-strip { grid-template-columns: 1fr 1fr; }
 .rs-strip-img-narrow { display: none; }
 .rs-pg-inner { grid-template-columns: 1fr; gap: 48px; padding: 72px 24px; }
 .rs-produces { grid-template-columns: 1fr; gap: 40px; }
 .rs-founders-grid { grid-template-columns: 1fr; }
 .rs-podcast-inner { grid-template-columns: 1fr; gap: 48px; padding: 72px 24px; }
 .rs-contact-grid { grid-template-columns: 1fr; gap: 52px; }
 .rs-footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
 .rs-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
 .rs-form-row { grid-template-columns: 1fr; }
 .rs-nav { padding: 0 24px; }
 .rs-footer { padding: 56px 24px 36px; }
 }
 @media (max-width: 480px) {
 .rs-fit-alts { grid-template-columns: 1fr; }
 .rs-founder-card { flex-direction: column; }
 }
`;

export default function HomePage() {
 const [scrolled, setScrolled] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const [heroErr, setHeroErr] = useState(false);
 const [pg, setPg] = useState({ name:"", email:"", role:"" });
 const [pgStatus, setPgStatus] = useState("idle");
 const [pgErr, setPgErr] = useState("");
 const [contact, setContact] = useState({ first:"", last:"", email:"", company:"", type:"", message:"" });
 const [ctStatus, setCtStatus] = useState("idle");
 const [ctErr, setCtErr] = useState("");

 useEffect(() => {
 document.body.classList.toggle("rs-no-scroll", menuOpen);
 return () => document.body.classList.remove("rs-no-scroll");
 }, [menuOpen]);

 useEffect(() => {
 const fn = () => setScrolled(window.scrollY > 30);
 window.addEventListener("scroll", fn);
 return () => window.removeEventListener("scroll", fn);
 }, []);

 const close = () => setMenuOpen(false);

 /* ── FORM HANDLERS , DO NOT MODIFY ──────────────────────────────────────── */
 const submitPG = async () => {
 if (!pg.name.trim() || !pg.email.trim()) { setPgErr("Please enter your name and email."); return; }
 setPgStatus("loading"); setPgErr("");
 try {
 const res = await fetch("/api/pg-interest", {
 method: "POST", headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name: pg.name.trim(), email: pg.email.trim(), role: pg.role, source: "Proving Grounds Waitlist" }),
 });
 if (res.ok) { setPgStatus("success"); }
 else { const d = await res.json().catch(()=>({})); setPgErr(d.error || "Submission failed. Please email info@roamsix.com directly."); setPgStatus("idle"); }
 } catch { setPgErr("Network error. Please email info@roamsix.com directly."); setPgStatus("idle"); }
 };

 const submitContact = async () => {
 if (!contact.email.trim() || !contact.message.trim()) { setCtErr("Please enter your email and message."); return; }
 setCtStatus("loading"); setCtErr("");
 try {
 const res = await fetch("/api/contact", {
 method: "POST", headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ firstName: contact.first.trim(), lastName: contact.last.trim(), email: contact.email.trim(), company: contact.company.trim(), inquiryType: contact.type, message: contact.message.trim(), source: "Homepage Contact Form" }),
 });
 if (res.ok) { setCtStatus("success"); }
 else { const d = await res.json().catch(()=>({})); setCtErr(d.error || "Submission failed. Please email info@roamsix.com directly."); setCtStatus("idle"); }
 } catch { setCtErr("Network error. Please email info@roamsix.com directly."); setCtStatus("idle"); }
 };

 return (
 <div className="rs">
 <style>{css}</style>

 {/* MOBILE MENU */}
 <div className={`rs-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
 {NAV.map(([l,h]) => <a key={l} href={h} onClick={close}>{l}</a>)}
 <a href="#contact" className="rs-mobile-cta" onClick={close}>Inquire</a>
 </div>

 {/* NAV */}
 <nav className={`rs-nav ${scrolled ? "solid" : ""}`}>
 <a className="rs-nav-brand" href="/"><span className="rs-wordmark">ROAMSIX</span></a>
 <ul className="rs-nav-links">
 {NAV.map(([l,h]) => <li key={l}><a href={h}>{l}</a></li>)}
 <li><a href="#contact" className="rs-nav-cta">Inquire</a></li>
 </ul>
 <button className={`rs-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
 <span/><span/><span/>
 </button>
 </nav>

 {/* ── 1. HERO ── */}
 <section className="rs-hero">
 {/* VIDEO PLACEHOLDER: replace img with <video autoPlay muted loop playsInline poster={HERO_SRC}><source src="/videos/homepage/roamsix-hero.mp4" type="video/mp4"/></video> */}
 <img className="rs-hero-img" src={heroErr ? HERO_FALLBACK : HERO_SRC} alt="ROAMSIX" onError={() => setHeroErr(true)}/>
 <div className="rs-hero-overlay"/>
 <div className="rs-hero-content">
 <div className="rs-label-row" style={{marginBottom:"22px"}}>
 <span className="rs-rule" style={{background:"#E8DFD0"}}/>
 <span className="rs-label" style={{color:"#E8DFD0",textShadow:"0 1px 4px rgba(0,0,0,0.9)"}}>Offsites and Retreats</span>
 </div>
 <h1 className="rs-hero-h1">Offsites built around<br/>what needs to<br/>happen next.</h1>
 <p className="rs-hero-sub">Most teams arrive somewhere new and run the same conversation they've been having for months. ROAMSIX builds the conditions where that stops.</p>
 <div className="rs-hero-actions">
 <a href="#contact" className="rs-btn rs-btn-teal">Start a Conversation</a>
 <a href="#how-we-work" className="rs-btn rs-btn-outline">See How It Works</a>
 </div>
 </div>
 </section>

 {/* ── 2. YOU'VE ALREADY TRIED ── */}
 <section className="rs-section rs-section-dark" id="about">
 <div className="rs-scratch">
 <div>
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">The Problem</span></div>
 <h2 className="rs-h2">You've already tried the obvious options.</h2>
 </div>
 <div className="rs-scratch-body">
 <p>You've done the offsite. The team-building day. The consultant with the framework.</p>
 <p>The time was spent. The budget was used. Very little changed after.</p>
 <div className="rs-scratch-pull">
 <p className="rs-pull">What you're dealing with now needs to be structured differently.</p>
 </div>
 </div>
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 3. WHERE WE FIT ── */}
 <section className="rs-section rs-section-navy" id="where-we-fit">
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Where We Fit</span></div>
 <h2 className="rs-h2">Where this fits.</h2>
 <p style={{fontSize:"19px",lineHeight:"1.85",color:"var(--cream-dim)",marginTop:"28px",marginBottom:"0"}}>Most teams choose between:</p>
 <div className="rs-fit-alts">
 {["A hotel offsite with a packed agenda","A conference that sounds valuable but doesn't carry back into the business","A team outing that feels good for a day","A consultant who hands over a deck"].map(a=>(
 <div className="rs-fit-alt" key={a}>{a}</div>
 ))}
 </div>
 <p style={{fontSize:"19px",lineHeight:"1.85",color:"var(--cream-dim)",marginBottom:"0"}}>Those all have a place. They just don't solve what most teams come to us for.</p>
 <div className="rs-fit-friction">
 Work slows down. Decisions get revisited.<br/>The same conversations keep happening.
 </div>
 <div className="rs-fit-body">
 <p>ROAMSIX is brought in when the experience needs to produce something that carries back into the work.</p>
 <p>We design and run the entire experience around what needs to come out of it.</p>
 <p style={{color:"var(--cream)",fontWeight:"500"}}>Most clients contact us before they've booked a location.</p>
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 4. WHAT CHANGES ── */}
 <section className="rs-section rs-section-dark" id="approach-preview">
 <div className="rs-env">
 <div>
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">What Changes</span></div>
 <h2 className="rs-h2">What changes when the environment is right.</h2>
 <div style={{marginTop:"32px"}}>
 <a href="/approach" className="rs-btn rs-btn-outline" style={{fontSize:"12px"}}>Read Our Approach</a>
 </div>
 </div>
 <div>
 <div className="rs-env-body">
 <p>Most teams are running harder than they should be, with less clarity than they used to have.</p>
 <p>What gets said is filtered. What gets held back stays hidden.</p>
 <p>When the environment changes, that shifts.</p>
 </div>
 <div className="rs-env-shift">
 <p>People show how they think. How they contribute. Where they create value.</p>
 <p>Teams start to see each other clearly. Decisions get made faster and with less friction.</p>
 </div>
 </div>
 </div>
 </section>

 {/* VISUAL PROOF STRIP */}
 <div className="rs-proof-strip">
 <img src={TEAM_SRC} alt="ROAMSIX team in the field" loading="lazy" className="rs-strip-img" onError={e=>{e.target.style.display="none"}}/>
 <img src={NOTES_SRC} alt="Field facilitation" loading="lazy" className="rs-strip-img rs-strip-img-narrow" onError={e=>{e.target.style.display="none"}}/>
 <img src={HERO_SRC} alt="ROAMSIX terrain" loading="lazy" className="rs-strip-img" onError={e=>{e.target.style.display="none"}}/>
 </div>

 {/* ── 5. HOW WE WORK ── */}
 <section className="rs-section rs-section-navy" id="how-we-work">
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">How We Work</span></div>
 <h2 className="rs-h2">Ways we work.</h2>
 <div className="rs-work-grid" id="experiences">
 {HOW_WE_WORK.map(w => (
 <div className="rs-work-card" key={w.title}>
 <div className="rs-work-title">{w.title}</div>
 <p className="rs-work-desc">{w.desc}</p>
 </div>
 ))}
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 6. PROVING GROUNDS ── */}
 <section className="rs-pg" id="proving-grounds">
 <img className="rs-pg-bg-img" src={PG_SRC} alt="Proving Grounds" loading="lazy" onError={e=>{e.target.style.display="none"}}/>
 <div className="rs-pg-overlay"/>
 {/* VIDEO PLACEHOLDER: /public/videos/homepage/proving-grounds.mp4 */}
 <div className="rs-pg-inner">
 <div>
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Proving Grounds</span></div>
 <h2 className="rs-h2">See how your team actually operates.</h2>
 <div className="rs-pg-body">
 <p>A one-day structured environment designed to surface how your team operates under pressure.</p>
 <p>How decisions get made when variables change. How communication holds or breaks. What people default to when the answer isn't obvious.</p>
 <p>Used by teams who want a clear read before making larger moves.</p>
 </div>
 <div className="rs-pg-stations">
 {["Terrain","Strength","Engine","Control","Power","Grit"].map(s=>(
 <span className="rs-pg-station" key={s}>{s}</span>
 ))}
 </div>
 </div>
 <div>
 <div className="rs-pg-form-box">
 {pgStatus === "success" ? (
 <div className="rs-form-success">
 <p>You're on the list. We'll be in touch directly when registration opens.</p>
 </div>
 ) : (
 <>
 <div className="rs-pg-form-title">Ask About Proving Grounds</div>
 <div className="rs-pg-form-sub">Be contacted when registration opens.</div>
 <input className="rs-pg-input" placeholder="Full Name" value={pg.name} onChange={e=>setPg(p=>({...p,name:e.target.value}))}/>
 <input className="rs-pg-input" placeholder="Email Address" type="email" value={pg.email} onChange={e=>setPg(p=>({...p,email:e.target.value}))}/>
 <select className="rs-pg-select" value={pg.role} onChange={e=>setPg(p=>({...p,role:e.target.value}))}>
 <option value="">I am joining as...</option>
 <option value="Athlete">Athlete</option>
 <option value="Coach">Coach</option>
 <option value="Corporate Team">Corporate Team</option>
 <option value="Individual">Individual</option>
 </select>
 {pgErr && <p className="rs-form-err">{pgErr}</p>}
 <button className="rs-pg-submit" onClick={submitPG} disabled={pgStatus==="loading"}>
 {pgStatus === "loading" ? "Sending..." : "Request Proving Grounds Info"}
 </button>
 <p className="rs-pg-note">No commitment required. We will contact you directly.</p>
 </>
 )}
 </div>
 </div>
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 7. WHAT THIS PRODUCES ── */}
 <section className="rs-section rs-section-dark" id="what-this-produces">
 <div className="rs-produces">
 <div>
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Outcomes</span></div>
 <h2 className="rs-h2">What this is designed to produce.</h2>
 </div>
 <ul className="rs-produces-list">
 {WHAT_PRODUCES.map(item => <li key={item}>{item}</li>)}
 </ul>
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 8. FOUNDERS ── */}
 <section className="rs-section rs-section-dark" id="founders">
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">The Founding Team</span></div>
 <h2 className="rs-h2">Built by people who've done the work.</h2>
 <div className="rs-founders-grid">
 {FOUNDERS.map(f => (
 <div className="rs-founder-card" key={f.name}>
 <div className="rs-founder-photo-wrap">
 <img className="rs-founder-img" src={f.photo} alt={f.name} loading="lazy"
 onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
 <div className="rs-founder-init" style={{display:"none"}}>{f.initials}</div>
 </div>
 <div>
 <div className="rs-founder-role">{f.role}</div>
 <div className="rs-founder-name">{f.name}</div>
 <p className="rs-founder-bio">{f.bio}</p>
 </div>
 </div>
 ))}
 </div>
 <div className="rs-founders-note">
 <p>ROAMSIX was built by operators with backgrounds in performance, team environments, and experience design. The work is grounded in real-world execution and informed by proven principles in human performance, behavior, and team dynamics.</p>
 <p>ROAMSIX also works with individuals. Founders, executives, and high-performers navigating transitions who need a structured environment to think clearly.</p>
 <a href="/team" className="rs-btn rs-btn-outline" style={{fontSize:"12px"}}>Meet the Team</a>
 </div>
 </section>

 <hr className="rs-hr"/>

 {/* ── 9. PODCAST ── */}
 <section className="rs-podcast" id="podcast">
 <div className="rs-podcast-inner">
 <div className="rs-podcast-art">
 <div className="rs-podcast-frame"/>
 <img src={RP_LOGO} alt="Redirection Point" style={{width:"100%",height:"auto",display:"block",position:"relative",zIndex:1}}
 onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}/>
 <div style={{display:"none",textAlign:"center"}}>
 <div className="rs-rp-wordmark">Redirection<br/>Point</div>
 <div className="rs-rp-sub">A ROAMSIX Podcast</div>
 <div className="rs-rp-divider"/>
 <div className="rs-rp-tag">Where Paths Converge</div>
 </div>
 </div>
 <div>
 <div className="rs-podcast-label">The Podcast</div>
 <h2 className="rs-podcast-h2">Redirection Point.</h2>
 <p className="rs-podcast-tagline">Conversations with operators, founders, and athletes at the moments where things shifted.</p>
 <p className="rs-podcast-desc">Every high-performer reaches a point where the path changed. We explore those moments with the people who built something meaningful on the other side.</p>
 <div>
 {[["YouTube","https://www.youtube.com/@RedirectionPoint"],["Instagram","https://www.instagram.com/redirectionpoint"],["Spotify","#"],["Apple Podcasts","#"]].map(([p,url]) => (
 <a href={url} className="rs-platform" key={p} target="_blank" rel="noopener noreferrer">{p}</a>
 ))}
 </div>
 <div style={{marginTop:"28px"}}>
 <a href="https://www.youtube.com/@RedirectionPoint" className="rs-btn-rp" target="_blank" rel="noopener noreferrer">Watch or Listen</a>
 </div>
 </div>
 </div>
 </section>

 {/* ── 10. CONTACT ── */}
 <section className="rs-section rs-section-dark" id="contact">
 <div className="rs-contact-grid">
 <div className="rs-contact-intro">
 <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Start Here</span></div>
 <h2 className="rs-h2">Start with a conversation.</h2>
 <p>Every engagement starts with a direct conversation about what's actually going on.</p>
 <p>If there's a fit, we build from there.</p>
 <div className="rs-contact-links">
 <a href="mailto:info@roamsix.com">info@roamsix.com</a>
 <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a>
 <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
 </div>
 </div>
 <div>
 {ctStatus === "success" ? (
 <div className="rs-form-success">
 <p>We received your message and will follow up directly within 48 hours.</p>
 </div>
 ) : (
 <>
 <div className="rs-form-row">
 <div className="rs-form-group"><label className="rs-form-label">First Name</label><input className="rs-input" placeholder="First" value={contact.first} onChange={e=>setContact(c=>({...c,first:e.target.value}))}/></div>
 <div className="rs-form-group"><label className="rs-form-label">Last Name</label><input className="rs-input" placeholder="Last" value={contact.last} onChange={e=>setContact(c=>({...c,last:e.target.value}))}/></div>
 </div>
 <div className="rs-form-group"><label className="rs-form-label">Email *</label><input className="rs-input" placeholder="your@email.com" type="email" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))}/></div>
 <div className="rs-form-group"><label className="rs-form-label">Company or Organization</label><input className="rs-input" placeholder="Optional" value={contact.company} onChange={e=>setContact(c=>({...c,company:e.target.value}))}/></div>
 <div className="rs-form-group">
 <label className="rs-form-label">What are you looking for?</label>
 <select className="rs-select" value={contact.type} onChange={e=>setContact(c=>({...c,type:e.target.value}))}>
 <option value="">Select one</option>
 <option value="Leadership Offsite">Leadership Offsite</option>
 <option value="Team Session">Team Session</option>
 <option value="Individual or Small Group">Individual or Small Group</option>
 <option value="Proving Grounds">Proving Grounds</option>
 <option value="Partnership">Partnership</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div className="rs-form-group"><label className="rs-form-label">Tell us what's going on *</label><textarea className="rs-textarea" placeholder="What's the situation? What needs to change?" value={contact.message} onChange={e=>setContact(c=>({...c,message:e.target.value}))}/></div>
 {ctErr && <p className="rs-form-err">{ctErr}</p>}
 <button className="rs-btn rs-btn-teal" style={{width:"100%",textAlign:"center",marginTop:"8px"}} onClick={submitContact} disabled={ctStatus==="loading"}>
 {ctStatus === "loading" ? "Sending..." : "Start a Conversation"}
 </button>
 </>
 )}
 </div>
 </div>
 </section>

 {/* FOOTER */}
 <footer className="rs-footer">
 <div className="rs-footer-top">
 <div>
 <div className="rs-footer-wm">ROAMSIX</div>
 <p className="rs-footer-tag">Environment-led experience design for teams and high-performers.</p>
 <div className="rs-footer-social">
 <a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">Instagram</a>
 <a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
 </div>
 </div>
 <div className="rs-footer-col"><h4>Company</h4><ul>
 <li><a href="#about">About</a></li>
 <li><a href="/approach">Approach</a></li>
 <li><a href="/team">Team</a></li>
 </ul></div>
 <div className="rs-footer-col"><h4>Experiences</h4><ul>
 <li><a href="#how-we-work">How We Work</a></li>
 <li><a href="#proving-grounds">Proving Grounds</a></li>
 <li><a href="#contact">Inquire</a></li>
 </ul></div>
 <div className="rs-footer-col"><h4>Connect</h4><ul>
 <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
 <li><a href="https://www.instagram.com/roamsix_" target="_blank" rel="noopener noreferrer">@roamsix_</a></li>
 <li><a href="https://www.linkedin.com/company/roamsix/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
 </ul></div>
 <div className="rs-footer-col"><h4>Redirection Point</h4><ul>
 <li><a href="https://www.youtube.com/@RedirectionPoint" target="_blank" rel="noopener noreferrer">YouTube</a></li>
 <li><a href="https://www.instagram.com/redirectionpoint" target="_blank" rel="noopener noreferrer">Instagram</a></li>
 <li><a href="#podcast">About the Podcast</a></li>
 </ul></div>
 </div>
 <div className="rs-footer-bottom">
 <span className="rs-footer-copy">© {new Date().getFullYear()} Reciprofy Inc. All rights reserved.</span>
 <span className="rs-footer-copy">ROAMSIX , Murrieta, CA</span>
 </div>
 </footer>
 </div>
 );
}
