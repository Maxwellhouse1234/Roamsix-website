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
    pricePaid,
    waiverAccepted,
    mediaReleaseAccepted
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
          fld6VeNuuLRG0f5Ig: waiverAccepted,
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

    // 3. SEND EMAIL DIRECTLY (no separate endpoint call)
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        console.log('Sending email to:', coachEmail);
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'ROAMSIX Proving Grounds <info@roamsix.com>',
            to: [coachEmail],
            subject: `Your Team is Registered - Team Code: ${teamCode}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #c6a463; font-size: 32px; margin: 0;">ROAMSIX</h1>
                    <p style="color: #9ca3af; font-size: 18px; margin: 10px 0 0 0;">PROVING GROUNDS</p>
                  </div>

                  <div style="background-color: #111827; border-radius: 8px; padding: 40px; margin-bottom: 30px;">
                    <h2 style="color: #f3f4f6; font-size: 24px; margin: 0 0 20px 0;">Registration Complete, ${coachName}</h2>
                    
                    <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Your spot is reserved at Proving Grounds. Your team is pending payment confirmation.
                    </p>

                    <div style="background-color: #000000; border: 2px solid #c6a463; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Team Code</p>
                      <p style="color: #c6a463; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 2px;">${teamCode}</p>
                    </div>

                    <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Share this code with your 3 athletes. They'll use it to complete their individual registration and sign their liability waiver.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://buy.stripe.com/test_4gM6oJ8QveS43MU0ol73G00" style="display: inline-block; background-color: #c6a463; color: #000000; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                        Complete Payment - $${pricePaid}
                      </a>
                    </div>

                    <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                      Your team is confirmed once payment is complete and all 4 members are registered.
                    </p>
                  </div>

                  <div style="background-color: #111827; border-radius: 8px; padding: 40px;">
                    <h3 style="color: #f3f4f6; font-size: 18px; margin: 0 0 20px 0;">What Happens Next</h3>
                    
                    <div style="margin-bottom: 20px;">
                      <p style="color: #c6a463; font-weight: bold; margin: 0 0 5px 0;">1. Complete Payment</p>
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">Use the button above to confirm your team's spot.</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                      <p style="color: #c6a463; font-weight: bold; margin: 0 0 5px 0;">2. Share Team Code</p>
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">Send ${teamCode} to your 3 athletes.</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                      <p style="color: #c6a463; font-weight: bold; margin: 0 0 5px 0;">3. Athletes Register</p>
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">They'll complete their registration at: <a href="https://www.roamsix.com/proving-grounds/athlete-register" style="color: #c6a463;">www.roamsix.com/proving-grounds/athlete-register</a></p>
                    </div>

                    <div>
                      <p style="color: #c6a463; font-weight: bold; margin: 0 0 5px 0;">4. Team Confirmed</p>
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">Once all 4 registrations are complete, you're locked in.</p>
                    </div>
                  </div>

                  <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #9ca3af;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                      May 17, 2026 | Chihuahua Valley, CA
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                      Questions? Reply to this email.
                    </p>
                  </div>

                </div>
              </body>
              </html>
            `
          })
        });

        if (emailResponse.ok) {
          console.log('Email sent successfully!');
        } else {
          const error = await emailResponse.text();
          console.error('Resend error:', error);
        }
      } else {
        console.log('No Resend API key - skipping email');
      }
    } catch (emailError) {
      console.error('Email error (non-fatal):', emailError);
      // Don't fail registration if email fails
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
