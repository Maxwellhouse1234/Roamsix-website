export default async function handler(req, res) {
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
    athleteName,
    athleteEmail,
    athletePhone,
    athleteShirtSize,
    emergencyContactName,
    emergencyContactPhone,
    teamCode,
    waiverAccepted,
    mediaReleaseAccepted
  } = req.body;

  try {
    const baseId = process.env.PROVING_GROUNDS_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    // CREATE PARTICIPANT RECORD
    const participantPayload = {
      records: [{
        fields: {
          fldekM5VpBSwvd2Q7: athleteName,
          fldfTlc1EaWdjfi7t: athleteEmail,
          fld4EUZKhzqmKG1hf: athletePhone,
          fldGhclpvBclEdaO9: 'Athlete',
          fldk1vrmRQrZcb0xw: teamCode,
          fldDaQTMCCn9tC2Qa: athleteShirtSize,
          fldqbDW0miUEqEcw7: emergencyContactName,
          fldhefygVPg99sKo8: emergencyContactPhone,
          fld6VeNuuLRG0f5Ig: waiverAccepted && mediaReleaseAccepted,
          fld0cUov4AoXjb3eX: new Date().toISOString()
        }
      }]
    };

    const participantResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbll5iTggAYjNgRhv`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participantPayload)
      }
    );

    if (!participantResponse.ok) {
      const error = await participantResponse.text();
      throw new Error(`Participant creation failed: ${error}`);
    }

    // UPDATE TEAM SIZE
    // First, get the team record
    const teamResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbl8azUw7OSszOhf6?filterByFormula={Team Code}='${teamCode}'`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const teamData = await teamResponse.json();

    if (teamData.records && teamData.records.length > 0) {
      const teamRecord = teamData.records[0];
      const currentSize = teamRecord.fields.fldJEVhMxBWz8zHF1 || 1;
      const newSize = currentSize + 1;

      // Update team size
      await fetch(
        `https://api.airtable.com/v0/${baseId}/tbl8azUw7OSszOhf6/${teamRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              fldJEVhMxBWz8zHF1: newSize,
              fldNFRyrhQJblpYa0: newSize >= 4
            }
          })
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Athlete registration successful'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
