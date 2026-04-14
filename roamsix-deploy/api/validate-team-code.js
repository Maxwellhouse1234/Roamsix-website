export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ valid: false, message: 'No team code provided' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/tbl8azUw7OSszOhf6?filterByFormula={Team Code}='${code}'`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return res.status(200).json({
        valid: false,
        message: 'Team code not found'
      });
    }

    const team = data.records[0];
    const teamSize = team.fields['Team Size'] || 1;

    if (teamSize >= 4) {
      return res.status(200).json({
        valid: false,
        message: 'This team is already full'
      });
    }

    return res.status(200).json({
      valid: true,
      teamSize,
      spotsRemaining: 4 - teamSize
    });

  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Error validating team code'
    });
  }
}
