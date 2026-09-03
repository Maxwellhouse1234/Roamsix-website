# ROAMSIX website Phase A handoff

## Current state

- Branch: `codex/phase-a-professional-rebuild`
- Offer status: `discovery`
- No public dates, faculty, capacity, price, deposit, or checkout
- Existing Stripe, event, waiver, intake, and webhook routes remain unchanged
- `vercel.json` remains unchanged, including the protected `/api/*` routing boundary

## Retreat configuration

The current offer and all public CTA behavior are controlled by:

- `src/config/retreatOffer.js`
- `src/lib/offerState.js`

Do not move the offer out of `discovery` until the expert, date, place, capacity, price, deposit, inclusions, exclusions, payment terms, and refund terms are approved.

## Interest form activation

The new endpoint is `api/retreat-interest.js`. It deliberately does not reuse the legacy Priority Access fields.

Before production release, configure:

- `AIRTABLE_RETREAT_INTEREST_TABLE_ID`
- `AIRTABLE_RETREAT_INTEREST_FIELD_MAP`

The field map must be JSON whose values are Airtable field IDs, not display names. Required keys:

```json
{
  "retreatSlug": "fld...",
  "participantStatus": "fld...",
  "firstName": "fld...",
  "lastName": "fld...",
  "email": "fld...",
  "mobile": "fld...",
  "role": "fld...",
  "organization": "fld...",
  "professionalCategory": "fld...",
  "challenge": "fld...",
  "paymentSource": "fld...",
  "referralSource": "fld...",
  "source": "fld...",
  "campaign": "fld...",
  "landingPage": "fld...",
  "emailConsent": "fld...",
  "smsConsent": "fld...",
  "privacyAccepted": "fld...",
  "createdAt": "fld..."
}
```

If the current Airtable schema does not contain these fields, approve the smallest explicit schema addition before configuring the endpoint. Do not repurpose unrelated fields.

## Verified locally

- Production build passes
- Homepage and first-retreat page render without an error overlay
- Desktop and 390-pixel mobile layouts have no horizontal overflow
- All visible form controls have associated labels
- Mobile menu opens, locks background scrolling, and navigates correctly
- Legacy route redirects resolve without loops
- Privacy, terms, waiver, and media-release pages still resolve
- No date, price, deposit, or generic Priority Access language appears on the first-retreat page

## Still required before production

1. Confirm the Airtable table and field-ID mapping.
2. Test a real interest submission and Resend delivery in a preview deployment.
3. Review the monochrome design and decide whether to add the restrained rust accent.
4. Review and approve all copy, especially the working retreat name and founder biography.
5. Verify Cal.com in the preview deployment.
6. Keep Stripe/deposit exposure disabled until Phase B is fully approved and tested.

