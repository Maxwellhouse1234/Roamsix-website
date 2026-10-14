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

## Approval blockers

- Confirm the legal entity operating ROAMSIX.
- Confirm the property host's exact legal name.
- Obtain Elizabeth's approval of the modified agreement, including Section 5.
- Obtain Elizabeth's confirmation that the proposed electronic acceptance and record are acceptable.
- Approve working agreement version `ROAMSIX-OCT24-2026-DRAFT-2026-10-13`, or provide the final version identifier.
- Approve `Individual admission - $25` and `Two admissions - $50` for activation.
- Confirm whether active members continue to receive included admission under the existing membership promise.
- Approve the second-attendee deadline of October 23, 2026 at 4:00 PM Pacific.
- Confirm the retention period and the authorized ROAMSIX staff roles.
- Confirm the exact legal name of Alive Ferments if it must appear in the agreement or event disclosures.

## Activation gate

Production activation requires all approval blockers above, production Airtable fields, secure snapshot storage, guest-link delivery and expiry, email delivery verification, Stripe prices, webhook coverage, refund reporting, access-control verification, a complete end-to-end test for both ticket types and a final production build.
