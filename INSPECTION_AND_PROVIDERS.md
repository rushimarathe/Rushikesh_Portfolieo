# Inspection and provider decision — checked 28 October 2026

## Confirmed findings

The ZIP contains index.html (35,517 bytes), style.css (44,013 bytes), bg.png, two images, a resume PDF under assets/, and a .git directory. The main page contains inline animation/navigation JavaScript and a contact handler. External fonts/icons/Typed.js are existing dependencies. No backend, package.json, .env, vercel.json or runtime logs were supplied. Originally it was a static site; email depended on a remote form service.

The old form sends POST to the previous service with a credential under the field name `Portfolio Contact Form`, rather than the required `access_key`. This is a concrete malformed request/configuration finding, not evidence of an invalid key. The hidden value also has a trailing newline. There is no access_key field in the submitted form. No provider response, account access or deployment logs were supplied, so the actual historical server response, key validity, recipient setup, quota and delivery outcome cannot be established. The previous success text also claimed sending without delivery evidence. That handler and endpoint have been removed.

## Alternatives (official documentation)

| Provider | Permanent free sending allowance | Submissions vs notifications | Verification and suitability |
| --- | --- | --- | --- |
| Brevo (selected) | 300 sends/day; resets daily, no rollover; permanent free plan, no credit card | API quota counts sends, not web form submissions. This project requests one notification per accepted form. No guaranteed delivered-email count. | Verify account and sender; transactional sending must be enabled. Free mailbox sender may be rewritten; authenticated custom domain recommended. Backend API key required. |
| Resend | Free $0 plan: 3,000 emails/month, max 100/day | Email sends, not hosted form submissions or guaranteed inbox delivery | Backend key; own domain verification for general sending. Testing domain is restricted to account owner's email and intended for testing. A viable alternative if a domain is available. Credit-card requirement not independently established from the cited pricing page. |

Both services support transactional email; neither is a hosted contact-form submission quota here. Brevo is chosen for its explicitly documented permanent no-card plan and larger daily allowance, with sender verification suitable for local setup. Neither can be verified to GUARANTEE 100 successfully delivered notifications: receiving-server rejection, spam filtering, account review and quota consumption remain possible. Brevo provides sufficient free send capacity, conditional on activation and successful delivery tests. No purchased domain is assumed.

Brevo free daily quota is separate from API throughput: its documented general POST /v3/smtp/email API limit is 1,000 requests/second and 3,600,000/hour; this does not increase the 300 free sends/day. Brevo says excess transactional messages may enter a retry queue up to 1,000, beyond which they are not delivered. Do not interpret request acceptance or queuing as inbox receipt. This project does not send visitor auto-replies (which would consume additional sends).

## Official sources

- Brevo free plan duration, daily quota, rollover and queue behavior: https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- Brevo free plan, no card and transactional inclusion: https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- Transactional API fields, api-key authentication and 201 messageId response: https://developers.brevo.com/reference/send-transac-email
- API throughput limits: https://developers.brevo.com/docs/api-limits
- Sender creation/verification: https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email
- Free sender rewriting: https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-Domain-authentication
- Resend pricing: https://resend.com/pricing
- Resend testing restrictions: https://resend.com/docs/knowledge-base/403-error-resend-dev-domain

Provider terms can change. Check the account dashboard's effective quota and activation status before relying on sending capacity.
