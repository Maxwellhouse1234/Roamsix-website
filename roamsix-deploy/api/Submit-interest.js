// Add table ID for alternative interests
const INTERESTS_TABLE = 'tblddUVnvzC9Xgalk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName, interests } = req.body;

  if (!email || !interests || !Array.isArray(interests)) {
    return res.status(400).json({ error: 'Email and interests are required' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${INTERESTS_TABLE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': email,
              'Full Name': fullName || '',
              'Interests': interests,
              'Status': 'Not Contacted'
            }
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Airtable API error');
    }

    const data = await response.json();
    return res.status(200).json({ success: true, recordId: data.records[0].id });
  } catch (error) {
    console.error('Error submitting interests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
