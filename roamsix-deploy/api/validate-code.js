export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Accept either CODE or code (frontend mismatch protection)
  const CODE = (req.body?.CODE ?? req.body?.code ?? "").toString().trim();

  if (!CODE) {
    return res.status(400).json({ error: "CODE is required" });
  }

  try {
    const tableIdOrName = encodeURIComponent(process.env.AIRTABLE_TABLE_CODES);

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${tableIdOrName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Airtable error:", response.status, text);
      return res.status(500).json({ error: "Airtable request failed" });
    }

    const data = await response.json();
    const records = data.records || [];

    const validCode = records.find((record) => {
      const recordCode = (record?.fields?.CODE ?? "").toString().trim();
      const status = (record?.fields?.Status ?? "").toString().trim();
      return (
        recordCode.toUpperCase() === CODE.toUpperCase() &&
        status === "Active"
      );
    });

    if (validCode) {
      return res.status(200).json({
        valid: true,
        pathway: validCode.fields.Pathway,
        recordId: validCode.id,
      });
    }

    return res.status(200).json({ valid: false });
  } catch (error) {
    console.error("Error validating CODE:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
