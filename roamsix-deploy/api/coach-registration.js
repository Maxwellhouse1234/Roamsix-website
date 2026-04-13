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
    const baseId = process.env.PROVING_GROUNDS_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    if (!baseId || !token) {
      throw new Error('Missing environment variables');
    }

    // 1. CREATE TEAM RECORD
    const teamPayload = {
      records: [{
        fields: {
          fldQ4irjCRk5rPmcA: teamCode,
          fldyrZpiBHYBxKwiY: coachName,
          fldanyN6KmbQ0DHME: coachEmail,
          fld9D3NcgLpFSC5ez: coachPhone,
          fld3b5qCJ6IqgS5h3: pricePaid,
          fld5jvDMMU2dwrsiK: 'Pending',
          fldmN2rzH2z6k5P0N: new Date().toISOString(),
          fldJEVhMxBWz8zHF1: 1,
          fldNFRyrhQJblpYa0: false
        }
      }]
    };

    const teamResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbl8azUw7OSszOhf6`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamPayload)
      }
    );

    if (!teamResponse.ok) {
      const error = await teamResponse.text();
      throw new Error(`Team creation failed: ${error}`);
    }

    // 2. CREATE PARTICIPANT RECORD
    const participantPayload = {
      records: [{
        fields: {
          fldekM5VpBSwvd2Q7: coachName,
          fldfTlc1EaWdjfi7t: coachEmail,
          fld4EUZKhzqmKG1hf: coachPhone,
          fldGhclpvBclEdaO9: 'Coach',
          fldk1vrmRQrZcb0xw: teamCode,
          fldDaQTMCCn9tC2Qa: coachShirtSize,
          fldqbDW0miUEqEcw7: emergencyContactName,
          fldhefygVPg99sKo8: emergencyContactPhone,
          fld6VeNuuLRG0f5Ig: false,
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

    // 3. SEND EMAIL - Use absolute URL from request headers
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const emailUrl = `${protocol}://${host}/api/send-coach-email`;
      
      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coachName,
          coachEmail,
          teamCode,
          pricePaid
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Email sending failed:', errorText);
      } else {
        console.log('Email sent successfully to:', coachEmail);
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Continue - don't fail registration if email fails
    }

    return res.status(200).json({
      success: true,
      teamCode,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
}
