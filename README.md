# Rushikesh portfolio — local contact email repair

## Start here on Windows

1. Install Node.js 22 or newer from https://nodejs.org and VS Code. Restart VS Code after installation. Open this extracted project folder (the folder containing package.json).
2. Create a free Brevo account at https://www.brevo.com. Verify your account email and complete any account/transactional sending activation requested. No private credentials need to be shared in chat.
3. In Brevo: Settings > Senders, Domains, IPs > Senders > Add a sender. Add an email address you control and complete the emailed verification code. Use that address in BREVO_SENDER_EMAIL. You may try your Gmail address locally; Brevo may replace its sending domain with a compliant Brevo domain. An authenticated custom domain is recommended for reliable long-term sending. Gmail domains cannot be authenticated by you. Account approval and sending permissions must be confirmed in your dashboard.
4. In Brevo's SMTP & API / API Keys settings, create a private API key (not an SMTP password). Store it only on your computer.
5. Open VS Code Terminal > New Terminal. Run these PowerShell commands:

```powershell
node --version
Copy-Item .env.example .env
code .env
```

Replace the first two placeholder values in .env with your Brevo API key and verified sender address. Leave SITE_ORIGIN=http://localhost:3000. Leave Turnstile keys blank for local-only testing. Save the file.

```powershell
npm start
```

No npm install is necessary: the application uses only Node built-ins. The frontend and backend run together. Open **http://localhost:3000** exactly. Do not open index.html directly or use VS Code Live Server on another port. Stop with Ctrl+C. Restart after editing .env.

6. Fill all four contact fields. Use a unique subject such as `Local test 2026-10-28 01` and a message of at least 10 characters. Submit once. The button should show Sending… and disable temporarily. Acceptance resets the form; errors preserve your entries.
7. In Brevo, open Transactional > Email > Logs, find the recipient rushikeshmarathe47@gmail.com and your unique subject/time. Check whether the message is sent, delivered, deferred, blocked or bounced. Record its message ID and status. Provider acceptance alone is not delivery. Delivered normally means the receiving mail server accepted it, not proof of inbox placement.
8. Sign in to rushikeshmarathe47@gmail.com and inspect Inbox, Spam/Junk, All Mail and search for the unique subject. Only mark the live test complete when you actually see the message. Reply should target the visitor's address.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| npm start reports missing .env | Copy .env.example to .env; confirm Windows did not name it .env.txt. |
| node/npm not recognized | Install Node and restart VS Code. |
| EADDRINUSE | Stop the other server using port 3000; keep this project's local port/origin together. |
| Origin not allowed | Open http://localhost:3000 exactly; check SITE_ORIGIN and restart. |
| Email not configured (503) | Replace API key and sender placeholders; restart. |
| Authentication failed (502) | Use an active Brevo API key, not an SMTP key; check IP authorization restrictions if enabled. |
| Provider denied / rejected (502) | Verify sender, account activation, permissions and available sending credits in Brevo; consult transactional logs. |
| Quota/provider limit (503) | Check daily credits and provider logs; wait for reset. Do not repeatedly submit. |
| Too many attempts (429) | Wait 10 minutes; restarting the local server also resets the local counter. |
| Network/timeout (504) | Check internet/firewall and Brevo status. A timeout can happen after acceptance; check logs/inbox before resubmitting. |
| Unexpected response | Confirm the Node backend is running, not a static file server; check logs before retrying. |
| Accepted but no email | Check Logs for bounce/block/deferral, sender setup and Spam/All Mail. Acceptance is not a guarantee. |

Errors intentionally omit raw provider payloads, keys and visitor message content. Authentication, verification, quota, connection and unexpected-response failures remain distinct. The backend does not log message bodies or credentials.

## Architecture and abuse protection

Browser -> same-origin /api/contact -> Brevo transactional HTTPS API -> fixed Gmail recipient. The visitor email is Reply-To, never From or To. Text-only mail prevents HTML injection. Server validation bounds all fields, rejects blank inputs/header newlines and invalid addresses. Origin checks, a hidden honeypot, 24 KB body cap, 12-second provider timeout and five attempts per IP per 10 minutes protect local testing. Browser requests disable the button and reject simultaneous submit events. No automatic retries are performed because ambiguous failures can already have sent mail.

The local server listens on loopback only and serves an explicit asset allowlist: .env, backend code, tests and Git metadata cannot be downloaded. Private keys never enter public HTML or JavaScript. /api/config exposes only the optional public Turnstile site key.

Public origins fail closed unless both Turnstile keys are configured. Token validation checks success and the expected hostname. The process-local IP limiter resets on restart and is not a shared global limit across serverless instances; Turnstile is the additional public-site abuse barrier. Before any future public launch, assess traffic and configure shared rate limiting/platform firewall rules if stronger quota protection is needed. Tokens and honeypots do not guarantee that all spam will be blocked.

## Verification

Run `npm test` for dependency-free backend tests. See TEST_RESULTS.md for executed results and your remaining live checklist. Optional browser regression script: install Playwright temporarily with `npm install --no-save playwright`, run `npx playwright install chromium`, start the local server in another terminal, then `node tests/browser-check.cjs`. This script intercepts email requests with mock responses: it never proves delivery. Do not commit node_modules or credentials.

## File map and backup

index.html preserves the original content and classes; style.css, images, background and resume are unchanged. contact.js contains the new frontend handler; lib/contact.js is the shared backend; server.js runs both locally; api/ contains small serverless adapters for future use. There were no backend, dependencies, README, environment configuration or deployment configuration in the supplied working tree.

The uploaded original ZIP remains your backup. An untouched extracted copy was also made before editing in the working session. The final ZIP excludes .git history, real .env files and old provider credentials/handlers. Keep the original ZIP privately; do not upload its obsolete integration key/history to a new repository.

## Deployment is intentionally deferred

Nothing has been deployed and no Vercel project was created. This project includes serverless adapters, but deployment instructions and production configuration review are deferred until you confirm the local test message arrived in your inbox. Do not deploy the repository root as an unrestricted static directory: private backend files must remain server-side. After inbox confirmation, request the GitHub/Vercel deployment steps, production environment setup, public Turnstile configuration and live verification checklist.
