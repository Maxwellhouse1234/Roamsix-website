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

    // Step 4: Send notification email to coach
    const coachEmail = teamRecord.fields.fldanyN6KmbQ0DHME;
    const coachName = teamRecord.fields.fldyrZpiBHYBxKwiY;
    
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ROAMSIX <info@roamsix.com>',
          to: coachEmail,
          subject: `New Athlete Joined Your Team - ${teamCode}`,
          html: `
            <!DOCTYPE html>
            <html>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #c6a463; font-size: 32px; margin: 0;">ROAMSIX</h1>
                    <p style="color: #9ca3af; font-size: 18px; margin: 10px 0 0 0;">PROVING GROUNDS</p>
                  </div>

                  <div style="background-color: #111827; border-radius: 8px; padding: 40px; margin-bottom: 30px;">
                    <h2 style="color: #f3f4f6; font-size: 24px; margin: 0 0 20px 0;">Good News, ${coachName}</h2>
                    
                    <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      <strong style="color: #c6a463;">${athleteName}</strong> just completed their registration and joined your team!
                    </p>

                    <div style="background-color: #000000; border: 2px solid #c6a463; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Team Progress</p>
                      <p style="color: #c6a463; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 2px;">${newTeamSize} of 4</p>
                      <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">Members Registered</p>
                    </div>

                    ${newTeamSize < 4 ? `
                      <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0;">
                        You need <strong style="color: #c6a463;">${4 - newTeamSize} more ${4 - newTeamSize === 1 ? 'athlete' : 'athletes'}</strong> to complete your team. Share your team code: <strong style="color: #c6a463; font-family: monospace;">${teamCode}</strong>
                      </p>
                    ` : `
                      <div style="background-color: #000000; border-left: 4px solid #c6a463; padding: 20px; margin-top: 20px;">
                        <p style="color: #c6a463; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">🎉 Your Team is Complete!</p>
                        <p style="color: #9ca3af; font-size: 14px; margin: 0;">All 4 team members have registered. You're locked in for Proving Grounds!</p>
                      </div>
                    `}
                  </div>

                  <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #9ca3af;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                      May 17, 2026 | Chihuahua Valley, CA
                    </p>
                  </div>

                </div>
              </body>
            </html>
          `
        })
      });

      const emailData = await emailResponse.json();
      
      if (!emailResponse.ok) {
        console.error('Failed to send coach notification email:', emailData);
      }
    } catch (emailError) {
      console.error('Error sending coach notification:', emailError);
      // Don't fail the registration if email fails
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
