import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventById } from "../data/events";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,400&family=EB+Garamond:ital,wght@1,400;1,500&display=swap');

  .ed *, .ed *::before, .ed *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ed {
    font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
    min-height: 100vh; font-size: 18px; line-height: 1.65;
    --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558; --gold-dim: #876F3E;
  }
  body.ed-no-scroll { overflow: hidden; }

  /* NAV */
  .ed-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .ed-nav-brand { text-decoration: none; }
  .ed-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .ed-nav-back { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .ed-nav-back:hover { color: var(--cream); }

  /* HERO */
  .ed-hero { padding: 140px 56px 80px; background: var(--panel); border-bottom: 1px solid rgba(181,149,88,0.1); position: relative; overflow: hidden; }
  .ed-hero-inner { max-width: 900px; position: relative; z-index: 1; }
  .ed-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 35%; opacity: 0.28; display: block; }
  .ed-hero-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(12,18,32,0.5) 0%, rgba(12,18,32,0.92) 100%); }
  .ed-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .ed-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .ed-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .ed-event-tag { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 6px 14px; background: rgba(181,149,88,0.1); border: 1px solid rgba(181,149,88,0.25); color: var(--gold); margin-bottom: 28px; }
  .ed-hero-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(38px,5vw,68px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.02; margin-bottom: 16px; }
  .ed-hero-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 32px; }
  .ed-hero-meta { display: flex; flex-wrap: wrap; gap: 32px; margin-top: 32px; border-top: 1px solid rgba(232,223,208,0.08); padding-top: 32px; }
  .ed-meta-item { display: flex; flex-direction: column; gap: 4px; }
  .ed-meta-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
  .ed-meta-value { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; color: var(--cream); }
  .ed-badge { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 5px 12px; border: 1px solid; margin-top: 6px; }
  .ed-badge-open { background: rgba(181,149,88,0.1); border-color: rgba(181,149,88,0.3); color: var(--gold); }
  .ed-badge-soldout { background: rgba(232,223,208,0.05); border-color: rgba(232,223,208,0.15); color: var(--cream-muted); }
  .ed-badge-coming-soon { background: rgba(74,117,117,0.08); border-color: rgba(74,117,117,0.25); color: var(--teal-light); }

  /* BODY */
  .ed-body { padding: 80px 56px; max-width: 1100px; margin: 0 auto; }
  .ed-body-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: start; margin-bottom: 80px; }
  .ed-body-text p { font-size: 19px; line-height: 1.88; color: var(--cream-dim); margin-bottom: 24px; }
  .ed-body-text p:last-child { margin-bottom: 0; }
  .ed-highlights { background: var(--panel); border: 1px solid rgba(232,223,208,0.07); border-left: 3px solid var(--teal); padding: 36px; }
  .ed-highlights-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 20px; }
  .ed-highlights-list { list-style: none; }
  .ed-highlights-list li { font-size: 16px; line-height: 1.65; color: var(--cream-dim); padding: 10px 0; border-bottom: 1px solid rgba(232,223,208,0.07); display: flex; gap: 12px; align-items: flex-start; }
  .ed-highlights-list li:last-child { border-bottom: none; padding-bottom: 0; }
  .ed-highlights-list li::before { content: ""; display: block; width: 6px; height: 6px; background: var(--teal); border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
  .ed-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(181,149,88,0.14), transparent); margin: 0 0 80px; }

  /* MENU */
  .ed-menu { margin-bottom: 64px; }
  .ed-menu-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  .ed-menu-sublabel { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 32px; }
  .ed-menu-list { list-style: none; }
  .ed-menu-list li { font-size: 17px; line-height: 1.85; color: var(--cream-dim); padding: 12px 0; border-bottom: 1px solid rgba(232,223,208,0.06); display: flex; gap: 14px; align-items: baseline; }
  .ed-menu-list li:last-child { border-bottom: none; }
  .ed-menu-dash { color: var(--gold); flex-shrink: 0; font-size: 15px; }

  /* PACKAGES */
  .ed-packages-head { margin-bottom: 48px; }
  .ed-packages-h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: clamp(28px,3.2vw,42px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-top: 16px; }
  .ed-packages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .ed-pkg { background: var(--panel); border: 1px solid rgba(232,223,208,0.07); padding: 36px 32px 32px; display: flex; flex-direction: column; position: relative; transition: border-color 0.25s; }
  .ed-pkg:hover { border-color: rgba(74,117,117,0.3); }
  .ed-pkg-featured { border-color: rgba(181,149,88,0.2); }
  .ed-pkg-featured:hover { border-color: rgba(181,149,88,0.4); }
  .ed-pkg-limited { position: absolute; top: -1px; right: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 5px 12px; background: rgba(181,149,88,0.12); border: 1px solid rgba(181,149,88,0.3); border-top: none; color: var(--gold); }
  .ed-pkg-name { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--cream); margin-bottom: 16px; line-height: 1.2; }
  .ed-pkg-price { font-family: 'Barlow Condensed', sans-serif; font-size: 42px; font-weight: 700; color: var(--gold); letter-spacing: -0.5px; line-height: 1; margin-bottom: 4px; }
  .ed-pkg-price-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 20px; }
  .ed-pkg-capacity { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 20px; }
  .ed-pkg-desc { font-size: 15px; line-height: 1.7; color: var(--cream-muted); margin-bottom: 24px; border-bottom: 1px solid rgba(232,223,208,0.07); padding-bottom: 24px; }
  .ed-pkg-includes-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 14px; }
  .ed-pkg-includes { list-style: none; flex: 1; margin-bottom: 32px; }
  .ed-pkg-includes li { font-size: 15px; line-height: 1.5; color: var(--cream-dim); padding: 8px 0; border-bottom: 1px solid rgba(232,223,208,0.05); display: flex; gap: 10px; align-items: flex-start; }
  .ed-pkg-includes li:last-child { border-bottom: none; }
  .ed-pkg-includes li::before { content: ""; display: block; width: 5px; height: 5px; background: var(--teal); border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
  .ed-pkg-bundle { background: rgba(181,149,88,0.06); border: 1px solid rgba(181,149,88,0.2); padding: 14px 16px; margin-bottom: 16px; font-size: 14px; color: var(--cream-dim); line-height: 1.5; }
  .ed-pkg-bundle-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 4px; }
  .ed-pkg-btn { width: 100%; padding: 15px; background: var(--teal); color: var(--cream); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.22s; }
  .ed-pkg-btn:hover { background: var(--teal-dim); }
  .ed-pkg-btn-gold { background: var(--gold); color: var(--navy); }
  .ed-pkg-btn-gold:hover { background: var(--cream); color: var(--navy); }
  .ed-pkg-btn-bundle { width: 100%; padding: 13px; background: transparent; color: var(--gold); font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(181,149,88,0.35); cursor: pointer; transition: all 0.22s; margin-top: 8px; }
  .ed-pkg-btn-bundle:hover { border-color: var(--gold); color: var(--cream); }
  .ed-pkg-btn-soldout { width: 100%; padding: 15px; background: rgba(232,223,208,0.05); color: var(--cream-muted); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; border: 1px solid rgba(232,223,208,0.1); cursor: not-allowed; }

  /* MODAL */
  .ed-overlay { position: fixed; inset: 0; z-index: 900; background: rgba(4,7,14,0.88); display: flex; align-items: center; justify-content: center; padding: 24px; animation: edFadeIn 0.2s ease; }
  @keyframes edFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .ed-modal { background: var(--navy-mid); border: 1px solid rgba(232,223,208,0.12); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: edSlideUp 0.25s cubic-bezier(0.16,1,0.3,1); }
  @keyframes edSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .ed-modal-header { padding: 32px 36px 24px; border-bottom: 1px solid rgba(232,223,208,0.08); display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .ed-modal-pkg { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  .ed-modal-price { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 700; color: var(--cream); }
  .ed-modal-close { background: none; border: none; color: var(--cream-muted); font-size: 22px; cursor: pointer; padding: 4px; line-height: 1; flex-shrink: 0; transition: color 0.2s; margin-top: 2px; }
  .ed-modal-close:hover { color: var(--cream); }
  .ed-modal-body { padding: 28px 36px 36px; }
  .ed-bundle-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 24px; }
  .ed-bundle-opt { padding: 14px 16px; border: 1px solid rgba(232,223,208,0.12); cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.02); text-align: center; }
  .ed-bundle-opt.active { border-color: rgba(181,149,88,0.4); background: rgba(181,149,88,0.07); }
  .ed-bundle-opt-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); display: block; margin-bottom: 4px; }
  .ed-bundle-opt.active .ed-bundle-opt-label { color: var(--gold); }
  .ed-bundle-opt-price { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: var(--cream); }
  .ed-form-group { margin-bottom: 16px; }
  .ed-form-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); display: block; margin-bottom: 6px; }
  .ed-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; }
  .ed-input:focus { border-color: var(--teal); }
  .ed-input::placeholder { color: rgba(232,223,208,0.3); }
  .ed-modal-err { color: #E07070; font-size: 14px; margin-bottom: 16px; line-height: 1.5; }
  .ed-modal-submit { width: 100%; padding: 16px; background: var(--gold); color: var(--navy); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.22s; margin-top: 8px; }
  .ed-modal-submit:hover:not(:disabled) { background: var(--cream); }
  .ed-modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .ed-modal-note { font-size: 13px; color: var(--cream-muted); text-align: center; margin-top: 12px; line-height: 1.5; }
  .ed-modal-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 15px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; resize: vertical; min-height: 90px; }
  .ed-modal-textarea:focus { border-color: var(--teal); }
  .ed-modal-textarea::placeholder { color: rgba(232,223,208,0.3); }
  .ed-modal-divider { height: 1px; background: rgba(232,223,208,0.08); margin: 20px 0; }
  .ed-modal-consent { display: flex; gap: 12px; align-items: flex-start; margin-top: 16px; }
  .ed-modal-consent-check { width: 18px; height: 18px; min-width: 18px; margin-top: 2px; accent-color: var(--teal); cursor: pointer; }
  .ed-modal-consent-text { font-size: 13px; color: var(--cream-muted); line-height: 1.6; }
  .ed-modal-consent-text a { color: var(--teal-light); text-decoration: none; }
  .ed-modal-consent-text a:hover { color: var(--cream); }
  .ed-modal-event-summary { padding: 20px 36px 18px; border-bottom: 1px solid rgba(181,149,88,0.12); background: rgba(181,149,88,0.04); }
  .ed-modal-event-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--cream); margin-bottom: 6px; }
  .ed-modal-event-date { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 3px; }
  .ed-modal-event-venue { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-dim); margin-bottom: 2px; }
  .ed-modal-event-loc { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); margin-bottom: 2px; }
  .ed-modal-event-time { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
  .ed-modal-cancel-notice { font-size: 12px; color: var(--cream-muted); line-height: 1.65; margin-bottom: 12px; padding: 14px 16px; background: rgba(232,223,208,0.03); border-left: 2px solid rgba(232,223,208,0.12); }
  .ed-modal-cancel-notice a { color: var(--teal-light); text-decoration: none; }
  .ed-modal-cancel-notice a:hover { color: var(--cream); }
  .ed-modal-voluntary { font-size: 12px; color: var(--cream-muted); line-height: 1.65; margin-top: 14px; margin-bottom: 4px; }

  /* SINGLE OFFER CARD */
  .ed-offer-wrap { max-width: 860px; margin: 0 auto; }
  .ed-offer-positioning { font-size: 17px; color: var(--cream-muted); line-height: 1.75; margin-bottom: 44px; text-align: center; font-style: italic; }
  .ed-offer { background: var(--panel); border: 1px solid rgba(181,149,88,0.2); border-top: 3px solid var(--gold); }
  .ed-offer-top { padding: 48px 56px 36px; border-bottom: 1px solid rgba(232,223,208,0.07); }
  .ed-offer-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; }
  .ed-offer-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px; }
  .ed-offer-price { font-family: 'Barlow Condensed', sans-serif; font-size: 72px; font-weight: 700; color: var(--cream); letter-spacing: -1px; line-height: 1; }
  .ed-offer-price-label { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }
  .ed-offer-subcopy { font-size: 18px; line-height: 1.75; color: var(--cream-dim); max-width: 580px; }
  .ed-offer-body { padding: 40px 56px 48px; }
  .ed-offer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 40px; }
  .ed-offer-section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(74,117,117,0.2); }
  .ed-offer-list { list-style: none; }
  .ed-offer-list li { font-size: 15px; line-height: 1.6; color: var(--cream-dim); padding: 8px 0; border-bottom: 1px solid rgba(232,223,208,0.05); display: flex; gap: 10px; align-items: flex-start; }
  .ed-offer-list li:last-child { border-bottom: none; }
  .ed-offer-list li::before { content: ""; display: block; width: 5px; height: 5px; background: var(--teal); border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
  .ed-offer-promo { background: rgba(181,149,88,0.05); border: 1px solid rgba(181,149,88,0.2); border-left: 3px solid var(--gold); padding: 20px 24px; margin-bottom: 36px; }
  .ed-offer-promo-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .ed-offer-two-tickets { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; color: var(--cream); letter-spacing: 0.5px; line-height: 1.1; margin-bottom: 10px; }
  .ed-offer-promo-text { font-size: 15px; color: var(--cream-dim); line-height: 1.65; }
  .ed-offer-promo-code { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: var(--cream); letter-spacing: 2px; }
  .ed-offer-topic { font-size: 16px; color: var(--cream-muted); line-height: 1.75; margin-bottom: 36px; font-style: italic; }
  .ed-offer-footer { display: flex; align-items: center; justify-content: space-between; gap: 24px; border-top: 1px solid rgba(232,223,208,0.07); padding-top: 32px; flex-wrap: wrap; }
  .ed-offer-capacity { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); }
  .ed-offer-btn { padding: 17px 52px; background: var(--gold); color: var(--navy); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.22s; }
  .ed-offer-btn:hover { background: var(--cream); color: var(--navy); }
  .ed-offer-btn-soldout { padding: 17px 52px; background: rgba(232,223,208,0.05); color: var(--cream-muted); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; border: 1px solid rgba(232,223,208,0.1); cursor: not-allowed; }

  /* IMAGE DIVIDER */
  .ed-img-divider { width: 100%; aspect-ratio: 16/6; overflow: hidden; margin-bottom: 80px; }
  .ed-img-divider img { width: 100%; height: 100%; object-fit: cover; object-position: center 40%; filter: brightness(0.65) contrast(1.05); display: block; }

  /* FOOTER */
  .ed-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 40px 56px; }
  .ed-footer-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .ed-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .ed-footer-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .ed-footer-link:hover { color: var(--cream); }
  .ed-footer-legal { display: flex; flex-wrap: wrap; gap: 20px; border-top: 1px solid rgba(232,223,208,0.07); padding-top: 20px; }
  .ed-footer-legal a { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: rgba(232,223,208,0.4); text-decoration: none; transition: color 0.2s; }
  .ed-footer-legal a:hover { color: var(--cream-muted); }

  @media (max-width: 900px) {
    .ed-nav { padding: 0 24px; }
    .ed-hero { padding: 120px 24px 60px; }
    .ed-body { padding: 60px 24px; }
    .ed-body-grid { grid-template-columns: 1fr; gap: 40px; margin-bottom: 60px; }
    .ed-packages-grid { grid-template-columns: 1fr; }
    .ed-img-divider { margin-bottom: 60px; }
    .ed-footer { padding: 32px 24px; }
    .ed-footer-top { flex-direction: column; gap: 16px; text-align: center; }
    .ed-offer-top { padding: 32px 28px 28px; }
    .ed-offer-body { padding: 28px 28px 36px; }
    .ed-offer-cols { grid-template-columns: 1fr; gap: 32px; }
    .ed-offer-price { font-size: 56px; }
    .ed-offer-footer { flex-direction: column; align-items: flex-start; }
    .ed-offer-btn { width: 100%; text-align: center; }
    .ed-offer-btn-soldout { width: 100%; text-align: center; }
  }
  @media (max-width: 480px) {
    .ed-bundle-toggle { grid-template-columns: 1fr; }
    .ed-modal-header { padding: 24px 24px 20px; }
    .ed-modal-body { padding: 20px 24px 28px; }
  }
