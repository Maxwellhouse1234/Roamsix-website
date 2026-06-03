import LegalPage from "./LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 2026">

      <div className="lp-section">
        <h2 className="lp-section-title">Information We Collect</h2>
        <p>
          When you register for a ROAMSIX event or interact with our website, we may collect the following information:
        </p>
        <ul>
          <li>Full name and email address</li>
          <li>Phone number</li>
          <li>Emergency contact name and phone number</li>
          <li>Medical conditions, injuries, mobility considerations, or dietary restrictions you choose to disclose</li>
          <li>Payment status (not full payment card details, which are handled by Stripe)</li>
          <li>Event registration details including package selected and registration date</li>
          <li>How you heard about ROAMSIX</li>
          <li>Responses to optional intake questions</li>
          <li>Marketing source or referral information if applicable</li>
        </ul>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Process and confirm your event registration</li>
          <li>Communicate event details, logistics, schedule, and safety information</li>
          <li>Prepare for food allergies, dietary restrictions, and accessibility needs</li>
          <li>Contact your emergency contact if a medical situation arises</li>
          <li>Send event-related updates and follow-up communications</li>
          <li>Improve the quality of future ROAMSIX events and offerings</li>
          <li>Send occasional marketing communications about future events (you may opt out at any time)</li>
        </ul>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Payment Processing</h2>
        <p>
          All payment transactions are processed by Stripe, a third-party payment processor. When you complete a purchase on our website, your payment information is submitted directly to Stripe and processed in accordance with Stripe's privacy and security policies. ROAMSIX does not store your full payment card number, CVV, or other sensitive payment details.
        </p>
        <p>
          ROAMSIX receives confirmation of payment status and a transaction identifier from Stripe for recordkeeping purposes.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Data Storage</h2>
        <p>
          Participant registration information is stored in Airtable, a cloud-based database service. Data stored includes registration details, contact information, intake form responses, and payment status. Airtable operates its own security and access controls. ROAMSIX limits access to participant data to authorized staff only.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Email Communication</h2>
        <p>
          By registering for a ROAMSIX event, you consent to receive transactional emails related to your registration, including confirmation emails, intake form reminders, event detail communications, and post-event follow-up. These emails are sent through Resend, a third-party email delivery service.
        </p>
        <p>
          You may also receive occasional marketing emails about upcoming ROAMSIX events and offerings. You may unsubscribe from marketing emails at any time by following the unsubscribe link in the email or contacting us directly.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Event Safety Communication</h2>
        <p>
          If you have opted in to text messaging, ROAMSIX may send you text messages related to event logistics, parking, schedule changes, weather alerts, or safety information. Standard message and data rates may apply. You may opt out at any time by replying STOP to any message or notifying us at <a href="mailto:info@roamsix.com" style={{ color: "#5A8A8A" }}>info@roamsix.com</a>.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Media and Marketing</h2>
        <p>
          If you appear in photographs or video captured at a ROAMSIX event, your likeness may be used in marketing and promotional materials as described in our Media Release. Please review our <a href="/media-release" style={{ color: "#5A8A8A" }}>Media Release</a> for details and opt-out instructions.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">No Sale of Personal Information</h2>
        <p>
          ROAMSIX does not sell, rent, or trade your personal information to third parties for their marketing purposes.
        </p>
        <p>
          We may share information with service providers who assist us in operating the ROAMSIX business (such as Stripe for payments, Airtable for data storage, and Resend for email delivery). These providers are authorized to use your information only as necessary to perform services on our behalf.
        </p>
      </div>

      <div className="lp-contact">
        <div className="lp-contact-label">Contact</div>
        <p>
          Questions about this Privacy Policy or your data? Contact us at <a href="mailto:info@roamsix.com">info@roamsix.com</a>. We will respond within a reasonable timeframe.
        </p>
        <p style={{ marginTop: "10px" }}>
          ROAMSIX is operated by Reciprofy Inc., Murrieta, CA.
        </p>
      </div>

    </LegalPage>
  );
}
