import { createHash } from 'node:crypto';

const memoryBuckets = new Map();
const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’\-]{0,99}$/u;
const PHONE_RE = /^[+()0-9 .\-]{7,30}$/;
const NAME_FIELDS = new Set(['name', 'fullName', 'firstName', 'lastName', 'customerName', 'guestName', 'friendFirstName', 'athleteName', 'coachName', 'emergencyContactName']);
const EMAIL_FIELDS = new Set(['email', 'customerEmail', 'friendEmail']);
const PHONE_FIELDS = new Set(['phone', 'mobile', 'customerPhone', 'emergencyContactPhone']);
const TEXT_LIMITS = {
  message: 4000, challenge: 3000, specific: 2000, other: 500, customInterest: 500,
  dietaryRestrictions: 2000, foodAllergies: 2000, medicalNotes: 3000,
  whyAttending: 3000, goals: 3000, referralSource: 500, company: 200, organization: 200,
};

function text(value, max = 5000) {
  return String(value ?? '').normalize('NFKC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, max);
}

export function normalizeEmail(value) { return text(value, 320).toLowerCase(); }
export function normalizeName(value) { return text(value, 100).replace(/\s+/g, ' '); }
export function normalizePhone(value) { return text(value, 30).replace(/\s+/g, ' '); }
export function normalizeFreeText(value, max = 5000) { return text(value, max); }

function normalizeObject(value, key = '', depth = 0) {
  if (depth > 4) return null;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => normalizeObject(item, key, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 100).map(([childKey, child]) => [childKey, normalizeObject(child, childKey, depth + 1)]));
  }
  if (typeof value !== 'string') return value;
  if (EMAIL_FIELDS.has(key)) return normalizeEmail(value);
  if (NAME_FIELDS.has(key)) return normalizeName(value);
  if (PHONE_FIELDS.has(key)) return normalizePhone(value);
  return normalizeFreeText(value, TEXT_LIMITS[key] || 5000);
}

function clientIp(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return text(req.headers?.['cf-connecting-ip'] || forwarded || req.socket?.remoteAddress || 'unknown', 100);
}

function hash(value) { return createHash('sha256').update(value).digest('hex').slice(0, 24); }

function consumeMemory(key, limit, windowMs, now) {
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}

async function consumeRateLimit(key, limit, windowSeconds, now) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return consumeMemory(key, limit, windowSeconds * 1000, now);
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSeconds, 'NX']]),
    });
    if (!response.ok) throw new Error(`rate store ${response.status}`);
    const result = await response.json();
    const count = Number(result?.[0]?.result || 1);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    console.error(JSON.stringify({ event: 'form_security_rate_store_error', message: error.message }));
    return consumeMemory(key, limit, windowSeconds * 1000, now);
  }
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== 'production' || process.env.FORM_SECURITY_ALLOW_NO_TURNSTILE === 'true';
  if (!token) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const result = await response.json();
    return response.ok && result.success === true;
  } catch (error) {
    console.error(JSON.stringify({ event: 'form_security_turnstile_error', message: error.message }));
    return false;
  }
}

