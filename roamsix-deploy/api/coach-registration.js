export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    coachName,
    coachEmail,
    coachPhone,
    coachShirtSize,
    emergencyContactName,
    emergencyContactPhone,
    teamCode,
    pricePaid
  } = req.body;

  try {
    // Log environment variables (for debugging)
    console.log('Base ID:', process.env.PROVING_GROUNDS_BASE_ID);
    console.log('Has token:', !!process.env.AIRTABLE_TOKEN);

    // 1. CREATE TEAM RECORD
    const teamResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/tbl8azUw7OSszOhf6`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Team Code': teamCode,
              'Coach Name': coachName,
              'Coach Email': coachEmail,
              'Coach Phone': coachPhone,
              'Price Paid': pricePaid,
              'Payment Status': 'Pending',
              'Registration Date': new Date().toISOString(),
              'Team Size': 1,
              'Team Complete': false
            }
          }]
        })
      }
    );

    const teamData = await teamResponse.json();

    if (!teamResponse.ok) {
      console.error('Team creation failed:', teamData);
      throw new Error(JSON.stringify(teamData));
    }

    // 2. CREATE PARTICIPANT RECORD FOR COACH
    const participantResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/tbll5iTggAYjNgRhv`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Name': coachName,
              'Email': coachEmail,
              'Phone': coachPhone,
              'Role': 'Coach',
              'Team Code': teamCode,
              'Shirt Size': coachShirtSize,
              'Emergency Contact Name': emergencyContactName,
              'Emergency Contact Phone': emergencyContactPhone,
              'Waiver Signed': false,
              'Registration Date': new Date().toISOString()
            }
          }]
        })
      }
    );

    const participantData = await participantResponse.json();

    if (!participantResponse.ok) {
      console.error('Participant creation failed:', participantData);
      throw new Error(JSON.stringify(participantData));
    }

    return res.status(200).json({
      success: true,
      teamCode,
      message: 'Coach registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.',
      error: error.toString()
    });
  }
}
