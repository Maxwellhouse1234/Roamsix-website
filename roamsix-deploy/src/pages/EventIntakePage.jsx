import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  .ei *, .ei *::before, .ei *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ei {
    font-family: 'Barlow', sans-serif; background: #141C2A; color: #E8DFD0;
    min-height: 100vh; font-size: 17px; line-height: 1.75;
    --navy: #141C2A; --panel: #0C1220; --navy-mid: #1A2337;
    --teal: #4A7575; --teal-dim: #3A5A5A; --teal-light: #5A8A8A;
    --cream: #E8DFD0; --cream-dim: #DDD6CC; --cream-muted: #B8B0A6;
    --gold: #B59558;
  }

  /* NAV */
  .ei-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; align-items: center; padding: 0 52px; height: 76px; background: rgba(6,10,18,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(181,149,88,0.12); }
  .ei-nav-brand { text-decoration: none; }
  .ei-wordmark { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; }
  .ei-nav-link { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); text-decoration: none; transition: color 0.2s; }
  .ei-nav-link:hover { color: var(--cream); }

  /* PAGE */
  .ei-page { padding: 120px 56px 100px; max-width: 720px; margin: 0 auto; }

  /* HEADER */
  .ei-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .ei-rule { display: block; width: 24px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .ei-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); }
  .ei-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: clamp(30px, 4vw, 48px); letter-spacing: 1px; text-transform: uppercase; color: var(--cream); line-height: 1.05; margin-bottom: 16px; }
  .ei-subtitle { font-size: 16px; color: var(--cream-muted); line-height: 1.7; margin-bottom: 48px; }

  /* FORM */
  .ei-section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 20px; margin-top: 40px; padding-bottom: 10px; border-bottom: 1px solid rgba(74,117,117,0.2); }
  .ei-section-title:first-of-type { margin-top: 0; }
  .ei-form-group { margin-bottom: 16px; }
  .ei-label-field { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--cream-muted); display: block; margin-bottom: 6px; }
  .ei-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; }
  .ei-input:focus { border-color: var(--teal); }
  .ei-input::placeholder { color: rgba(232,223,208,0.3); }
  .ei-textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(232,223,208,0.15); color: var(--cream); font-family: 'Barlow', sans-serif; font-size: 15px; padding: 13px 16px; width: 100%; outline: none; transition: border-color 0.2s; resize: vertical; min-height: 100px; }
  .ei-textarea:focus { border-color: var(--teal); }
  .ei-textarea::placeholder { color: rgba(232,223,208,0.3); }
  .ei-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }

  /* CHECKBOXES */
  .ei-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .ei-check-item { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .ei-check-item input[type="checkbox"] { width: 17px; height: 17px; min-width: 17px; accent-color: var(--teal); cursor: pointer; }
  .ei-check-label { font-size: 15px; color: var(--cream-dim); cursor: pointer; }

  /* CONSENT */
  .ei-consent { display: flex; gap: 12px; align-items: flex-start; margin-top: 24px; margin-bottom: 28px; background: rgba(74,117,117,0.06); border: 1px solid rgba(74,117,117,0.15); padding: 18px; }
  .ei-consent input[type="checkbox"] { width: 18px; height: 18px; min-width: 18px; margin-top: 2px; accent-color: var(--teal); cursor: pointer; }
  .ei-consent-text { font-size: 14px; color: var(--cream-muted); line-height: 1.6; }

  /* SUBMIT */
  .ei-submit { width: 100%; padding: 17px; background: var(--gold); color: var(--navy); font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.22s; }
  .ei-submit:hover:not(:disabled) { background: var(--cream); }
  .ei-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .ei-err { color: #E07070; font-size: 14px; margin-bottom: 16px; line-height: 1.5; }

  /* SUCCESS */
  .ei-success { background: rgba(74,117,117,0.1); border: 1px solid rgba(74,117,117,0.3); border-left: 3px solid var(--teal); padding: 36px; margin-top: 40px; }
  .ei-success-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--teal-light); margin-bottom: 16px; }
  .ei-success-text { font-size: 16px; color: var(--cream-dim); line-height: 1.75; }

  /* FOOTER */
  .ei-footer { background: var(--panel); border-top: 1px solid rgba(181,149,88,0.1); padding: 32px 56px; margin-top: 60px; }
  .ei-footer-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--cream); text-transform: uppercase; display: block; margin-bottom: 16px; }
  .ei-footer-legal { display: flex; flex-wrap: wrap; gap: 20px; }
  .ei-footer-legal a { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: rgba(232,223,208,0.4); text-decoration: none; transition: color 0.2s; }
  .ei-footer-legal a:hover { color: var(--cream-muted); }

  @media (max-width: 900px) {
    .ei-nav { padding: 0 24px; }
    .ei-page { padding: 108px 24px 72px; }
    .ei-row { grid-template-columns: 1fr; }
    .ei-check-grid { grid-template-columns: 1fr; }
    .ei-footer { padding: 28px 24px; }
  }
