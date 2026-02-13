// Add table ID for applications as environment variable
const APPLICATIONS_TABLE = 'tblCLgvCLwv2juTlF';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formData, pathway, invitationCode } = req.body;

  if (!formData || !pathway || !invitationCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const applicationData = {
      fields: {
        'Full Name': formData.fullName,
        'Email': formData.email,
        'Phone': formData.phone || '',
        'Location': formData.location,
        'LinkedIn': formData.linkedin,
        'Mailing Address': formData.address || '',
        'Pathway': pathway,
        'Invitation Code Used': invitationCode,
        'Transition Question': formData.transition,
        'Why Now Question': formData.whyNow,
        'Status': 'Under Review'
      }
    };

    // Add pathway-specific fields
    if (pathway === 'Individual') {
      applicationData.fields.Role = formData.role;
      if (formData.website) applicationData.fields.Website = formData.website;
    } else if (pathway === 'Corporate') {
      applicationData.fields.Company = formData.company;
      applicationData.fields.Role = formData.role;
      applicationData.fields['Team Size'] = formData.teamSize;
      if (formData.website) applicationData.fields.Website = formData.website;
    } else if (pathway === 'Athletics') {
      applicationData.fields['Organization Name'] = formData.organizationName;
      applicationData.fields.Role = formData.role;
      applicationData.fields.Sport = formData.sport;
    } else if (pathway === 'Family') {
      applicationData.fields.Participants = formData.participants;
      applicationData.fields.Relationship = formData.relationship;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${APPLICATIONS_TABLE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [applicationData] })
      }
    );

    if (!response.ok) {
      throw new Error('Airtable API error');
    }

    const data = await response.json();
    return res.status(200).json({ success: true, recordId: data.records[0].id });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
