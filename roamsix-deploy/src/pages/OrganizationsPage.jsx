import SiteLayout from '../components/SiteLayout';
import BookCallButton from '../components/BookCallButton';

export default function OrganizationsPage() {
  const emailHref = 'mailto:info@roamsix.com?subject=ROAMSIX%20organization%20inquiry';
  return (
    <SiteLayout>
      <section className="page-hero"><div className="container narrow"><p className="eyebrow">For organizations</p><h1>Give your people a deeper way to learn.</h1><p className="page-lead">ROAMSIX designs immersive retreats and experiences around subjects that matter to people and the organizations they serve. Your team can take part in an existing ROAMSIX experience, or work with us to shape one around a specific need.</p></div></section>
      <section className="section light-section"><div className="container organization-options">
        <article><p className="eyebrow">Join an existing experience</p><h2>Bring the right people into the room.</h2><p>Send one person or a group to a ROAMSIX experience that connects with their work, development, or the people they serve. We can coordinate direct invoicing and the documentation your organization requires.</p><div className="choice-links"><BookCallButton className="text-link">Let’s connect <span aria-hidden="true">→</span></BookCallButton><a className="text-link" href={emailHref}>Send a quick email <span aria-hidden="true">→</span></a></div></article>
        <article><p className="eyebrow">Create something for your organization</p><h2>Shape an experience around your needs.</h2><p>ROAMSIX can design a private retreat or experience around a subject your people need to understand more deeply. We bring together the right expertise, place, practices, and shared journey for that question.</p><div className="choice-links"><BookCallButton className="text-link">Let’s connect <span aria-hidden="true">→</span></BookCallButton><a className="text-link" href={emailHref}>Send a quick email <span aria-hidden="true">→</span></a></div></article>
      </div></section>
      <section className="section ink-section"><div className="container contact-block"><p className="eyebrow">Begin with the need</p><h2>What would you like your people to understand differently?</h2><p>Tell us what your team is working through. We will help you decide whether an existing experience fits or whether we should build something around it.</p><div className="button-row"><BookCallButton className="button">Let’s connect</BookCallButton><a className="text-link light" href={emailHref}>Or send us an email <span aria-hidden="true">→</span></a></div></div></section>
    </SiteLayout>
  );
}
