// api/priority-access.js
// Handles Priority Access sign-up submissions.
// Writes/updates a record in the Airtable "Priority Access" table and
// manages referral codes and referral counts.

const AIRTABLE_BASE_ID = "app2b2mTCtAIMmo79";
const TABLE = "Priority Access";

function randomChars(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function makeReferralCode(firstName) {
  const namePart = (firstName || "FRIEND").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "FRIEND";
  return `ROAM-${namePart}-${randomChars(4)}`;
}

function makeDiscountCode(firstName) {
  const namePart = (firstName || "FRIEND").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "FRIEND";
  return `ROAM10-${namePart}-${randomChars(4)}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const {
    firstName = "",
    lastName = "",
    email = "",
    mobile = "",
    experienceInterests = [],
    customInterest = "",
    questionOne = "",
    questionTwo = "",
    referralSource = "",
    referredBy = "",
  } = req.body || {};

  if (!firstName.trim() || !email.trim()) {
    return res.status(400).json({ success: false, error: "First name and email are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }

  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    return res.status(503).json({ success: false, error: "Service unavailable. Please contact info@roamsix.com." });
  }
  const HEADERS = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const now = new Date().toISOString();

  try {
    // Look up existing record by email
    const emailFormula = `({Email}="${email.trim().replace(/"/g, '\\"')}")`;
    const lookupRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}?filterByFormula=${encodeURIComponent(emailFormula)}&maxRecords=1`,
      { headers: HEADERS }
    );
    if (!lookupRes.ok) {
      const errData = await lookupRes.json().catch(() => ({}));
      console.error("Airtable lookup error:", errData);
      return res.status(500).json({ success: false, error: "Failed to save your submission. Please contact info@roamsix.com." });
    }
    const lookupData = await lookupRes.json();
    const existing = lookupData.records?.[0];

    let referralCode;

    if (existing) {
      referralCode = existing.fields["Referral Code"] || makeReferralCode(firstName);
      const updateFields = {
        "First Name": firstName.trim(),
        "Last Name": lastName.trim(),
        "Mobile Number": mobile.trim(),
        "Experience Interests": experienceInterests.join(", "),
        "Custom Experience Interest": customInterest.trim(),
        "Question One Response": questionOne.trim(),
        "Question Two Response": questionTwo.trim(),
        "Referral Source": referralSource.trim(),
        "Referred By": referredBy.trim(),
        "Last Updated": now,
      };
      if (!existing.fields["Referral Code"]) updateFields["Referral Code"] = referralCode;

      const updateRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}/${existing.id}`,
        { method: "PATCH", headers: HEADERS, body: JSON.stringify({ fields: updateFields }) }
      );
      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        console.error("Airtable update error:", errData);
        return res.status(500).json({ success: false, error: "Failed to save your submission. Please contact info@roamsix.com." });
      }
    } else {
      referralCode = makeReferralCode(firstName);
      const createRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}`,
        {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({
            fields: {
              "First Name": firstName.trim(),
              "Last Name": lastName.trim(),
              "Email": email.trim(),
              "Mobile Number": mobile.trim(),
              "Source": "Priority Access Page",
              "Experience Interests": experienceInterests.join(", "),
              "Custom Experience Interest": customInterest.trim(),
              "Question One Response": questionOne.trim(),
              "Question Two Response": questionTwo.trim(),
              "Referral Source": referralSource.trim(),
              "Referred By": referredBy.trim(),
              "Referral Code": referralCode,
              "Referral Count": 0,
              "Created Date": now,
              "Last Updated": now,
            },
          }),
        }
      );
      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        console.error("Airtable create error:", errData);
        return res.status(500).json({ success: false, error: "Failed to save your submission. Please contact info@roamsix.com." });
      }
    }

    // Handle referral credit
    if (referredBy && referredBy.trim()) {
      const refFormula = `({Referral Code}="${referredBy.trim().replace(/"/g, '\\"')}")`;
      const refRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}?filterByFormula=${encodeURIComponent(refFormula)}&maxRecords=1`,
        { headers: HEADERS }
      );
      if (refRes.ok) {
        const refData = await refRes.json();
        const referrer = refData.records?.[0];
        if (referrer) {
          const newCount = (referrer.fields["Referral Count"] || 0) + 1;
          const refUpdateFields = { "Referral Count": newCount, "Last Updated": now };
          if (newCount === 1 && !referrer.fields["Discount Code Earned"]) {
            refUpdateFields["Discount Code Earned"] = makeDiscountCode(referrer.fields["First Name"]);
          }
          await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}/${referrer.id}`,
            { method: "PATCH", headers: HEADERS, body: JSON.stringify({ fields: refUpdateFields }) }
          );
        }
      }
    }

    return res.status(200).json({ success: true, referralCode });
  } catch (err) {
    console.error("Priority Access submission error:", err);
    return res.status(500).json({ success: false, error: "Failed to save your submission. Please contact info@roamsix.com." });
  }
};
