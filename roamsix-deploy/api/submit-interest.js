export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { email, fullName, interests } = body;

    // Validate incoming payload
    if (!email || !fullName || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "fullName", "interests (array, length > 0)"],
        received: body,
      });
    }

    // Required env vars
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    // IMPORTANT: set this env var in Vercel to the TABLE NAME exactly: Alternative Interest
    const table = process.env.AIRTABLE_TABLE_INTERESTS;

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

    // Airtable field names must match EXACTLY what you see as column headers in Airtable
    // Based on your screenshot: Email, Full Name, Interest, Status, Submitted Date
    // "Submitted Date" is usually a created-time or formula field; we do not set it.
    const fields = {
      "Email": email,
      "Full Name": fullName,
      "Interest": interests, // works if "Interest" is multi-select; if it's single-select, send interests[0]
      "Status": "Not Contacted",
    };

    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

    const airtableRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields }],
      }),
    });

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error("Airtable submit-interest failed:", airtableRes.status, responseText);
      return res.status(500).json({
        error: "Airtable submit-interest failed",
        airtableStatus: airtableRes.status,
        airtableResponse: responseText,
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
