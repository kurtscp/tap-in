# Handoff — Task 3: Email

- Member: Member 3
- Branch: feature/task-3-email
- Folder / files: /email — /email/Email.gs, /email/template.html
- Date: 2026-11-27

## What was built
Implemented the email module (`/email/Email.gs`) and branded HTML email template (`/email/template.html`). Provides `sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}` which checks daily quota with `MailApp.getRemainingDailyQuota()`, renders the ticket template with Tap In branding (`#4F46E5`, `Montserrat`), embeds the QR image inline using key `"qr"` (`cid:qr`), and dispatches via `GmailApp.sendEmail`. The AttendeeID is strictly omitted from the email body and subject line to prevent PII/ID leakage.

## How to verify
1. In the bound Apps Script project, ensure `Email.gs` and `template.html` are present in the script editor.
2. In the Apps Script console, call `getAvailableAliases()` to confirm the project owner's verified "Send as" alias is visible.
3. Call `sendTicketEmail` with a test recipient, name, dummy AttendeeID, and a test PNG blob:
   ```javascript
   const testBlob = Utilities.newBlob("dummy png content", "image/png", "test.png");
   const res = sendTicketEmail({
     to: "test@example.com",
     fullName: "Test Attendee",
     attendeeId: "test-id-123",
     qrBlob: testBlob,
     qrUrl: "https://drive.google.com/..."
   });
   Logger.log(res);
   ```
4. Verify the test inbox receives the email with the inline QR image displayed, subject "Your Tap In Event Ticket", and confirm `test-id-123` does NOT appear anywhere in the email body or subject.
5. Test with an invalid recipient or quota 0 to verify `{sent: false, error}` is returned and handled gracefully by `onFormSubmit` in `backend/Code.gs`.

## Contract checks
- [x] Columns A-J and order unchanged
- [x] Form field order / AttendeeID rule / QR-only-ID rule respected (as applicable to this task)
- [x] Function names and signatures exact (sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error})
- [x] SCANNER_PIN / SENDER_ALIAS / EVENT_TIMEZONE handled as specified (SENDER_ALIAS = "PASTE_LATER" placeholder preserved)
- [x] No secrets or real attendee data in files

## Setup items needed from the project owner
- Once code is merged, replace `SENDER_ALIAS = "PASTE_LATER"` in `Config.gs` with the exact verified dummy Gmail "Send as" alias address.

## Known issues / NOT verified
- Live dispatch via the project owner's verified Gmail alias (requires post-merge execution in the owner's environment).

## A2 Report
REPORT
Plan followed: Implemented Task 3 (Member 3: Email) by creating email/template.html and email/Email.gs conforming to the exact function contract sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}, enforcing brand guidelines (#4F46E5, Montserrat, Tap In), embedding the inline QR code via cid:qr with key "qr", checking MailApp.getRemainingDailyQuota(), respecting placeholder SENDER_ALIAS = "PASTE_LATER", and ensuring zero AttendeeID leakage in email content.
Changed files: email/Email.gs, email/template.html
Commands / steps run:
1. Created email/template.html with responsive layout, Montserrat font, #4F46E5 accent, inline image cid:qr, and recipient name greeting.
2. Created email/Email.gs with sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) and helper functions.
3. Verified syntax of email/Email.gs using Node.js runtime parser.
4. Scanned email/template.html for AttendeeID or secret leakage (confirmed zero occurrences).
5. Checked git status to verify only OWNED FILES were created.
Verified:
- Exact function signature: sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}.
- Quota check: checks MailApp.getRemainingDailyQuota() before attempting dispatch; returns {sent: false, error: "Daily email quota reached"} if quota <= 0.
- Inline image contract: HTML template references <img class="qr-image" src="cid:qr" ... /> matching inlineImages: { qr: params.qrBlob }.
- Brand rules (BR1): name "Tap In", accent color #4F46E5, font Montserrat, wordmark only (no logo overlay), plain QR display.
- Security constraints (SEC1, SEC3, SEC4, SEC5): No secrets or real attendee data in files; SENDER_ALIAS = "PASTE_LATER" placeholder respected; AttendeeID is strictly excluded from email subject, HTML template, and plain-text fallback.
- Error handling: catches errors and returns {sent: false, error} so backend/Code.gs sets EmailSent (column H) to FALSE on failure.
- Syntax: validated email/Email.gs cleanly in Node.js.
NOT verified:
- Live email dispatch and quota decrement in Google Apps Script runtime (requires execution in the bound Apps Script container with authenticated Google credentials).
- Live verification of the dummy Gmail "Send as" alias via GmailApp.getAliases() (configured in Script Properties / Gmail by the project owner post-merge).
Rules touched: SC1, SC2, SC3, ST1, ST3, SEC1, SEC3, SEC4, SEC5, DT1, DT4, TR1, TR2, PR1, PR2, PR3, PR4, BR1.
Open questions: none