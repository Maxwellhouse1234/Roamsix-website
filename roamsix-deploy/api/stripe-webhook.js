// api/stripe-webhook.js
// Handles Stripe checkout.session.completed webhook.
// On payment confirmed:
//   1. Writes registration to Airtable "Event Registrations" table (legacy recordkeeping)
//   2. Writes full attendee record to Airtable "Attendees" table (legal + operational records)
//   3. Sends confirmation email to customer via Resend
//   4. Sends notification email to max@roamsix.com + jackie@roamsix.com

import { createHmac, timingSafeEqual } from "crypto";

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

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

const AIRTABLE_BASE_ID  = "app2b2mTCtAIMmo79";
const EVENTS_TABLE      = "Event Registrations";
const ATTENDEES_TABLE   = "Attendees";

// ── AIRTABLE: EVENT REGISTRATIONS (legacy) ───────────────────────────────────

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

// ── AIRTABLE: ATTENDEES (full legal + operational record) ────────────────────

async function ensureAttendeesTable(token) {
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  try {
    const testRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(ATTENDEES_TABLE)}?maxRecords=1`,
      { headers }
    );
    if (testRes.status === 404) {
      await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: ATTENDEES_TABLE,
          fields: [
            { name: "Full Name",               type: "singleLineText" },
            { name: "Email",                   type: "email" },
            { name: "Phone",                   type: "singleLineText" },
            { name: "Event Name",              type: "singleLineText" },
            { name: "Event Date",              type: "singleLineText" },
            { name: "Package",                 type: "singleLineText" },
            { name: "Amount Paid",             type: "number", options: { precision: 2 } },
            { name: "Stripe Session ID",       type: "singleLineText" },
            { name: "Payment Status",          type: "singleLineText" },
            { name: "Legal Accepted",          type: "singleLineText" },
            { name: "Legal Version",           type: "singleLineText" },
            { name: "Accepted At",             type: "singleLineText" },
            { name: "Registered At",           type: "singleLineText" },
            { name: "Emergency Contact Name",  type: "singleLineText" },
            { name: "Emergency Contact Phone", type: "singleLineText" },
            { name: "Medical or Dietary Notes",type: "multilineText" },
            { name: "Intake Completed",        type: "singleLineText" },
            { name: "Intake Completed At",     type: "singleLineText" },
            { name: "Dietary Restrictions",    type: "multilineText" },
            { name: "Food Allergies",          type: "multilineText" },
            { name: "Why Attending",           type: "multilineText" },
            { name: "Goals",                   type: "multilineText" },
            { name: "How Heard",               type: "singleLineText" },
            { name: "Text Consent",            type: "singleLineText" },
          ],
        }),
      });
    }
  } catch (err) {
    console.error("Attendees table check/create error:", err);
  }
}

async function writeAttendeesRecord(token, fields) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbltON9TJyq9GqBW4`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Attendees write error:", err);
    }
  } catch (err) {
    console.error("Attendees write exception:", err);
  }
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Synchronous method check — no async work yet
  if (req.method !== "POST") return res.status(405).end();

  try {
    // ── STEP 1: Read raw body (fast — just buffering the stream) ─────────────
    const rawBody    = await readRawBody(req);
    const rawBodyStr = rawBody.length > 0 ? rawBody.toString("utf8") : "";

    // ── STEP 2: Verify signature (synchronous crypto) ────────────────────────
    const sigHeader = req.headers["stripe-signature"] || "";
    const secret    = process.env.STRIPE_WEBHOOK_SECRET;

    if (secret && sigHeader) {
      if (rawBodyStr) {
        if (!verifyStripeSignature(rawBodyStr, sigHeader, secret)) {
          console.error("Stripe webhook: signature verification failed");
          return res.status(400).json({ error: "Invalid signature" });
        }
      } else {
        console.warn("Stripe webhook: raw body unavailable, signature verification skipped");
      }
    }

    // ── STEP 3: Parse event (synchronous) ────────────────────────────────────
    let event;
    try {
      event = rawBodyStr ? JSON.parse(rawBodyStr) : (req.body || {});
    } catch {
      event = req.body || {};
    }

    if (!event || event.type !== "checkout.session.completed") {
      return res.status(200).json({ received: true });
    }

    // ── STEP 4: Extract all metadata (synchronous) ───────────────────────────
    const session               = event.data?.object || {};
    const sessionId             = session.id || "";
    const eventId               = session.metadata?.eventId || "";
    const packageId             = session.metadata?.packageId || "";
    const customerName          = session.metadata?.customerName || "";
    const isBundle              = session.metadata?.isBundle === "true";
    const quantity              = parseInt(session.metadata?.quantity || "1", 10);
    const amountPaid            = (session.amount_total || 0) / 100;
    const email                 = session.customer_details?.email || session.customer_email || "";
    const phone                 = session.metadata?.phone || "";
    const emergencyContactName  = session.metadata?.emergencyContactName || "";
    const emergencyContactPhone = session.metadata?.emergencyContactPhone || "";
    const medicalNotes          = session.metadata?.medicalNotes || "";
    const eventName             = session.metadata?.eventName || eventId.replace(/-/g, " ").toUpperCase();
    const eventDate             = session.metadata?.eventDate || "";
    const legalVersion          = session.metadata?.acceptedLegalVersion || "";
    const acceptedAt            = session.metadata?.acceptedAt || "";
    const agreedToTerms         = session.metadata?.agreedToTerms === "true";
    const ageConfirmed          = session.metadata?.ageConfirmed  || "No";
    const smsConsent            = session.metadata?.smsConsent    || "No";
    const timestamp             = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const registeredAt          = new Date().toISOString();

    // Derive origin for intake form link
    const host   = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
    const proto  = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${host}`;

    // ── STEP 5: RUN ALL WORK WITHIN 25s, THEN ACK STRIPE ───────────────────────
    // Vercel terminates the function as soon as res.json() is called, so all
    // Airtable writes and emails must complete BEFORE we respond to Stripe.
    // Promise.race ensures we always respond within 25 seconds even if work stalls.

    const workPromise = (async () => {

      // ── WRITE TO EVENT REGISTRATIONS (legacy record) ───────────────────────
      if (process.env.AIRTABLE_TOKEN) {
        await writeAirtableRecord(process.env.AIRTABLE_TOKEN, {
          "Name":              customerName || "Not provided",
          "Email":             email,
          "Event":             eventId,
          "Package":           packageId + (isBundle ? " (Couples Bundle)" : ""),
          "Amount Paid":       amountPaid,
          "Quantity":          quantity,
          "Stripe Session ID": sessionId,
          "Status":            "Confirmed",
          "Registered At":     registeredAt,
          "Notes":             medicalNotes || "",
        });
      }

      // ── WRITE TO ATTENDEES (full legal + operational record) ───────────────
      if (process.env.AIRTABLE_TOKEN) {
        await writeAttendeesRecord(process.env.AIRTABLE_TOKEN, {
          "Full Name":               customerName || "Not provided",
          "Email":                   email,
          "Phone":                   phone,
          "Event Name":              eventName,
          "Event Date":              eventDate,
          "Package":                 packageId + (isBundle ? " (Couples Bundle)" : ""),
          "Amount Paid":             amountPaid,
          "Stripe Session ID":       sessionId,
          "Payment Status":          "Paid",
          "Legal Accepted":          agreedToTerms ? "Yes" : "No",
          "Legal Version":           legalVersion,
          "Accepted At":             acceptedAt,
          "Age Confirmed":           (ageConfirmed === "true" || ageConfirmed === true) ? "Yes" : "No",
          "SMS Consent":             smsConsent,
          "Emergency Contact Name":  emergencyContactName,
          "Emergency Contact Phone": emergencyContactPhone,
          "Medical or Dietary Notes": medicalNotes,
          "Intake Completed":        "No",
        });
      }

      // ── CONFIRMATION EMAIL TO CUSTOMER ─────────────────────────────────────
      if (process.env.RESEND_API_KEY && email) {
        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from:    "ROAMSIX Events <info@roamsix.com>",
              to:      [email],
              subject: "Your ROAMSIX Registration is Confirmed",
              html:    customerConfirmHTML({
                name: customerName, eventId, eventName, packageId, isBundle, amountPaid, quantity,
                sessionId, origin,
              }),
            }),
          });
          if (!resendRes.ok) {
            const errBody = await resendRes.text();
            console.error("Resend error (customer email):", resendRes.status, errBody);
          }
        } catch (err) {
          console.error("Customer confirmation email fetch error:", err.message);
        }
      }

      // ── NOTIFICATION EMAIL TO ROAMSIX TEAM ────────────────────────────────
      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from:     "ROAMSIX Events <info@roamsix.com>",
              to:       ["max@roamsix.com", "jackie@roamsix.com"],
              reply_to: email || undefined,
              subject:  `New Registration: ${customerName || email} - ${packageId}`,
              html:     teamNotifyHTML({
                name: customerName, email, eventId, eventName, packageId, isBundle,
                amountPaid, quantity, sessionId, timestamp, phone,
                emergencyContactName, emergencyContactPhone, medicalNotes,
                legalVersion, agreedToTerms,
              }),
            }),
          });
          if (!resendRes.ok) {
            const errBody = await resendRes.text();
            console.error("Resend error (team notification):", resendRes.status, errBody);
          }
        } catch (err) {
          console.error("Team notification email fetch error:", err.message);
        }
      }

    })();

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 25000));

    await Promise.race([workPromise, timeoutPromise]);

    // ── ACK STRIPE — all work done (or timed out) ─────────────────────────────
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err);
    if (!res.headersSent) {
      return res.status(200).json({ received: true, error: err.message });
    }
  }
}

// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────

function row(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);width:160px;vertical-align:top;">
      <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B59558;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(232,223,208,0.08);color:#E8DFD0;font-size:15px;">${value}</td>
  </tr>`;
}

