// api/stripe-webhook.js
// Handles Stripe checkout.session.completed webhook.
// On payment confirmed:
//   1. Writes registration to Airtable "Event Registrations" table
//   2. Sends confirmation email to customer via Resend
//   3. Sends notification email to max@roamsix.com + jackie@roamsix.com

import { createHmac, timingSafeEqual } from "crypto";

// Read raw body from stream (needed for Stripe signature verification).
// Vercel may or may not pre-parse the body before this function runs.
// If the stream is empty (body already parsed), rawBody will be empty Buffer.
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyStripeSignature(rawBodyStr, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx !== -1) acc[part.slice(0, idx)] = part.slice(idx + 1);
    return acc;
  }, {});

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${rawBodyStr}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  // Constant-time comparison
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

const AIRTABLE_BASE_ID = "app2b2mTCtAIMmo79";
const EVENTS_TABLE     = "Event Registrations";

async function ensureAirtableTable(token) {
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  try {
    const testRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(EVENTS_TABLE)}?maxRecords=1`,
      { headers }
    );
    if (testRes.status === 404) {
      await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: EVENTS_TABLE,
          fields: [
            { name: "Name",              type: "singleLineText" },
            { name: "Email",             type: "email" },
            { name: "Event",             type: "singleLineText" },
            { name: "Package",           type: "singleLineText" },
            { name: "Amount Paid",       type: "number", options: { precision: 2 } },
            { name: "Quantity",          type: "number", options: { precision: 0 } },
            { name: "Stripe Session ID", type: "singleLineText" },
            { name: "Status",            type: "singleLineText" },
            {
              name: "Registered At",
              type: "dateTime",
              options: {
                dateFormat: { name: "iso" },
                timeFormat: { name: "24hour" },
                timeZone: "America/Los_Angeles",
              },
            },
            { name: "Notes", type: "multilineText" },
          ],
        }),
      });
    }
  } catch (err) {
    console.error("Airtable table check/create error:", err);
  }
}

async function writeAirtableRecord(token, fields) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(EVENTS_TABLE)}`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Airtable write error:", err);
    }
  } catch (err) {
    console.error("Airtable write exception:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Read raw body for signature verification
  const rawBody    = await readRawBody(req);
  const rawBodyStr = rawBody.length > 0 ? rawBody.toString("utf8") : "";

  const sigHeader = req.headers["stripe-signature"] || "";
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify signature when both secret and raw body are available
  if (secret && sigHeader) {
    if (rawBodyStr) {
      if (!verifyStripeSignature(rawBodyStr, sigHeader, secret)) {
        console.error("Stripe webhook: signature verification failed");
        return res.status(400).json({ error: "Invalid signature" });
      }
    } else {
      // Raw body unavailable (Vercel pre-parsed the body).
      // Signature verification skipped. To fix: ensure STRIPE_WEBHOOK_SECRET is set
      // and the Vercel function receives the raw body before it is parsed.
      console.warn("Stripe webhook: raw body unavailable, signature verification skipped");
    }
  }

  // Parse event from raw body or fallback to req.body
  let event;
  try {
    event = rawBodyStr ? JSON.parse(rawBodyStr) : (req.body || {});
  } catch {
    event = req.body || {};
  }

  // Only handle checkout.session.completed
  if (!event || event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session      = event.data?.object || {};
  const sessionId    = session.id || "";
  const eventId      = session.metadata?.eventId || "";
  const packageId    = session.metadata?.packageId || "";
  const customerName = session.metadata?.customerName || "";
  const isBundle     = session.metadata?.isBundle === "true";
  const quantity     = parseInt(session.metadata?.quantity || "1", 10);
  const amountPaid   = (session.amount_total || 0) / 100;
  const email        = session.customer_details?.email || session.customer_email || "";
  const timestamp    = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // ── 1. WRITE TO AIRTABLE ──────────────────────────────────────────
  if (process.env.AIRTABLE_TOKEN) {
    await ensureAirtableTable(process.env.AIRTABLE_TOKEN);
    await writeAirtableRecord(process.env.AIRTABLE_TOKEN, {
      "Name":              customerName || "Not provided",
      "Email":             email,
      "Event":             eventId,
      "Package":           packageId + (isBundle ? " (Couples Bundle)" : ""),
      "Amount Paid":       amountPaid,
      "Quantity":          quantity,
      "Stripe Session ID": sessionId,
      "Status":            "Confirmed",
      "Registered At":     new Date().toISOString(),
      "Notes":             "",
    });
  }

  // ── 2. CONFIRMATION EMAIL TO CUSTOMER ────────────────────────────
  if (process.env.RESEND_API_KEY && email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from:    "ROAMSIX Events <info@roamsix.com>",
          to:      [email],
          subject: "You're registered for " + (eventId ? eventId.replace(/-/g, " ").toUpperCase() : "a ROAMSIX event"),
          html:    customerConfirmHTML({ name: customerName, eventId, packageId, isBundle, amountPaid, quantity }),
        }),
      });
    } catch (err) { console.error("Customer confirmation email error:", err); }
  }

  // ── 3. NOTIFICATION EMAIL TO ROAMSIX TEAM ────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from:     "ROAMSIX Events <info@roamsix.com>",
          to:       ["max@roamsix.com", "jackie@roamsix.com"],
          reply_to: email || undefined,
          subject:  `New Event Registration: ${customerName || email} - ${packageId}`,
          html:     teamNotifyHTML({ name: customerName, email, eventId, packageId, isBundle, amountPaid, quantity, sessionId, timestamp }),
        }),
      });
    } catch (err) { console.error("Team notification email error:", err); }
  }

  return res.status(200).json({ received: true });
}

