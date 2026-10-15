# October 24 two-stage registration release

Status: **GO for protected Preview review; NO-GO for Production payment activation.**

This change separates seat reservation from admission readiness:

1. The attendee accepts the event purchase and refund terms and acknowledges that payment reserves one seat.
2. Stripe collects the payment only when `OCT24_REGISTRATION_ENABLED=true` in that environment.
3. The attendee record is created as `Paid - agreement pending` with `Check-In Eligibility: Agreement required`.
4. The final participation agreement is completed electronically after approval or, if necessary, on paper at check-in.
5. The attendee cannot be admitted until the approved agreement is complete. Photography and video consent is requested separately and remains optional.

The draft property waiver is not displayed, attached to the payment confirmation, recorded as accepted, or exposed through the launch router. Transfer completion is closed unless `OCT24_PARTICIPATION_AGREEMENT_APPROVED=true`.

## Proposed purchase and refund decision

The Preview currently proposes:

- full refunds through October 21, 2026 at 5:00 PM Pacific;
- staff-assisted transfer after that deadline if the replacement attendee completes the required participation agreement;
- a full-refund path if ROAMSIX cancels, materially changes the event or participation requirements, or cannot provide the approved participation agreement before admission.

This is a business term for Max to approve before Production. It prevents ROAMSIX from keeping payment when a later agreement or venue requirement changes the bargain or cannot be supplied in time.

## External decisions required before accepting money

The current files do not establish authority to sell admissions yet. Before payment activation, obtain and retain:

- written venue authorization to hold the October 24 event and sell admissions, either in the executed facility agreement or a separate written authorization;
- the property's exact contracting legal name and authorized signer;
- confirmation that the event insurance is bound and any required certificate of insurance and additional-insured wording have been accepted by the host;
- confirmation that `Reciprofy Inc., dba ROAMSIX` is the organizer, merchant of record, contracting entity, and entity named consistently in the purchase terms, Stripe, emails, and venue documents;
- Max's approval of the proposed two-stage disclosure and expanded refund promise.

Final approval of the property participation waiver is not required to test the two-stage Preview. It may remain pending when payments open only if the five items above are resolved, the attendee is clearly told that a later agreement is required, and ROAMSIX is prepared to refund anyone affected by a later material requirement. This is a business-risk recommendation, not a legal opinion.

## Technical release gates

Protected Preview verification completed:

- the exact `codex/oct24-two-stage-preview` branch opens registration only with a Stripe test or restricted-test key;
- Cloudflare's official test widget and secret are selected only for that protected Preview branch, never for Production;
- the mobile registration form has no horizontal overflow and requires both acknowledgments;
- `ROAMSIXFRIENDS50` was resolved from Stripe Sandbox and produced a Stripe-hosted mobile Checkout showing **Sandbox** and **$25.00**;
- no test payment was completed in this verification, so no new confirmation email, webhook fulfillment, or refund was generated.

Before Production activation:

1. Confirm the protected Preview's Airtable writes remain isolated from live registrations.
2. Complete one full-price and one `ROAMSIXFRIENDS50` payment across mobile and desktop; the discounted mobile Checkout Session is verified, but payment was not submitted.
3. Confirm each duplicate webhook delivery leaves one registration, one attendee, and one copy of each expected email.
4. Confirm the attendee and confirmation email say `agreement pending`, never `waiver accepted` or `admission ready`.
5. Refund the discounted Sandbox payment and confirm registration, attendee, net revenue, and property share reconcile to zero.
6. Confirm membership enrollment and unrelated payment flows remain unchanged.
7. Add `charge.refunded` to the live webhook only after the updated handler is deployed.
8. With separate authorization, run one controlled live checkout and refund.
9. Keep `OCT24_PARTICIPATION_AGREEMENT_APPROVED=false` until the exact final agreement and process are approved.
10. Obtain explicit authorization before setting Production `OCT24_REGISTRATION_ENABLED=true`, promoting the release, or sending Holly's invitation.

## Production decision

- **GO** only when every external decision and technical release gate above is satisfied.
- **NO-GO** if venue authority, insurance, or the operating/contracting entity remains unresolved.
- **NO-GO** if Production would display or record the draft Elizabeth waiver as accepted.
- **NO-GO** if a paid attendee can be marked check-in-ready before the approved participation agreement is complete.

