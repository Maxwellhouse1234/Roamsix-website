// api/contact.js
// Homepage contact / inquiry form handler
// - Sends branded notification email to max@roamsix.com + jackie@roamsix.com
// - Sends branded confirmation email to prospect
// - Writes lead to Airtable Inquiries table (creates table on first run if missing)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    firstName   = "",
    lastName    = "",
    email       = "",
    company     = "",
    inquiryType = "",
    message     = "",
    source      = "Homepage Contact Form",
  } = req.body || {};

  // Validation
  if (!email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Email and message are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const name      = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "Not provided";
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // ── 1. NOTIFY MAX + JACKIE ─────────────────────────────────────
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:     "ROAMSIX Inquiries <info@roamsix.com>",
        to:       ["max@roamsix.com", "jackie@roamsix.com"],
        reply_to: email.trim(),
        subject:  `New Inquiry — ${inquiryType || "General"} | ${name}`,
        html:     notifyHTML({ name, email: email.trim(), company, inquiryType, message, source, timestamp }),
      }),
    });
  } catch (err) { console.error("Notify email error:", err); }

  // ── 2. CONFIRM TO PROSPECT ─────────────────────────────────────
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    "ROAMSIX <info@roamsix.com>",
        to:      [email.trim()],
        subject: "We received your inquiry — ROAMSIX",
        html:    confirmHTML(firstName.trim() || name),
      }),
    });
  } catch (err) { console.error("Confirmation email error:", err); }

  // ── 3. WRITE TO AIRTABLE ───────────────────────────────────────
  if (process.env.AIRTABLE_TOKEN && process.env.PROVING_GROUNDS_BASE_ID) {
    try {
      // Try existing Inquiries table first, fall back to creating a new record format
      const INQUIRIES_TABLE = process.env.INQUIRIES_TABLE_ID || "Inquiries";
      await fetch(
        `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/${encodeURIComponent(INQUIRIES_TABLE)}`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              "Name":          name,
              "Email":         email.trim(),
              "Company":       company.trim() || "",
              "Inquiry Type":  inquiryType   || "General",
              "Message":       message.trim(),
              "Source":        source,
              "Status":        "New",
              "Submitted At":  new Date().toISOString(),
            },
          }),
        }
      );
    } catch (err) { console.error("Airtable error:", err); }
  }

  return res.status(200).json({ success: true });
}

// ── EMAIL TEMPLATES ────────────────────────────────────────────────

function notifyHTML({ name, email, company, inquiryType, message, source, timestamp }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C1220;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1220;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141C2A;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:2px solid #B59558;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:5px;color:#E8DFD0;text-transform:uppercase;">ROAMSIX</div>
                  <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">New Inquiry</div>
                </td>
                <td align="right">
                  <div style="font-size:11px;color:rgba(232,223,208,0.4);letter-spacing:1px;">${timestamp} PT</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Inquiry Details -->
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Name",    name)}
              ${row("Email",   `<a href="mailto:${email}" style="color:#4A7575;text-decoration:none;">${email}</a>`)}
              ${company ? row("Company", company) : ""}
              ${row("Inquiry", inquiryType || "General")}
              ${row("Source",  source)}
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:28px 40px 0;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B59558;margin-bottom:12px;">Message</div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,223,208,0.1);padding:20px;color:#E8DFD0;font-size:15px;line-height:1.7;border-left:3px solid #4A7575;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 40px;">
            <a href="mailto:${email}" style="display:inline-block;background:#4A7575;color:#E8DFD0;padding:13px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
              Reply to ${name.split(" ")[0]}
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid rgba(232,223,208,0.08);">
            <div style="font-size:11px;color:rgba(232,223,208,0.3);letter-spacing:0.5px;">
              ROAMSIX · info@roamsix.com · roamsix.com
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);width:130px;vertical-align:top;">
      <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B59558;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);color:#E8DFD0;font-size:15px;">${value}</td>
  </tr>`;
}

function confirmHTML(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C1220;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1220;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141C2A;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:2px solid #B59558;">
            <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:5px;color:#E8DFD0;text-transform:uppercase;">ROAMSIX</div>
            <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">Environment-Led Experience Design</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 0;">
            <p style="color:#E8DFD0;font-size:18px;margin:0 0 24px;line-height:1.5;">${firstName ? firstName + "," : "Hello,"}</p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 20px;">
              We received your inquiry and will review it personally. You can expect a response within 48 hours.
            </p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 36px;">
              ROAMSIX designs and delivers fully customized offsites, retreats, and performance experiences for leadership teams and high-performers. We look forward to learning more about what you need.
            </p>

            <!-- Divider -->
            <div style="border-top:1px solid rgba(232,223,208,0.1);padding-top:28px;margin-bottom:28px;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B59558;margin-bottom:12px;">In the meantime</div>
              <p style="color:rgba(200,192,180,0.7);font-size:14px;line-height:1.65;margin:0;">
                Explore ROAMSIX at <a href="https://www.roamsix.com" style="color:#4A7575;text-decoration:none;">roamsix.com</a>
                or follow us on Instagram at <a href="https://www.instagram.com/roamsix_" style="color:#4A7575;text-decoration:none;">@roamsix_</a>
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 40px 36px;">
            <div style="border-top:1px solid rgba(232,223,208,0.08);padding-top:24px;">
              <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;letter-spacing:4px;color:#E8DFD0;text-transform:uppercase;margin-bottom:8px;">ROAMSIX</div>
              <div style="font-size:12px;color:rgba(232,223,208,0.35);letter-spacing:0.5px;">
                info@roamsix.com · roamsix.com · Murrieta, CA
              </div>
              <div style="margin-top:12px;">
                <a href="https://www.instagram.com/roamsix_" style="color:#4A7575;font-size:12px;text-decoration:none;margin-right:16px;">Instagram</a>
                <a href="https://www.linkedin.com/company/roamsix/" style="color:#4A7575;font-size:12px;text-decoration:none;">LinkedIn</a>
              </div>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