// ── EMAIL TEMPLATES ──────────────────────────────────────────────────

function row(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);width:140px;vertical-align:top;">
      <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B59558;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);color:#E8DFD0;font-size:15px;">${value}</td>
  </tr>`;
}

function fmtEventId(id) {
  return (id || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtPkgId(id) {
  return (id || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function customerConfirmHTML({ name, eventId, packageId, isBundle, amountPaid, quantity }) {
  const firstName = (name || "").split(" ")[0] || "there";
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
            <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">Event Registration</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 0;">
            <p style="color:#E8DFD0;font-size:18px;margin:0 0 24px;line-height:1.5;">${firstName},</p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 20px;">
              You are registered. Your spot is confirmed for ${fmtEventId(eventId)}.
            </p>
            <div style="background:rgba(74,117,117,0.08);border:1px solid rgba(74,117,117,0.2);border-left:3px solid #4A7575;padding:24px;margin:28px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Event",   fmtEventId(eventId))}
                ${row("Package", fmtPkgId(packageId) + (isBundle ? " (Couples Bundle)" : ""))}
                ${row("Guests",  String(isBundle ? 2 : quantity))}
                ${row("Paid",    "$" + amountPaid.toFixed(2))}
              </table>
            </div>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 20px;">
              You will receive a follow-up email from ROAMSIX with event details, directions, and what to bring closer to the date.
            </p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 36px;">
              Questions? Email us at <a href="mailto:info@roamsix.com" style="color:#4A7575;text-decoration:none;">info@roamsix.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 36px;">
            <div style="border-top:1px solid rgba(232,223,208,0.08);padding-top:24px;">
              <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;letter-spacing:4px;color:#E8DFD0;text-transform:uppercase;margin-bottom:8px;">ROAMSIX</div>
              <div style="font-size:12px;color:rgba(232,223,208,0.35);">info@roamsix.com · roamsix.com · Warner Springs, CA</div>
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

function teamNotifyHTML({ name, email, eventId, packageId, isBundle, amountPaid, quantity, sessionId, timestamp }) {
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
                <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">New Event Registration</div>
              </td>
              <td align="right"><div style="font-size:11px;color:rgba(232,223,208,0.4);">${timestamp} PT</div></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Name",       name || "Not provided")}
              ${row("Email",      email ? `<a href="mailto:${email}" style="color:#4A7575;text-decoration:none;">${email}</a>` : "Not provided")}
              ${row("Event",      fmtEventId(eventId))}
              ${row("Package",    fmtPkgId(packageId) + (isBundle ? " (Couples Bundle)" : ""))}
              ${row("Guests",     String(isBundle ? 2 : quantity))}
              ${row("Amount",     "$" + amountPaid.toFixed(2))}
              ${row("Session ID", sessionId)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${email ? `<a href="mailto:${email}" style="display:inline-block;background:#4A7575;color:#E8DFD0;padding:13px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Reply to ${(name || "").split(" ")[0] || "Registrant"}</a>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid rgba(232,223,208,0.08);">
            <div style="font-size:11px;color:rgba(232,223,208,0.3);">ROAMSIX Events · info@roamsix.com · roamsix.com</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
