import { createHmac, timingSafeEqual } from "node:crypto";
import { sendTransactionalEmail, updateTransactionalDelivery } from "../lib/transactional-email.js";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function header(req, names) {
  for (const name of names) {
    if (req.headers[name]) return String(req.headers[name]);
  }
  return "";
}

function verifyResendSignature(rawBody, req, secret) {
  const id = header(req, ["svix-id", "webhook-id"]);
  const timestamp = header(req, ["svix-timestamp", "webhook-timestamp"]);
  const supplied = header(req, ["svix-signature", "webhook-signature"]);
  if (!id || !timestamp || !supplied || !secret) return false;
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp) || Math.abs(Date.now() / 1000 - numericTimestamp) > 5 * 60) return false;
  let key;
  try {
    key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  } catch {
    return false;
  }
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  return supplied.split(/[ ,]/).some((part, index, parts) => {
    const candidate = part === "v1" ? parts[index + 1] : part.startsWith("v1,") ? part.slice(3) : "";
    if (!candidate || Buffer.byteLength(candidate) !== Buffer.byteLength(expected)) return false;
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
  });
}

function deliveryError(event) {
  return event.data?.bounce?.message || event.data?.reason || event.data?.error || event.type;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!process.env.RESEND_WEBHOOK_SECRET) return res.status(503).json({ error: "Resend webhook is not configured." });
  try {
    const raw = await readRawBody(req);
    const rawBody = raw.toString("utf8");
    if (!rawBody || !verifyResendSignature(rawBody, req, process.env.RESEND_WEBHOOK_SECRET)) {
      return res.status(400).json({ error: "Invalid signature." });
    }
    const event = JSON.parse(rawBody);
    if (!["email.delivered", "email.bounced", "email.complained", "email.suppressed"].includes(event.type)) {
      return res.status(200).json({ received: true, tracked: false });
    }
    const messageId = event.data?.email_id || event.data?.id || "";
    const result = await updateTransactionalDelivery({
      messageId,
      type: event.type,
      occurredAt: event.created_at || event.data?.created_at || new Date().toISOString(),
      errorMessage: deliveryError(event),
    });
    if (result?.failure && result.previous?.fields?.Purpose !== "delivery-failure-alert") {
      const recipient = result.previous?.fields?.Recipient || "unknown recipient";
      await sendTransactionalEmail({
        key: `resend:${messageId}:${event.type}:delivery-failure-alert:max@roamsix.com`,
        purpose: "delivery-failure-alert",
        to: "max@roamsix.com",
        subject: `ROAMSIX email delivery issue: ${event.type.replace("email.", "")}`,
        html: `<p>A required ROAMSIX transactional email reported <strong>${event.type}</strong>.</p><p>Recipient: ${recipient}</p><p>Purpose: ${result.previous?.fields?.Purpose || "unknown"}</p><p>Resend message: ${messageId}</p><p>The Airtable Transactional Emails record has been flagged for attention.</p>`,
        retryable: true,
      });
    }
    return res.status(200).json({ received: true, tracked: Boolean(result), status: result?.record?.fields?.Status || null });
  } catch (error) {
    console.error("Resend webhook failed:", error.message);
    return res.status(500).json({ error: "Resend webhook processing failed and should be retried." });
  }
}
