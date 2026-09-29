# ROAMSIX member-benefit operations

The member-benefit system is a controlled publishing registry, not a list of ideas. A benefit is shown only when it is confirmed, active, visible to the selected audience, and eligible for the member's tier.

## Airtable setup

Run `npm run email:provision` with an Airtable token that has `schema.bases:write`. This creates or updates:

- `Member Benefits`, the source of truth for partner offers and their approved presentation.
- `Member Benefit Redemptions`, a fulfillment ledger reserved for later redemption workflows and manual tracking.

Set `ROAMSIX_CRM_MEMBER_BENEFITS_TABLE_ID` in Vercel Preview and Production to the Airtable table ID. If the variable or Airtable access is missing, the public and member experiences fail safely by displaying no partner offers.

## Publishing gates

A benefit appears only when all applicable requirements are satisfied:

1. `Status` is exactly `Confirmed`.
2. `Member Visible` is checked for the authenticated member area, or `Publicly Listed` is checked for the public membership page.
3. `Eligible Tiers` contains one or more comma-separated values from `Core`, `Field`, `Journey`, or `Private`.
4. The current date is on or after `Starts At` and before `Expires At`, when those dates are present.
5. `Benefit` and `Exact Offer` are complete. Public listings also require `Approved Website Language`; the public API uses that reviewed copy rather than internal working notes.

Draft, negotiating, paused, expired, and future benefits are never returned. Internal cost, liability, insurance, member-data, contract, inventory, and internal-note fields are never returned by the public API.

## Approval workflow

Before changing a record to `Confirmed`:

1. Obtain a signed agreement or written confirmation covering the exact offer, availability, allocation, dates, fulfillment owner, cancellation or replacement plan, data handling, and any liability or insurance requirements.
2. Substantiate the retail value. Use `Retail Value Label` for the exact customer-facing language; do not publish a calculated or aspirational value.
3. Enter the approved website language, redemption instructions, booking and blackout rules, third-party disclaimer, and applicable tiers.
4. Use HTTPS URLs for partner logos, information, and redemption links.
5. Review any health-related language for unsupported clinical claims. ROAMSIX should not receive diagnoses, treatment records, laboratory results, or other clinical information through this workflow.
6. Check `Member Visible` and, only if suitable for nonmembers, `Publicly Listed`.
7. Set `Status` to `Confirmed` last.

The website may describe that the partner network is growing, but it must not identify or quantify a specific benefit until these gates are met.

## Redemption and inventory

The current member area can present instructions and send a member to an approved HTTPS redemption destination. It does not yet issue codes, reserve inventory, or write redemption records automatically. Until a dedicated redemption workflow is approved, the fulfillment owner must track usage and remaining allocation manually. Do not enable a redemption call to action unless the partner can honor it.

## Pricing reconciliation required

Core is $850 annually for founding members. The founding rate is held while membership stays active. The standard Core rate for new members becomes $1,100 in 2027.
