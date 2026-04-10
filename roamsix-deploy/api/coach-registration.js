export default async function handler(req, res) {
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
              fldQ4irjCRk5rPmcA: teamCode, // Team Code
              fldyrZpiBHYBxKwiY: coachName, // Coach Name
              fldanyN6KmbQ0DHME: coachEmail, // Coach Email
              fld9D3NcgLpFSC5ez: coachPhone, // Coach Phone
              fld3b5qCJ6IqgS5h3: pricePaid, // Price Paid
              fld5jvDMMU2dwrsiK: 'Pending', // Payment Status
              fldmN2rzH2z6k5P0N: new Date().toISOString(), // Registration Date
              fldJEVhMxBWz8zHF1: 1, // Team Size (starts at 1 for coach)
              fldNFRyrhQJblpYa0: false // Team Complete
            }
          }]
        })
      }
    );

    if (!teamResponse.ok) {
      throw new Error('Failed to create team record');
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
              fldekM5VpBSwvd2Q7: coachName, // Name
              fldfTlc1EaWdjfi7t: coachEmail, // Email
              fld4EUZKhzqmKG1hf: coachPhone, // Phone
              fldGhclpvBclEdaO9: 'Coach', // Role
              fldk1vrmRQrZcb0xw: teamCode, // Team Code
              fldDaQTMCCn9tC2Qa: coachShirtSize, // Shirt Size
              fldqbDW0miUEqEcw7: emergencyContactName, // Emergency Contact Name
              fldhefygVPg99sKo8: emergencyContactPhone, // Emergency Contact Phone
              fld6VeNuuLRG0f5Ig: false, // Waiver Signed (will be signed later)
              fld0cUov4AoXjb3eX: new Date().toISOString() // Registration Date
            }
          }]
        })
      }
    );

    if (!participantResponse.ok) {
      throw new Error('Failed to create participant record');
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
      message: 'Registration failed. Please try again.'
    });
  }
}
