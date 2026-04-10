export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    teamCode,
    athleteName,
    athleteEmail,
    athletePhone,
    shirtSize,
    emergencyContactName,
    emergencyContactPhone,
    waiverAccepted
  } = req.body;

  try {
    // 1. VERIFY TEAM CODE EXISTS AND HAS ROOM
    const teamCheckResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/tbl8azUw7OSszOhf6?filterByFormula={Team Code}='${teamCode}'`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`
        }
      }
    );

    const teamData = await teamCheckResponse.json();

    if (!teamData.records || teamData.records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team code'
      });
    }

    const team = teamData.records[0];
    const currentTeamSize = team.fields['Team Size'] || 1;

    if (currentTeamSize >= 4) {
      return res.status(400).json({
        success: false,
        message: 'This team is already full'
      });
    }

    // 2. CREATE PARTICIPANT RECORD
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
              fldekM5VpBSwvd2Q7: athleteName, // Name
              fldfTlc1EaWdjfi7t: athleteEmail, // Email
              fld4EUZKhzqmKG1hf: athletePhone, // Phone
              fldGhclpvBclEdaO9: 'Athlete', // Role
              fldk1vrmRQrZcb0xw: teamCode, // Team Code
              fldDaQTMCCn9tC2Qa: shirtSize, // Shirt Size
              fldqbDW0miUEqEcw7: emergencyContactName, // Emergency Contact Name
              fldhefygVPg99sKo8: emergencyContactPhone, // Emergency Contact Phone
              fld6VeNuuLRG0f5Ig: waiverAccepted, // Waiver Signed
              fld0cUov4AoXjb3eX: new Date().toISOString() // Registration Date
            }
          }]
        })
      }
    );

    if (!participantResponse.ok) {
      throw new Error('Failed to create participant record');
    }

    // 3. UPDATE TEAM SIZE
    const newTeamSize = currentTeamSize + 1;
    const teamComplete = newTeamSize === 4;

    const updateTeamResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/tbl8azUw7OSszOhf6/${team.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            fldJEVhMxBWz8zHF1: newTeamSize, // Team Size
            fldNFRyrhQJblpYa0: teamComplete // Team Complete
          }
        })
      }
    );

    if (!updateTeamResponse.ok) {
      throw new Error('Failed to update team size');
    }

    return res.status(200).json({
      success: true,
      message: 'Athlete registration successful',
      teamComplete
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
}
