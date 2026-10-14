import { NavLink } from 'react-router-dom';

const links = [
  ['Individual', '/events/dr-sal-gut-brain-2026/registration-preview'],
  ['Second guest', '/events/dr-sal-gut-brain-2026/guest-agreement-preview?token=preview-guest'],
  ['Emails', '/events/dr-sal-gut-brain-2026/email-preview'],
  ['QR ticket', '/events/dr-sal-gut-brain-2026/ticket-preview'],
  ['Check-in', '/events/dr-sal-gut-brain-2026/check-in-preview'],
  ['Reporting', '/events/dr-sal-gut-brain-2026/attendance-preview'],
];

export default function EventPreviewNav() {
  return <nav className="event-preview-nav" aria-label="Private event-system preview">{links.map(([label, href]) => <NavLink key={href} to={href}>{label}</NavLink>)}</nav>;
}
