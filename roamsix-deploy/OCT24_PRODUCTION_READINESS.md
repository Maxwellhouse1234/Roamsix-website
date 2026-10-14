# October 24 production readiness

Status: **NO-GO for the approved registration system.** The approved design remains private and payments for this new flow must remain disabled.

Approved design baseline: `efc93a4`

## Simplified pricing decision

- General admission remains $50 per adult using the existing event product and price.
- Every adult registers individually. There is no pair-ticket or purchaser-on-behalf-of-guest flow.
- Stripe promotion code `ROAMSIXFRIENDS50` is private, applies only to the October 24 event product, reduces admission by 50%, permits 20 redemptions and expires October 23, 2026 at 4:00 PM Pacific.
- The website does not display or advertise the code. Stripe Checkout accepts eligible promotion codes.
- Eligible members retain one included admission and complete the same event-specific agreement without payment.

## Shortest safe launch path

1. Obtain the final legal name, Elizabeth's agreement approval and insurance confirmation.
2. Store an immutable copy and hash of the approved agreement with each attendee's identity, server timestamp, version and separate photography choice.
3. Add only the Airtable fields required for the individual attendee record, payment reconciliation and private consent list.
4. Subscribe the existing Stripe webhook to refund events after the updated partial/full refund handler is deployed.
5. Verify full-price, discounted and member-included registrations end to end in an isolated Stripe sandbox, including Airtable and real-inbox email delivery.
6. Use an authenticated Airtable roster for event-day check-in if the production QR validator is not ready. QR scanning is not required to begin selling admissions safely.
7. Run one controlled live full-price or discounted transaction, refund it, reconcile net collected revenue and obtain Max's final publication approval.

## Verified in the private implementation

- Public and member-included paths are represented.
- Each adult has an individual agreement state.
- Photography consent is optional and separate from the participation agreement.
- Photography preference appears only in the attendee's own confirmation and authorized staff views, not on the shareable QR ticket.
- QR credentials use opaque identifiers and are not standalone admission credentials.
- Check-in eligibility rejects pending agreements, canceled or refunded admissions and duplicate scans.
- Net collected revenue equals gross settled admission payments minus discounts and refunds exactly once.
- The property share equals 20% of net collected admission revenue.
- The local test suite passes and the production build succeeds.

## Technical work still required

1. Connect the approved single-admission UI to the existing $50 production checkout route.
2. Preserve the existing $50 event product and allow Stripe's private, product-restricted promotion code at Checkout without advertising it on the website.
3. Add secure storage for the immutable agreement text or PDF accepted by each attendee, with its version, text hash, identity and server-recorded timestamp.
4. Extend Airtable or the chosen operational store for admission type, photography choice, agreement status/version/hash, snapshot reference, QR credential hash, check-in time, gross amount, discount, refund and net collected amount. The current Airtable tables do not contain this complete field set.
5. Build authenticated QR verification and staff check-in endpoints. The approved QR and check-in screens are currently interactive previews backed by sample data only.
6. Add individual confirmation, agreement-copy, QR-issuance and operational reminder email templates to the transactional email system. Confirm delivery in real inboxes.
7. Subscribe the Stripe webhook endpoint to `charge.refunded` and verify full and partial refund reconciliation. The code contains a refund handler, but the connected live webhook does not currently subscribe to refund events.
8. Reconcile reporting from settled Stripe amounts and refunds, not displayed prices or attendee-row totals.
9. Run end-to-end tests in an isolated Stripe sandbox for full-price, discounted, member-included, refund, email, QR and check-in flows. The connected Stripe integration currently exposes only the live ROAMSIX account to this workspace.
10. Verify required Vercel environment variables and environment scoping. The connected Vercel account can read the project but does not grant this workspace permission to list its environment variables.

## External dependencies

- Confirm the property's exact legal entity name.
- Obtain Elizabeth's approval of the event-specific agreement and electronic acceptance process.
- Confirm insurance and certificate requirements.
- Confirm final arrival, parking and access instructions.
- Receive Max's explicit authorization before publication or payment activation.

## Launch gate

Production may be considered ready only after all technical items above are complete, all external dependencies are resolved, and end-to-end sandbox evidence confirms Stripe payment, Airtable records, attendee emails, agreement storage, QR issuance, refund reconciliation and staff check-in as one continuous flow.
