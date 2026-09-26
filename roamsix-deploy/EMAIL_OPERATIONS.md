# ROAMSIX transactional email operations

## Ownership matrix

| Trigger | Event or route | Recipient | Owner | Idempotency source |
| --- | --- | --- | --- | --- |
| Initial paid membership | `checkout.session.completed` or `checkout.session.async_payment_succeeded` | Member | ROAMSIX / Resend | Stripe event + Checkout Session + purpose + recipient |
| New paid member | Same checkout events | Max and Jackie, tracked separately | ROAMSIX / Resend | Stripe event + Checkout Session + purpose + recipient |
| Paid event registration | Same checkout events for an event purchase | Attendee, Max, and Jackie, tracked separately | ROAMSIX / Resend | Stripe event + Checkout Session + purpose + recipient |
| Annual membership renewal | `invoice.paid` with `billing_reason=subscription_cycle` | Member | ROAMSIX / Resend | Stripe event + purpose + recipient |
| Membership payment failure | `invoice.payment_failed` | Member | ROAMSIX / Resend | Stripe event + purpose + recipient |
| Cancellation scheduled | `customer.subscription.updated` when `cancel_at_period_end` changes to `true` | Member | ROAMSIX / Resend | Stripe event + purpose + recipient |
| Membership ended | `customer.subscription.deleted` | Member | ROAMSIX / Resend | Stripe event + purpose + recipient |
| Tier upgrade or downgrade | `customer.subscription.updated` when the membership Price changes | Member | ROAMSIX / Resend | Stripe event + purpose + recipient |
| Renewal-terms reminder | Daily membership cron, approximately 30 days before renewal | Member | ROAMSIX / Resend | Subscription + calendar year + purpose + recipient |
| Field/Journey request | `/api/retreat-interest` | Applicant and Max | ROAMSIX / Resend | Saved request record + purpose + recipient |
| Approved Field/Journey invitation | `/api/send-membership-invite` after human approval | Approved applicant | ROAMSIX / Resend | Approval ID + purpose + recipient |
| Secure member sign-in | `/api/member-auth` | Active member | ROAMSIX / Resend | Immediate request; link expires in 15 minutes and is intentionally not cron-retried |
| Formal payment receipt | Stripe customer email setting | Customer | Stripe | Stripe payment/invoice |
| Expiring-card notice | Stripe customer email setting | Customer | Stripe | Stripe payment method/customer |

ROAMSIX owns membership state and action messages. Stripe should own formal receipts and expiring-card notices. Because ROAMSIX sends payment-failure and cancellation messages, confirm Stripe's overlapping failed-payment and subscription email settings are disabled or deliberately differentiated before launch.

## Durable outbox and retry behavior

Transactional messages are written to the CRM Airtable base before Resend is called. Each record stores purpose, recipient, Stripe event/session references, Resend message ID, attempted time, status, retry count, last error, next retry time, delivery time, and the retry payload.

Resend calls use deterministic idempotency keys. A Stripe retry therefore resumes failed work and skips messages already marked `Sent` or `Delivered`. Failed messages are retried by the existing authenticated daily membership cron, with exponential scheduling metadata and a maximum of five attempts by default. Delivery bounces, complaints, and suppressions set `Needs Attention` and send a separately tracked alert to Max.

Run `npm run email:provision` once with an Airtable token that has schema-management access. This creates `Transactional Emails` and `Membership Approvals` in the CRM base. If existing tables are used instead, set `ROAMSIX_CRM_EMAIL_TABLE_ID` and `ROAMSIX_CRM_APPROVALS_TABLE_ID`.

## Human approval and invitation

Field and Journey approval remains manual. After reviewing an applicant, send an invitation with a unique approval ID:

```text
MEMBERSHIP_APPROVAL_SECRET=... PUBLIC_SITE_URL=https://www.roamsix.com npm run membership:approve -- approval-2026-001 field approved@example.com Max "Approved Person" 168
```

The approval record stores the approver, email, tier, approval time, expiry, signed invitation token, and send state. Reusing the same approval ID is idempotent. An expired invitation requires a new approval ID and another human review; it is never renewed automatically.

## Required production configuration

- `AIRTABLE_TOKEN`
- `ROAMSIX_CRM_BASE_ID` if the default CRM base changes
- `ROAMSIX_CRM_EMAIL_TABLE_ID` and `ROAMSIX_CRM_APPROVALS_TABLE_ID` when table IDs are preferred over names
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MEMBERSHIP_CORE_PRICE_ID`
- `STRIPE_MEMBERSHIP_FIELD_PRICE_ID`
- `STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID`
- `STRIPE_CUSTOMER_PORTAL_URL`
- `CRON_SECRET`
- `MEMBERSHIP_INVITE_SECRET`
- `MEMBERSHIP_APPROVAL_SECRET`
- `PUBLIC_SITE_URL=https://www.roamsix.com`
- Optional: `TRANSACTIONAL_EMAIL_MAX_RETRIES` (defaults to 5)

## Dashboard setup still required

1. Configure the production Stripe webhook at `/api/stripe-webhook` for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
2. Configure the Resend webhook at `/api/resend-webhook` for:
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.suppressed`
3. Confirm Stripe receipts remain enabled if Stripe owns formal receipts.
4. Confirm Stripe expiring-card notices are enabled; ROAMSIX does not duplicate them.
5. Disable or deliberately differentiate Stripe failed-payment and subscription-state emails because ROAMSIX sends those messages.

## Public DNS evidence checked September 25, 2026

- `send.roamsix.com` publishes `v=spf1 include:amazonses.com ~all`.
- `send.roamsix.com` routes mail feedback to `feedback-smtp.us-east-1.amazonses.com`.
- `resend._domainkey.roamsix.com` publishes a DKIM public key.
- The root `roamsix.com` SPF record remains Google Workspace-specific, which is compatible with the separate Resend sending subdomain.

These public records are consistent with Resend authentication. The Resend dashboard's final verified status cannot be proven from DNS alone.
