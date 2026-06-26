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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const {
    firstName = "",
    lastName = "",
    email = "",
    mobile = "",
    experienceInterests = [],
    customInterest = "",
    referralSource = "",
    referralName = "",
    emailConsent = false,
    smsConsent = false,
    termsAccepted = false,
    referredBy = "",
  } = req.body || {};

  if (!firstName.trim() || !lastName.trim() || !email.trim()) {
    return res.status(400).json({ success: false, error: "First name, last name, and email are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  if (!termsAccepted) {
    return res.status(400).json({ success: false, error: "You must agree to the Terms of Service and Privacy Policy." });
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
        "Referral Source": referralSource.trim(),
        "Referred By": referredBy.trim(),
        "Referral Name": referralName.trim(),
        "Email Consent": emailConsent ? "Yes" : "No",
        "SMS Consent": smsConsent ? "Yes" : "No",
        "Terms Accepted": termsAccepted ? "Yes" : "No",
        "Status": "Priority Access",
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
              "Referral Source": referralSource.trim(),
              "Referred By": referredBy.trim(),
              "Referral Name": referralName.trim(),
              "Email Consent": emailConsent ? "Yes" : "No",
              "SMS Consent": smsConsent ? "Yes" : "No",
              "Terms Accepted": termsAccepted ? "Yes" : "No",
              "Status": "Priority Access",
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

    // Welcome email to submitter (does not block submission success)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "ROAMSIX <info@roamsix.com>",
            to: [email.trim()],
            subject: "Welcome to ROAMSIX",
            html: welcomeHTML(),
          }),
        });
      } catch (err) { console.error("Welcome email error:", err); }

      // Internal notification (does not block submission success)
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "ROAMSIX <info@roamsix.com>",
            to: ["max@roamsix.com"],
            subject: "New Priority Access Member",
            html: internalNotifyHTML({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              experienceInterests,
              referralSource: referralSource.trim(),
              referralName: referralName.trim(),
            }),
          }),
        });
      } catch (err) { console.error("Internal notification email error:", err); }
    }

    return res.status(200).json({ success: true, referralCode });
  } catch (err) {
    console.error("Priority Access submission error:", err);
    return res.status(500).json({ success: false, error: "Failed to save your submission. Please contact info@roamsix.com." });
  }
};

// TODO: 48-hour referral email
// Template approved. Implement when
// email automation platform is confirmed.

function welcomeHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to ROAMSIX</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none;
          text-decoration: none; display: block; }
    body { margin: 0; padding: 0; background-color: #0f1520; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-pad { padding: 32px 24px !important; }
      .footer-pad { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0f1520;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#0f1520;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table class="email-container" role="presentation" width="600" cellpadding="0"
          cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#141C2A;">

          <!-- GOLD TOP BAR -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <div style="height:3px;background-color:#B59558;"></div>
            </td>
          </tr>

          <!-- WORDMARK -->
          <tr>
            <td align="center"
              style="padding:40px 40px 36px;background-color:#141C2A;
                line-height:0;font-size:0;">
              <img src="https://www.roamsix.com/images/Roamsix_Logo.png"
                alt="ROAMSIX" width="190"
                style="display:block;margin:0 auto;width:190px;height:auto;
                  mix-blend-mode:screen;">
            </td>
          </tr>

          <!-- THIN DIVIDER -->
          <tr>
            <td style="padding:0 48px;">
              <div style="height:1px;background-color:#B5955830;"></div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="content-pad"
              style="padding:48px 48px 40px;background-color:#141C2A;">

              <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:26px;
                font-weight:normal;color:#E8DFD0;letter-spacing:0.5px;line-height:1.4;">
                Welcome.
              </h1>

              <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#E8DFD0;">
                We're glad you found us.
              </p>

              <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                ROAMSIX brings together people who care about how they live,
                what they build, and who they become.
              </p>

              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                People who stay curious.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                Who value quality over convenience.
              </p>
              <p style="margin:0 0 36px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                Who believe the people around them matter.
              </p>

              <div style="height:1px;background-color:#B5955825;margin:0 0 36px;"></div>

              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                When there's something worth your time, you'll hear from us.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                An invitation.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                A conversation.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                A story.
              </p>
              <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                An introduction.
              </p>

              <p style="margin:0 0 44px;font-family:Georgia,serif;font-size:16px;
                line-height:1.8;color:#b8afa0;">
                Until then, we're glad you're here.
              </p>

              <!-- Signature -->
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;
                line-height:1.7;color:#b8afa0;font-style:italic;">
                Stay curious.
              </p>
              <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:15px;
                line-height:1.7;color:#b8afa0;font-style:italic;">
                The world is still wide.
              </p>
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;
                line-height:1.7;color:#E8DFD0;">
                Max &amp; Jackie
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;
                letter-spacing:4px;color:#B59558;text-transform:uppercase;">
                ROAMSIX
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-pad"
              style="padding:28px 48px 36px;background-color:#0f1520;">

              <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:12px;
                line-height:1.7;color:#4a4538;font-style:italic;text-align:center;">
                The world is still wide.
              </p>

              <p style="margin:0 0 20px;text-align:center;">
                <a href="https://www.instagram.com/roamsix_"
                  style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;
                    color:#C8A96E;text-decoration:none;text-transform:uppercase;
                    margin:0 12px;">Instagram</a>
                <a href="https://www.linkedin.com/company/roamsix"
                  style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;
                    color:#C8A96E;text-decoration:none;text-transform:uppercase;
                    margin:0 12px;">LinkedIn</a>
                <a href="https://www.roamsix.com"
                  style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;
                    color:#C8A96E;text-decoration:none;text-transform:uppercase;
                    margin:0 12px;">Website</a>
              </p>

              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;
                line-height:1.8;color:#3a342a;text-align:center;">
                You requested Priority Access through ROAMSIX.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function internalNotifyHTML({ firstName, lastName, email, mobile, experienceInterests, referralSource, referralName }) {
  return `<p>First Name: ${firstName}</p>
<p>Last Name: ${lastName}</p>
<p>Email: ${email}</p>
<p>Phone: ${mobile}</p>
<p>Interests: ${experienceInterests.join(", ")}</p>
<p>Referral Source: ${referralSource}</p>
${referralName ? `<p>Referral Name: ${referralName}</p>` : ""}`;
}
