export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { email, fullName, interests } = body;

    if (!email || !fullName || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "fullName", "interests (array, length > 0)"],
        received: body,
      });
    }

    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
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

    // IMPORTANT: match Airtable column headers EXACTLY
    const fields = {
      "Email": email,
      "Full Name": fullName,
      "Interest": interests, // multi-select expects array of strings
      // Remove Status for now (common cause of 422 if option doesn’t match exactly)
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
        typecast: true, // lets Airtable coerce values + accept select labels more flexibly
      }),
    });

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      // Return the REAL Airtable error so you can see it in browser console
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
    return res.status(500).json({
      error: "Server crashed",
      details: String(err),
    });
  }
}