`;

function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function fmtModalDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function fmtPrice(cents) {
  return "$" + (cents / 100).toFixed(0);
}

function StatusBadge({ status }) {
  return (
    <span className={`ed-badge ed-badge-${status}`}>
      {status === "open" ? "Registration Open" : status === "soldout" ? "Sold Out" : "Coming Soon"}
    </span>
  );
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const event = getEventById(eventId);

  const LEGAL_VERSION = "ROAMSIX_EVENT_TERMS_V1_2026";

  const [modal, setModal] = useState(null);
  const [isBundle, setIsBundle] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    emergencyContactName: "", emergencyContactPhone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (modal) {
      document.body.classList.add("ed-no-scroll");
    } else {
      document.body.classList.remove("ed-no-scroll");
    }
    return () => document.body.classList.remove("ed-no-scroll");
  }, [modal]);

  const openModal = (pkg, bundle = false) => {
    setModal(pkg);
    setIsBundle(bundle);
    setForm({ name: "", email: "", phone: "", emergencyContactName: "", emergencyContactPhone: "" });
    setAgreedToTerms(false);
    setAgeConfirmed(false);
    setStatus("idle");
    setErr("");
  };

  const closeModal = () => {
    setModal(null);
    setStatus("idle");
    setErr("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() ||
        !form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
      setErr("Please complete all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (!ageConfirmed) {
      setErr("Please confirm that you are 21 years of age or older.");
      return;
    }
    if (!agreedToTerms) {
      setErr("Please read and accept the terms and agreements to continue.");
      return;
    }
    setStatus("loading");
    setErr("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          packageId: modal.id,
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          isBundle,
          quantity: 1,
          phone: form.phone.trim(),
          emergencyContactName: form.emergencyContactName.trim(),
          emergencyContactPhone: form.emergencyContactPhone.trim(),
          eventName: event.title,
          eventDate: event.date,
          acceptedLegalVersion: LEGAL_VERSION,
          acceptedAt: new Date().toISOString(),
          agreedToTerms: "true",
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErr(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setErr("Network error. Please try again.");
      setStatus("idle");
    }
  };

  if (!event) {
    return (
      <div className="ed">
        <style>{css}</style>
        <nav className="ed-nav">
          <a className="ed-nav-brand" href="/"><span className="ed-wordmark">ROAMSIX</span></a>
          <Link className="ed-nav-back" to="/events">← Events</Link>
        </nav>
        <div style={{ padding: "180px 56px 100px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", color: "#B8B0A6", letterSpacing: "2px", textTransform: "uppercase" }}>
            Event not found.
          </p>
          <Link to="/events" style={{ display: "inline-block", marginTop: "32px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase", color: "#4A7575", textDecoration: "none" }}>
            View All Events
          </Link>
        </div>
      </div>
    );
  }

  const modalPrice = modal
    ? isBundle && modal.bundlePrice
      ? fmtPrice(modal.bundlePrice)
      : fmtPrice(modal.price)
    : "";

  return (
    <div className="ed">
      <style>{css}</style>

      {/* MODAL */}
      {modal && (
        <div className="ed-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="ed-modal" role="dialog" aria-modal="true">
            <div className="ed-modal-event-summary">
              <div className="ed-modal-event-name">{event.modalTitle || event.title}</div>
              <div className="ed-modal-event-date">{fmtModalDate(event.date)}</div>
              {event.venueName && <div className="ed-modal-event-venue">{event.venueName}</div>}
              <div className="ed-modal-event-loc">{event.cityState || event.location}</div>
              {event.timeRange && <div className="ed-modal-event-time">{event.timeRange}</div>}
            </div>
            <div className="ed-modal-header">
              <div>
                <div className="ed-modal-pkg">{modal.name}</div>
                <div className="ed-modal-price">{modalPrice} <span style={{ fontSize: "16px", fontWeight: 400, color: "var(--cream-muted)" }}>/ person{isBundle && modal.bundlePrice ? " x2" : ""}</span></div>
              </div>
              <button className="ed-modal-close" onClick={closeModal} aria-label="Close">&#215;</button>
            </div>
            <div className="ed-modal-body">
              {modal.bundlePrice && (
                <div className="ed-bundle-toggle">
                  <div
                    className={`ed-bundle-opt${!isBundle ? " active" : ""}`}
                    onClick={() => setIsBundle(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setIsBundle(false)}
                  >
                    <span className="ed-bundle-opt-label">Individual</span>
                    <span className="ed-bundle-opt-price">{fmtPrice(modal.price)}</span>
                  </div>
                  <div
                    className={`ed-bundle-opt${isBundle ? " active" : ""}`}
                    onClick={() => setIsBundle(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setIsBundle(true)}
                  >
                    <span className="ed-bundle-opt-label">Couples Bundle</span>
                    <span className="ed-bundle-opt-price">{fmtPrice(modal.bundlePrice)}</span>
                  </div>
                </div>
              )}
              <div className="ed-form-group">
                <label className="ed-form-label">Full Name *</label>
                <input
                  className="ed-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="ed-form-group">
                <label className="ed-form-label">Email Address *</label>
                <input
                  className="ed-input"
                  placeholder="your@email.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="ed-form-group">
                <label className="ed-form-label">Phone Number *</label>
                <input
                  className="ed-input"
                  placeholder="(555) 000-0000"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="ed-modal-divider" />
              <div className="ed-form-group">
                <label className="ed-form-label">Emergency Contact Name *</label>
                <input
                  className="ed-input"
                  placeholder="Full name"
                  value={form.emergencyContactName}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
                />
              </div>
              <div className="ed-form-group">
                <label className="ed-form-label">Emergency Contact Phone *</label>
                <input
                  className="ed-input"
                  placeholder="(555) 000-0000"
                  type="tel"
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
                />
              </div>
              <div className="ed-modal-divider" />
              <p className="ed-modal-cancel-notice">
                Tickets are non-refundable and non-transferable. If you are unable to attend, you must notify ROAMSIX at least 48 hours before the scheduled event start time. At ROAMSIX's sole discretion, your registration may be credited toward a future ROAMSIX event. No credits, transfers, or rescheduling requests will be granted within 48 hours of the event. No-shows forfeit their registration.{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              </p>
              <div className="ed-modal-consent">
                <input
                  type="checkbox"
                  className="ed-modal-consent-check"
                  id="ed-age-confirmed"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />
                <label htmlFor="ed-age-confirmed" className="ed-modal-consent-text">
                  I confirm that I am 21 years of age or older.
                </label>
              </div>
              <p className="ed-modal-voluntary">
                Participation in ROAMSIX events is voluntary. Participants are responsible for determining whether they are physically capable of participating and may discontinue participation at any time.
              </p>
              <div className="ed-modal-consent">
                <input
                  type="checkbox"
                  className="ed-modal-consent-check"
                  id="ed-consent"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="ed-consent" className="ed-modal-consent-text">
                  By checking this box, I acknowledge that I have read and agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>,{" "}
                  <a href="/waiver" target="_blank" rel="noopener noreferrer">Assumption of Risk and Participant Agreement</a>,{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, and{" "}
                  <a href="/media-release" target="_blank" rel="noopener noreferrer">Media Release</a>.{" "}
                  I understand participation may involve physical activity, uneven terrain, outdoor environments,
                  food service, weather exposure, and other inherent risks.
                </label>
              </div>
              {err && <div className="ed-modal-err">{err}</div>}
              <button
                className="ed-modal-submit"
                onClick={handleSubmit}
                disabled={
                  status === "loading" ||
                  !form.name.trim() || !form.email.trim() || !form.phone.trim() ||
                  !form.emergencyContactName.trim() || !form.emergencyContactPhone.trim() ||
                  !ageConfirmed || !agreedToTerms
                }
              >
                {status === "loading" ? "Redirecting..." : "Proceed to Checkout"}
              </button>
              <p className="ed-modal-note">
                You will be redirected to a secure Stripe checkout page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="ed-nav">
        <a className="ed-nav-brand" href="/"><span className="ed-wordmark">ROAMSIX</span></a>
        <Link className="ed-nav-back" to="/events">← All Events</Link>
      </nav>

      {/* HERO */}
      <section className="ed-hero">
        <img className="ed-hero-bg" src="/images/sunset-valley.webp" alt="" aria-hidden="true" onError={e=>{e.target.style.display='none'}}/>
        <div className="ed-hero-shade"/>
        <div className="ed-hero-inner">
          <div className="ed-event-tag">ROAMSIX Experience</div>
          <h1 className="ed-hero-title">{event.title}</h1>
          {event.subtitle && <div className="ed-hero-subtitle">{event.subtitle}</div>}
          <div className="ed-hero-meta">
            <div className="ed-meta-item">
              <span className="ed-meta-label">Date</span>
              <span className="ed-meta-value">{formatEventDate(event.date)}</span>
            </div>
            <div className="ed-meta-item">
              <span className="ed-meta-label">Location</span>
              <span className="ed-meta-value">{event.location}</span>
            </div>
            <div className="ed-meta-item">
              <span className="ed-meta-label">Venue</span>
              <span className="ed-meta-value">{event.locationDetail}</span>
            </div>
            <div className="ed-meta-item">
              <span className="ed-meta-label">Status</span>
              <StatusBadge status={event.status} />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="ed-body">
        <div className="ed-body-grid">
          <div className="ed-body-text">
            {event.body.map((p, i) => <p key={i}>{p}</p>)}
            {event.menu && (
              <div className="ed-menu">
                <div className="ed-menu-label">{event.menu.label}</div>
                <div className="ed-menu-sublabel">{event.menu.sublabel}</div>
                <ul className="ed-menu-list">
                  {event.menu.items.map((item, i) => (
                    <li key={i}><span className="ed-menu-dash">-</span>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="ed-highlights">
            <div className="ed-highlights-label">What's Included</div>
            <ul className="ed-highlights-list">
              {event.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        </div>

        <div className="ed-img-divider">
          <img src="/images/events/event-dinner-placeholder.webp" alt="" loading="lazy" onError={e=>{e.target.style.display='none'}}/>
        </div>

        <hr className="ed-hr" />

        {/* SINGLE OFFER */}
        <div className="ed-offer-wrap">
          <div className="ed-label-row" style={{ justifyContent: "center", marginBottom: "16px" }}>
            <span className="ed-rule" />
            <span className="ed-label">Registration</span>
            <span className="ed-rule" />
          </div>
          <div className="ed-offer">
            <div className="ed-offer-top">
              <div className="ed-offer-name">{event.packages[0].name}</div>
              <div className="ed-offer-price-row">
                <div className="ed-offer-price">{fmtPrice(event.packages[0].price)}</div>
                <div className="ed-offer-price-label">per person</div>
              </div>
              <p className="ed-offer-subcopy">{event.packages[0].description}</p>
            </div>
            <div className="ed-offer-body">
              <div className="ed-offer-section-label">What's Included</div>
              <ul className="ed-offer-list" style={{ marginBottom: "28px" }}>
                {event.packages[0].includes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <div className="ed-offer-promo">
                <div className="ed-offer-promo-label">Father's Day Weekend</div>
                <div className="ed-offer-two-tickets">Two tickets for $398</div>
                <p className="ed-offer-promo-text">
                  Use code{" "}
                  <span className="ed-offer-promo-code">FATHER30</span>
                  {" "}for 30% off at checkout.
                </p>
              </div>
              <div className="ed-offer-footer">
                <div className="ed-offer-capacity">Limited to 20 guests</div>
                {event.status === "soldout" ? (
                  <div className="ed-offer-btn-soldout">Sold Out</div>
                ) : (
                  <button
                    className="ed-offer-btn"
                    onClick={() => openModal(event.packages[0])}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="ed-footer">
        <div className="ed-footer-top">
          <span className="ed-footer-brand">ROAMSIX</span>
          <Link className="ed-footer-link" to="/events">All Events</Link>
        </div>
        <div className="ed-footer-legal">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/waiver">Assumption of Risk</Link>
          <Link to="/media-release">Media Release</Link>
          <Link to="/terms">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
