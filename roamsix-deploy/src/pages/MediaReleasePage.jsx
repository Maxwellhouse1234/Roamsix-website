import LegalPage from "./LegalPage";

export default function MediaReleasePage() {
  return (
    <LegalPage title="Media Release" lastUpdated="June 2026">

      <div className="lp-section">
        <h2 className="lp-section-title">Permission to Photograph and Film</h2>
        <p>
          By registering for and attending a ROAMSIX event, you grant ROAMSIX and Reciprofy Inc. permission to photograph, film, record audio, capture video, and document testimonials, conversations, and activities in which you participate during the event.
        </p>
        <p>
          This permission is granted without limitation as to time, geography, or media format.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Permitted Uses</h2>
        <p>
          Media captured at ROAMSIX events may be used for any legitimate business purpose, including:
        </p>
        <ul>
          <li>ROAMSIX website and digital properties</li>
          <li>Social media platforms including Instagram, LinkedIn, YouTube, and others</li>
          <li>Email campaigns and newsletters</li>
          <li>Paid advertising and promotional materials</li>
          <li>Investor and partner presentations</li>
          <li>Press releases, editorial content, and publications</li>
          <li>Future event promotion</li>
        </ul>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">No Compensation</h2>
        <p>
          You acknowledge that you will not receive any compensation, royalties, or other remuneration for the use of any media content that includes your likeness, voice, or image, regardless of how that content is used.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Editorial Rights</h2>
        <p>
          ROAMSIX reserves the right to edit, crop, resize, color-correct, caption, reproduce, publish, and distribute media content in any format without seeking additional approval. This includes use across physical and digital media.
        </p>
        <p>
          ROAMSIX will use media in a manner consistent with its brand values and will not intentionally use images or footage in a way that is defamatory or materially misleading.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Opt-Out Process</h2>
        <p>
          If you do not wish to appear in media content created at a ROAMSIX event, you must notify ROAMSIX in writing before the event.
        </p>
        <p>
          Opt-out requests must be submitted to <a href="mailto:info@roamsix.com" style={{ color: "#5A8A8A" }}>info@roamsix.com</a> no later than 72 hours before the event start time. Include your full name, the event name, and a clear statement that you are requesting an opt-out from media capture.
        </p>
        <p>
          ROAMSIX will make reasonable efforts to honor opt-out requests during the event. However, in group settings and candid photography situations, ROAMSIX cannot guarantee that individuals who have submitted opt-out requests will not appear incidentally in wide-angle or group photographs.
        </p>
        <p>
          Opt-out requests submitted after an event has taken place cannot be guaranteed and will be assessed on a case-by-case basis.
        </p>
      </div>

      <div className="lp-contact">
        <div className="lp-contact-label">Contact</div>
        <p>
          Questions about this Media Release? Contact us at <a href="mailto:info@roamsix.com">info@roamsix.com</a> before your event.
        </p>
      </div>

    </LegalPage>
  );
}
