import test from 'node:test';
import assert from 'node:assert/strict';

function response(body = {}, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function mockRes() {
  return {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const securityFields = () => ({ formStartedAt: Date.now() - 3000, turnstileToken: 'test-token', website: '' });

test('Experience Finder requires a name and sends the promised recommendation email', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response({ id: 'email_test' });
  };
  delete process.env.AIRTABLE_TOKEN;
  delete process.env.PROVING_GROUNDS_BASE_ID;
  const { default: contact } = await import('../api/contact.js');

  const missingName = mockRes();
  await contact({ method: 'POST', body: {
    email: 'member@example.com', source: 'Experience Finder', message: 'answers',
    experienceFinderAnswers: { audience: 'healthy-aging', priority: 'clarity', topic: 'gut' },
    ...securityFields(),
  } }, missingName);
  assert.equal(missingName.statusCode, 400);
  assert.match(missingName.body.error, /Name is required/);
  assert.equal(calls.length, 0);

  const cases = [
    [{ audience: 'healthy-aging', priority: 'clarity', topic: 'gut' }, 'Core membership, founding rate, closes December 31'],
    [{ audience: 'transition', priority: 'clarity', topic: 'recovery' }, 'Sleep and recovery quarter, plus Field'],
    [{ audience: 'practitioner', priority: 'application', topic: 'whole' }, 'Collaborate'],
    [{ audience: 'team', priority: 'prevention', topic: 'longevity' }, 'Organizations'],
  ];

  for (const [experienceFinderAnswers, expected] of cases) {
    const res = mockRes();
    const before = calls.length;
    await contact({ method: 'POST', body: {
      fullName: 'Jamie Rivera', email: 'member@example.com', inquiryType: 'Experience recommendation',
      source: 'Experience Finder', message: 'structured answers', experienceFinderAnswers,
      ...securityFields(),
    } }, res);
    assert.equal(res.statusCode, 200);
    const emailCalls = calls.slice(before).filter((call) => call.url === 'https://api.resend.com/emails');
    assert.equal(emailCalls.length, 2);
    const internal = JSON.parse(emailCalls[0].options.body);
    const recommendation = JSON.parse(emailCalls[1].options.body);
    assert.match(internal.html, /Reply to Jamie/);
    assert.match(recommendation.html, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(recommendation.html, /Thanks for telling us where you are\./);
    assert.match(recommendation.html, /See membership/);
    assert.match(recommendation.html, /See the October 24 event/);
    assert.doesNotMatch(recommendation.html, /fully customized offsites/);
  }
});

test('internal notification uses a human fallback when a generic inquiry has no name', async () => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response({ id: 'email_test' });
  };
  delete process.env.AIRTABLE_TOKEN;
  delete process.env.PROVING_GROUNDS_BASE_ID;
  const { default: contact } = await import('../api/contact.js');
  const res = mockRes();
  await contact({ method: 'POST', body: { email: 'lead@example.com', message: 'Hello', ...securityFields() } }, res);
  assert.equal(res.statusCode, 200);
  const internal = JSON.parse(calls[0].options.body);
  assert.match(internal.html, /Reply to this lead/);
  assert.doesNotMatch(internal.html, /Reply to Not/);
});
