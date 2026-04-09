export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    teamName,
    coachName,
    coachCertification,
    athlete1Name,
    athlete2Name,
    athlete3Name,
    email,
    phone,
    coachShirtSize,
    athlete1ShirtSize,
    athlete2ShirtSize,
    athlete3ShirtSize,
    coachEmergencyName,
    coachEmergencyPhone,
    athlete1EmergencyName,
    athlete1EmergencyPhone,
    athlete2EmergencyName,
    athlete2EmergencyPhone,
    athlete3EmergencyName,
    athlete3EmergencyPhone,
    waiverAccepted,
    priceTier
  } = req.body;

  if (!teamName || !coachName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.PROVING_GROUNDS_BASE_ID}/${process.env.PROVING_GROUNDS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Team Name': teamName,
              'Coach Name': coachName,
              'Coach Certification': coachCertification,
              'Athlete 1 Name': athlete1Name,
              'Athlete 2 Name': athlete2Name,
              'Athlete 3 Name': athlete3Name,
              'Email': email,
              'Phone': phone,
              'Coach Shirt Size': coachShirtSize,
              'Athlete 1 Shirt Size': athlete1ShirtSize,
              'Athlete 2 Shirt Size': athlete2ShirtSize,
              'Athlete 3 Shirt Size': athlete3ShirtSize,
              'Coach Emergency Contact Name': coachEmergencyName,
              'Coach Emergency Contact Phone': coachEmergencyPhone,
              'Athlete 1 Emergency Contact Name': athlete1EmergencyName,
              'Athlete 1 Emergency Contact Phone': athlete1EmergencyPhone,
              'Athlete 2 Emergency Contact Name': athlete2EmergencyName,
              'Athlete 2 Emergency Contact Phone': athlete2EmergencyPhone,
              'Athlete 3 Emergency Contact Name': athlete3EmergencyName,
              'Athlete 3 Emergency Contact Phone': athlete3EmergencyPhone,
              'Waiver Accepted': waiverAccepted,
              'Price Tier': priceTier,
              'Payment Status': 'Pending',
              'Registration Date': new Date().toISOString().split('T')[0]
            }
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Airtable API error');
    }

    const data = await response.json();
    return res.status(200).json({ success: true, recordId: data.records[0].id });
  } catch (error) {
    console.error('Error submitting registration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
