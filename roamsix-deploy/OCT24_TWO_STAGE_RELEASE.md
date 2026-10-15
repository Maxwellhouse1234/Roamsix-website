# October 24 two-stage registration release

Status: **Protected Preview verified; Production payment activation awaits purchase-terms approval and the separately authorized live charge/refund test.**

This change separates seat reservation from admission readiness:

1. The attendee accepts the event purchase and refund terms and acknowledges that payment reserves one seat.
2. Stripe collects the payment only when `OCT24_REGISTRATION_ENABLED=true` in that environment.
3. The attendee record is created as `Paid - agreement pending` with `Check-In Eligibility: Agreement required`.
4. The final participation agreement is completed electronically after approval or, if necessary, on paper at check-in.
5. The attendee cannot be admitted until the approved agreement is complete. Photography and video consent is requested separately and remains optional.

The draft property waiver is not displayed, attached to the payment confirmation, recorded as accepted, or exposed through the launch router. Transfer completion is closed unless `OCT24_PARTICIPATION_AGREEMENT_APPROVED=true`.

## Proposed purchase and refund decision

Purchase terms version `ROAMSIX-OCT24-2026-RESERVATION-TERMS-2026-10-14-R2` proposes:

- full refunds through October 21, 2026 at 5:00 PM Pacific;
- staff-assisted transfer after that deadline if the replacement attendee completes the required participation agreement;
- an unconditional full refund to the original payment method if ROAMSIX cancels, including because venue, insurance, permit, safety or other operational requirements are not satisfied;
- the choice to keep the registration or request a full refund if ROAMSIX postpones or reschedules the event, materially changes the event or participation requirements, or cannot provide the approved participation agreement before admission.

This is a business term for Max to approve before Production. It prevents ROAMSIX from keeping payment when a later agreement or venue requirement changes the bargain or cannot be supplied in time.

## External decisions and operational requirements

Confirmed by Max on October 14, 2026:

- Elizabeth authorized ROAMSIX to host the October 24 event and sell tickets;
- `Reciprofy Inc., dba ROAMSIX` is the organizer, merchant of record and contracting entity;
- the final participation agreement may be completed electronically or on paper at check-in before admission;
- event insurance is being arranged and final coverage and additional-insured requirements remain pending.

The host's original facility form recommends that the user obtain liability and property coverage. The proposed event-specific agreement requires agreed coverage and any certificate/additional-insured documentation before the event proceeds or attendee access begins; neither document says presales must wait for policy issuance. Max's confirmation of ticket-sale authority and the R2 cancellation refund protect purchasers if coverage or another operational requirement is not satisfied. This is a business-risk assessment, not legal advice.

Because fermented-food samples are planned, San Diego County states that temporary food permits are required when food or beverages are sold or given away to the public. The event is under four hours and does not qualify for a Community Event Permit, but the applicable temporary food organizer/vendor applications should be confirmed and submitted immediately. Late fees may apply inside 14 days. This does not itself prohibit presales, but the event must not proceed without required approvals.

## Technical release gates

Protected Preview verification completed:

- the exact `codex/oct24-two-stage-preview` branch opens registration only with a Stripe test or restricted-test key;
- Cloudflare's official test widget and secret are selected only for that protected Preview branch, never for Production;
- the mobile registration form has no horizontal overflow and requires both acknowledgments;
- `ROAMSIXFRIENDS50` was resolved from Stripe Sandbox and produced a Stripe-hosted mobile Checkout showing **Sandbox** and **$25.00**;
- duplicate Sandbox webhook delivery produced one registration, one attendee record and the expected two emails;
- the verified $25 Sandbox payment was fully refunded; the webhook returned HTTP 200, Airtable marked the registration and attendee refunded/canceled, net collected revenue and property share reconciled to zero, and no duplicate record was created;
- the R2 refund wording is deployed in protected Preview commit `766fe47`, 62 tests and the production build pass, and the mobile page has no horizontal overflow.

Before Production activation:

1. Max approves the exact R2 purchase and refund wording.
2. Deploy commit `766fe47` through the Git-connected Production workflow while keeping `OCT24_REGISTRATION_ENABLED=false`.
3. Confirm Production uses live price `price_1UL6IYLgUPmdquZo5gW7gVWK` and promotion `promo_1UQJIGLgUPmdquZo0u0VGmjQ`.
4. Add `charge.refunded` to the existing live webhook only after the updated handler is deployed.
5. With separate authorization, enable registration for one controlled $25 live checkout and full refund; verify the Stripe event, one Airtable registration, one attendee, two expected emails, and zero net/property-share reconciliation.
6. Keep `OCT24_PARTICIPATION_AGREEMENT_APPROVED=false` until the exact final agreement and process are approved.
7. If the live test passes, keep registration open; if any check fails, immediately restore the checkout hold.
8. Do not send Holly's invitation without separate approval.

## Production decision

- **GO to deploy closed** after Max approves the R2 purchase terms.
- **GO to a controlled live test** only with separate authorization.
- **GO to public paid registration** only after the controlled live test passes and live reconciliation is confirmed.
- **NO-GO for holding the event** if required insurance, food permits or venue operational approvals are not satisfied before attendee access.
- **NO-GO** if Production would display or record the draft Elizabeth waiver as accepted.
- **NO-GO** if a paid attendee can be marked check-in-ready before the approved participation agreement is complete.

