# Actual test results — 28 October 2026

## Completed

`npm test`: 19 backend tests passed, 0 failed. Provider HTTP calls were mocked; no real credentials used and no live message sent.

Covered: valid acceptance and message ID requirement, fixed recipient despite supplied To, visitor Reply-To, missing name, malformed email, whitespace message, wrong field type, header injection, honeypot, provider 400/401/402/403/429/500, malformed acceptance, network exception, five-attempt rate limit and expiry, wrong origin, missing credentials, public origin without spam protection, challenge hostname mismatch.

`node --check contact.js`: passed.

Local Node server startup: passed at http://localhost:3000.

Browser automation attempted but blocked: the runtime has Playwright but no Chromium executable. The optional browser-check.cjs script is supplied; its UI assertions have NOT been reported as passed. The design preservation check compares original assets/CSS byte-for-byte; no visual browser QA was completed.

## Complete on your Windows PC

- [ ] Valid submission accepted with real Brevo key and verified sender.
- [ ] Unique test email visible in rushikeshmarathe47@gmail.com (Inbox/Spam/All Mail); correlate provider logs and message ID.
- [ ] Invalid email blocked by browser; missing fields blocked.
- [ ] Whitespace/short message rejected without reset.
- [ ] During Sending…, button disabled; repeated clicking creates only one request.
- [ ] After confirmed provider acceptance, form resets and button restores.
- [ ] Offline browser submission gives network feedback, retains inputs and restores button. Restore network before the next test.
- [ ] A deliberately invalid LOCAL API key produces authentication feedback; restore real key and restart afterward. Do not share either key in chat.
- [ ] Rate limit: after five backend attempts in ten minutes the sixth returns 429. Do not waste live sending quota: run npm test for this scenario instead.
- [ ] Run optional mocked browser script for unexpected response, authentication feedback, duplicate prevention and restoration.
- [ ] In browser View Source and Network, confirm no API key; requests contain visitor fields, not provider credentials. GET /.env, /lib/contact.js, /server.js and /.git/config should be 404 locally.

Live quota exhaustion was not attempted. Live account activation, real authentication, sender verification, public Turnstile and actual delivery remain unverified. Do not deploy until you independently confirm inbox receipt.
