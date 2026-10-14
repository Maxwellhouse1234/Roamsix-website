import SiteLayout from '../components/SiteLayout';
import EventPreviewNav from '../components/EventPreviewNav';

function EmailCard({ eyebrow, subject, children }) {
  return <article className="event-email-preview"><p className="eyebrow">{eyebrow}</p><p className="event-email-subject"><strong>Subject:</strong> {subject}</p><div className="event-email-body"><div className="event-email-brand">ROAMSIX</div>{children}<p className="event-email-footer">Reciprofy Inc., dba ROAMSIX<br />Southern California</p></div></article>;
}

export default function DrSalEmailPreviewPage() {
  return <SiteLayout theme="dark">
    <section className="page-hero editorial-page-hero event-preview-hero"><div className="container narrow"><p className="eyebrow">PRIVATE EMAIL PREVIEW · NOTHING WILL BE SENT</p><h1>Attendee messages.</h1><p className="page-lead">Each adult receives only the message and credential appropriate to their own agreement status.</p></div></section>
    <EventPreviewNav />
    <section className="section light-section"><div className="container event-email-grid">
      <EmailCard eyebrow="Individual confirmation" subject="Your October 24 ROAMSIX registration is confirmed">
        <p>Hi Jordan,</p><p>Your admission is confirmed for The gut-brain connection: food, stress, and everyday performance.</p><dl><div><dt>Date</dt><dd>October 24, 2026 · 4:00–6:00 PM</dd></div><div><dt>Location</dt><dd>Prayers for Peace Park / Essene Retreat Center<br />29455 Pamoosa Lane, Valley Center, CA 92082</dd></div><div><dt>Agreement</dt><dd>Accepted · copy attached</dd></div><div><dt>Photography</dt><dd>Declined</dd></div></dl><a className="button" href="/events/dr-sal-gut-brain-2026/ticket-preview">Open my QR ticket</a><p>Your QR ticket becomes admission-ready only while your agreement and admission remain valid. Please do not forward it.</p>
      </EmailCard>
      <EmailCard eyebrow="Member-included confirmation" subject="Your included October 24 ROAMSIX admission is confirmed">
        <p>Hi Morgan,</p><p>Your October 24 admission is included with your active ROAMSIX membership. You were not charged.</p><dl><div><dt>Admission</dt><dd>Member-included</dd></div><div><dt>Agreement</dt><dd>Accepted · copy attached</dd></div><div><dt>Photography</dt><dd>Declined</dd></div></dl><a className="button" href="/events/dr-sal-gut-brain-2026/ticket-preview">Open my QR ticket</a><p>Your QR ticket remains valid only while your membership admission and event-specific agreement remain current.</p>
      </EmailCard>
    </div></section>
  </SiteLayout>;
}
