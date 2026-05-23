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
  .ed-modal-submit:hover { background: var(--cream); }
  .ed-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .ed-modal-note { font-size: 13px; color: var(--cream-muted); text-align: center; margin-top: 12px; line-height: 1.5; }

  /* IMAGE DIVIDER */
  .ed-img-divider { width: 100%; aspect-ratio: 16/6; overflow: hidden; margin-bottom: 80px; }
  .ed-img-divider img { width: 100%; height: 100%; object-fit: cover; object-position: center 40%; filter: brightness(0.65) contrast(1.05); display: block; }

  /* FOOTER */
  .ed-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 40px 56px; display: flex; align-items: center; justify-content: space-between; }
  .ed-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .ed-footer-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .ed-footer-link:hover { color: var(--cream); }

  @media (max-width: 900px) {
    .ed-nav { padding: 0 24px; }
    .ed-hero { padding: 120px 24px 60px; }
    .ed-body { padding: 60px 24px; }
    .ed-body-grid { grid-template-columns: 1fr; gap: 40px; margin-bottom: 60px; }
    .ed-packages-grid { grid-template-columns: 1fr; }
    .ed-img-divider { margin-bottom: 60px; }
    .ed-footer { padding: 32px 24px; flex-direction: column; gap: 16px; text-align: center; }
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

  const [modal, setModal] = useState(null);
  const [isBundle, setIsBundle] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
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
    setForm({ name: "", email: "" });
    setStatus("idle");
    setErr("");
  };

  const closeModal = () => {
    setModal(null);
    setStatus("idle");
    setErr("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setErr("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr("Please enter a valid email address.");
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
                <label className="ed-form-label">Full Name</label>
                <input
                  className="ed-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="ed-form-group">
                <label className="ed-form-label">Email Address</label>
                <input
                  className="ed-input"
                  placeholder="your@email.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              {err && <div className="ed-modal-err">{err}</div>}
              <button
                className="ed-modal-submit"
                onClick={handleSubmit}
                disabled={status === "loading"}
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
          </div>
          <div className="ed-highlights">
            <div className="ed-highlights-label">What's Included</div>
            <ul className="ed-highlights-list">
              {event.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        </div>

        <div className="ed-img-divider">
          <img src="/images/gathering-dusk.webp" alt="" loading="lazy" onError={e=>{e.target.style.display='none'}}/>
        </div>

        <hr className="ed-hr" />

        {/* PACKAGES */}
        <div className="ed-packages-head">
          <div className="ed-label-row">
            <span className="ed-rule" />
            <span className="ed-label">Registration</span>
          </div>
          <h2 className="ed-packages-h2">Choose your experience.</h2>
        </div>

        <div className="ed-packages-grid">
          {event.packages.map((pkg, i) => {
            const isFeatured = i === 1;
            const soldOut = event.status === "soldout";
            return (
              <div key={pkg.id} className={`ed-pkg${isFeatured ? " ed-pkg-featured" : ""}`}>
                {pkg.id === "private-circle" && <span className="ed-pkg-limited">Limited to 10 guests</span>}
                <div className="ed-pkg-name">{pkg.name}</div>
                <div className="ed-pkg-price">{fmtPrice(pkg.price)}</div>
                <div className="ed-pkg-price-label">per person</div>
                <p className="ed-pkg-desc">{pkg.description}</p>
                <div className="ed-pkg-includes-label">Includes</div>
                <ul className="ed-pkg-includes">
                  {pkg.includes.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
                {pkg.bundleOffer && pkg.bundlePrice && (
                  <div className="ed-pkg-bundle">
                    <span className="ed-pkg-bundle-label">Bundle Offer</span>
                    {pkg.bundleOffer}
                  </div>
                )}
                {pkg.bundleOffer && !pkg.bundlePrice && (
                  <div className="ed-pkg-bundle">
                    <span className="ed-pkg-bundle-label">Special Offer</span>
                    {pkg.bundleOffer}
                  </div>
                )}
                {soldOut ? (
                  <div className="ed-pkg-btn-soldout">Sold Out</div>
                ) : (
                  <>
                    <button
                      className={`ed-pkg-btn${isFeatured ? " ed-pkg-btn-gold" : ""}`}
                      onClick={() => openModal(pkg, false)}
                    >
                      Register
                    </button>
                    {pkg.bundlePrice && (
                      <button
                        className="ed-pkg-btn-bundle"
                        onClick={() => openModal(pkg, true)}
                      >
                        Couples Bundle: {fmtPrice(pkg.bundlePrice)} for two
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="ed-footer">
        <span className="ed-footer-brand">ROAMSIX</span>
        <Link className="ed-footer-link" to="/events">← All Events</Link>
      </footer>
    </div>
  );
}
