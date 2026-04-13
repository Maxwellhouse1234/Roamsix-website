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
    teamCode,
    pricePaid
  } = req.body;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    console.log('Attempting to send email to:', coachEmail);
    console.log('Team code:', teamCode);

    // Send email using Resend
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
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a1628; color: #f5f3f0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #d4af37; font-size: 32px; margin: 0;">ROAMSIX</h1>
                <p style="color: #5eead4; font-size: 18px; margin: 10px 0 0 0;">PROVING GROUNDS</p>
              </div>

              <!-- Main Content -->
              <div style="background-color: #152238; border-radius: 8px; padding: 40px; margin-bottom: 30px;">
                <h2 style="color: #f5f3f0; font-size: 24px; margin: 0 0 20px 0;">Registration Complete, ${coachName}</h2>
                
                <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  Your spot is reserved at Proving Grounds. Your team is pending payment confirmation.
                </p>

                <!-- Team Code Box -->
                <div style="background-color: #0a1628; border: 2px solid #d4af37; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                  <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Team Code</p>
                  <p style="color: #d4af37; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 2px;">${teamCode}</p>
                </div>

                <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  Share this code with your 3 athletes. They'll use it to complete their individual registration and sign their liability waiver.
                </p>

                <!-- Payment Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://buy.stripe.com/test_4gM6oJ8QveS43MU0ol73G00" style="display: inline-block; background-color: #d4af37; color: #0a1628; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                    Complete Payment - $${pricePaid}
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                  Your team is confirmed once payment is complete and all 4 members are registered.
                </p>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #152238; border-radius: 8px; padding: 40px;">
                <h3 style="color: #5eead4; font-size: 18px; margin: 0 0 20px 0;">What Happens Next</h3>
                
                <div style="margin-bottom: 20px;">
                  <p style="color: #d4af37; font-weight: bold; margin: 0 0 5px 0;">1. Complete Payment</p>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Use the button above to confirm your team's spot.</p>
                </div>

                <div style="margin-bottom: 20px;">
                  <p style="color: #d4af37; font-weight: bold; margin: 0 0 5px 0;">2. Share Team Code</p>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Send ${teamCode} to your 3 athletes.</p>
                </div>

                <div style="margin-bottom: 20px;">
                  <p style="color: #d4af37; font-weight: bold; margin: 0 0 5px 0;">3. Athletes Register</p>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0;">They'll complete their registration at: <a href="https://roamsix.com/proving-grounds/athlete-register" style="color: #5eead4;">roamsix.com/proving-grounds/athlete-register</a></p>
                </div>

                <div>
                  <p style="color: #d4af37; font-weight: bold; margin: 0 0 5px 0;">4. Team Confirmed</p>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Once all 4 registrations are complete, you're locked in.</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #1e293b;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  May 17, 2026 | Chihuahua Valley, CA
                </p>
                <p style="color: #64748b; font-size: 12px; margin: 10px 0 0 0;">
                  Questions? Reply to this email.
                </p>
              </div>

            </div>
          </body>
          </html>
        `
      })
    });

    const responseText = await emailResponse.text();
    
    if (!emailResponse.ok) {
      console.error('Resend API error:', responseText);
      throw new Error(`Email failed: ${responseText}`);
    }

    const emailData = JSON.parse(responseText);
    console.log('Email sent successfully. Email ID:', emailData.id);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData.id
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
}
