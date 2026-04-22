import { useState, useEffect } from "react";

/*
  ROAMSIX — HomePage.jsx
  Design: v5 — Environment-Led Experience Design
  Assets: drop files into /public/images/ and /public/videos/
  
  Image slots:
    /public/images/roamsix-hero.jpg       ← hero background (replace HERO_SRC below)
    /public/images/max-ouellette.jpg      ← founder photo
    /public/images/jackie.jpg             ← founder photo
    /public/images/proving-grounds.jpg    ← PG section background
  
  Video slot:
    /public/videos/roamsix-hero.mp4       ← hero video (optional, see HeroMedia)
*/

// ─── ASSET PATHS ─────────────────────────────────────────────────────────────
// Replace these with your actual files once dropped into /public/
const HERO_SRC = "/images/roamsix-hero.jpg";           // your hero image
const MAX_SRC  = "/images/max-ouellette.jpg";           // Max portrait
const JACKIE_SRC = "/images/jackie.jpg";                // Jackie portrait
const PG_SRC   = "/images/proving-grounds.jpg";         // Proving Grounds bg

// Fallback hero while real image is pending — dark cinematic landscape
const HERO_FALLBACK = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80&auto=format&fit=crop";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .rs *, .rs *::before, .rs *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rs {
    font-family: 'Barlow', sans-serif;
    font-weight: 400;
    background: #141C2A;
    color: #E8DFD0;
    overflow-x: hidden;
    font-size: 18px;
    line-height: 1.65;
  }

  /* ── TOKENS ── */
  .rs {
    --navy:       #141C2A;
    --navy-mid:   #1F2B3E;
    --navy-panel: #0F1622;
    --teal:       #4A7575;
    --teal-dim:   #3A5A5A;
    --teal-light: #5A8A8A;
    --cream:      #E8DFD0;
    --cream-dim:  #C8C0B4;
    --cream-muted:#8C887F;
    --gold:       #B59558;
    --gold-dim:   #876F3E;
    --rp-black:   #090705;
    --rp-dark:    #0E0B06;
    --rp-gold:    #C9A84C;
    --rp-gold-dim:#8A7438;
    --rp-cream:   #D0BF9A;
  }

  /* ── NAV ── */
  .rs-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 500;
    display: flex; align-items: center;
    padding: 0 52px; height: 76px;
    border-bottom: 1px solid transparent;
    transition: background 0.4s, border-color 0.4s;
  }
  .rs-nav.solid {
    background: rgba(10,15,24,0.97);
    backdrop-filter: blur(20px);
    border-bottom-color: rgba(181,149,88,0.12);
  }
  .rs-nav-brand {
    display: flex; align-items: center;
    text-decoration: none; margin-right: auto;
  }
  .rs-wordmark {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 26px;
    letter-spacing: 2.5px; color: var(--cream);
    text-transform: uppercase; line-height: 1;
  }
  .rs-nav-links {
    display: flex; align-items: center;
    gap: 28px; list-style: none; margin-left: 48px;
  }
  .rs-nav-links a {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 500; letter-spacing: 2px;
    text-transform: uppercase; color: #B8B0A4;
    text-decoration: none; transition: color 0.2s;
  }
  .rs-nav-links a:hover { color: var(--cream); }
  .rs-nav-inquire {
    background: var(--teal) !important;
    color: var(--cream) !important;
    padding: 9px 22px; transition: background 0.2s !important;
  }
  .rs-nav-inquire:hover { background: var(--teal-dim) !important; }

  /* ── BUTTONS ── */
  .rs-btn {
    display: inline-block;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; font-size: 13px; letter-spacing: 3px;
    text-transform: uppercase; padding: 15px 34px;
    text-decoration: none; cursor: pointer; border: none;
    transition: all 0.22s;
  }
  .rs-btn-teal { background: var(--teal); color: var(--cream); }
  .rs-btn-teal:hover { background: var(--teal-dim); }
  .rs-btn-outline {
    background: transparent; color: var(--cream);
    border: 1px solid rgba(232,223,208,0.3);
  }
  .rs-btn-outline:hover { border-color: var(--cream-dim); }
  .rs-btn-gold { background: var(--gold); color: var(--navy); }
  .rs-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .rs-btn-rp {
    display: inline-block;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 500; font-size: 12px; letter-spacing: 3px;
    text-transform: uppercase; padding: 12px 26px;
    border: 1px solid rgba(201,168,76,0.35);
    color: var(--rp-gold); text-decoration: none;
    transition: all 0.2s; background: transparent; cursor: pointer;
  }
  .rs-btn-rp:hover { border-color: var(--rp-gold); background: rgba(201,168,76,0.05); }

  /* ── CHROME ── */
  .rs-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .rs-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .rs-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 500; font-size: 12px;
    letter-spacing: 4px; text-transform: uppercase; color: var(--gold);
  }
  .rs-h2 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; letter-spacing: 1px; line-height: 1.05;
    color: var(--cream); text-transform: uppercase;
    font-size: clamp(36px, 4.8vw, 60px);
    margin-top: 16px;
  }
  .rs-body { font-weight: 400; font-size: 18px; line-height: 1.8; color: var(--cream-dim); }
  .rs-body-sm { font-weight: 400; font-size: 16px; line-height: 1.75; color: var(--cream-dim); }
  .rs-pull {
    font-family: 'EB Garamond', serif;
    font-style: italic; font-size: 24px;
    line-height: 1.6; color: var(--cream);
  }
  .rs-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.16), transparent); }

  /* ── HERO ── */
  .rs-hero {
    min-height: 100vh; position: relative;
    display: flex; align-items: flex-end; overflow: hidden;
  }
  .rs-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 30%;
  }
  .rs-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(14,20,32,0.15) 0%,
      rgba(14,20,32,0.38) 35%,
      rgba(14,20,32,0.80) 68%,
      rgba(14,20,32,0.97) 90%,
      #141C2A 100%
    );
  }
  .rs-hero-content {
    position: relative; z-index: 2;
    padding: 0 56px 96px; max-width: 960px;
    animation: rsRise 1s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .rs-hero-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: clamp(44px, 5.8vw, 76px);
    line-height: 1.05; letter-spacing: 0.5px;
    color: var(--cream); margin-bottom: 24px;
    text-transform: uppercase;
  }
  .rs-hero-sub {
    font-size: 20px; line-height: 1.75;
    color: var(--cream-dim); max-width: 580px;
    margin-bottom: 48px; font-weight: 400;
  }
  .rs-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

  /* ── PROOF BAR ── */
  .rs-proof-bar {
    background: #0A0F1A;
    border-bottom: 1px solid rgba(181,149,88,0.1);
    padding: 44px 56px;
    display: grid; grid-template-columns: repeat(4, 1fr);
  }
  .rs-proof-item {
    padding: 0 28px;
    border-right: 1px solid rgba(232,223,208,0.07);
  }
  .rs-proof-item:first-child { padding-left: 0; }
  .rs-proof-item:last-child { border-right: none; }
  .rs-proof-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 38px; font-weight: 700;
    color: var(--cream); letter-spacing: 1px;
    line-height: 1; margin-bottom: 6px;
  }
  .rs-proof-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--cream); margin-bottom: 5px;
  }
  .rs-proof-label { font-size: 14px; color: var(--cream-dim); font-weight: 400; line-height: 1.5; }

  /* ── ABOUT ── */
  .rs-about {
    background: var(--navy-panel);
    padding: 108px 56px;
    display: grid; grid-template-columns: 1fr 1.15fr;
    gap: 88px; align-items: start;
  }
  .rs-about-right { max-width: 760px; }
  .rs-about-right p { font-size: 19px; line-height: 1.85; margin-bottom: 24px; color: var(--cream-dim); font-weight: 400; }
  .rs-about-right p:last-child { margin-bottom: 0; }
  .rs-about-pull { border-left: 2px solid var(--teal-dim); padding-left: 28px; margin: 36px 0; }

  /* ── DESIGNED FOR ── */
  .rs-for { padding: 108px 56px; background: var(--navy-mid); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-for-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 56px; }
  .rs-for-card {
    padding: 44px 34px; background: rgba(10,15,24,0.7);
    border: 1px solid rgba(232,223,208,0.07); position: relative;
  }
  .rs-for-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right, var(--gold-dim), transparent); }
  .rs-for-icon { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: rgba(181,149,88,0.25); margin-bottom: 18px; }
  .rs-for-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cream); margin-bottom: 12px; line-height: 1.15; }
  .rs-for-desc { font-size: 16px; line-height: 1.75; color: var(--cream-dim); font-weight: 400; }

  /* ── OFFERINGS ── */
  .rs-offerings { padding: 108px 56px; background: var(--navy-panel); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-offerings-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; margin-top: 56px; }
  .rs-offerings-col-header {
    padding: 18px 32px 16px; background: rgba(8,12,20,0.9);
    border: 1px solid rgba(232,223,208,0.07); border-bottom: 2px solid var(--teal-dim);
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 2px;
  }
  .rs-offering {
    padding: 34px 32px 32px; background: rgba(8,12,20,0.65);
    border: 1px solid rgba(232,223,208,0.06); border-top: none;
    transition: background 0.25s, border-color 0.25s;
  }
  .rs-offering:hover { background: rgba(74,117,117,0.07); border-color: rgba(74,117,117,0.18); }
  .rs-offering-num { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: var(--gold-dim); margin-bottom: 10px; font-weight: 500; }
  .rs-offering-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cream); margin-bottom: 12px; line-height: 1.15; }
  .rs-offering-desc { font-size: 15px; line-height: 1.75; color: var(--cream-dim); font-weight: 400; }

  /* ── PATHWAYS ── */
  .rs-pathways { display: grid; grid-template-columns: 1fr 1fr; }
  .rs-pathway { padding: 88px 56px; }
  .rs-pathway-org { background: var(--navy-panel); border-right: 1px solid rgba(181,149,88,0.08); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-pathway-ind { background: var(--navy); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-pathway-h3 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px,3vw,42px); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--cream); margin-bottom: 18px; line-height: 1.05; margin-top: 16px; }
  .rs-pathway-desc { font-size: 17px; line-height: 1.8; margin-bottom: 36px; max-width: 500px; color: var(--cream-dim); font-weight: 400; }
  .rs-pathway-list { list-style: none; border-top: 1px solid rgba(232,223,208,0.07); margin-bottom: 40px; }
  .rs-pathway-list li { font-size: 16px; color: var(--cream-dim); padding: 13px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; gap: 14px; font-weight: 400; line-height: 1.55; align-items: flex-start; }
  .rs-pathway-list li span { color: var(--teal); flex-shrink: 0; margin-top: 2px; }

  /* ── WHY ── */
  .rs-why { padding: 108px 56px; background: var(--navy-mid); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-why-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; margin-top: 56px; }
  .rs-why-card { padding: 44px 32px; background: rgba(8,12,20,0.6); border: 1px solid rgba(232,223,208,0.06); position: relative; overflow: hidden; }
  .rs-why-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--teal-dim); transform: scaleX(0); transform-origin: left; transition: transform 0.35s; }
  .rs-why-card:hover::before { transform: scaleX(1); }
  .rs-why-num { font-family: 'Barlow Condensed', sans-serif; font-size: 48px; font-weight: 700; color: rgba(74,117,117,0.16); line-height: 1; margin-bottom: 20px; }
  .rs-why-title { font-family: 'Barlow Condensed', sans-serif; font-size: 19px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cream); margin-bottom: 14px; line-height: 1.2; }
  .rs-why-text { font-size: 16px; line-height: 1.75; color: var(--cream-dim); font-weight: 400; }

  /* ── FOUNDERS ── */
  .rs-founders { padding: 108px 56px; background: var(--navy-panel); border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-founders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 56px; }
  .rs-founder { display: grid; grid-template-columns: 200px 1fr; gap: 36px; align-items: start; border: 1px solid rgba(232,223,208,0.07); padding: 36px; background: rgba(8,12,20,0.5); }
  .rs-founder-img-wrap { width: 200px; flex-shrink: 0; position: relative; }
  .rs-founder-img { width: 100%; aspect-ratio: 2/3; object-fit: cover; object-position: center top; display: block; }
  .rs-founder-placeholder { width: 100%; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; }
  .rs-founder-initials { font-family: 'Barlow Condensed', sans-serif; font-size: 52px; font-weight: 700; letter-spacing: 4px; color: rgba(232,223,208,0.07); }
  .rs-founder-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
  .rs-founder-role { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; font-weight: 500; }
  .rs-founder-name { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cream); margin-bottom: 18px; line-height: 1.05; }
  .rs-founder-bio { font-size: 16px; line-height: 1.8; color: var(--cream-dim); font-weight: 400; }

  /* ── PROVING GROUNDS ── */
  .rs-pg { background: var(--navy); border-top: 1px solid rgba(181,149,88,0.08); position: relative; overflow: hidden; }
  .rs-pg-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 0.12; }
  .rs-pg-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(10,15,24,0.98) 45%, rgba(10,15,24,0.88) 100%); }
  .rs-pg-top { position: relative; z-index: 2; padding: 56px 56px 44px; display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: start; border-bottom: 1px solid rgba(232,223,208,0.06); }
  .rs-pg-pill { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(181,149,88,0.28); padding: 5px 14px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; font-weight: 500; }
  .rs-pg-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: rsBreathe 2s ease infinite; }
  .rs-pg-stations { display: flex; gap: 10px; flex-wrap: wrap; align-self: flex-end; padding-bottom: 4px; }
  .rs-pg-station { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); padding: 8px 16px; border: 1px solid rgba(232,223,208,0.07); font-weight: 500; }
  .rs-pg-station.grit { color: var(--teal-light); border-color: rgba(74,117,117,0.25); }
  .rs-pg-body { position: relative; z-index: 2; display: grid; grid-template-columns: 1.2fr 1fr; }
  .rs-pg-left { padding: 56px 56px 72px; border-right: 1px solid rgba(232,223,208,0.06); }
  .rs-pg-right { padding: 56px 56px 72px; background: rgba(8,12,20,0.55); }
  .rs-form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--cream); margin-bottom: 8px; }
  .rs-form-sub { font-size: 16px; color: var(--cream-dim); margin-bottom: 30px; font-weight: 400; }
  .rs-field { background: rgba(255,255,255,0.035); border: 1px solid rgba(232,223,208,0.1); color: var(--cream); padding: 14px 18px; font-size: 16px; font-family: 'Barlow', sans-serif; font-weight: 400; width: 100%; margin-bottom: 10px; outline: none; transition: border-color 0.2s; }
  .rs-field::placeholder { color: var(--cream-muted); font-size: 15px; }
  .rs-field:focus { border-color: var(--teal-dim); }
  .rs-select { appearance: none; cursor: pointer; }
  textarea.rs-field { min-height: 120px; resize: vertical; }
  .rs-form-note { font-size: 14px; color: var(--cream-dim); margin-top: 14px; font-weight: 400; line-height: 1.6; }
  .rs-success { text-align: left; padding: 24px 0; }
  .rs-success-check { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--teal); display: flex; align-items: center; justify-content: center; color: var(--teal); font-size: 18px; margin-bottom: 20px; }

  /* ── REDIRECTION POINT ── */
  .rs-podcast { background: var(--rp-black); border-top: 1px solid rgba(201,168,76,0.12); display: grid; grid-template-columns: 1fr 1.2fr; overflow: hidden; }
  .rs-podcast-visual { padding: 88px 56px; display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(201,168,76,0.08); background: var(--rp-dark); position: relative; }
  .rs-podcast-visual::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 40% 50%, rgba(201,168,76,0.05) 0%, transparent 65%); pointer-events: none; }
  .rs-podcast-art { width: 100%; max-width: 300px; aspect-ratio: 1; border: 1px solid rgba(201,168,76,0.2); background: var(--rp-dark); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 32px; position: relative; z-index: 1; }
  .rs-podcast-frame { position: absolute; inset: 10px; border: 1px solid rgba(201,168,76,0.07); pointer-events: none; }
  .rs-rp-wordmark { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--rp-gold); line-height: 1.1; margin-bottom: 4px; }
  .rs-rp-sub { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--rp-gold-dim); font-weight: 500; }
  .rs-rp-divider { width: 40px; height: 1px; background: rgba(201,168,76,0.3); margin: 16px auto; }
  .rs-rp-tag { font-family: 'EB Garamond', serif; font-style: italic; font-size: 13px; color: rgba(201,168,76,0.4); letter-spacing: 0.5px; }
  .rs-podcast-content { padding: 88px 56px; display: flex; flex-direction: column; justify-content: center; background: var(--rp-black); }
  .rs-podcast-label { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .rs-podcast-rule { display: block; width: 24px; height: 1px; background: var(--rp-gold); flex-shrink: 0; }
  .rs-podcast-label-text { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--rp-gold); font-weight: 500; }
  .rs-podcast-h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(36px,4.5vw,58px); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--rp-cream); line-height: 1.02; margin-bottom: 12px; }
  .rs-podcast-connect { font-size: 15px; font-style: italic; font-family: 'EB Garamond', serif; color: rgba(208,191,154,0.55); margin-bottom: 24px; line-height: 1.5; }
  .rs-podcast-desc { font-size: 18px; line-height: 1.8; color: rgba(208,191,154,0.72); font-weight: 400; margin-bottom: 36px; }
  .rs-platforms { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 40px; }
  .rs-platform { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; border: 1px solid rgba(201,168,76,0.22); color: var(--rp-cream); padding: 9px 20px; text-decoration: none; transition: all 0.2s; display: inline-block; }
  .rs-platform:hover { border-color: var(--rp-gold); color: var(--rp-gold); }
  .rs-collab { border-top: 1px solid rgba(201,168,76,0.08); padding-top: 30px; }
  .rs-collab-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--rp-gold-dim); margin-bottom: 10px; font-weight: 500; }
  .rs-collab-text { font-size: 15px; color: rgba(208,191,154,0.6); font-weight: 400; line-height: 1.7; margin-bottom: 22px; }

  /* ── PARTNERSHIP ── */
  .rs-partner { padding: 108px 56px; background: var(--navy-mid); border-top: 1px solid rgba(181,149,88,0.08); display: grid; grid-template-columns: 1fr 1fr; gap: 88px; align-items: start; }
  .rs-partner-types { display: flex; flex-direction: column; gap: 2px; }
  .rs-pt { padding: 24px 28px; background: rgba(8,12,20,0.6); border: 1px solid rgba(232,223,208,0.06); transition: border-color 0.2s; }
  .rs-pt:hover { border-color: rgba(74,117,117,0.22); }
  .rs-pt-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 4px; font-weight: 500; }
  .rs-pt-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; color: var(--cream); margin-bottom: 6px; letter-spacing: 0.5px; }
  .rs-pt-desc { font-size: 15px; color: var(--cream-dim); font-weight: 400; line-height: 1.65; }

  /* ── CONTACT ── */
  .rs-contact { padding: 108px 56px; background: var(--navy-panel); border-top: 1px solid rgba(181,149,88,0.08); display: grid; grid-template-columns: 1fr 1fr; gap: 88px; align-items: start; }
  .rs-contact-meta { margin-top: 28px; }
  .rs-contact-meta p { font-size: 18px; line-height: 1.8; color: var(--cream-dim); margin-bottom: 20px; font-weight: 400; }
  .rs-contact-note { font-family: 'EB Garamond', serif; font-style: italic; font-size: 16px; color: var(--cream-muted); }
  .rs-form-grid { display: flex; flex-direction: column; gap: 10px; }
  .rs-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* ── FOOTER ── */
  .rs-footer { background: #080D15; padding: 80px 56px 40px; border-top: 1px solid rgba(181,149,88,0.08); }
  .rs-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; margin-bottom: 64px; }
  .rs-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; color: var(--cream); display: block; margin-bottom: 18px; text-decoration: none; }
  .rs-footer-tag { font-size: 15px; color: var(--cream-dim); font-weight: 400; line-height: 1.7; max-width: 280px; margin-bottom: 24px; }
  .rs-footer-loc { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(140,136,127,0.45); font-weight: 400; }
  .rs-footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 20px; font-weight: 600; }
  .rs-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .rs-footer-col a { font-size: 15px; color: var(--cream-dim); text-decoration: none; font-weight: 400; transition: color 0.2s; }
  .rs-footer-col a:hover { color: var(--cream); }
  .rs-footer-bottom { border-top: 1px solid rgba(232,223,208,0.04); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; }
  .rs-footer-bottom p { font-size: 12px; color: rgba(140,136,127,0.38); font-weight: 300; }

  /* ── ANIMATIONS ── */
  @keyframes rsRise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes rsBreathe { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── MOBILE ── */
  @media (max-width: 900px) {
    .rs { font-size: 17px; }
    .rs-nav { padding: 0 24px; }
    .rs-nav-links { display: none; }
    .rs-hero-content { padding: 0 24px 80px; }
    .rs-hero-sub { font-size: 18px; max-width: 100%; }
    .rs-about, .rs-contact, .rs-partner { grid-template-columns: 1fr; gap: 44px; padding: 72px 24px; }
    .rs-about-right { max-width: 100%; }
    .rs-proof-bar { grid-template-columns: 1fr 1fr; padding: 40px 24px; }
    .rs-proof-item { padding: 0 16px; }
    .rs-for-grid, .rs-offerings-grid, .rs-pathways { grid-template-columns: 1fr; }
    .rs-why-grid { grid-template-columns: 1fr 1fr; }
    .rs-founders-grid { grid-template-columns: 1fr; }
    .rs-founder { grid-template-columns: 1fr; padding: 28px; }
    .rs-founder-img-wrap { width: 100%; }
    .rs-pg-body, .rs-pg-top { grid-template-columns: 1fr; }
    .rs-pg-top, .rs-pg-left, .rs-pg-right { padding: 36px 24px; }
    .rs-podcast { grid-template-columns: 1fr; }
    .rs-podcast-visual, .rs-podcast-content { padding: 56px 24px; }
    .rs-footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
    .rs-footer { padding: 56px 24px 36px; }
    .rs-for, .rs-offerings, .rs-why, .rs-founders { padding-left: 24px; padding-right: 24px; }
    .rs-pathway { padding: 64px 28px; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const PROOF = [
  { num: "Custom",     title: "Custom Designed",      label: "Every experience is built around the people, setting, and outcome required." },
  { num: "End to End", title: "End-to-End Delivery",  label: "ROAMSIX handles the structure, facilitation, and logistics." },
  { num: "Transition", title: "Built for Transition",  label: "For teams and people at moments that require more than another meeting." },
  { num: "Selective",  title: "Selective by Design",   label: "Access happens through referral, alignment, and direct inquiry." },
];

const OFFERINGS_ORG = [
  { num: "01", title: "Leadership Offsites",       desc: "Multi-day immersive experiences for leadership teams navigating growth, misalignment, or transition. Built around your group's goals and dynamics." },
  { num: "02", title: "Team Alignment Retreats",   desc: "Structured retreats for teams who need more than a day off. Built around communication, trust, and the decisions that need to get made." },
  { num: "03", title: "One-Day Reset Experiences", desc: "A single day, precision-designed. For individuals or small groups who need a change of environment and a clear plan for what comes next." },
];
const OFFERINGS_PVT = [
  { num: "04", title: "Private Group Experiences",        desc: "Custom experiences for private groups or couples at a pivotal moment. Reconnection, recalibration, or forward movement." },
  { num: "05", title: "Wellness and Longevity Retreats",  desc: "Performance-focused retreats built around recovery, health optimization, and expert facilitation." },
  { num: "06", title: "Travel-Based Experiences",         desc: "Curated destinations, white-glove logistics, and immersive facilitation. The journey is part of the design." },
];
const OFFERINGS_SIG = [
  { num: "07", title: "Proving Grounds",    desc: "One-day competitive team performance events. Six stations. No shortcuts." },
  { num: "08", title: "Redirection Point", desc: "The ROAMSIX podcast. Conversations on pivotal moments with athletes, executives, and operators." },
];

const WHY = [
  { num: "01", title: "Environment Shapes Behavior",  text: "The setting changes what people say, how they communicate, and what they can see clearly." },
  { num: "02", title: "Trust Changes Communication",  text: "Most organizational problems are trust problems. We create conditions for trust to develop through shared experience." },
  { num: "03", title: "Recovery Sharpens Decisions",  text: "High performers running on empty make worse decisions. Recovery is built into every experience." },
  { num: "04", title: "Structure Reveals What's Real", text: "The right structure reveals what a team actually needs, not what they said they needed in the intake form." },
];

const DESIGNED = [
  { icon: "ORG", title: "Founder-Led Leadership Teams", desc: "Organizations at an inflection point. Communication breaking down. Culture not keeping pace with the business." },
  { icon: "PPL", title: "People Leaders and L&D Teams", desc: "CPOs, VPs of People, and L&D leaders with a mandate to develop culture and leadership at scale." },
  { icon: "PRF", title: "High-Performers and Private Groups", desc: "Individuals, couples, and private groups in serious pursuit of alignment, recovery, or clarity on what comes next." },
];

const PARTNERS = [
  { tag: "Corporate", title: "Annual Retreat Partner",       desc: "Organizations looking for a retained experience partner across multiple engagements per year." },
  { tag: "Brand",     title: "Sponsor and Brand Alignment",  desc: "Brands in health, performance, wellness, and outdoor aligned with the ROAMSIX audience." },
  { tag: "Venue",     title: "Property and Venue Partners",  desc: "Premium properties and locations interested in hosting or co-designing ROAMSIX experiences." },
  { tag: "Expert",    title: "Facilitators and Speakers",    desc: "Credentialed practitioners in leadership, performance, longevity, and wellness." },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled]         = useState(false);
  const [pg, setPg]                     = useState({ name: "", email: "", role: "" });
  const [pgDone, setPgDone]             = useState(false);
  const [contact, setContact]           = useState({ first: "", last: "", email: "", company: "", type: "", message: "" });
  const [contactDone, setContactDone]   = useState(false);
  const [heroError, setHeroError]       = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const submitContact = () => {
    if (!contact.email || !contact.message) return;
    // TODO: wire to /api/submit-application or a new contact endpoint
    setContactDone(true);
  };

  return (
    <div className="rs">
      <style>{css}</style>

      {/* NAV */}
      <nav className={`rs-nav ${scrolled ? "solid" : ""}`}>
        <a className="rs-nav-brand" href="/">
          <span className="rs-wordmark">ROAMSIX</span>
        </a>
        <ul className="rs-nav-links">
          {[["About","#about"],["Experiences","#experiences"],["Our Team","#founders"],["Proving Grounds","#proving-grounds"],["Podcast","#podcast"]].map(([l,h]) => (
            <li key={l}><a href={h}>{l}</a></li>
          ))}
          <li><a href="#contact" className="rs-btn rs-nav-inquire">Inquire</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="rs-hero">
        <img
          className="rs-hero-img"
          src={heroError ? HERO_FALLBACK : HERO_SRC}
          alt="ROAMSIX environment"
          onError={() => setHeroError(true)}
        />
        <div className="rs-hero-overlay" />
        <div className="rs-hero-content">
          <div className="rs-label-row" style={{marginBottom:"22px"}}>
            <span className="rs-rule"/><span className="rs-label">Custom Offsites, Retreats, and Performance Experiences</span>
          </div>
          <h1 className="rs-hero-h1">
            Custom Offsites,<br/>
            Retreats, and<br/>
            Performance<br/>
            Experiences for<br/>
            Teams and<br/>
            High Performers.
          </h1>
          <p className="rs-hero-sub">
            ROAMSIX designs and delivers immersive experiences built around environment, wellness, structure, and facilitation to create alignment, recovery, and forward movement.
          </p>
          <div className="rs-hero-actions">
            <a href="#contact" className="rs-btn rs-btn-teal">Inquire About an Experience</a>
            <a href="#about"   className="rs-btn rs-btn-outline">Explore ROAMSIX</a>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <div className="rs-proof-bar">
        {PROOF.map(p => (
          <div className="rs-proof-item" key={p.num}>
            <div className="rs-proof-num">{p.num}</div>
            <div className="rs-proof-title">{p.title}</div>
            <div className="rs-proof-label">{p.label}</div>
          </div>
        ))}
      </div>

      <hr className="rs-hr"/>

      {/* ABOUT */}
      <section className="rs-about" id="about">
        <div>
          <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Why We Exist</span></div>
          <h2 className="rs-h2">Most teams don't need more information. They need the right environment.</h2>
        </div>
        <div className="rs-about-right">
          <p>As organizations grow, distance develops. Between the people doing the work and the people making decisions. Between stated values and daily behavior. Between high-performance and the recovery that sustains it.</p>
          <div className="rs-about-pull">
            <p className="rs-pull">Environment changes what people reveal, how they relate, and what they are able to see clearly.</p>
          </div>
          <p>ROAMSIX designs experiences that use place, structure, wellness, and facilitation to produce alignment, recovery, and forward movement. Every engagement is customized. Every detail is intentional.</p>
          <p style={{fontSize:"16px",color:"var(--cream-muted)",marginTop:"8px"}}>Internally, we describe the work as analog experience design. In practice, it means real-world environments designed to change how people think, relate, recover, and perform.</p>
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* DESIGNED FOR */}
      <section className="rs-for" id="designed-for">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Who We Build For</span></div>
        <h2 className="rs-h2">Who ROAMSIX Is Designed For.</h2>
        <div className="rs-for-grid">
          {DESIGNED.map(d => (
            <div className="rs-for-card" key={d.title}>
              <div className="rs-for-icon">{d.icon}</div>
              <div className="rs-for-title">{d.title}</div>
              <p className="rs-for-desc">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* OFFERINGS */}
      <section className="rs-offerings" id="experiences">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Experiences</span></div>
        <h2 className="rs-h2">Every Experience Is Built Around You.</h2>
        <div className="rs-offerings-grid">
          {[["For Organizations",OFFERINGS_ORG],["Private and Individual",OFFERINGS_PVT],["Signature Properties",OFFERINGS_SIG]].map(([header,items]) => (
            <div key={header}>
              <div className="rs-offerings-col-header">{header}</div>
              {items.map(o => (
                <div className="rs-offering" key={o.num}>
                  <div className="rs-offering-num">{o.num}</div>
                  <div className="rs-offering-title">{o.title}</div>
                  <p className="rs-offering-desc">{o.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PATHWAYS */}
      <div className="rs-pathways">
        <div className="rs-pathway rs-pathway-org">
          <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">For Organizations</span></div>
          <h3 className="rs-pathway-h3">Leadership Teams<br/>and Organizations</h3>
          <p className="rs-pathway-desc">Companies navigating growth, misalignment, or culture that is not keeping up with the business. We build the experience around what your team actually needs.</p>
          <ul className="rs-pathway-list">
            {["Founder-led scaleup leadership teams","Chief People Officers and L&D leaders","Executive and senior leadership offsites","Multi-day or single-day formats","Recurring annual partnership model available"].map(i => (
              <li key={i}><span>+</span>{i}</li>
            ))}
          </ul>
          <a href="#contact" className="rs-btn rs-btn-teal">Request a Conversation</a>
        </div>
        <div className="rs-pathway rs-pathway-ind">
          <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">For Individuals and Private Groups</span></div>
          <h3 className="rs-pathway-h3">High Performers<br/>and Private Groups</h3>
          <p className="rs-pathway-desc">For individuals, couples, and private groups at a pivotal moment. Whether you are recalibrating, recovering, or deciding what comes next, we design the environment to support the work.</p>
          <ul className="rs-pathway-list">
            {["High-performing individuals seeking clarity","Couples and private group experiences","Wellness, longevity, and recovery retreats","Proving Grounds competitive events","Referral and invitation access"].map(i => (
              <li key={i}><span>+</span>{i}</li>
            ))}
          </ul>
          <a href="#contact" className="rs-btn rs-btn-outline">Explore a Custom Experience</a>
        </div>
      </div>

      <hr className="rs-hr"/>

      {/* WHY */}
      <section className="rs-why" id="why">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Why Environment Matters</span></div>
        <h2 className="rs-h2">How ROAMSIX Works.</h2>
        <div className="rs-why-grid">
          {WHY.map(c => (
            <div className="rs-why-card" key={c.num}>
              <div className="rs-why-num">{c.num}</div>
              <div className="rs-why-title">{c.title}</div>
              <p className="rs-why-text">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* FOUNDERS */}
      <section className="rs-founders" id="founders">
        <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">The Founding Team</span></div>
        <h2 className="rs-h2">Built by People Who've Done the Work.</h2>
        <div className="rs-founders-grid">
          {[
            { init:"MO", name:"Max Ouellette", bar:"#4A7575", bg:"linear-gradient(160deg,#1C2535,#1E2E2E)", photo: MAX_SRC,
              bio:"Former professional athlete with deep experience across performance, wellness, events, and high-accountability team environments. Max leads ROAMSIX with a focus on structure, trust, and the design of experiences that create real movement in people and teams." },
            { init:"JA", name:"Jackie",        bar:"#3A5A5A", bg:"linear-gradient(160deg,#1E2E2E,#1C2535)", photo: JACKIE_SRC,
              bio:"Jackie brings experience across fitness, operational delivery, and experience execution. She shapes the human side of ROAMSIX so every engagement feels intentional, personal, and well held." },
          ].map(f => (
            <div className="rs-founder" key={f.name}>
              <div className="rs-founder-img-wrap">
                <img
                  className="rs-founder-img"
                  src={f.photo}
                  alt={f.name}
                  onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                />
                <div className="rs-founder-placeholder" style={{display:"none",background:f.bg}}>
                  <span className="rs-founder-initials">{f.init}</span>
                </div>
                <div className="rs-founder-bar" style={{background:f.bar}}/>
              </div>
              <div>
                <div className="rs-founder-role">Co-Founder</div>
                <div className="rs-founder-name">{f.name}</div>
                <p className="rs-founder-bio">{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* PROVING GROUNDS */}
      <section className="rs-pg" id="proving-grounds">
        <img
          className="rs-pg-bg-img"
          src={PG_SRC}
          alt=""
          onError={e => { e.target.style.display="none"; }}
        />
        <div className="rs-pg-overlay"/>
        <div className="rs-pg-top">
          <div>
            <div className="rs-pg-pill"><span className="rs-pg-dot"/>Next Event: Dates Forthcoming</div>
            <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Proving Grounds</span></div>
            <h2 className="rs-h2">One Day. Six Stations. No Shortcuts.</h2>
          </div>
          <div className="rs-pg-stations">
            {["Terrain","Strength","Engine","Control","Power","Grit"].map((s,i) => (
              <div className={`rs-pg-station${i===5?" grit":""}`} key={s}>{s}</div>
            ))}
          </div>
        </div>
        <div className="rs-pg-body">
          <div className="rs-pg-left">
            <p className="rs-body" style={{marginBottom:"24px",maxWidth:"560px"}}>
              Proving Grounds is a one-day competitive team performance event under the ROAMSIX brand. Teams of four compete across six field stations. The sixth station, Grit, is revealed morning-of. No preparation for what you cannot prepare for.
            </p>
            <p className="rs-body-sm" style={{maxWidth:"520px"}}>
              The next event date is being confirmed. Registration opens to the ROAMSIX network first. Submit your information to be contacted directly.
            </p>
          </div>
          <div className="rs-pg-right">
            {!pgDone ? (
              <>
                <div className="rs-form-title">Ask About Proving Grounds</div>
                <div className="rs-form-sub">Be contacted when registration opens.</div>
                <input className="rs-field" placeholder="Full Name" value={pg.name} onChange={e=>setPg(p=>({...p,name:e.target.value}))}/>
                <input className="rs-field" type="email" placeholder="Email Address" value={pg.email} onChange={e=>setPg(p=>({...p,email:e.target.value}))}/>
                <select className="rs-field rs-select" value={pg.role} onChange={e=>setPg(p=>({...p,role:e.target.value}))}>
                  <option value="">I am joining as...</option>
                  <option>An individual</option>
                  <option>A coach or trainer</option>
                  <option>A team of four</option>
                </select>
                <button className="rs-btn rs-btn-gold" style={{width:"100%",fontSize:"12px",marginTop:"4px"}} onClick={()=>pg.email&&setPgDone(true)}>
                  Request Proving Grounds Info
                </button>
                <p className="rs-form-note">No commitment required. We will contact you directly.</p>
              </>
            ) : (
              <div className="rs-success">
                <div className="rs-success-check">✓</div>
                <div className="rs-form-title">Received.</div>
                <p className="rs-form-sub">We will be in touch when the date is confirmed.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REDIRECTION POINT */}
      <section className="rs-podcast" id="podcast">
        <div className="rs-podcast-visual">
          <div className="rs-podcast-art">
            <div className="rs-podcast-frame"/>
            <div className="rs-rp-wordmark">Redirection<br/>Point</div>
            <div className="rs-rp-sub">A ROAMSIX Podcast</div>
            <div className="rs-rp-divider"/>
            <div className="rs-rp-tag">Where Paths Converge</div>
          </div>
        </div>
        <div className="rs-podcast-content">
          <div className="rs-podcast-label">
            <span className="rs-podcast-rule"/><span className="rs-podcast-label-text">The Podcast</span>
          </div>
          <h2 className="rs-podcast-h2">Redirection<br/>Point.</h2>
          <p className="rs-podcast-connect">Redirection Point is the media expression of the same questions ROAMSIX is built around.</p>
          <p className="rs-podcast-desc">
            Every high-performer has a moment where the path changed. A decision, a setback, a discovery that redirected everything that followed. We explore those moments with athletes, executives, veterans, and operators who built something meaningful on the other side of one.
          </p>
          <div className="rs-platforms">
            {["YouTube","Spotify","Apple Podcasts"].map(p => (
              <a href="#" className="rs-platform" key={p}>{p}</a>
            ))}
          </div>
          <div className="rs-collab">
            <div className="rs-collab-label">Want to be featured or collaborate?</div>
            <p className="rs-collab-text">If you have lived a redirection and want to share it, or if you are a brand or practitioner looking to collaborate, reach out.</p>
            <a href="#contact" className="rs-btn-rp">Reach Out to the Team</a>
          </div>
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* PARTNERSHIP */}
      <section className="rs-partner" id="partnership">
        <div>
          <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Partnerships</span></div>
          <h2 className="rs-h2">Partner With ROAMSIX.</h2>
          <p className="rs-body" style={{marginTop:"22px",marginBottom:"36px",maxWidth:"400px"}}>
            We are building a network of partners who believe the right environment produces the right outcomes. If your brand, organization, or practice belongs in that conversation, we want to hear from you.
          </p>
          <a href="#contact" className="rs-btn rs-btn-teal">Explore Partnership Opportunities</a>
        </div>
        <div className="rs-partner-types">
          {PARTNERS.map(p => (
            <div className="rs-pt" key={p.title}>
              <div className="rs-pt-tag">{p.tag}</div>
              <div className="rs-pt-title">{p.title}</div>
              <p className="rs-pt-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="rs-hr"/>

      {/* CONTACT */}
      <section className="rs-contact" id="contact">
        <div>
          <div className="rs-label-row"><span className="rs-rule"/><span className="rs-label">Contact</span></div>
          <h2 className="rs-h2">Start a Conversation.</h2>
          <div className="rs-contact-meta">
            <p>Every engagement begins with a conversation to understand what you need, what your group requires, and whether ROAMSIX is the right fit.</p>
            <p>We respond within 48 hours. Direct inquiries: <a href="mailto:info@roamsix.com" style={{color:"var(--cream)",fontWeight:"400",textDecoration:"none"}}>info@roamsix.com</a></p>
            <p className="rs-contact-note">ROAMSIX operates by referral and invitation.</p>
          </div>
        </div>
        <div>
          {!contactDone ? (
            <div className="rs-form-grid">
              <div className="rs-form-row">
                <input className="rs-field" placeholder="First Name" value={contact.first} onChange={e=>setContact(p=>({...p,first:e.target.value}))}/>
                <input className="rs-field" placeholder="Last Name"  value={contact.last}  onChange={e=>setContact(p=>({...p,last:e.target.value}))}/>
              </div>
              <input className="rs-field" type="email" placeholder="Email Address" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))}/>
              <input className="rs-field" placeholder="Company or Organization (optional)" value={contact.company} onChange={e=>setContact(p=>({...p,company:e.target.value}))}/>
              <select className="rs-field rs-select" value={contact.type} onChange={e=>setContact(p=>({...p,type:e.target.value}))}>
                <option value="">I am inquiring about...</option>
                <option>A corporate leadership offsite</option>
                <option>A team retreat</option>
                <option>A private or individual experience</option>
                <option>Proving Grounds</option>
                <option>Redirection Point or Podcast</option>
                <option>A partnership or sponsorship</option>
              </select>
              <textarea className="rs-field" placeholder="Tell us about your situation and what you are looking for." value={contact.message} onChange={e=>setContact(p=>({...p,message:e.target.value}))}/>
              <button className="rs-btn rs-btn-teal" style={{width:"100%",fontSize:"12px"}} onClick={submitContact}>
                Submit Inquiry
              </button>
            </div>
          ) : (
            <div className="rs-success" style={{paddingTop:"48px"}}>
              <div className="rs-success-check">✓</div>
              <div className="rs-form-title" style={{marginBottom:"12px"}}>Inquiry Received.</div>
              <p className="rs-body">We review every submission personally and will respond within 48 hours.</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="rs-footer">
        <div className="rs-footer-top">
          <div>
            <span className="rs-footer-brand">ROAMSIX</span>
            <p className="rs-footer-tag">Custom offsites, retreats, and performance experiences built around environment, trust, and forward movement.</p>
            <p className="rs-footer-loc">Murrieta, CA — By Referral and Invitation</p>
          </div>
          <div className="rs-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About ROAMSIX</a></li>
              <li><a href="#founders">Our Team</a></li>
              <li><a href="#partnership">Partnerships</a></li>
            </ul>
          </div>
          <div className="rs-footer-col">
            <h4>Experiences</h4>
            <ul>
              <li><a href="#experiences">Corporate Offsites</a></li>
              <li><a href="#experiences">Private Retreats</a></li>
              <li><a href="#proving-grounds">Proving Grounds</a></li>
              <li><a href="#podcast">Redirection Point</a></li>
            </ul>
          </div>
          <div className="rs-footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="#contact">Inquire</a></li>
              <li><a href="mailto:info@roamsix.com">info@roamsix.com</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="rs-footer-bottom">
          <p>2026 Reciprofy Inc. operating as ROAMSIX. All rights reserved.</p>
          <p>Environment-Led Experience Design</p>
        </div>
      </footer>
    </div>
  );
} "redesign: replace HomePage v5"
