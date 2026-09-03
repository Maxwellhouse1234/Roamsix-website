const CRM_BASE_ID = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";
const CONTACTS_TABLE_ID = process.env.ROAMSIX_CRM_CONTACTS_TABLE_ID || "tblV06NCECV5m4lYf";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function formulaValue(value) {
  return clean(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function airtable(path, options = {}) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error("AIRTABLE_TOKEN is not configured");
  const response = await fetch(`https://api.airtable.com/v0/${CRM_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Airtable request failed (${response.status})`);
  return response.json();
}

async function findContact(preferenceToken) {
  const query = new URLSearchParams({
    filterByFormula: `{Email Preference Token}='${formulaValue(preferenceToken)}'`,
    maxRecords: "1",
  });
  const data = await airtable(`${CONTACTS_TABLE_ID}?${query}`);
  return data.records?.[0] || null;
}

async function updateResend(email, unsubscribed) {
  if (!process.env.RESEND_API_KEY || !email) return;
  const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ unsubscribed }),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Resend contact update failed (${response.status})`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const preferenceToken = clean(req.method === "GET" ? req.query?.token : req.body?.token, 200);
  if (!preferenceToken) return res.status(400).json({ error: "This preference link is incomplete." });

  try {
    const contact = await findContact(preferenceToken);
    if (!contact) return res.status(404).json({ error: "This preference link is no longer valid." });

    const firstName = clean(contact.fields?.["First Name"], 100);
    const permission = clean(contact.fields?.["Email Permission"], 100) || "Unknown";
    const relationships = Array.isArray(contact.fields?.["Relationship Types"])
      ? contact.fields["Relationship Types"]
      : [];
    const discountEligible = relationships.includes("Dinner Guest") && permission !== "Unsubscribed";
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ firstName, permission, discountEligible });
    }

    const choice = clean(req.body?.choice, 20);
    if (choice !== "opt_in" && choice !== "opt_out") {
      return res.status(400).json({ error: "Please choose yes or no." });
    }

    const optedIn = choice === "opt_in";
    const fields = {
      "Email Permission": optedIn ? "Opted In" : "Unsubscribed",
      "Marketing Basis": optedIn ? "Express Opt-In" : "No Marketing",
      "Consent Updated At": new Date().toISOString(),
      "Consent Source": "ROAMSIX email preference center",
    };
    await airtable(`${CONTACTS_TABLE_ID}/${contact.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true }),
    });
    await updateResend(clean(contact.fields?.Email, 320).toLowerCase(), !optedIn);

    return res.status(200).json({
      firstName,
      permission: fields["Email Permission"],
      message: optedIn
        ? "You’re subscribed to occasional ROAMSIX event updates."
        : "You’re unsubscribed from ROAMSIX marketing emails.",
    });
  } catch (error) {
    console.error("Email preference update failed:", error.message);
    return res.status(500).json({ error: "We couldn’t update your preference. Please email info@roamsix.com." });
  }
}
