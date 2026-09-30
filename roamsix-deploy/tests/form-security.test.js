import test from 'node:test';
import assert from 'node:assert/strict';
import { protectPublicSubmission, resetFormSecurityForTests } from '../lib/form-security.js';

process.env.NODE_ENV = 'test';
delete process.env.TURNSTILE_SECRET_KEY;

function request(body, ip = '203.0.113.10') {
  return { body, headers: { 'x-forwarded-for': ip } };
}

function legitimate(overrides = {}) {
  return {
    firstName: '  José  ', lastName: 'O’Connor', email: 'PERSON@Example.COM ', mobile: '+1 (555) 010-2026',
    message: 'I would like to learn more about Field membership and the upcoming program.',
    website: '', turnstileToken: 'test-token', formStartedAt: Date.now() - 4000, ...overrides,
  };
}

test.beforeEach(() => resetFormSecurityForTests());

test('accepts and normalizes a legitimate submission', async () => {
  const result = await protectPublicSubmission(request(legitimate()), { endpoint: 'test' });
  assert.equal(result.ok, true);
  assert.equal(result.data.firstName, 'José');
  assert.equal(result.data.email, 'person@example.com');
  assert.equal('turnstileToken' in result.data, false);
});

test('rejects honeypots and impossibly fast direct submissions', async () => {
  const honeypot = await protectPublicSubmission(request(legitimate({ website: 'https://spam.invalid' })), { endpoint: 'honeypot' });
  assert.equal(honeypot.ok, false);
  assert.equal(honeypot.status, 400);
  const fast = await protectPublicSubmission(request(legitimate({ formStartedAt: Date.now() - 50 })), { endpoint: 'fast' });
  assert.equal(fast.ok, false);
  assert.equal(fast.status, 400);
});

test('rejects malformed data even when browser validation is bypassed', async () => {
  const result = await protectPublicSubmission(request(legitimate({ firstName: '<b>Bot</b>', email: 'not-an-email', mobile: 'CALL-ME' })), { endpoint: 'malformed' });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /check the information/i);
  const tooLong = await protectPublicSubmission(request(legitimate({ message: 'a'.repeat(4001) })), { endpoint: 'too-long' });
  assert.equal(tooLong.status, 400);
});

test('hard rejects active payload patterns and quarantines ambiguous gibberish', async () => {
  const attack = await protectPublicSubmission(request(legitimate({ message: '<script>alert(1)</script>' })), { endpoint: 'attack' });
  assert.equal(attack.ok, false);
  assert.equal(attack.status, 400);
  const ambiguous = await protectPublicSubmission(request(legitimate({ message: 'bcdfghjklmnpqrst this may be an unusual project code' })), { endpoint: 'ambiguous' });
  assert.equal(ambiguous.quarantined, true);
  assert.equal(ambiguous.status, 202);
});

test('throttles repeated submissions by IP and email fingerprint', async () => {
  for (let index = 0; index < 2; index += 1) {
    const accepted = await protectPublicSubmission(request(legitimate()), { endpoint: 'repeat', repeatLimit: 2 });
    assert.equal(accepted.ok, true);
  }
  const blocked = await protectPublicSubmission(request(legitimate()), { endpoint: 'repeat', repeatLimit: 2 });
  assert.equal(blocked.status, 429);
});

test('requires successful server-side Turnstile verification when configured', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'secret';
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ success: false }) });
  try {
    const result = await protectPublicSubmission(request(legitimate()), { endpoint: 'turnstile' });
    assert.equal(result.ok, false);
    assert.match(result.error, /security check/i);
  } finally {
    global.fetch = previousFetch;
    delete process.env.TURNSTILE_SECRET_KEY;
  }
});

test('retired public form endpoints fail closed', async () => {
  const { default: retiredHandler } = await import('../api/submit-interest.js');
  const res = {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await retiredHandler({ method: 'POST', body: { email: 'bot@example.com' } }, res);
  assert.equal(res.statusCode, 410);
  assert.match(res.body.error, /no longer available/i);
});
