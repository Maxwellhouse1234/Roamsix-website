// api/pg-interest.js
// Proving Grounds interest / waitlist form handler
// - Notifies max@roamsix.com + jackie@roamsix.com
// - Sends branded confirmation to prospect
// - Writes to Airtable Participants table

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    name   = "",
    email  = "",
    role   = "",
    source = "Proving Grounds Waitlist",
  } = req.body || {};

  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // ── 1. NOTIFY MAX + JACKIE ─────────────────────────────────────
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:     "ROAMSIX Proving Grounds <info@roamsix.com>",
        to:       ["max@roamsix.com", "jackie@roamsix.com"],
        reply_to: email.trim(),
        subject:  `Proving Grounds Interest — ${name.trim()} | ${role || "Role not specified"}`,
        html:     pgNotifyHTML({ name: name.trim(), email: email.trim(), role, source, timestamp }),
      }),
    });
  } catch (err) { console.error("PG notify email error:", err); }

  // ── 2. CONFIRM TO PROSPECT ─────────────────────────────────────
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    "ROAMSIX Proving Grounds <info@roamsix.com>",
        to:      [email.trim()],
        subject: "You're on the Proving Grounds list — ROAMSIX",
        html:    pgConfirmHTML(name.trim().split(" ")[0]),
      }),
    });
  } catch (err) { console.error("PG confirmation email error:", err); }

  // ── 3. WRITE TO AIRTABLE PARTICIPANTS ──────────────────────────
  if (process.env.AIRTABLE_TOKEN && process.env.PROVING_GROUNDS_BASE_ID && process.env.PARTICIPANTS_TABLE_ID) {
    try {
      await fetch(
        `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/${process.env.PARTICIPANTS_TABLE_ID}`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              "Name":         name.trim(),
              "Email":        email.trim(),
              "Role":         role || "",
              "Source":       source,
              "Status":       "Waitlist",
              "Submitted At": new Date().toISOString(),
            },
          }),
        }
      );
    } catch (err) { console.error("Airtable PG error:", err); }
  }

  return res.status(200).json({ success: true });
}

// ── EMAIL TEMPLATES ────────────────────────────────────────────────

function pgNotifyHTML({ name, email, role, source, timestamp }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C1220;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1220;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141C2A;max-width:600px;width:100%;">
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:2px solid #B59558;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:5px;color:#E8DFD0;text-transform:uppercase;">ROAMSIX</div>
                <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">Proving Grounds — New Interest</div>
              </td>
              <td align="right"><div style="font-size:11px;color:rgba(232,223,208,0.4);">${timestamp} PT</div></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${pgRow("Name",      name)}
              ${pgRow("Email",     `<a href="mailto:${email}" style="color:#4A7575;text-decoration:none;">${email}</a>`)}
              ${pgRow("Joining As", role || "Not specified")}
              ${pgRow("Source",    source)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <a href="mailto:${email}" style="display:inline-block;background:#4A7575;color:#E8DFD0;padding:13px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
              Reply to ${name.split(" ")[0]}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid rgba(232,223,208,0.08);">
            <div style="font-size:11px;color:rgba(232,223,208,0.3);">ROAMSIX · Proving Grounds · roamsix.com</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function pgRow(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);width:130px;vertical-align:top;">
      <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B59558;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);color:#E8DFD0;font-size:15px;">${value}</td>
  </tr>`;
}

function pgConfirmHTML(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C1220;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1220;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141C2A;max-width:600px;width:100%;">
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:2px solid #B59558;">
            <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:5px;color:#E8DFD0;text-transform:uppercase;">ROAMSIX</div>
            <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">Proving Grounds</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 0;">
            <p style="color:#E8DFD0;font-size:18px;margin:0 0 24px;">${firstName ? firstName + "," : "Hello,"}</p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 20px;">
              You're on the list. When Proving Grounds registration opens, you'll be contacted directly.
            </p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 36px;">
              Registration opens to the ROAMSIX network first. The next event date is being confirmed.
            </p>

            <!-- What is PG -->
            <div style="background:rgba(74,117,117,0.08);border:1px solid rgba(74,117,117,0.2);border-left:3px solid #4A7575;padding:20px;margin-bottom:36px;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4A7575;margin-bottom:10px;">About Proving Grounds</div>
              <p style="color:#C8C0B4;font-size:14px;line-height:1.65;margin:0;">
                One day. Six stations. Teams of four compete across Terrain, Strength, Engine, Control, Power, and a surprise Grit challenge revealed morning-of. No shortcuts.
              </p>
            </div>

            <div style="border-top:1px solid rgba(232,223,208,0.08);padding-top:24px;">
              <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;letter-spacing:4px;color:#E8DFD0;text-transform:uppercase;margin-bottom:8px;">ROAMSIX</div>
              <div style="font-size:12px;color:rgba(232,223,208,0.35);">info@roamsix.com · roamsix.com</div>
              <div style="margin-top:12px;">
                <a href="https://www.instagram.com/roamsix_" style="color:#4A7575;font-size:12px;text-decoration:none;margin-right:16px;">Instagram</a>
                <a href="https://www.linkedin.com/company/roamsix/" style="color:#4A7575;font-size:12px;text-decoration:none;">LinkedIn</a>
              </div>
            </div>
          </td>
        </tr>
        <tr><td style="padding:36px 40px 36px;"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