`;

const DIETARY_OPTIONS = [
  "None",
  "Gluten-Free",
  "Dairy-Free",
  "Vegetarian",
  "Vegan",
  "Nut Allergy",
  "Shellfish Allergy",
  "Other",
];

export default function EventIntakePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [form, setForm] = useState({
    emergencyContactName: "",
    emergencyContactPhone: "",
    dietaryRestrictions: [],
    foodAllergies: "",
    medicalNotes: "",
    whyAttending: "",
    goals: "",
    howHeard: "",
    textConsent: false,
  });
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | loading | success | error
  const [err, setErr] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Participant Intake Form | ROAMSIX";
    return () => { document.title = "ROAMSIX"; };
  }, []);

  function toggleDietary(option) {
    setForm((f) => {
      const next = f.dietaryRestrictions.includes(option)
        ? f.dietaryRestrictions.filter((d) => d !== option)
        : [...f.dietaryRestrictions, option];
      return { ...f, dietaryRestrictions: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
      setErr("Please provide your emergency contact name and phone number.");
      return;
    }
    if (!sessionId) {
      setErr("Missing session ID. Please use the link from your confirmation email.");
      return;
    }
    setSubmitStatus("loading");
    setErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, ...form }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitStatus("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErr(data.error || "Something went wrong. Please try again or contact info@roamsix.com.");
        setSubmitStatus("idle");
      }
    } catch {
      setErr("Network error. Please try again.");
      setSubmitStatus("idle");
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="ei">
        <style>{css}</style>
        <nav className="ei-nav">
          <a className="ei-nav-brand" href="/"><span className="ei-wordmark">ROAMSIX</span></a>
          <Link className="ei-nav-link" to="/">Home</Link>
        </nav>
        <div className="ei-page">
          <div className="ei-success">
            <div className="ei-success-title">Intake Form Received</div>
            <p className="ei-success-text">
              Thank you. Your participant intake form has been received. We will use this information to prepare for your ROAMSIX experience.
            </p>
            <p className="ei-success-text" style={{ marginTop: "16px" }}>
              Questions before the event? Email us at{" "}
              <a href="mailto:info@roamsix.com" style={{ color: "#5A8A8A" }}>info@roamsix.com</a>.
            </p>
          </div>
          <div style={{ marginTop: "32px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="/" style={{ display: "inline-block", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", padding: "14px 28px", background: "#4A7575", color: "#E8DFD0", textDecoration: "none" }}>Back to Home</a>
            <Link to="/events" style={{ display: "inline-block", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", padding: "14px 28px", background: "transparent", color: "#E8DFD0", border: "1px solid rgba(232,223,208,0.25)", textDecoration: "none" }}>View Events</Link>
          </div>
        </div>
        <footer className="ei-footer">
          <span className="ei-footer-brand">ROAMSIX</span>
          <div className="ei-footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/waiver">Assumption of Risk</Link>
            <Link to="/media-release">Media Release</Link>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="ei">
      <style>{css}</style>

      <nav className="ei-nav">
        <a className="ei-nav-brand" href="/"><span className="ei-wordmark">ROAMSIX</span></a>
        <Link className="ei-nav-link" to="/">Home</Link>
      </nav>

      <div className="ei-page">
        <div className="ei-label-row">
          <span className="ei-rule" />
          <span className="ei-label">Pre-Event</span>
        </div>
        <h1 className="ei-title">Participant Intake Form</h1>
        <p className="ei-subtitle">
          This form helps us prepare for your ROAMSIX experience. All information is kept confidential and used only to ensure your safety, comfort, and a well-prepared event.
        </p>

        {!sessionId && (
          <div style={{ background: "rgba(224,112,112,0.08)", border: "1px solid rgba(224,112,112,0.2)", padding: "16px 20px", marginBottom: "32px", fontSize: "14px", color: "#E07070", lineHeight: 1.6 }}>
            No session ID found. Please use the link from your ROAMSIX confirmation email to access this form.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="ei-section-title">Emergency Contact</div>

          <div className="ei-row">
            <div className="ei-form-group" style={{ marginBottom: 0 }}>
              <label className="ei-label-field">Emergency Contact Name *</label>
              <input className="ei-input" placeholder="Full name" value={form.emergencyContactName}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))} />
            </div>
            <div className="ei-form-group" style={{ marginBottom: 0 }}>
              <label className="ei-label-field">Emergency Contact Phone *</label>
              <input className="ei-input" type="tel" placeholder="(555) 000-0000" value={form.emergencyContactPhone}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))} />
            </div>
          </div>

          <div className="ei-section-title">Dietary Restrictions</div>

          <div className="ei-check-grid">
            {DIETARY_OPTIONS.map((opt) => (
              <label key={opt} className="ei-check-item">
                <input
                  type="checkbox"
                  checked={form.dietaryRestrictions.includes(opt)}
                  onChange={() => toggleDietary(opt)}
                />
                <span className="ei-check-label">{opt}</span>
              </label>
            ))}
          </div>

          <div className="ei-form-group">
            <label className="ei-label-field">Food Allergies</label>
            <input className="ei-input" placeholder="List any specific food allergies" value={form.foodAllergies}
              onChange={(e) => setForm((f) => ({ ...f, foodAllergies: e.target.value }))} />
          </div>

          <div className="ei-section-title">Health and Accessibility</div>

          <div className="ei-form-group">
            <label className="ei-label-field">Accessibility, Mobility, Dietary, or Safety Considerations</label>
            <textarea className="ei-textarea"
              placeholder="Please let us know about any dietary restrictions, food allergies, accessibility needs, mobility limitations, injuries, or other considerations that would help us create a safer and more comfortable experience for you."
              value={form.medicalNotes}
              onChange={(e) => setForm((f) => ({ ...f, medicalNotes: e.target.value }))}
            />
          </div>

          <div className="ei-section-title">About You</div>

          <div className="ei-form-group">
            <label className="ei-label-field">What made you decide to attend?</label>
            <textarea className="ei-textarea" placeholder="Optional" value={form.whyAttending}
              onChange={(e) => setForm((f) => ({ ...f, whyAttending: e.target.value }))} />
          </div>
          <div className="ei-form-group">
            <label className="ei-label-field">What are you hoping to get from this experience?</label>
            <textarea className="ei-textarea" placeholder="Optional" value={form.goals}
              onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))} />
          </div>
          <div className="ei-form-group">
            <label className="ei-label-field">How did you hear about ROAMSIX?</label>
            <input className="ei-input" placeholder="Instagram, word of mouth, LinkedIn, etc." value={form.howHeard}
              onChange={(e) => setForm((f) => ({ ...f, howHeard: e.target.value }))} />
          </div>

          <div className="ei-section-title">Communication Preferences</div>

          <div className="ei-consent">
            <input
              type="checkbox"
              id="ei-text-consent"
              checked={form.textConsent}
              onChange={(e) => setForm((f) => ({ ...f, textConsent: e.target.checked }))}
            />
            <label htmlFor="ei-text-consent" className="ei-consent-text">
              Yes, ROAMSIX may text me important event updates related to weather, parking, schedule changes, safety, or logistics.
            </label>
          </div>

          {err && <div className="ei-err">{err}</div>}

          <button
            type="submit"
            className="ei-submit"
            disabled={submitStatus === "loading" || !sessionId}
          >
            {submitStatus === "loading" ? "Submitting..." : "Submit Intake Form"}
          </button>

          <p style={{ marginTop: "14px", fontSize: "13px", color: "rgba(232,223,208,0.4)", lineHeight: 1.5 }}>
            Your information is kept confidential and used only to prepare for your event.
          </p>

        </form>
      </div>

      <footer className="ei-footer">
        <span className="ei-footer-brand">ROAMSIX</span>
        <div className="ei-footer-legal">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/waiver">Assumption of Risk</Link>
          <Link to="/media-release">Media Release</Link>
        </div>
      </footer>
    </div>
  );
}
