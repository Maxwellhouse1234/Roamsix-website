export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { email, fullName, interests } = body;

    if (!email || !Array.isArray(interests)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "interests (array)"],
        received: body,
      });
    }

    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    // IMPORTANT:
    // Set this in Vercel env vars to EXACTLY: Alternative Interest
    // (the table name, not the base name)
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

    // Airtable field names MUST match exactly.
    // Based on your screenshot, the column looks like "A Full Name" (not "Full Name").
    // If your Alternative Interest table is different, rename the field in Airtable or change it here.
    const fields = {
      Email: email,
      "A Full Name": fullName || "",
      Interests: interests,
      Status: "Not Contacted",
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
