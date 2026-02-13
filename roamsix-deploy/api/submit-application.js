export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Handle cases where req.body arrives as a string
    const parsedBody =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const { formData, pathway, invitationCode } = parsedBody;

    if (!formData || !pathway || !invitationCode) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["formData", "pathway", "invitationCode"],
        received: parsedBody,
      });
    }

    // Required env vars
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const table = process.env.AIRTABLE_TABLE_APPLICATIONS; // Vercel: Applications

    if (!base || !token || !table) {
      return res.status(500).json({
        error: "Server misconfigured (missing Airtable env vars)",
        missing: {
          AIRTABLE_BASE_ID: !base,
          AIRTABLE_TOKEN: !token,
          AIRTABLE_TABLE_APPLICATIONS: !table,
        },
      });
    }

    // Map frontend fields -> Airtable field names (must match Airtable exactly)
    const fields = {
      "Full Name": formData.fullName || "",
      "Email": formData.email || "",
      "Phone": formData.phone || "",
      "Location": formData.location || "",
      "Linkedin": formData.linkedin || "",         // matches Airtable
      "Mailing Address": formData.address || "",
      "Pathway": pathway,
      "Invitation Code Used": invitationCode,
      "Transition Question": formData.transition || "",
      "Why Now Question": formData.whyNow || "",
      "Status": "Under Review",
    };

    // Optional fields (only add if present)
    if (formData.role) fields["Role"] = formData.role;
    if (formData.company) fields["Company"] = formData.company;
    if (formData.teamSize) fields["Team Size"] = formData.teamSize;
    if (formData.website) fields["Website"] = formData.website;
    if (formData.organizationName)
      fields["Organization Name"] = formData.organizationName;
    if (formData.sport) fields["Sport"] = formData.sport;
    if (formData.participants) fields["Participants"] = formData.participants;
    if (formData.relationship) fields["Relationship"] = formData.relationship;

    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(
      table
    )}`;

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
      console.error("Airtable submit failed:", airtableRes.status, responseText);
      return res.status(500).json({
        error: "Airtable submit failed",
        airtableStatus: airtableRes.status,
        airtableResponse: responseText,
      });
    }

    // Airtable normally returns JSON, but we’ll guard anyway
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(200).json({
        success: true,
        note: "Airtable returned a non-JSON success response",
        raw: responseText,
      });
    }

    const recordId = data?.records?.[0]?.id;
    return res.status(200).json({ success: true, recordId });
  } catch (err) {
    console.error("submit-application crashed:", err);
    return res.status(500).json({
      error: "Server crashed",
      details: String(err),
    });
  }
}
