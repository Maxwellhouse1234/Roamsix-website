import { captureCrmActivity } from '../lib/crm.js';

const BASE_ID = 'app2b2mTCtAIMmo79';
const LEGACY_INTEREST_TABLE_ID = 'tblZto5jr9k7C4fE3';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYMENT_SOURCES = new Set(['self', 'employer', 'either', 'unsure']);

function clean(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function getFieldMap() {
  try {
    return JSON.parse(process.env.AIRTABLE_RETREAT_INTEREST_FIELD_MAP || '{}');
  } catch {
    return {};
  }
}

function crmTopics(data) {
  const value = `${data.campaign} ${data.challenge}`.toLowerCase();
  const topics = [];
  if (value.includes('microbiome') || value.includes('q1-')) topics.push('Microbiome & Gut Health');
  if (value.includes('sleep') || value.includes('q2-')) topics.push('Sleep & Recovery');
  if (value.includes('stress') || value.includes('resilience') || value.includes('q3-')) topics.push('Stress & Resilience');
  if (value.includes('strength') || value.includes('mobility') || value.includes('longevity') || value.includes('q4-')) topics.push('Strength & Longevity');
  if (value.includes('2027-program')) topics.push('2027 Program');
  if (value.includes('year-end')) topics.push('Year-End Journey');
  return topics;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const input = req.body || {};
  const data = {
    retreatSlug: clean(input.retreatSlug, 100), firstName: clean(input.firstName, 100), lastName: clean(input.lastName, 100),
    email: clean(input.email, 320).toLowerCase(), mobile: clean(input.mobile, 40), role: clean(input.role, 160),
    organization: clean(input.organization, 200), professionalCategory: clean(input.professionalCategory, 160),
    challenge: clean(input.challenge, 2000), paymentSource: clean(input.paymentSource, 20),
    referralSource: clean(input.referralSource, 300), source: clean(input.source, 100), campaign: clean(input.campaign, 160),
    landingPage: clean(input.landingPage, 300), emailConsent: Boolean(input.emailConsent), smsConsent: Boolean(input.smsConsent),
    privacyAccepted: Boolean(input.privacyAccepted),
  };

  if (!data.firstName || !data.lastName || !EMAIL_RE.test(data.email) || !data.role || !data.professionalCategory || !data.challenge) {
    return res.status(400).json({ success: false, error: 'Please complete every required field.' });
  }
  if (!PAYMENT_SOURCES.has(data.paymentSource) || !data.privacyAccepted) {
    return res.status(400).json({ success: false, error: 'Please select a payment source and accept the Privacy Policy and Terms.' });
  }
  if (data.smsConsent && !data.mobile) {
    return res.status(400).json({ success: false, error: 'Add a mobile number or turn off text updates.' });
  }

  const configuredTableId = process.env.AIRTABLE_RETREAT_INTEREST_TABLE_ID;
  const token = process.env.AIRTABLE_TOKEN;
  const fieldMap = getFieldMap();
  const requiredMapKeys = ['retreatSlug', 'participantStatus', 'firstName', 'lastName', 'email', 'role', 'professionalCategory', 'challenge', 'paymentSource', 'emailConsent', 'smsConsent', 'createdAt'];
  const missingConfig = requiredMapKeys.filter((key) => !fieldMap[key]);
  if (!token) {
    console.error('Retreat interest Airtable token is not configured.');
    return res.status(503).json({ success: false, error: 'The interest list is being connected. Please email info@roamsix.com for now.' });
  }

  const now = new Date().toISOString();
  const values = { ...data, participantStatus: 'interest', createdAt: now };
  let tableId = configuredTableId;
  let fields = {};

  if (configuredTableId && !missingConfig.length) {
    for (const [key, fieldId] of Object.entries(fieldMap)) {
      if (Object.prototype.hasOwnProperty.call(values, key) && fieldId) fields[fieldId] = values[key];
    }
  } else {
    tableId = LEGACY_INTEREST_TABLE_ID;
    fields = {
      'First Name': data.firstName,
      'Last Name': data.lastName,
      'Email': data.email,
      'Mobile Number': data.mobile || undefined,
      'Source': data.source || 'website',
      'Experience Interests': [data.retreatSlug, data.professionalCategory, data.campaign].filter(Boolean).join(' | '),
      'Question One Response': data.challenge,
      'Question Two Response': `Expected payment source: ${data.paymentSource}`,
      'Referral Source': data.referralSource || undefined,
      'Notes': [
        `Professional role: ${data.role}`,
        data.organization ? `Organization: ${data.organization}` : '',
        data.landingPage ? `Landing page: ${data.landingPage}` : '',
      ].filter(Boolean).join('\n'),
      'Created Date': now,
      'Last Updated': now,
      'Email Consent': data.emailConsent ? 'Yes' : 'No',
      'SMS Consent': data.smsConsent ? 'Yes' : 'No',
      'Terms Accepted': data.privacyAccepted ? 'Yes' : 'No',
      'Status': 'Experience interest',
    };
    fields = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  }

  try {
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    if (!airtableResponse.ok) {
      console.error('Retreat interest Airtable request failed with status', airtableResponse.status);
      return res.status(502).json({ success: false, error: 'We could not save your interest right now.' });
    }

    const topics = crmTopics(data);
    const relationshipText = `${data.role} ${data.challenge}`.toLowerCase();
    const relationships = ['Interest Subscriber'];
    if (relationshipText.includes('collaborat')) relationships.push('Collaborator');
    if (relationshipText.includes('speaker')) relationships.push('Speaker');
    await captureCrmActivity({
      contact: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        organization: data.organization,
        role: data.role,
        lifecycleStage: relationships.includes('Speaker') ? 'Speaker' : relationships.includes('Collaborator') ? 'Collaborator' : 'Interested',
        relationships,
        topics,
        sources: ['Website'],
        emailPermission: data.emailConsent ? 'Opted In' : 'Unknown',
        smsPermission: data.smsConsent ? 'Opted In' : 'Unknown',
        occurredAt: now,
        notes: `${data.professionalCategory}: ${data.challenge}`,
      },
      engagement: {
        engagementType: relationships.includes('Speaker') ? 'Speaker' : relationships.includes('Collaborator') ? 'Collaborator' : 'Interested',
        status: 'Active',
        topic: topics[0] && !['2027 Program', 'Year-End Journey'].includes(topics[0]) ? topics[0] : 'General',
        eventName: data.retreatSlug === 'fieldwork-curriculum' ? 'Fieldwork 2027 Program' : 'ROAMSIX Retreat Interest',
        occurredAt: now,
        source: 'Website',
        uniqueKey: `retreat-interest:${data.email}:${data.campaign || data.retreatSlug}:${now}`,
        details: data.challenge,
      },
    });

    if (process.env.RESEND_API_KEY) {
      const emailRequests = [
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'ROAMSIX <info@roamsix.com>', to: [data.email], subject: data.retreatSlug === 'fieldwork-curriculum' ? 'Your ROAMSIX Fieldwork interest is confirmed' : 'Your ROAMSIX retreat interest is confirmed',
            html: data.retreatSlug === 'fieldwork-curriculum'
              ? `<p>Thank you for registering your interest in ROAMSIX Fieldwork.</p><p>We recorded: <strong>${escapeHtml(data.challenge.replace('Interested in:', '').trim())}</strong>.</p><p>We will share details as they are released and send a calendar invitation when an event in this area is scheduled.</p><p>ROAMSIX</p>`
              : '<p>Thank you for your interest in the first ROAMSIX professional field experience.</p><p>We are still validating the expert team, format, date, place, and investment. We will share a complete written offer before asking you to apply, reserve a place, or pay.</p><p>ROAMSIX</p>',
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'ROAMSIX <info@roamsix.com>', to: ['max@roamsix.com'], subject: 'New first-retreat interest',
            html: `<p><strong>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</strong></p><p>${escapeHtml(data.email)} · ${escapeHtml(data.role)}</p><p>${escapeHtml(data.professionalCategory)} · payment: ${escapeHtml(data.paymentSource)}</p><p>${escapeHtml(data.challenge)}</p>`,
          }),
        }),
      ];
      await Promise.allSettled(emailRequests);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Retreat interest submission failed:', error?.message || 'unknown error');
    return res.status(500).json({ success: false, error: 'We could not save your interest right now.' });
  }
}
