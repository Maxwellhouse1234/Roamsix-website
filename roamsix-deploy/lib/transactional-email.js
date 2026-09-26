import { createHash } from "node:crypto";

const CRM_BASE_ID = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";
const EMAIL_TABLE = process.env.ROAMSIX_CRM_EMAIL_TABLE_ID || "Transactional Emails";
const MAX_RETRIES = Math.max(1, Number(process.env.TRANSACTIONAL_EMAIL_MAX_RETRIES || 5));

function clean(value, max = 10000) {
  return String(value || "").trim().slice(0, max);
}

function formulaValue(value) {
  return clean(value, 500).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function resendKey(key, purpose) {
  const slug = clean(purpose, 60).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "transactional";
  const digest = createHash("sha256").update(key).digest("hex").slice(0, 32);
  return `roamsix-${slug}-${digest}`;
}

async function airtable(path, options = {}) {
  if (!process.env.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN is not configured for transactional email state");
  const response = await fetch(`https://api.airtable.com/v0/${CRM_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Transactional email Airtable ${response.status}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

async function findOne(field, value) {
  const query = new URLSearchParams({ filterByFormula: `{${field}}='${formulaValue(value)}'`, maxRecords: "1" });
  const data = await airtable(`${encodeURIComponent(EMAIL_TABLE)}?${query}`);
  return data.records?.[0] || null;
}

async function saveRecord(recordId, fields) {
  const path = recordId ? `${encodeURIComponent(EMAIL_TABLE)}/${recordId}` : encodeURIComponent(EMAIL_TABLE);
  return airtable(path, {
    method: recordId ? "PATCH" : "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
}

function retryAt(retryCount) {
  const minutes = Math.min(24 * 60, 5 * (2 ** Math.max(0, retryCount - 1)));
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function payloadFor(input) {
  return {
    key: clean(input.key, 500),
    purpose: clean(input.purpose, 200),
    to: clean(input.to, 320).toLowerCase(),
    from: clean(input.from || "ROAMSIX <info@roamsix.com>", 320),
    replyTo: clean(input.replyTo, 320),
    subject: clean(input.subject, 500),
    html: String(input.html || "").slice(0, 90000),
    stripeEventId: clean(input.stripeEventId, 200),
    stripeSessionId: clean(input.stripeSessionId, 200),
    retryable: input.retryable !== false,
  };
}

export function assertTransactionalEmailConfig() {
  const missing = ["RESEND_API_KEY", "AIRTABLE_TOKEN"].filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Transactional email configuration missing: ${missing.join(", ")}`);
}

export async function sendTransactionalEmail(input) {
  assertTransactionalEmailConfig();
  const payload = payloadFor(input);
  if (!payload.key || !payload.purpose || !payload.to || !payload.subject || !payload.html) {
    throw new Error("Transactional email requires key, purpose, recipient, subject, and HTML");
  }

  const existing = await findOne("Email Key", payload.key);
  const existingStatus = existing?.fields?.Status;
  if (["Sent", "Delivered"].includes(existingStatus)) {
    return { skipped: true, status: existingStatus, id: existing.fields?.["Resend Message ID"] || "", recordId: existing.id };
  }

  const retryCount = Number(existing?.fields?.["Retry Count"] || 0) + 1;
  if (retryCount > MAX_RETRIES) throw new Error(`Transactional email retry limit reached for ${payload.key}`);
  const attemptedAt = new Date().toISOString();
  const baseFields = {
    "Email Key": payload.key,
    Purpose: payload.purpose,
    Recipient: payload.to,
    "Stripe Event ID": payload.stripeEventId,
    "Stripe Session ID": payload.stripeSessionId,
    "Attempted At": attemptedAt,
    Status: "Attempting",
    "Retry Count": retryCount,
    "Last Error": "",
    "Next Retry At": null,
    "Needs Attention": false,
    Payload: JSON.stringify(payload),
    "Updated At": attemptedAt,
  };
  const record = await saveRecord(existing?.id, baseFields);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": resendKey(payload.key, payload.purpose),
      },
      body: JSON.stringify({
        from: payload.from,
        to: [payload.to],
        reply_to: payload.replyTo || undefined,
        subject: payload.subject,
        html: payload.html,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) throw new Error(`Resend ${response.status}: ${JSON.stringify(data).slice(0, 500)}`);
    await saveRecord(record.id, {
      Status: "Sent",
      "Resend Message ID": data.id,
      "Last Error": "",
      "Next Retry At": null,
      "Needs Attention": false,
      "Updated At": new Date().toISOString(),
    });
    return { skipped: false, status: "Sent", id: data.id, recordId: record.id };
  } catch (error) {
    await saveRecord(record.id, {
      Status: "Failed",
      "Last Error": clean(error.message, 5000),
      "Next Retry At": payload.retryable && retryCount < MAX_RETRIES ? retryAt(retryCount) : null,
      "Needs Attention": true,
      "Updated At": new Date().toISOString(),
    });
    throw error;
  }
}

export async function retryFailedTransactionalEmails(limit = 25) {
  assertTransactionalEmailConfig();
  const formula = `AND(OR({Status}='Failed',AND({Status}='Attempting',IS_BEFORE({Attempted At},DATEADD(NOW(),-15,'minutes')))),{Retry Count}<${MAX_RETRIES},OR({Next Retry At}=BLANK(),IS_BEFORE({Next Retry At},NOW())))`;
  const query = new URLSearchParams({ filterByFormula: formula, maxRecords: String(Math.min(100, limit)) });
  const data = await airtable(`${encodeURIComponent(EMAIL_TABLE)}?${query}`);
  let sent = 0;
  let failed = 0;
  for (const record of data.records || []) {
    try {
      const payload = JSON.parse(record.fields?.Payload || "{}");
      if (payload.retryable === false) continue;
      await sendTransactionalEmail(payload);
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("Transactional email retry failed:", error.message);
    }
  }
  return { checked: (data.records || []).length, sent, failed };
}

export async function updateTransactionalDelivery({ messageId, type, occurredAt, errorMessage = "" }) {
  if (!messageId) return null;
  const record = await findOne("Resend Message ID", messageId);
  if (!record) return null;
  const statuses = {
    "email.delivered": "Delivered",
    "email.bounced": "Bounced",
    "email.complained": "Complained",
    "email.suppressed": "Suppressed",
  };
  const status = statuses[type];
  if (!status) return { record, updated: false };
  const failure = status !== "Delivered";
  const updated = await saveRecord(record.id, {
    Status: status,
    "Delivery Event At": occurredAt || new Date().toISOString(),
    "Last Error": failure ? clean(errorMessage || status, 5000) : "",
    "Needs Attention": failure,
    "Updated At": new Date().toISOString(),
  });
  return { record: updated, previous: record, updated: true, failure };
}
