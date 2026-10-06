import test from 'node:test';
import assert from 'node:assert/strict';
import { protectPublicSubmission, resetFormSecurityForTests } from '../lib/form-security.js';

process.env.NODE_ENV = 'test';
delete process.env.TURNSTILE_SECRET_KEY;

function request(body, ip = '203.0.113.10') {
  return { body, headers: { 'x-forwarded-for': ip, host: 'www.roamsix.com' } };
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
  const highEntropy = await protectPublicSubmission(request(legitimate({ message: 'I am interested in qqzDTSAKyzuHJcVjEigJcGB' })), { endpoint: 'high-entropy' });
  assert.equal(highEntropy.quarantined, true);
  assert.equal(highEntropy.status, 202);
});

test('throttles repeated submissions by IP and email fingerprint', async () => {
  for (let index = 0; index < 2; index += 1) {
    const accepted = await protectPublicSubmission(request(legitimate()), { endpoint: 'repeat', repeatLimit: 2 });
    assert.equal(accepted.ok, true);
  }
  const blocked = await protectPublicSubmission(request(legitimate()), { endpoint: 'repeat', repeatLimit: 2 });
  assert.equal(blocked.status, 429);
});

test('throttles coordinated submissions across different public endpoints', async () => {
  for (const endpoint of ['contact', 'retreat-interest', 'member-login']) {
    const result = await protectPublicSubmission(request(legitimate()), { endpoint, globalEmailLimit: 2 });
    if (endpoint === 'member-login') assert.equal(result.status, 429);
    else assert.equal(result.ok, true);
  }
});

test('isolates durable rate limits between Preview and Production', async () => {
  const previousFetch = global.fetch;
  const previousUrl = process.env.KV_REST_API_URL;
  const previousToken = process.env.KV_REST_API_TOKEN;
  const previousVercelEnvironment = process.env.VERCEL_ENV;
  const observedKeys = [];
  process.env.KV_REST_API_URL = 'https://rate-store.example.test';
  process.env.KV_REST_API_TOKEN = 'test-token';
  global.fetch = async (_url, requestOptions) => {
    const commands = JSON.parse(requestOptions.body);
    observedKeys.push(commands[0][1]);
    return { ok: true, json: async () => [{ result: 1 }, { result: 1 }] };
  };
  try {
    process.env.VERCEL_ENV = 'preview';
    const preview = await protectPublicSubmission(request(legitimate()), { endpoint: 'namespace' });
    assert.equal(preview.ok, true);

    process.env.VERCEL_ENV = 'production';
    const production = await protectPublicSubmission(request(legitimate()), { endpoint: 'namespace' });
    assert.equal(production.ok, true);

    assert.ok(observedKeys.some((key) => key.startsWith('form:preview:')));
    assert.ok(observedKeys.some((key) => key.startsWith('form:production:')));
    assert.notEqual(
      observedKeys.find((key) => key.startsWith('form:preview:')),
      observedKeys.find((key) => key.startsWith('form:production:')),
    );
  } finally {
    global.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.KV_REST_API_TOKEN;
    else process.env.KV_REST_API_TOKEN = previousToken;
    if (previousVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousVercelEnvironment;
  }
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

test('requires Turnstile tokens minted for the expected hostname and action', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'secret';
  const previousFetch = global.fetch;
  try {
    global.fetch = async () => ({ ok: true, json: async () => ({ success: true, hostname: 'www.roamsix.com', action: 'public_form' }) });
    const accepted = await protectPublicSubmission(request(legitimate()), { endpoint: 'turnstile-valid' });
    assert.equal(accepted.ok, true);

    global.fetch = async () => ({ ok: true, json: async () => ({ success: true, hostname: 'www.roamsix.com', action: 'other_action' }) });
    const wrongAction = await protectPublicSubmission(request(legitimate({ email: 'second@example.com' })), { endpoint: 'turnstile-action' });
    assert.equal(wrongAction.ok, false);

    global.fetch = async () => ({ ok: true, json: async () => ({ success: true, hostname: 'untrusted.example', action: 'public_form' }) });
    const wrongHostname = await protectPublicSubmission(request(legitimate({ email: 'third@example.com' })), { endpoint: 'turnstile-hostname' });
    assert.equal(wrongHostname.ok, false);
  } finally {
    global.fetch = previousFetch;
    delete process.env.TURNSTILE_SECRET_KEY;
  }
});

test('rejection logs expose only payload shape, never submitted content', async () => {
  const previousWarn = console.warn;
  let output = '';
  console.warn = (value) => { output += String(value); };
  try {
    await protectPublicSubmission(request(legitimate({ website: 'https://spam.invalid', message: 'private submitted text' })), { endpoint: 'private-logging' });
  } finally {
    console.warn = previousWarn;
  }
  assert.match(output, /payloadSummary/);
  assert.doesNotMatch(output, /person@example\.com|private submitted text|spam\.invalid/);
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
