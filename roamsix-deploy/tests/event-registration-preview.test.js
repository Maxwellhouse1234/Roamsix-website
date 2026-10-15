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

test('individual discounts and refunds reduce net revenue before the property share', () => {
  const report = calculateEventRevenue(PREVIEW_ATTENDEES);
  assert.equal(report.individual, 4);
  assert.equal(report.pair, 0);
  assert.equal(report.memberIncluded, 1);
  assert.equal(report.complimentary, 1);
  assert.equal(report.gross, 200);
  assert.equal(report.discounts, 25);
  assert.equal(report.refunds, 50);
  assert.equal(report.netCollected, 125);
  assert.equal(report.propertyShare, 25);
});

test('discounts and partial refunds are each deducted exactly once', () => {
  const report = calculateEventRevenue([
    { transactionId: 'txn-pair', admissionType: 'pair-purchaser', transactionAdmissionType: 'pair', grossAmount: 50, discountAmount: 5, refundAmount: 10 },
    { transactionId: 'txn-pair', admissionType: 'pair-guest', transactionAdmissionType: 'pair', grossAmount: 50, discountAmount: 5, refundAmount: 10 },
  ]);
  assert.equal(report.gross, 50);
  assert.equal(report.discounts, 5);
  assert.equal(report.refunds, 10);
  assert.equal(report.netCollected, 35);
  assert.equal(report.propertyShare, 7);
});

test('preview keeps photography separate and supports both choices', () => {
  assert.ok(PREVIEW_ATTENDEES.some((record) => record.photoConsent === 'permitted'));
  assert.ok(PREVIEW_ATTENDEES.some((record) => record.photoConsent === 'declined'));
});

test('approved preview artifacts remain available for review but are not routed in the launch build', async () => {
  const [router, registration, emails, ticket, checkIn, agreement, eligibility, styles, agreementComponent] = await Promise.all([
    readFile(new URL('../src/router.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalRegistrationPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalEmailPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalTicketPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DrSalCheckInPreviewPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/drSalGuestAgreement.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/eventRegistration.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/DrSalAgreementText.jsx', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(router, /registration-preview/);
  assert.doesNotMatch(router, /guest-agreement-preview/);
  assert.doesNotMatch(router, /email-preview/);
  assert.doesNotMatch(router, /ticket-preview/);
  assert.doesNotMatch(router, /check-in-preview/);
  assert.doesNotMatch(router, /attendance-preview/);
  assert.doesNotMatch(router, /staff-roster/);
  assert.match(registration, /General admission/);
  assert.match(registration, /\$50 · One adult/);
  assert.doesNotMatch(registration, /Two admissions|\$25 · One adult/);
  assert.match(registration, /Member-included admission · no payment/);
  assert.match(registration, /Event Registration Terms/);
  assert.match(registration, /Privacy Policy is provided as notice/);
  assert.doesNotMatch(registration, /I accept the .*Terms.* and .*Privacy Policy/);
  assert.match(registration, /I have read and agree to the October 24, 2026 Guest Participation Agreement/);
  assert.doesNotMatch(emails, /Second-attendee invitation/);
  assert.match(emails, /included with your active ROAMSIX membership\. You were not charged/);
  assert.match(ticket, /not a standalone admission credential/);
  assert.match(ticket, /current registration, payment or member-included status/);
  assert.doesNotMatch(ticket, /<dt>Photography<\/dt>/);
  assert.match(eligibility, /Agreement incomplete/);
  assert.match(checkIn, /current registration and agreement record/);
  assert.match(styles, /\.event-agreement \{[^}]*max-height:[^}]*overflow-y: auto/);
  assert.match(styles, /\.event-agreement-copy p, \.event-agreement-copy li \{[^}]*font-size: 1rem/);
  assert.match(styles, /\.membership-checkout-form \.check \{[^}]*min-height: 44px/);
  assert.match(agreementComponent, /Scroll to review the complete agreement/);
  assert.match(registration, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(emails, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(ticket, /The gut-brain connection: food, stress, and everyday performance/);
  assert.match(checkIn, /connection failure/);
  assert.match(await readFile(new URL('../src/pages/DrSalAttendancePreviewPage.jsx', import.meta.url), 'utf8'), /Net collected revenue after discounts and refunds/);
  assert.match(agreement, /Reciprofy Inc., dba ROAMSIX/);
  assert.doesNotMatch(agreement, /\[Legal entity operating ROAMSIX\]/);
  assert.match(agreement, /\[Confirm exact legal name of property host\]/);
});

test('October 24 launch path stays individual-only, two-stage, and protects staff operations', async () => {
  const [registration, checkout, webhook, transfer, completion, roster, router] = await Promise.all([
    readFile(new URL('../src/pages/DrSalRegistrationPage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../api/create-checkout-session.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/stripe-webhook.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/event-transfer.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/complete-event-transfer.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/event-roster.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/router.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(registration, /Private admission code/);
  assert.match(registration, /ROAMSIXFRIENDS50|discountCode/);
  assert.doesNotMatch(registration, /Two admissions|second guest/i);
  assert.match(checkout, /Each October 24 attendee must register individually/);
  assert.match(checkout, /privatePromotionEnv/);
  assert.doesNotMatch(checkout, /allow_promotion_codes/);
  assert.match(registration, /Payment reserves a seat\. It does not complete admission requirements/);
  assert.match(registration, /current draft property waiver is not being presented or accepted here/);
  assert.doesNotMatch(registration, /DrSalAgreementText|DR_SAL_GUEST_AGREEMENT_VERSION/);
  assert.match(checkout, /participationRequirementAcknowledged/);
  assert.match(checkout, /participationAgreementStatus/);
  assert.match(webhook, /Paid - agreement pending/);
  assert.match(webhook, /Check-In Eligibility": "Agreement required"/);
  assert.doesNotMatch(webhook, /drSalAgreementHtml\(agreementSnapshot\)/);
  assert.match(transfer, /Authorized event staff access is required/);
  assert.match(transfer, /drSalParticipationAgreementEnabled/);
  assert.match(transfer, /Awaiting agreement/);
  assert.match(completion, /drSalParticipationAgreementEnabled/);
  assert.match(completion, /Photography Consent/);
  assert.match(completion, /Agreement SHA-256/);
  assert.match(roster, /propertyShare: Number\(\(netCollected \* 0\.2\)/);
  assert.doesNotMatch(router, /staff-roster/);
  assert.doesNotMatch(router, /\/transfer/);
});
