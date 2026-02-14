export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // Accept both "fullName" and "full_name" defensively
    const email = body.email;
    const fullName = body.fullName || body.full_name;
    const interests = body.interests;

    // Validate payload
    if (!email || !fullName || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "fullName", "interests (array, length > 0)"],
        received: body,
      });
    }

    // Env vars
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const table = process.env.AIRTABLE_TABLE_INTERESTS; // should be: Alternative Interest

    if (!base || !token || !table) {
      return res.status(500).json({
        error: "Server misconfigured (missing Airtable env vars)",
        missing: {
          AIRTABLE_BASE_ID: !base,
          AIRTABLE_TOKEN: !token,
          AIRTABLE_TABLE_INTERESTS: !table,
        },
      });
    }

    // IMPORTANT: Field names must match Airtable column headers EXACTLY (no "A " prefix)
    const fields = {
      "Email": email,
      "Full Name": fullName,
      "Interest": interests, // multi-select expects an array of option names
      "Status": "Not Contacted",
      // Do NOT set "Submitted Date" if it's a created-time field
    };

    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

    const airtableRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error("Airtable submit-interest failed:", airtableRes.status, responseText);
      return res.status(500).json({
        error: "Airtable submit-interest failed",
        airtableStatus: airtableRes.status,
        airtableResponse: responseText,
        fieldsSent: fields,
        tableUsed: table,
      });
    }

    const data = JSON.parse(responseText);
    const recordId = data?.records?.[0]?.id;

    return res.status(200).json({ success: true, recordId });
  } catch (err) {
    console.error("submit-interest crashed:", err);
    return res.status(500).json({
      error: "Server crashed",
      details: String(err),
    });
  }
}
