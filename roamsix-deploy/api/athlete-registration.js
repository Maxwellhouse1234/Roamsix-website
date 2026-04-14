export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.PROVING_GROUNDS_BASE_ID;
  const TEAMS_TABLE_ID = process.env.TEAMS_TABLE_ID;
  const PARTICIPANTS_TABLE_ID = process.env.PARTICIPANTS_TABLE_ID;

  try {
    // Step 1: Get the team record to find current team size
    const teamResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TEAMS_TABLE_ID}?filterByFormula={fldQ4irjCRk5rPmcA}='${teamCode}'`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const teamData = await teamResponse.json();
    
    if (!teamData.records || teamData.records.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid team code' });
    }

    const teamRecord = teamData.records[0];
    const currentTeamSize = teamRecord.fields.fldJEVhMxBWz8zHF1 || 1;

    // Step 2: Create athlete participant record
    const participantRecord = {
      fields: {
        fldekM5VpBSwvd2Q7: athleteName,
        fldfTlc1EaWdjfi7t: athleteEmail,
        fld4EUZKhzqmKG1hf: athletePhone,
        fldGhclpvBclEdaO9: 'Athlete',
        fldk1vrmRQrZcb0xw: teamCode,
        fldDaQTMCCn9tC2Qa: athleteShirtSize,
        fldqbDW0miUEqEcw7: emergencyContactName,
        fldhefygVPg99sKo8: emergencyContactPhone,
        fld6VeNuuLRG0f5Ig: waiverAccepted,
        fld0cUov4AoXjb3eX: new Date().toISOString()
      }
    };

    const createResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${PARTICIPANTS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [participantRecord] })
      }
    );

    const createData = await createResponse.json();

    if (createData.error) {
      console.error('Airtable create error:', createData.error);
      return res.status(500).json({ success: false, error: 'Failed to create participant record' });
    }

    // Step 3: Update team size
    const newTeamSize = currentTeamSize + 1;
    const teamComplete = newTeamSize === 4;

    const updateTeamResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TEAMS_TABLE_ID}/${teamRecord.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            fldJEVhMxBWz8zHF1: newTeamSize,
            fldNFRyrhQJblpYa0: teamComplete
          }
        })
      }
    );

    const updateTeamData = await updateTeamResponse.json();

    if (updateTeamData.error) {
      console.error('Team update error:', updateTeamData.error);
    }

    return res.status(200).json({
      success: true,
      message: 'Athlete registration complete',
      teamSize: newTeamSize,
      teamComplete
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
 
