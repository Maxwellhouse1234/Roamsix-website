# October 24 production readiness

Status: **NO-GO for the approved registration system.** The approved design remains private and payments for this new flow must remain disabled.

Approved design baseline: `efc93a4`

## Verified in the private implementation

- Public, member-included and second-attendee paths are represented.
- Each adult has an individual agreement state.
- Photography consent is optional and separate from the participation agreement.
- Photography preference appears only in the attendee's own confirmation and authorized staff views, not on the shareable QR ticket.
- QR credentials use opaque identifiers and are not standalone admission credentials.
- Check-in eligibility rejects pending agreements, canceled or refunded admissions and duplicate scans.
- Net collected revenue equals gross settled admission payments minus discounts and refunds exactly once.
- The property share equals 20% of net collected admission revenue.
- The local test suite passes and the production build succeeds.

## Technical work still required

1. Connect the approved registration UI to production API routes. The existing public route is the earlier $50 single-admission implementation and does not implement the approved $25 individual and $50 pair paths.
2. Create or configure Stripe prices for $25 individual admission and $50 pair admission. The connected live account currently has only the earlier $50 single-admission event price.
3. Make photography consent optional in both public and member registration handlers. The current handlers require media-release acceptance.
4. Create one attendee record per adult, including a pending second-attendee record and a unique, expiring agreement-completion link stored only as a hash.
5. Add secure storage for the immutable agreement text or PDF accepted by each attendee, with its version, text hash, identity and timestamp.
6. Extend Airtable or the chosen operational store for admission type, purchaser relationship, photography choice, agreement status/version/hash, snapshot reference, QR credential hash, check-in time, gross amount, discount, refund and net collected amount. The current Airtable tables do not contain this complete field set.
7. Build authenticated QR verification and staff check-in endpoints. The approved QR and check-in screens are currently interactive previews backed by sample data only.
8. Add individual confirmation, second-attendee invitation, agreement-completion, QR-issuance and operational reminder email templates to the transactional email system. Confirm delivery in real inboxes.
9. Subscribe the Stripe webhook endpoint to `charge.refunded` and verify full and partial refund reconciliation. The code contains a refund handler, but the connected live webhook does not currently subscribe to refund events.
10. Reconcile reporting from settled Stripe amounts and refunds, not displayed prices or attendee-row totals. Pair transactions must be counted once.
11. Run end-to-end tests in an isolated Stripe sandbox for individual, pair, member-included, refund, second-attendee, email, QR and check-in flows. The connected Stripe integration currently exposes only the live ROAMSIX account to this workspace.
12. Verify required Vercel environment variables and environment scoping. The connected Vercel account can read the project but does not grant this workspace permission to list its environment variables.

## External dependencies

- Confirm the property's exact legal entity name.
- Obtain Elizabeth's approval of the event-specific agreement and electronic acceptance process.
- Confirm insurance and certificate requirements.
- Confirm final arrival, parking and access instructions.
- Receive Max's explicit authorization before publication or payment activation.

## Launch gate

Production may be considered ready only after all technical items above are complete, all external dependencies are resolved, and end-to-end sandbox evidence confirms Stripe payment, Airtable records, attendee emails, agreement storage, QR issuance, refund reconciliation and staff check-in as one continuous flow.
