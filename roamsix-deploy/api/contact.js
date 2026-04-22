// api/contact.js
// Handles the main homepage contact/inquiry form
// Sends email via Resend to info@roamsix.com
// Stores lead in Airtable if AIRTABLE_TOKEN is available
//
// Expected POST body:
//   firstName, lastName, email, company, inquiryType, message, source

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    firstName = "",
    lastName  = "",
    email     = "",
    company   = "",
    inquiryType = "",
    message   = "",
    source    = "Homepage Contact Form",
  } = req.body || {};

  // Validation
  if (!email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Email and message are required." });
  }
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "Not provided";
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // ── SEND EMAIL VIA RESEND ──────────────────────────────────────
  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "ROAMSIX Inquiries <info@roamsix.com>",
        to:      ["max@roamsix.com", "jackie@roamsix.com"],
        reply_to: email.trim(),
        subject: `New Inquiry: ${inquiryType || "General"} — ${name}`,
        html: buildEmailHTML({
          name, email: email.trim(), company, inquiryType, message, source, timestamp
        }),
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}));
      console.error("Resend error:", err);
      // Don't fail the whole request — try Airtable anyway
    }
  } catch (err) {
    console.error("Email send error:", err);
    // Continue — try Airtable
  }

  // ── STORE IN AIRTABLE (if configured) ─────────────────────────
  if (process.env.AIRTABLE_TOKEN && process.env.PROVING_GROUNDS_BASE_ID) {
    try {
      await fetch(
        `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/Inquiries`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Name:        name,
              Email:       email.trim(),
              Company:     company || "",
              "Inquiry Type": inquiryType || "General",
              Message:     message.trim(),
              Source:      source,
              Status:      "New",
              "Submitted At": new Date().toISOString(),
            },
          }),
        }
      );
    } catch (err) {
      console.error("Airtable error:", err);
      // Non-fatal — email already sent
    }
  }

  return res.status(200).json({ success: true });
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function buildEmailHTML({ name, email, company, inquiryType, message, source, timestamp }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#141C2A;color:#E8DFD0;padding:32px;">
      <div style="border-bottom:2px solid #B59558;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="font-size:24px;letter-spacing:4px;color:#E8DFD0;margin:0;">ROAMSIX</h1>
        <p style="color:#B59558;font-size:12px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase;">New Inquiry</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:140px;">Name</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);"><a href="mailto:${email}" style="color:#4A7575;">${email}</a></td></tr>
        ${company ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Company</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${company}</td></tr>` : ""}
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Inquiry</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${inquiryType || "Not specified"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Source</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${source}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Time</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${timestamp} PT</td></tr>
      </table>

      <div style="margin-top:28px;">
        <p style="color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Message</p>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,223,208,0.1);padding:20px;color:#E8DFD0;line-height:1.7;">
          ${message.replace(/\n/g, "<br/>")}
        </div>
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(232,223,208,0.1);">
        <a href="mailto:${email}" style="display:inline-block;background:#4A7575;color:#E8DFD0;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
          Reply to ${name.split(" ")[0]}
        </a>
      </div>

      <p style="margin-top:32px;color:rgba(232,223,208,0.3);font-size:11px;">roamsix.com — Environment-Led Experience Design</p>
    </div>
  `;
}
