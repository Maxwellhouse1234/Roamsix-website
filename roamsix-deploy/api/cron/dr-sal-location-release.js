import { DR_SAL_EVENT, listConfirmedDrSalRegistrations } from "../../lib/dr-sal-event.js";
import { sendTransactionalEmail } from "../../lib/transactional-email.js";

function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function locationEmail({ name, address, time, parking }) {
  const firstName = String(name || "").trim().split(" ")[0] || "Hello";
  return `<!DOCTYPE html>
  <html><body style="margin:0;padding:32px;background:#0A0A0A;color:#FAFAF9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#18181A;padding:36px 40px;border-top:3px solid #B8562F;">
      <div style="font-size:22px;font-weight:700;letter-spacing:5px;margin-bottom:28px;">ROAMSIX</div>
      <p style="font-size:18px;line-height:1.6;">${firstName},</p>
      <p style="font-size:16px;line-height:1.75;color:#E5E3E0;">Here are the final details for ${DR_SAL_EVENT.name}.</p>
      <p style="font-size:16px;line-height:1.75;color:#E5E3E0;"><strong>Date:</strong> October 24, 2026<br><strong>Time:</strong> ${time}<br><strong>Address:</strong> ${address}<br><strong>Parking:</strong> ${parking}</p>
      <p style="font-size:15px;line-height:1.75;color:#E5E3E0;">Questions? Reply to this email or contact info@roamsix.com.</p>
    </div>
  </body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.query?.test === "1" && process.env.VERCEL_ENV !== "production") {
    const to = String(req.query?.to || "").trim().toLowerCase();
    if (!/^[^\s@]+@roamsix\.com$/.test(to)) return res.status(400).json({ error: "A ROAMSIX test recipient is required" });
    const sent = await sendTransactionalEmail({
      key: `dr-sal-location-verification:${Date.now()}:${to}`,
      purpose: "dr-sal-location-release-verification",
      to,
      from: "ROAMSIX Events <info@roamsix.com>",
      subject: "October 24 ROAMSIX event details",
      html: locationEmail({ name: "Max", address: "TEST ONLY: exact address pending", time: "TEST ONLY: start and end time pending", parking: "TEST ONLY: parking instructions pending" }),
    });
    return res.status(200).json({ test: true, sent: true, messageId: sent.id || "" });
  }
  const today = localDate();
  if (today < "2026-10-07" || today > "2026-10-24") return res.status(200).json({ skipped: true, today });

  const address = String(process.env.DR_SAL_EVENT_ADDRESS || "").trim();
  const time = String(process.env.DR_SAL_EVENT_TIME || "").trim();
  const parking = String(process.env.DR_SAL_EVENT_PARKING || "").trim();
  if (!address || !time || !parking) {
    return res.status(503).json({ error: "Dr. Sal address, time, and parking details are not configured" });
  }

  try {
    const registrations = await listConfirmedDrSalRegistrations();
    const recipients = new Map();
    registrations.forEach((record) => {
      const email = String(record.fields?.Email || "").trim().toLowerCase();
      if (email) recipients.set(email, { name: record.fields?.Name || "", sessionId: record.fields?.["Stripe Session ID"] || record.id });
    });
    for (const [email, registration] of recipients) {
      await sendTransactionalEmail({
        key: `dr-sal-location-2026:${registration.sessionId}:${email}`,
        purpose: "dr-sal-location-release",
        to: email,
        from: "ROAMSIX Events <info@roamsix.com>",
        subject: "October 24 ROAMSIX event details",
        html: locationEmail({ name: registration.name, address, time, parking }),
      });
    }
    return res.status(200).json({ sent: recipients.size, today });
  } catch (error) {
    console.error("Dr. Sal location release failed:", error.message);
    return res.status(500).json({ error: "Location release email failed" });
  }
}
