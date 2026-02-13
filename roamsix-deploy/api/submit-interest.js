export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsedBody =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const email = (parsedBody.email || "").toString().trim();
    const fullName = (parsedBody.fullName || parsedBody.full_name || "").toString().trim();
    const interests = parsedBody.interests;

    if (!email || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        error: "Email and interests are required",
        received: parsedBody,
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

    // IMPORTANT:
    // Your Airtable "Alternative Interest" table does NOT have a field named "Full Name".
    // This uses "Name" instead. If your Airtable column is called something else, change "Name" here.
    const fields = {
      "Email": email,
      "Name": fullName,          // <-- was "Full Name"
      "Interests": interests,
      "Status": "Not Contacted",
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
      });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json({ success: true, recordId: data?.records?.[0]?.id });
  } catch (error) {
    console.error("submit-interest crashed:", error);
    return res.status(500).json({ error: "Server crashed", details: String(error) });
  }
}
