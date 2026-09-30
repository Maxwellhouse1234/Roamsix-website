# Public form security

Every current public lead or checkout form sends `formStartedAt`, an empty `website` honeypot, and a Cloudflare Turnstile token. The API independently verifies the challenge, normalizes and validates common contact fields, scores suspicious text, rate-limits by endpoint/IP and endpoint/IP/email fingerprint, and logs rejected or quarantined submissions as structured JSON.

## Required production configuration

- `VITE_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key, restricted to the production and preview hostnames.
- `TURNSTILE_SECRET_KEY`: matching server-side secret. Production requests fail closed if it is absent.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the equivalent `UPSTASH_REDIS_REST_*` names): shared Redis REST storage for rate limits. Without it, a per-instance in-memory fallback is used.

`FORM_SECURITY_ALLOW_NO_TURNSTILE=true` is only an emergency rollback switch. Do not set it in normal production operation.

## Decisions and recovery

- Invalid challenge, honeypot, impossible timing, malformed contact data, high-confidence malicious payloads, and exceeded limits are rejected.
- Borderline heuristic scores return an accepted-looking `202` response and are quarantined so the sender is not encouraged to retry.
- Logs use events `form_submission_rejected` and `form_submission_quarantined`. They include normalized payload text plus hashed IP/email identifiers, allowing a legitimate lead to be reviewed and recovered from the protected deployment logs. Access to those logs should remain limited because payloads can contain personal information.
- Downstream email templates must continue escaping submitted values. Never insert submission text with `dangerouslySetInnerHTML` or unescaped template interpolation.

## Review checklist before deployment

1. Create/restrict the Turnstile widget and add all production variables.
2. Provision shared Redis rate-limit storage and confirm the REST variables.
3. Confirm log retention and restricted access are sufficient for lead recovery.
4. Run `npm test` and `npm run build`.
5. Verify one legitimate submission and one failed challenge on a preview deployment before promoting it.
