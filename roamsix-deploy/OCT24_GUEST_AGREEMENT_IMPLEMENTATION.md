# October 24 guest agreement implementation

Status: private implementation preview only. Do not activate checkout, publish the agreement, create production records, or send guest agreement emails until Max approves the implementation and Elizabeth confirms electronic acceptance.

## Launch-critical registration decisions

- Public pricing remains $50 for one adult. A private Stripe promotion code can reduce that admission to $25 for approved recipients.
- An eligible signed-in member reserves one included admission without opening Stripe or purchasing a ticket. Membership status is verified server-side, and the attendee must still complete the same event-specific agreement before the admission becomes ready.
- The event-specific agreement has one affirmative acceptance checkbox after the complete agreement. Its wording does not repeat the full acknowledgment already contained in Section 9.
- Event Registration Terms require affirmative acceptance. The Privacy Policy is presented separately as notice, not bundled into the terms checkbox.
- The event's expert, subject and participatory format appear before the full agreement so the attendee understands the experience before reaching the legal material.
- The QR code is an opaque lookup key only. Every scan rechecks the attendee's current registration, payment or member-included status, agreement status, cancellation state and prior check-in.

## Proposed attendee workflow

1. Each adult registers individually for one `General admission - $50`, or uses one verified member-included admission.
2. The attendee provides their own full legal name, individual email and phone number.
3. The complete event-specific Guest Participation Agreement is displayed before acceptance.
4. The attendee affirmatively accepts the agreement for themselves. The checkbox is unchecked by default.
5. Photography and video consent is presented separately. It is optional and unchecked by default.
6. Public attendees continue to the existing $50 Stripe Checkout. Stripe may accept the private event-specific promotion code, but the website does not advertise it.
7. Eligible signed-in members reserve one included admission without Stripe and still complete the same event agreement.
8. Each attendee receives an email containing the accepted agreement version and either an attached PDF or a permanent, access-controlled copy.
9. After mandatory agreements are complete and admission is valid, issue one attendee-specific QR credential.

## QR credential and check-in design

- Generate the credential server-side with a cryptographically secure random identifier of at least 128 bits.
- Encode only an opaque ticket identifier or a short verification URL containing that identifier. Do not encode a name, email, payment amount or agreement status.
- Store only a secure hash of the raw identifier where practical. A scan resolves the identifier through an authenticated server endpoint.
- Bind each identifier to one attendee record, one event and one current admission status.
- Rotate or revoke a credential after a ticket transfer, cancellation, refund or suspected disclosure.
- The verification endpoint must re-check admission validity, required agreement status and prior check-in at scan time.
- Use an atomic check-in write so simultaneous or repeated scans cannot admit the same credential twice.
- Do not treat possession of a QR code as proof that the bearer is admission-ready.
- Limit the scanner and manual-lookup interfaces to authenticated, authorized ROAMSIX staff.
- Keep payment totals and complete agreement documents out of the general check-in view.

## Proposed acceptance record

Use one record per adult attendee. Do not combine two people in one legal record.

- Event ID
- Attendee full legal name
- Attendee email
- Registration ID
- Admission type: general admission, member included, complimentary
- Payment status: paid, complimentary, discounted, refunded, partially refunded
- Gross admission amount
- Discount amount
- Refunded amount
- Net collected admission revenue
- Agreement status: pending, accepted, revoked only if the approved legal process allows it
- Agreement version
- Immutable hash of the exact agreement text
- Server-generated acceptance timestamp in UTC
- Acceptance method: purchaser flow or guest link
- Guest-link token hash and expiration, never the raw token
- Photography and video choice: permitted or declined
- Photography consent-language version
- Photography choice timestamp in UTC
- Accepted agreement snapshot or secure object reference
- Source

Do not collect medical conditions, diagnoses, medications or treatment information in this registration flow.

## Secure storage and retrieval

- Keep attendee and payment operations in Airtable only if field-level access and the current workspace permissions meet ROAMSIX's requirements. Store immutable agreement snapshots in access-controlled object storage and reference them from the attendee record.
- Restrict the staff attendance view to authenticated ROAMSIX personnel assigned to the event.
- Show the door team only identity, admission readiness and payment status.
- Show the photographer or assigned event lead only the minimum consent information needed to avoid filming attendees who declined.
- Log changes to waiver status, photography choice, refunds and complimentary admissions.
- Keep raw guest-link tokens out of Airtable, logs, URLs shown in staff views and email analytics. Store only a secure token hash.
- Confirm the record-retention period with counsel before production. Do not delete accepted agreement records through routine attendee cleanup.

## Financial reporting

Report each category separately:

- Individual paid admissions
- Full-price and discounted general admissions
- Complimentary admissions
- Promotional discounts
- Full and partial refunds
- Gross admission revenue
- Discounts and refunds
- Net collected admission revenue
- Property share: 20% of net collected admission revenue, excluding separately contracted sponsorship revenue

Payment totals should come from settled Stripe amounts and refunds, not from the displayed ticket price. `Net collected revenue` means gross settled admission payments minus discounts and refunds exactly once. The property's 20% share is calculated from that net amount.

Photography preference may appear in the attendee's private confirmation email and the access-controlled staff view. It must not appear on the QR ticket or in any message sent to another attendee.

## Staff operations

- Before the event, export or review the pending-agreement list and contact only incomplete attendees.
- At check-in, do not admit an attendee whose agreement status is pending.
- Brief the photographer before any photography begins.
- Use a private staff-facing consent list. Do not publicly label attendees who declined photography.
- Provide a discreet direct check between the event lead and photographer if a person's consent status is uncertain.

## Offline contingency

- Conduct an onsite cellular test at the property with the carriers used by the event leads. This cannot be established from the website or the current preview.
- Before departing for the venue, an authorized event lead may download an encrypted, event-specific roster containing only ticket identifier, attendee name, admission validity, agreement-complete status, photography choice and prior check-in state.
- The offline roster must expire after the event and remain protected by the staff device's authentication.
- Offline scanning may check in only credentials already valid and agreement-complete in the downloaded snapshot.
- A new, pending or unresolved agreement cannot be approved offline and must not be bypassed at the door.
- Offline check-ins are written to a local append-only queue, duplicate local scans are blocked, and the queue is reconciled with the server when connectivity returns.
- Any conflict found during reconciliation is retained for authorized review rather than silently overwritten.

## Approval blockers

- Confirm the final document should identify the organizer as `Reciprofy Inc., dba ROAMSIX`.
- Confirm the property host's exact legal name.
- Obtain Elizabeth's approval of the modified agreement, including Section 5.
- Obtain Elizabeth's confirmation that the proposed electronic acceptance and record are acceptable.
- Approve working agreement version `ROAMSIX-OCT24-2026-DRAFT-2026-10-13`, or provide the final version identifier.
- Approve `General admission - $50` for activation.
- Confirm whether active members continue to receive included admission under the existing membership promise.
- Confirm the retention period and the authorized ROAMSIX staff roles.
- Confirm the exact legal name of Alive Ferments if it must appear in the agreement or event disclosures.
- Confirm the applicable insurance requirements and certificate-of-insurance status.

## Activation gate

Production activation requires all approval blockers above, production Airtable fields, secure snapshot storage, email delivery verification, Stripe promotion-code validation, webhook coverage, refund reporting, access-control verification, a complete end-to-end test for full-price, discounted and member-included admission, and a final production build.
