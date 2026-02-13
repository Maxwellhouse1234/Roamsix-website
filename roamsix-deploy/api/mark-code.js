export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recordId, email } = req.body;

  if (!recordId || !email) {
    return res.status(400).json({ error: 'RecordId and email are required' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_CODES}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            id: recordId,
            fields: {
              Status: 'Used',
              'Used By Email': email,
              'Used Date': new Date().toISOString().split('T')[0]
            }
          }]
        })
      }
    );

    const data = await response.json();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking code as used:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
