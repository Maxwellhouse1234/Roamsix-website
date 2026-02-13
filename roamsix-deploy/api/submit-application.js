export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { formData, pathway, invitationCode } = req.body || {};

    if (!formData || !pathway || !invitationCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const table = process.env.AIRTABLE_TABLE_APPLICATIONS; // set this in Vercel
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    if (!table || !base || !token) {
      return res.status(500).json({
        error: "Server misconfigured (missing Airtable env vars)",
      });
    }

    const fields = {
      "Full Name": formData.fullName || "",
      "Email": formData.email || "",
      "Phone": formData.phone || "",
      "Location": formData.location || "",
      "LinkedIn": formData.linkedin || "",
      "Mailing Address": formData.address || "",
      "Pathway": pathway,
      "Invitation Code Used": invitationCode,
      "Transition Question": formData.transition || "",
      "Why Now Question": formData.whyNow || "",
      "Status": "Under Review",
    };

    // Pathway-specific fields
    if (pathway === "Individual") {
      if (formData.role) fields["Role"] = formData.role;
      if (formData.website) fields["Website"] = formData.website;
    }
    if (pathway === "Corporate") {
      if (formData.company) fields["Company"] = formData.company;
      if (formData.role) fields["Role"] = formData.role;
      if (formData.teamSize) fields["Team Size"] = formData.teamSize;
      if (formData.website) fields["Website"] = formData.website;
    }
    if (pathway === "Athletics") {
      if (formData.organizationName) fields["Organization Name"] = formData.organizationName;
      if (formData.role) fields["Role"] = formData.role;
      if (formData.sport) fields["Sport"] = formData.sport;
    }
    if (pathway === "Family") {
      if (formData.participants) fields["Participants"] = formData.participants;
      if (formData.relationship) fields["Relationship"] = formData.relationship;
    }

    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

    const airtableRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    const text = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error("Airtable submit failed:", airtableRes.status, text);
      return res.status(500).json({
        error: "Airtable submit failed",
        status: airtableRes.status,
        details: text,
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json({ success: true, recordId: data.records?.[0]?.id });
  } catch (err) {
    console.error("submit-application crashed:", err);
    return res.status(500).json({ error: "Server crashed", details: String(err) });
  }
}
