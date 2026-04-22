// api/pg-interest.js
// Handles the Proving Grounds waitlist / interest form
// Sends notification email via Resend
// Stores in Airtable Participants table
//
// Expected POST body:
//   name, email, role, source

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name    = "",
    email   = "",
    role    = "",
    source  = "Proving Grounds Waitlist",
  } = req.body || {};

  // Validation
  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // ── SEND NOTIFICATION EMAIL VIA RESEND ───────────────────────
  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "ROAMSIX Proving Grounds <info@roamsix.com>",
        to:      ["max@roamsix.com", "jackie@roamsix.com"],
        reply_to: email.trim(),
        subject: `Proving Grounds Interest: ${name.trim()} — ${role || "Role not specified"}`,
        html: buildPGEmailHTML({
          name: name.trim(), email: email.trim(), role, source, timestamp
        }),
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}));
      console.error("Resend error:", err);
    }
  } catch (err) {
    console.error("Email send error:", err);
  }

  // ── STORE IN AIRTABLE PARTICIPANTS TABLE ──────────────────────
  if (process.env.AIRTABLE_TOKEN && process.env.PROVING_GROUNDS_BASE_ID && process.env.PARTICIPANTS_TABLE_ID) {
    try {
      await fetch(
        `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/${process.env.PARTICIPANTS_TABLE_ID}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Name:   name.trim(),
              Email:  email.trim(),
              Role:   role || "",
              Source: source,
              Status: "Waitlist",
              "Submitted At": new Date().toISOString(),
            },
          }),
        }
      );
    } catch (err) {
      console.error("Airtable error:", err);
    }
  }

  // ── SEND CONFIRMATION EMAIL TO SUBMITTER ─────────────────────
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "ROAMSIX <info@roamsix.com>",
        to:      [email.trim()],
        subject: "You're on the Proving Grounds list.",
        html: buildConfirmationHTML(name.trim()),
      }),
    });
  } catch (err) {
    console.error("Confirmation email error:", err);
    // Non-fatal
  }

  return res.status(200).json({ success: true });
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function buildPGEmailHTML({ name, email, role, source, timestamp }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#141C2A;color:#E8DFD0;padding:32px;">
      <div style="border-bottom:2px solid #B59558;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="font-size:24px;letter-spacing:4px;color:#E8DFD0;margin:0;">ROAMSIX</h1>
        <p style="color:#B59558;font-size:12px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase;">Proving Grounds — New Interest</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:140px;">Name</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);"><a href="mailto:${email}" style="color:#4A7575;">${email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Joining As</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${role || "Not specified"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Source</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.1);color:#E8DFD0;">${source}</td></tr>
        <tr><td style="padding:10px 0;color:#B59558;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Time</td>
            <td style="padding:10px 0;color:#E8DFD0;">${timestamp} PT</td></tr>
      </table>

      <p style="margin-top:32px;color:rgba(232,223,208,0.3);font-size:11px;">roamsix.com — Proving Grounds</p>
    </div>
  `;
}

function buildConfirmationHTML(firstName) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#141C2A;color:#E8DFD0;padding:40px;">
      <div style="border-bottom:2px solid #B59558;padding-bottom:20px;margin-bottom:32px;">
        <h1 style="font-size:24px;letter-spacing:4px;color:#E8DFD0;margin:0;">ROAMSIX</h1>
        <p style="color:#B59558;font-size:12px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase;">Proving Grounds</p>
      </div>

      <p style="font-size:18px;line-height:1.7;color:#E8DFD0;margin-bottom:20px;">
        ${firstName ? firstName + "," : ""}
      </p>
      <p style="font-size:16px;line-height:1.75;color:#C8C0B4;margin-bottom:16px;">
        We have your information. When Proving Grounds registration opens, you will be contacted directly.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#C8C0B4;margin-bottom:32px;">
        Registration opens to the ROAMSIX network first. We will be in touch.
      </p>

      <div style="border-top:1px solid rgba(232,223,208,0.1);padding-top:24px;">
        <p style="font-size:14px;color:rgba(232,223,208,0.4);margin:0;">
          Questions? Reply to this email or contact us at <a href="mailto:info@roamsix.com" style="color:#4A7575;">info@roamsix.com</a>
        </p>
      </div>

      <p style="margin-top:32px;color:rgba(232,223,208,0.25);font-size:11px;">roamsix.com — Environment-Led Experience Design</p>
    </div>
  `;
}