function spamScore(data) {
  const values = [];
  const ignoredKeys = new Set(['turnstileToken', 'invite', 'code', 'session_id', 'acceptedAt', 'formStartedAt']);
  const visit = (value, key = '') => {
    if (ignoredKeys.has(key)) return;
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach((item) => visit(item, key));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([childKey, child]) => visit(child, childKey));
  };
  visit(data);
  const joined = values.join(' ');
  let score = 0;
  const reasons = [];
  const add = (points, reason) => { score += points; reasons.push(reason); };
  if (/<\s*(script|iframe|object|embed|svg)|javascript:|data:text\/html/i.test(joined)) add(8, 'active_payload');
  if (/\b(?:viagra|casino|crypto giveaway|seo services|guest post|backlinks?|payday loan)\b/i.test(joined)) add(5, 'spam_terms');
  if ((joined.match(/https?:\/\//gi) || []).length >= 2) add(4, 'many_urls');
  if (/([a-z0-9])\1{7,}/i.test(joined)) add(3, 'repeated_characters');
  const alphaWords = joined.match(/[a-z]{8,}/gi) || [];
  if (alphaWords.some((word) => !/[aeiouy]/i.test(word) || /[bcdfghjklmnpqrstvwxz]{7,}/i.test(word))) add(3, 'random_characters');
  if (joined.length > 120 && joined.replace(/[\p{L}\p{N}\s.,!?@'’()\-]/gu, '').length / joined.length > 0.18) add(3, 'symbol_heavy');
  return { score, reasons, hardReject: reasons.includes('active_payload') };
}

function validationErrors(data) {
  const errors = [];
  const visit = (value, key = '') => {
    if (Array.isArray(value)) return value.forEach((item) => visit(item, key));
    if (value && typeof value === 'object') return Object.entries(value).forEach(([childKey, child]) => visit(child, childKey));
    if (typeof value !== 'string' || !value) return;
    if (EMAIL_FIELDS.has(key) && !EMAIL_RE.test(value)) errors.push(`${key} is invalid`);
    if (NAME_FIELDS.has(key) && !NAME_RE.test(value)) errors.push(`${key} is invalid`);
    if (PHONE_FIELDS.has(key) && !PHONE_RE.test(value)) errors.push(`${key} is invalid`);
  };
  visit(data);
  return errors;
}

function rawValidationErrors(data) {
  const errors = [];
  let fieldsSeen = 0;
  const visit = (value, key = '', depth = 0) => {
    fieldsSeen += 1;
    if (depth > 4 || fieldsSeen > 200) { errors.push('payload structure is too complex'); return; }
    if (Array.isArray(value)) {
      if (value.length > 50) errors.push(`${key || 'array'} has too many values`);
      return value.slice(0, 51).forEach((item) => visit(item, key, depth + 1));
    }
    if (value && typeof value === 'object') return Object.entries(value).forEach(([childKey, child]) => visit(child, childKey, depth + 1));
    if (NAME_FIELDS.has(key) || EMAIL_FIELDS.has(key) || PHONE_FIELDS.has(key)) {
      if (typeof value !== 'string') errors.push(`${key} must be text`);
    }
    if (typeof value === 'string') {
      const max = NAME_FIELDS.has(key) ? 100 : EMAIL_FIELDS.has(key) ? 320 : PHONE_FIELDS.has(key) ? 30 : (TEXT_LIMITS[key] || 5000);
      if (value.length > max) errors.push(`${key || 'field'} is too long`);
    }
  };
  visit(data);
  return errors;
}

function redactPayload(value, key = '') {
  if (new Set(['turnstileToken', 'invite', 'code', 'session_id']).has(key)) return '[redacted]';
  if (Array.isArray(value)) return value.map((item) => redactPayload(item, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redactPayload(child, childKey)]));
  return value;
}

function logDecision(decision, context) {
  const log = decision === 'allow' ? console.info : console.warn;
  const safeContext = context.payload ? { ...context, payload: redactPayload(context.payload) } : context;
  log(JSON.stringify({ event: `form_submission_${decision}`, ...safeContext }));
}

export async function protectPublicSubmission(req, options = {}) {
  const now = options.now || Date.now();
  const endpoint = options.endpoint || 'unknown';
  const ip = clientIp(req);
  const original = req.body && typeof req.body === 'object' ? req.body : {};
  const rawErrors = rawValidationErrors(original);
  if (rawErrors.length || JSON.stringify(original).length > 60_000) {
    const context = { endpoint, ipHash: hash(ip), at: new Date(now).toISOString(), reason: 'payload_limits', errors: rawErrors, payload: original };
    logDecision('rejected', context);
    return { ok: false, status: 400, error: 'Please check the information you entered.', data: {} };
  }
  const data = normalizeObject(original);
  const email = normalizeEmail(data.email || data.customerEmail || data.friendEmail || data.formData?.email || '');
  const fingerprint = hash(`${ip}|${email}|${endpoint}`);
  const context = { endpoint, fingerprint, ipHash: hash(ip), emailHash: email ? hash(email) : '', at: new Date(now).toISOString() };

  const ipRate = ip === 'unknown' ? { allowed: true } : await consumeRateLimit(`form:ip:${endpoint}:${hash(ip)}`, options.ipLimit || 12, options.windowSeconds || 600, now);
  const repeatRate = ip === 'unknown' ? { allowed: true } : await consumeRateLimit(`form:repeat:${endpoint}:${fingerprint}`, options.repeatLimit || 3, options.repeatWindowSeconds || 3600, now);
  if (!ipRate.allowed || !repeatRate.allowed) {
    logDecision('rejected', { ...context, reason: !ipRate.allowed ? 'ip_rate_limit' : 'repeated_submission', payload: data });
    return { ok: false, status: 429, error: 'Too many submissions. Please wait and try again.', data };
  }

  if (text(data.website || data.companyWebsite || '', 500)) {
    logDecision('rejected', { ...context, reason: 'honeypot', payload: data });
    return { ok: false, status: 400, error: 'Submission could not be verified.', data };
  }
  const startedAt = Number(data.formStartedAt);
  const elapsed = now - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < (options.minSubmitMs || 2500) || elapsed > 86_400_000) {
    logDecision('rejected', { ...context, reason: 'submission_timing', elapsed, payload: data });
    return { ok: false, status: 400, error: 'Submission could not be verified.', data };
  }
  if (!(await verifyTurnstile(text(data.turnstileToken, 2048), ip))) {
    logDecision('rejected', { ...context, reason: 'bot_challenge', payload: data });
    return { ok: false, status: 400, error: 'Please complete the security check and try again.', data };
  }

  const errors = validationErrors(data);
  if (errors.length) {
    logDecision('rejected', { ...context, reason: 'validation', errors, payload: data });
    return { ok: false, status: 400, error: 'Please check the information you entered.', data };
  }
  const spam = spamScore(data);
  delete data.website; delete data.companyWebsite; delete data.formStartedAt; delete data.turnstileToken;
  if (spam.hardReject || spam.score >= 8) {
    logDecision('rejected', { ...context, reason: 'malicious_payload', spam, payload: data });
    return { ok: false, status: 400, error: 'Submission could not be accepted.', data };
  }
  if (spam.score >= 3) {
    logDecision('quarantined', { ...context, reason: 'spam_score', spam, payload: data });
    return { ok: false, quarantined: true, status: 202, error: '', data };
  }
  logDecision('allow', context);
  return { ok: true, status: 200, data };
}

export async function enforcePublicSubmission(req, res, options = {}) {
  const result = await protectPublicSubmission(req, options);
  if (result.ok) { req.body = result.data; return true; }
  if (result.quarantined) {
    res.status(202).json({ success: true, quarantined: true, message: 'Thank you. Your submission is under review.' });
    return false;
  }
  res.status(result.status).json({ success: false, error: result.error });
  return false;
}

export function resetFormSecurityForTests() { memoryBuckets.clear(); }
