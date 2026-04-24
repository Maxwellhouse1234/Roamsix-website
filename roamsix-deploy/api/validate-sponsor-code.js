// api/validate-sponsor-code.js
//
// File location: api/validate-sponsor-code.js  (at your project root — NOT pages/api)
// This is a plain Vercel Serverless Function, not a Next.js route.
// Use CommonJS (require / module.exports) — not ES module import/export.
//
// Required env vars in Vercel → Settings → Environment Variables:
//   AIRTABLE_TOKEN    — your personal access token (already set)
//   AIRTABLE_BASE_ID  — app2b2mTCtAIMmo79 (already set)

const Airtable = require('airtable');

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'app2b2mTCtAIMmo79';

// FIX 1: Accept either token env var name — does not break existing setup
function getBase() {
  const token = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;
  return new Airtable({ apiKey: token }).base(BASE_ID);
}

module.exports = async function handler(req, res) {
  // CORS headers — allows your frontend to call this from roamsix.com
  res.setHeader('Access-Control-Allow-Origin', 'https://www.roamsix.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, company, accessCode } = req.body || {};
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // Input validation
  if (!email || !company || !accessCode) {
    return res.status(400).json({ valid: false, error: 'All fields are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ valid: false, error: 'Please enter a valid email address.' });
  }

  const code = String(accessCode).trim().toUpperCase();

  // FIX 2: Sanitize apostrophes so they don't corrupt the Airtable formula string
  const safeCode = code.replace(/'/g, "\\'");

  const base = getBase();

  try {
    // Step 1: Check the code exists and is active
    const codeRecords = await base('SponsorCodes')
      .select({
        filterByFormula: `AND({Code} = '${safeCode}', {Active} = TRUE())`,
        maxRecords: 1,
        fields: ['Code', 'Active'],
      })
      .firstPage();

    const isValid = codeRecords.length > 0;
    const status  = isValid ? 'approved' : 'denied';

    // Step 2: Log every attempt — both approved and denied
    await base('PartnershipAccessLog').create([{
      fields: {
        Email:        email,
        Company:      company,
        'Code Used':  code,
        Timestamp:    timestamp,
        'User Agent': userAgent,
        Status:       status,
      },
    }]);

    // Step 3: Respond
    if (!isValid) {
      return res.status(401).json({
        valid: false,
        error: 'Invalid access code. Please request a valid code via the link below.',
      });
    }

    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error('[validate-sponsor-code]', err);
    return res.status(500).json({
      valid: false,
      error: 'System error. Please try again or contact info@roamsix.com.',
    });
  }
};
