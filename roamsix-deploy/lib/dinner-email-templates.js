const ADDRESS = "251 Little Falls Drive, Wilmington, DE 19808";
const SIGNATURE = `<p style="margin:4px 0 0;color:#FAFAF9;font-family:'Brush Script MT','Segoe Script','Bradley Hand',cursive;font-size:30px;line-height:1.2;">Max &amp; Jackie</p>`;

function esc(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function shell({ preview, eyebrow, title, firstName, content, ctaLabel, ctaUrl, footerNote, preferencesUrl }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</span></head><body style="margin:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;color:#FAFAF9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#18181A;border:1px solid rgba(250,250,249,.12);"><tr><td style="padding:34px 40px;border-bottom:2px solid #B8562F;"><div style="font-size:22px;font-weight:700;letter-spacing:5px;">ROAMSIX</div><div style="margin-top:6px;color:#B8562F;font-size:11px;letter-spacing:3px;text-transform:uppercase;">${esc(eyebrow)}</div></td></tr><tr><td style="padding:42px 40px 16px;"><p style="font-size:18px;margin:0 0 24px;">${esc(firstName || "Hello")},</p><h1 style="font-family:Georgia,serif;font-size:34px;font-weight:400;line-height:1.22;margin:0 0 24px;">${esc(title)}</h1><div style="color:#E5E3E0;font-size:16px;line-height:1.8;">${content}</div></td></tr>${ctaUrl ? `<tr><td align="center" style="padding:10px 40px 42px;"><a href="${ctaUrl}" style="display:inline-block;background:#B8562F;color:#FAFAF9;text-decoration:none;padding:16px 30px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${esc(ctaLabel)}</a></td></tr>` : ""}<tr><td style="padding:30px 40px;border-top:1px solid rgba(250,250,249,.12);color:#9A9A96;font-size:11px;line-height:1.7;"><p style="margin:0 0 12px;">${footerNote}</p>${preferencesUrl ? `<p style="margin:0 0 12px;"><a href="${preferencesUrl}" style="color:#B8562F;">Manage email preferences</a></p>` : ""}<p style="margin:0;">Reciprofy Inc. dba ROAMSIX · ${ADDRESS}</p></td></tr></table></td></tr></table></body></html>`;
}

export function reservationReminderEmail({ firstName, isFounder, code, preferenceToken }) {
  const purchaseUrl = isFounder
    ? "https://www.roamsix.com/dinner?seats=2&code=FOUNDERPAIR#tickets"
    : `https://www.roamsix.com/dinner?code=${encodeURIComponent(code)}#tickets`;
  const offer = isFounder
    ? `<p>Your Founder invitation includes one seat for $148.75 with <strong>FOUNDER15</strong>, or two seats together for $275 with <strong>FOUNDERPAIR</strong>.</p>`
    : `<p>Your Founder-Friend invitation includes 10% off one individual seat with <strong>${esc(code)}</strong>. Two seats are available together for $295, and using the code still lets us thank the person who introduced you.</p>`;
  return {
    subject: "A gentle reminder from the ROAMSIX table",
    html: shell({
      preview: "September 19 is approaching, and a place at the table is still waiting for you.",
      eyebrow: "September dinner",
      title: "We wanted to leave the invitation with you once more.",
      firstName,
      content: `<p>As seats begin to fill for our evening at Father’s Farmhouse, we wanted to make sure the invitation did not get lost in the pace of summer.</p><p><strong>An Evening in the Olive Groves</strong><br>Saturday, September 19<br>Father’s Farmhouse in Winchester</p>${offer}<p>If the evening feels right for you, we would be glad to welcome you to the table.</p><p style="margin-bottom:0;">Warmly,</p>${SIGNATURE}`,
      ctaLabel: "Reserve your place",
      ctaUrl: purchaseUrl,
      footerNote: isFounder ? "You received this reminder because you previously attended a ROAMSIX dinner." : "This is the one follow-up to the personal Founder-Friend invitation sent to you. You have not been added to ongoing marketing.",
      preferencesUrl: `https://www.roamsix.com/email-preferences?token=${encodeURIComponent(preferenceToken)}`,
    }),
  };
}

export function finalDetailsEmail({ firstName }) {
  return {
    subject: "A few details for Saturday at Father’s Farmhouse",
    html: shell({
      preview: "Arrival, what to wear, and the flow of our evening in the olive groves.",
      eyebrow: "Your dinner details",
      title: "We’re looking forward to welcoming you on Saturday.",
      firstName,
      content: `<p><strong>Father’s Farmhouse</strong><br>31362 Keller Rd<br>Winchester, CA 92596</p><p><strong>Arrival:</strong> Please arrive between 4:30 and 5:00 p.m. Dinner will be served family style around 5:30 p.m.</p><p><strong>What to wear:</strong> Think elevated casual. Choose something comfortable, considered, and less formal than business casual. Comfortable shoes are recommended for garden paths and natural ground. Please bring a warm layer for after sunset.</p><p><strong>As the sun goes down:</strong> Sunset is expected near 6:50 p.m. We may take a short optional walk to a sunset point on the property and enjoy dessert with tea or coffee there.</p><p>If dietary, mobility, or arrival details have changed, please reply to this email so we can prepare with care.</p><p style="margin-bottom:0;">Warmly,</p>${SIGNATURE}`,
      footerNote: "This is an event-details message for your confirmed ROAMSIX reservation.",
    }),
  };
}

export function waitlistInvitationEmail({ firstName, partySize, expiresAt }) {
  const seats = partySize === 2 ? "two seats" : "one seat";
  const purchaseUrl = `https://www.roamsix.com/dinner?seats=${partySize}`;
  return {
    subject: "A place has opened at the ROAMSIX table",
    html: shell({
      preview: `${seats} became available for our September 19 dinner.`,
      eyebrow: "Waitlist invitation",
      title: `${partySize === 2 ? "Two seats have" : "A seat has"} opened for you.`,
      firstName,
      content: `<p>We are reaching out in waitlist order because ${seats} became available for An Evening in the Olive Groves.</p><p>Your invitation is held until <strong>${esc(expiresAt)}</strong>. Availability is confirmed when payment is completed.</p><p>If you are no longer able to join us, simply reply and we will offer the place to the next guest.</p>`,
      ctaLabel: partySize === 2 ? "Reserve two seats" : "Reserve my seat",
      ctaUrl: purchaseUrl,
      footerNote: "You received this message because you joined the waitlist for this dinner.",
    }),
  };
}