function section(title, content) {
  return `
    <div style="margin-bottom:28px;">
      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#4A7575;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(74,117,117,0.2);">${title}</div>
      <div style="font-size:15px;color:#C8C0B4;line-height:1.75;">${content}</div>
    </div>`;
}

function fmtEventId(id) {
  return (id || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtPkgId(id) {
  return (id || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function customerConfirmHTML({ name, eventId, eventName, packageId, isBundle, amountPaid, quantity, sessionId, origin }) {
  const firstName = (name || "").split(" ")[0] || "there";
  const displayEvent = eventName || fmtEventId(eventId);
  const intakeUrl = `${origin}/event-intake?session_id=${sessionId}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0C1220;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1220;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141C2A;max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:2px solid #B59558;">
            <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:5px;color:#E8DFD0;text-transform:uppercase;">ROAMSIX</div>
            <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">Registration Confirmed</div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="color:#E8DFD0;font-size:18px;margin:0 0 20px;line-height:1.5;">${firstName},</p>
            <p style="color:#C8C0B4;font-size:16px;line-height:1.75;margin:0 0 24px;">
              You are registered for ${displayEvent}. Your spot is confirmed.
            </p>
          </td>
        </tr>

        <!-- REGISTRATION SUMMARY -->
        <tr>
          <td style="padding:0 40px;">
            <div style="background:rgba(74,117,117,0.08);border:1px solid rgba(74,117,117,0.2);border-left:3px solid #4A7575;padding:24px;margin-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Event",   displayEvent)}
                ${row("Package", fmtPkgId(packageId) + (isBundle ? " (Couples Bundle)" : ""))}
                ${row("Guests",  String(isBundle ? 2 : quantity))}
                ${row("Paid",    "$" + amountPaid.toFixed(2))}
              </table>
            </div>
          </td>
        </tr>

        <!-- INTAKE FORM CTA -->
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:rgba(181,149,88,0.07);border:1px solid rgba(181,149,88,0.2);padding:28px;text-align:center;">
              <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#B59558;margin-bottom:12px;">Action Required</div>
              <p style="color:#E8DFD0;font-size:16px;line-height:1.7;margin:0 0 20px;">
                Before the event, please complete your Participant Intake Form so we can prepare for food allergies, emergency contact information, mobility considerations, and important event communication.
              </p>
              <a href="${intakeUrl}" style="display:inline-block;background:#B59558;color:#141C2A;padding:15px 32px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
                Complete Participant Intake Form
              </a>
            </div>
          </td>
        </tr>

        <!-- SECTIONS -->
        <tr>
          <td style="padding:0 40px 32px;">

            ${section("Participation Requirements",
              "ROAMSIX experiences may include physical movement, outdoor environments, uneven terrain, exposure to weather conditions, recovery activities, educational sessions, chef-prepared meals, and group discussions. By attending, you confirm that you are physically able to participate, will follow all safety instructions, and understand participation is voluntary."
            )}

            ${section("Food Allergies and Dietary Restrictions",
              "If you have food allergies, sensitivities, or dietary restrictions, complete the Participant Intake Form immediately. While every reasonable effort will be made to accommodate dietary needs, ROAMSIX cannot guarantee an allergen-free environment."
            )}

            ${section("Photography and Media",
              "ROAMSIX may photograph or film portions of the experience for marketing and promotional purposes. If you do not wish to appear in media content, notify us in writing before the event at <a href=\"mailto:info@roamsix.com\" style=\"color:#4A7575;text-decoration:none;\">info@roamsix.com</a>."
            )}

            ${section("Cancellation Policy",
              "Tickets are non-refundable. If you are unable to attend more than 14 days before the event, your ticket may be transferred or credited toward a future event at ROAMSIX's discretion. Within 14 days of the event, no refunds or credits apply unless otherwise approved by ROAMSIX. No-shows forfeit registration."
            )}

            ${section("Event Changes",
              "ROAMSIX may modify the schedule, programming, venue, facilitators, activities, or timing due to weather, safety concerns, operational needs, or circumstances outside our control."
            )}

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:0 40px 36px;">
            <p style="color:#C8C0B4;font-size:15px;line-height:1.75;margin:0 0 8px;">
              Questions? Reply directly to this email or contact <a href="mailto:info@roamsix.com" style="color:#4A7575;text-decoration:none;">info@roamsix.com</a>.
            </p>
            <div style="border-top:1px solid rgba(232,223,208,0.08);padding-top:24px;margin-top:24px;">
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

function teamNotifyHTML({ name, email, eventId, eventName, packageId, isBundle, amountPaid, quantity, sessionId, timestamp, phone, emergencyContactName, emergencyContactPhone, medicalNotes, legalVersion, agreedToTerms }) {
  const displayEvent = eventName || fmtEventId(eventId);
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
                <div style="font-size:11px;letter-spacing:3px;color:#B59558;text-transform:uppercase;margin-top:4px;">New Registration</div>
              </td>
              <td align="right"><div style="font-size:11px;color:rgba(232,223,208,0.4);">${timestamp} PT</div></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Name",                   name || "Not provided")}
              ${row("Email",                  email ? `<a href="mailto:${email}" style="color:#4A7575;text-decoration:none;">${email}</a>` : "Not provided")}
              ${row("Phone",                  phone || "Not provided")}
              ${row("Event",                  displayEvent)}
              ${row("Package",               fmtPkgId(packageId) + (isBundle ? " (Couples Bundle)" : ""))}
              ${row("Guests",                String(isBundle ? 2 : quantity))}
              ${row("Amount",                "$" + amountPaid.toFixed(2))}
              ${row("Emergency Contact",      emergencyContactName ? `${emergencyContactName} - ${emergencyContactPhone}` : "Not provided")}
              ${row("Medical / Dietary",      medicalNotes || "None disclosed")}
              ${row("Legal Accepted",         agreedToTerms ? "Yes" : "No")}
              ${row("Legal Version",          legalVersion || "N/A")}
              ${row("Session ID",             sessionId)}
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
