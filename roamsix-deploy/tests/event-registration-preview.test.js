import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateEventRevenue, evaluateCheckInEligibility } from '../src/lib/eventRegistration.js';
import { PREVIEW_ATTENDEES } from '../src/data/oct24RegistrationPreview.js';

test('check-in requires an accepted agreement and valid admission', () => {
  assert.deepEqual(evaluateCheckInEligibility(PREVIEW_ATTENDEES[0]), { code: 'ready', eligible: true, label: 'Ready to check in' });
  assert.equal(evaluateCheckInEligibility(PREVIEW_ATTENDEES[2]).code, 'agreement_required');
  assert.equal(evaluateCheckInEligibility(PREVIEW_ATTENDEES[5]).code, 'canceled');
  assert.equal(evaluateCheckInEligibility({ ...PREVIEW_ATTENDEES[0], checkedInAt: new Date().toISOString() }).code, 'duplicate');
  assert.equal(evaluateCheckInEligibility(null).code, 'not_found');
});

test('member-included and complimentary attendees remain eligible without new revenue', () => {
  assert.equal(evaluateCheckInEligibility(PREVIEW_ATTENDEES[3]).eligible, true);
  assert.equal(evaluateCheckInEligibility(PREVIEW_ATTENDEES[4]).eligible, true);
  assert.equal(PREVIEW_ATTENDEES[3].grossAmount, 0);
  assert.equal(PREVIEW_ATTENDEES[4].grossAmount, 0);
});

test('pair admission revenue is counted once and refunds reduce the property share', () => {
  const report = calculateEventRevenue(PREVIEW_ATTENDEES);
  assert.equal(report.individual, 2);
  assert.equal(report.pair, 1);
  assert.equal(report.memberIncluded, 1);
  assert.equal(report.complimentary, 1);
  assert.equal(report.gross, 100);
  assert.equal(report.refunds, 25);
  assert.equal(report.netCollected, 75);
  assert.equal(report.propertyShare, 15);
});

test('preview keeps photography separate and supports both choices', () => {
  assert.ok(PREVIEW_ATTENDEES.some((record) => record.photoConsent === 'permitted'));
  assert.ok(PREVIEW_ATTENDEES.some((record) => record.photoConsent === 'declined'));
});

test('private preview includes separate guest completion, QR, email, check-in and reporting views', async () => {
  const [router, registration, guest, emails, ticket, checkIn, agreement, eligibility, styles] = await Promise.all([
    readFile(new URL('../src/router.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalRegistrationPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalGuestAgreementPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalEmailPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalTicketPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalCheckInPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/drSalGuestAgreement.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/eventRegistration.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ]);

  assert.match(router, /registration-preview/);
  assert.match(router, /guest-agreement-preview/);
  assert.match(router, /email-preview/);
  assert.match(router, /ticket-preview/);
  assert.match(router, /check-in-preview/);
  assert.match(router, /attendance-preview/);
  assert.match(registration, /Individual admission/);
  assert.match(registration, /Two admissions/);
  assert.match(registration, /Member-included admission · no payment/);
  assert.match(registration, /Event Registration Terms/);
  assert.match(registration, /Privacy Policy is provided as notice/);
  assert.doesNotMatch(registration, /I accept the .*Terms.* and .*Privacy Policy/);
  assert.match(registration, /I have read and agree to the October 24, 2026 Guest Participation Agreement/);
  assert.match(guest, /The purchaser cannot accept this agreement for you/);
  assert.match(guest, /I have read and agree to the October 24, 2026 Guest Participation Agreement/);
  assert.match(emails, /Your QR ticket will be issued after the required agreement is complete/);
  assert.match(emails, /included with your active ROAMSIX membership\. You were not charged/);
  assert.match(ticket, /not a standalone admission credential/);
  assert.match(ticket, /current registration, payment or member-included status/);
  assert.match(eligibility, /Agreement incomplete/);
  assert.match(checkIn, /current registration and agreement record/);
  assert.match(styles, /\.event-agreement \{[^}]*max-height:[^}]*overflow-y: auto/);
  assert.match(styles, /\.event-agreement-copy p, \.event-agreement-copy li \{[^}]*font-size: 1rem/);
  assert.match(registration, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(emails, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(ticket, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(checkIn, /connection failure/);
  assert.match(agreement, /Reciprofy Inc., dba ROAMSIX/);
  assert.doesNotMatch(agreement, /\[Legal entity operating ROAMSIX\]/);
  assert.match(agreement, /\[Confirm exact legal name of property host\]/);
});
