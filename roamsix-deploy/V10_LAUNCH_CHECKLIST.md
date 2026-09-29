# ROAMSIX V10 launch checklist

The website and minimum member area use the existing Vercel, Stripe, Airtable, and Resend stack. No separate app, clinical system, social network, marketplace, or partner directory was added.

## Max must complete before live checkout

1. Use the approved annual pricing source of truth:
   - Core — $850 founding rate, held while membership stays active; $1,100 standard rate for new members in 2027
   - Field — $2,200
   - Journey — $4,500
2. Add their IDs to Vercel as `STRIPE_MEMBERSHIP_CORE_PRICE_ID`, `STRIPE_MEMBERSHIP_FIELD_PRICE_ID`, and `STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID`.
3. Add long, different random values for `MEMBER_AUTH_SECRET`, `MEMBERSHIP_INVITE_SECRET`, and `MEMBERSHIP_APPROVAL_SECRET` to every environment that serves the member area and restricted membership checkout.
4. Confirm `STRIPE_CUSTOMER_PORTAL_URL` and `VITE_STRIPE_CUSTOMER_PORTAL_URL` point to the enabled Stripe Customer Portal.
5. Confirm the production Stripe webhook sends `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, and `customer.subscription.deleted` to `/api/stripe-webhook`.
6. Verify the Airtable token can read and update the CRM Contacts table, create CRM Engagement records, and read/write the Transactional Emails, Membership Approvals, Membership Records, Member Benefits, and Member Benefit Redemptions tables. Run `npm run email:provision` once if those tables do not exist. The token also needs `schema.bases:write` while the provisioning script creates missing tables or fields. Set `ROAMSIX_CRM_MEMBER_BENEFITS_TABLE_ID` after provisioning. The Contact relationship options `Member` and `Priority Access` must be accepted.
7. Add `RESEND_WEBHOOK_SECRET` and configure `/api/resend-webhook` for delivered, bounced, complained, and suppressed events.
8. Confirm the production `RESEND_API_KEY`, `CRON_SECRET`, `STRIPE_CUSTOMER_PORTAL_URL`, all three membership Price IDs, and Stripe webhook signing secret are present.
9. Review Stripe customer email settings using `EMAIL_OPERATIONS.md`: Stripe owns formal receipts and expiring-card notices; overlapping failed-payment and subscription-state emails must be disabled or deliberately differentiated.
10. Set `ACTIVE_MEMBERSHIP_COHORT_ID=founding`, `ACTIVE_MEMBERSHIP_COHORT_LABEL=Founding Cohort`, and `MEMBERSHIP_COHORT_CAPACITY=25` in Vercel Preview and Production. Follow `MEMBERSHIP_COHORT_OPERATIONS.md` to open a later cohort; never advance it automatically.
11. Set `VITE_HOLLY_PUBLIC_PROFILE_APPROVED=true` in Vercel Preview and Production. Holly Beck's approved profile and title are no longer a business blocker.

## Business confirmation gates

- The Dr. Sal event is confirmed for October 24, 2026 in San Diego. Dr. Sulaiman Bharwani and the topic—gut-brain connection, food, stress, and everyday performance—are confirmed. Keep the venue labeled **to be announced** and registration closed until the remaining details are approved.
- Before paid registration opens, confirm actual venue, food/hospitality, filming/production, staffing/faculty, payment fees, and contingency estimates against the approved financial model. The approved ticket price and minimum attendance must cover the planned cash costs without an unnecessary planned loss.
- Do not add a partner benefit until signed value and delivery terms exist.
- Follow `MEMBER_BENEFIT_OPERATIONS.md`; only records that pass its confirmation, visibility, tier, and date gates may appear as current benefits.
- Add a larger member gathering or Journey booking only after separate pricing, deposits, cash coverage, and delivery gates are approved.
- Organize membership in small cohorts of up to 25 unique paid members. Treat 25 as the current operating guideline, not an inviolable contractual limit. Duplicate paid Checkout sessions for the same email or Stripe customer count once. Field and Journey requests do not count. When the configured guideline is reached, the cohort stays closed until ROAMSIX intentionally activates the next cohort through Vercel configuration. Do not add slot reservations or concurrency infrastructure at this stage.

## Final live test

Use Stripe test mode first: complete one Core purchase to a controlled inbox and confirm the member confirmation is delivered, Max and Jackie notifications are delivered, the CRM/member record includes a separate cohort ID and tier, the member magic link is delivered, and billing management opens. Test `invoice.paid`, `invoice.payment_failed`, scheduled cancellation, completed cancellation, and a tier change. Confirm direct Field and Journey checkout URLs are denied without an invitation. Submit requests, record human approval with `npm run membership:approve`, and test secure invitation delivery, valid checkout, expiration, wrong email, wrong tier, and wrong cohort. Force one Resend failure and one bounce to confirm retry and delivery state. Verify that 24 unique completed paid members in the active cohort still allow checkout, duplicates count once, and the 25th unique paid member closes that cohort. Change only the Preview active cohort ID and confirm enrollment opens for the new cohort without moving existing members.

## Ready for preview deployment

- Public positioning, Holly's approved profile, and the confirmed October 24 San Diego event presentation.
- Cohort-aware checkout metadata, cohort-specific capacity, next-cohort interest state, CRM membership records, internal notifications, and member-dashboard cohort display.
- Local automated tests and production build after they pass in the final verification run.

## Still requires production dashboard configuration

- Vercel membership cohort values and `VITE_HOLLY_PUBLIC_PROFILE_APPROVED=true`.
- Airtable operations table provisioning, including `Membership Records`, `Member Benefits`, `Member Benefit Redemptions`, and the new cohort fields on `Membership Approvals`.
- `ROAMSIX_CRM_MEMBER_BENEFITS_TABLE_ID` in Preview and Production. Until it is configured, partner offers intentionally remain unpublished.
- Stripe live Price IDs, Customer Portal, webhook event subscriptions/signing secret, and production restricted API credentials.
- Resend production key, verified sending domain, delivery webhook, and the controlled-inbox delivery test.
- Final Dr. Sal venue, capacity, operating budget, and registration price before paid registration opens.
