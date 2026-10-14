import SiteLayout from '../components/SiteLayout';
import EventPreviewNav from '../components/EventPreviewNav';
import { PREVIEW_TICKET_ID } from '../data/oct24RegistrationPreview';

export default function DrSalTicketPreviewPage() {
  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">PRIVATE QR-TICKET PREVIEW · SAMPLE CREDENTIAL ONLY</p><h1>Your October 24 ticket.</h1><p className="page-lead">One attendee, one opaque lookup key. The code contains no name, email or other personal information, and it is not a standalone admission credential.</p></div></section>
    <EventPreviewNav />
    <section className="section light-section"><div className="container narrow"><article className="event-ticket-preview">
      <div><p className="eyebrow">Admission ready</p><h2>Jordan Preview</h2><p>The gut-brain connection: food, stress, and everyday performance</p><dl><div><dt>Date</dt><dd>October 24, 2026 · 4:00–6:00 PM</dd></div><div><dt>Location</dt><dd>Prayers for Peace Park / Essene Retreat Center</dd></div><div><dt>Admission</dt><dd>Individual admission · paid</dd></div><div><dt>Agreement</dt><dd>Complete</dd></div></dl></div>
      <div className="event-ticket-qr"><img src="/images/oct24-preview-ticket.svg" alt="Sample QR ticket code" /><code>{PREVIEW_TICKET_ID}</code><p>At every scan, the staff system looks up the attendee's current registration, payment or member-included status, event-specific agreement status, cancellation state and prior check-in. The code alone does not grant admission.</p></div>
    </article></div></section>
  </SiteLayout>;
}
