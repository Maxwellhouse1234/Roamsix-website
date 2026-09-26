# ROAMSIX membership cohort operations

Membership opens in small cohorts of up to 25 paid members. The configured capacity is an operating guideline that protects personal, meaningful participation, not an inviolable contractual promise. A cohort organizes the membership experience; it does not replace the Core, Field, or Journey tier and does not limit public-event capacity.

ROAMSIX may divide a cohort into smaller working or discussion groups, such as two groups of approximately 12, when that better serves the programming. This is programming flexibility within the same membership cohort and does not require another technical hierarchy.

## Production configuration

Set these values in Vercel for Preview and Production:

- `ACTIVE_MEMBERSHIP_COHORT_ID=founding`
- `ACTIVE_MEMBERSHIP_COHORT_LABEL=Founding Cohort`
- `MEMBERSHIP_COHORT_CAPACITY=25`
- Optional: `ROAMSIX_CRM_MEMBERSHIP_TABLE_ID` when the Airtable table is referenced by ID instead of the default name `Membership Records`.

The checkout copies the cohort ID and label into both Checkout Session metadata and Subscription metadata. The paid-member webhook preserves them in the CRM engagement, the dedicated Airtable membership record, internal notifications, the member confirmation, and the member dashboard.

Legacy paid records with `enrollmentPhase=founding` or `purchaseType=foundingMembership` are treated as cohort ID `founding`. Existing subscriptions always use their own saved cohort metadata; changing the active cohort does not move existing members.

## When a cohort fills

When the recorded unique paid-member count reaches the configured guideline—currently 25—direct enrollment returns a closed-cohort state and offers the next-cohort interest list. Duplicate Checkout sessions linked by the same normalized email or Stripe customer count once. Field and Journey requests do not count until paid checkout is complete. No temporary slot reservation or separate concurrency system is used; any rare simultaneous-checkout overage is handled operationally.

A full cohort does not open another cohort automatically. Do not change the three active-cohort values until Max approves the next cohort.

## Opening the next cohort

1. Confirm the current cohort has reached its operational close and review any payment exceptions in Stripe and Airtable.
2. Choose a stable ID such as `cohort-02` and a public label such as `Cohort 02`.
3. Update `ACTIVE_MEMBERSHIP_COHORT_ID` and `ACTIVE_MEMBERSHIP_COHORT_LABEL` in Vercel Preview first. Keep `MEMBERSHIP_COHORT_CAPACITY=25` unless Max explicitly approves a different size.
4. Redeploy Preview and run the cohort rollover tests: old paid records do not consume the new cohort, new checkout metadata uses the new ID, and old Field/Journey invitations are rejected.
5. Update the same values in Production and deploy only after approval.
6. Create new Field/Journey approval IDs after activation. Invitations are bound to the cohort active when approval is recorded.

Public event capacity remains format-specific and must follow the operating financial model. It is never derived from membership cohort capacity.
