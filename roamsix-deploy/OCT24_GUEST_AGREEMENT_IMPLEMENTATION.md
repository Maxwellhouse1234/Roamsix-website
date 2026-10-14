# October 24 guest agreement implementation

Status: private implementation preview only. Do not activate checkout, publish the agreement, create production records, or send guest agreement emails until Max approves the implementation and Elizabeth confirms electronic acceptance.

## Proposed attendee workflow

1. The purchaser chooses `Individual admission - $25` or `Two admissions - $50`.
2. The purchaser provides their own full legal name, email and phone.
3. For two admissions, the purchaser also provides the second attendee's full legal name and individual email address.
4. The complete event-specific Guest Participation Agreement is displayed before acceptance.
5. The purchaser affirmatively accepts the agreement for themselves. The checkbox is unchecked by default.
6. Photography and video consent is presented separately. It is optional and unchecked by default.
7. After successful payment, the purchaser's attendee record is marked complete and a pair-ticket guest record is marked `Pending guest agreement`.
8. A cryptographically random, single-purpose guest link is emailed to the second attendee. The link must not contain the attendee's name, email or other personal information.
9. The second attendee reviews the same complete agreement and accepts for themselves. They separately choose whether to grant photography and video consent.
10. The second attendee must complete the agreement by 4:00 PM Pacific on October 23, 2026. A guest added within 24 hours of the event must complete it before arrival. No attendee is marked admission-ready without a completed agreement.
11. Each attendee receives an email containing the accepted agreement version and either an attached PDF or a permanent, access-controlled copy.
12. After mandatory agreements are complete and admission is valid, issue one attendee-specific QR credential. Do not issue an admission-ready QR credential while an agreement is pending.

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
- Purchaser registration ID, when different
- Admission type: individual, pair purchaser, pair guest, complimentary
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
- Pair-ticket paid admissions and the two attendees attached to each pair
- Complimentary admissions
- Promotional discounts
- Full and partial refunds
- Gross admission revenue
- Discounts and refunds
- Net collected admission revenue
- Property share: 20% of net collected admission revenue, excluding separately contracted sponsorship revenue

Payment totals should come from settled Stripe amounts and refunds, not from the displayed ticket price.

## Staff operations

- At 4:00 PM Pacific on October 23, export or review the pending-agreement list and contact only incomplete attendees.
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
- Approve `Individual admission - $25` and `Two admissions - $50` for activation.
- Confirm whether active members continue to receive included admission under the existing membership promise.
- Approve the second-attendee deadline of October 23, 2026 at 4:00 PM Pacific.
- Confirm the retention period and the authorized ROAMSIX staff roles.
- Confirm the exact legal name of Alive Ferments if it must appear in the agreement or event disclosures.
- Confirm the applicable insurance requirements and certificate-of-insurance status.

## Activation gate

Production activation requires all approval blockers above, production Airtable fields, secure snapshot storage, guest-link delivery and expiry, email delivery verification, Stripe prices, webhook coverage, refund reporting, access-control verification, a complete end-to-end test for both ticket types and a final production build.
