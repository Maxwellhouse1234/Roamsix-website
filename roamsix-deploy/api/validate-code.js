export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { CODE } = req.body;

  if (!CODE) {
    return res.status(400).json({ error: 'CODE is required' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_CODES}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
        }
      }
    );

    const data = await response.json();
    const records = data.records || [];
console.log('Airtable records:', JSON.stringify(records));
    const validCODE = records.find(record => 
      record.fields.CODE?.toUpperCase() === CODE.toUpperCase() && 
      record.fields.Status === 'Active'
    );

    if (validCODE) {
      return res.status(200).json({
        valid: true,
        pathway: validCODE.fields.Pathway,
        recordId: validCODE.id
      });
    } else {
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error('Error validating CODE:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
