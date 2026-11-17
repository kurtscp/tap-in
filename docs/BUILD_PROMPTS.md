# Build Prompts — Tap In

## How to use this file

1. Find **your task** below (1–5). Each teammate has one.
2. Copy **only your one prompt block** (the text inside the code fence). Do not copy this whole file.
3. Paste it as-is into your AI chat (ChatGPT, Gemini, Claude, any of them). Your AI cannot see this repo, so the prompt repeats everything it needs.
4. Follow the steps the AI gives you. If it asks a question, answer it.
5. Run the **verification test** in your prompt. Do not move on until it passes.
6. Commit and push your branch:

```text
git clone <repo-url>
cd tap-in
git checkout -b feature/<task>
git add .
git commit -m "Task <n>: <short description>"
git push -u origin feature/<task>
```

Example branch names: `feature/task-1-form`, `feature/task-2-backend`, `feature/task-3-email`, `feature/task-4-scanner`, `feature/task-5-qa`.

**Owner setup (the project owner does this once, before QA runs):** create the Sheet tab `Registrations` with the 10 headers; add the other four as Editors on the Form, Sheet, and Script (no shared passwords); set `SCANNER_PIN` in Apps Script → Project Settings → Script Properties; install the `onFormSubmit` trigger; deploy the web app (Execute as: Me, Anyone); share the QR Drive folder as "Anyone with the link can view"; verify the Gmail send-as alias. QA only checks these items — it never changes them.

## Shared contract

This is what every prompt assumes. Nobody changes it.

```text
Sheet tab: "Registrations". Row 1, columns A-J, exactly:
Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: generated with Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR code contains ONLY the AttendeeID - nothing else, ever.
No paid services. Nobody changes the columns or the QR format.
```

## Task 1 — Registration Form (/form)

```text
You are the Registration Form builder. Goal: collect registrations into the shared Sheet.

CONTRACT (do not change):
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> columns B-E; Timestamp in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes columns or QR format.

Build: a Google Form and its linked Google Sheet. Do NOT build: Apps Script, ID generation, QR, email, scanner, or columns F-J below row 1.
Steps (beginner):
1. Go to forms.google.com -> Blank form. Title it "Tap In Registration".
2. Add questions in this exact order: FullName (Short answer, required), Email (Email, required), Organization (Short answer, required), Contact (Short answer, optional).
3. Click the green Sheets icon (Responses) -> Create a new spreadsheet. Rename the bottom tab to "Registrations".
4. In row 1 type the 10 headers exactly as in the CONTRACT, A through J. Leave F-J empty below row 1.
5. Write a short setup note listing the field order and the Sheet ID for your teammates.
If you are not sure about any step or setting, say "I'm not sure" - never invent a function name, setting, or column.
Verification test: a test entry lands in the Sheet with all fields correct.
Final answer: give me copy-ready files with filenames: /form/README.md (field list + Sheet ID) and a plain list of the 10 headers. Write no code for other tasks.
```

## Task 2 — Unique ID + QR generation (/backend)

```text
You are the Backend builder. Goal: give each new registration a secret ID and a QR image.

CONTRACT (do not change):
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> columns B-E; Timestamp in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes columns or QR format.

Build: Apps Script bound to the Sheet that fills F, G, H on submit, plus checkIn(id, pin) for the scanner. Do NOT build: the Form, email text, scanner page, or anything in columns A-E.
Steps (beginner):
1. In the Sheet click Extensions -> Apps Script. Create files Config.gs and Code.gs.
2. In Config.gs set SHEET_NAME="Registrations", EVENT_TIMEZONE to our local zone, DRIVE_FOLDER_ID to a new folder you create in Drive, and SENDER_ALIAS="PASTE_LATER".
3. Add an installable trigger: clock icon -> Add trigger -> onFormSubmit -> From spreadsheet -> On form submit.
4. On submit: make the ID with Utilities.getUuid(), lowercase it, remove hyphens, check column F for a duplicate, write it as text in F.
5. Make a QR containing ONLY that ID using a small QR library placed in our /backend folder - never a third-party QR website.
6. Save the QR PNG in the Drive folder, set "Anyone with the link can view", and put the link in G (QRUrl).
7. Call the email builder's function exactly as: sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}. Set H from its result.
8. Provide checkIn(id, pin): check PIN against Script Properties key SCANNER_PIN; find the row by F; if I is already true return "already checked in at <time>"; otherwise set I and J only. Never write A-E.
If you are not sure about any step or setting, say "I'm not sure" - never invent a function name, setting, or column.
Verification test: a test submission gets a unique ID and a QR image/URL.
Final answer: copy-ready files with filenames for Config.gs, Code.gs, and the QR library source (name it). Also explain how to set SCANNER_PIN and list the two function names.
```

## Task 3 — Automated email with the QR (/email)

```text
You are the Email builder. Goal: email each attendee their QR from our dummy Gmail address.

CONTRACT (do not change):
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> columns B-E; Timestamp in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes columns or QR format.

Build: the email module and HTML template. Do NOT build: the Form, ID/QR generation, scanner, or Sheet columns. NEVER show the AttendeeID in the email.
Steps (beginner):
1. In your own Gmail: gear -> See all settings -> Accounts -> Send mail as -> Add another email address -> enter the dummy Gmail address -> send verification. Open the dummy inbox and approve the verification link. Only you do this; nobody else needs that account.
2. Add a file Email.gs in the Apps Script project. Confirm the alias is listed by GmailApp.getAliases() and put that address in SENDER_ALIAS.
3. Write sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}. Send with GmailApp.sendEmail(to, subject, text, {from: SENDER_ALIAS, htmlBody, inlineImages with key "qr", name, replyTo}).
4. In the HTML body, reference the inline image using the key "qr". Keep the subject and message in our template file. Include the name and event details, never the ID.
5. Check MailApp.getRemainingDailyQuota() first; if it is 0 return {sent:false}. Catch errors and return {sent:false, error}.
6. Never put the password, the email address, or real attendee data into any file.
If you are not sure about any step or setting, say "I'm not sure" - never invent a function name, setting, or column.
Verification test: the test inbox gets the email quickly with the QR displayed.
Final answer: copy-ready files with filenames for Email.gs and template.html. State the exact function name and its inputs.
```

## Task 4 — Check-in scanner (/scanner)

```text
You are the Scanner builder. Goal: a phone web page that scans a QR and marks that row checked in.

CONTRACT (do not change):
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> columns B-E; Timestamp in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes columns or QR format.

Build: the scanner page plus a doGet() that serves it. Do NOT build: the Form, ID/QR generation, email, or direct Sheet writes from the page. The page sends ONLY the ID and PIN to checkIn(id, pin).
Steps (beginner):
1. Add an HTML file in the Apps Script project; in our repo keep it as /scanner/index.html.
2. Add doGet() in Apps Script using HtmlService so the web app URL opens the page.
3. Deploy: Deploy -> New deployment -> Web app -> Execute as: Me -> Who has access: Anyone. Copy the URL.
4. Open the phone camera with BarcodeDetector. If the browser does not support it, show a clear message to use a supported browser - no paid library.
5. A scan gives only the AttendeeID. Ask the operator for the shared PIN once per session (keep it in session memory, never in source or URL).
6. Call checkIn(id, pin) through google.script.run. Show success with the name; "Already checked in at <time>" for a duplicate; a clear error for unknown ID, wrong PIN, or no connection. Cache nothing offline.
If you are not sure about any step or setting, say "I'm not sure" - never invent a function name, setting, or column.
Verification test: scanning a test QR marks the row "Checked In".
Final answer: copy-ready files with filenames for index.html and doGet.gs (a snippet the Backend owner copies). Write no code for other tasks.
```

## Task 5 — Lead/QA: merging and end-to-end test (/docs)

```text
You are the Lead/QA. Goal: merge everyone's files and run the end-to-end test. You are not the project owner; you only check, never configure.

CONTRACT (do not change):
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> columns B-E; Timestamp in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes columns or QR format.

Build: file merging, testing, and a test log. Do NOT build application code. Do NOT create or configure the Sheet, Script Properties, triggers, deployments, or Drive sharing - the project owner already did those. If a setup item is missing, report it as a finding; do not fix it yourself.
Steps (beginner):
1. Collect Tasks 1-4 and merge their files into /form, /backend, /email, /scanner without renaming files or changing columns.
2. Confirm the owner has already: created the Sheet tab "Registrations" with the 10 headers, added everyone as Editors, set SCANNER_PIN in Script Properties, installed the onFormSubmit trigger, deployed the web app (Execute as: Me, Anyone), and shared the QR Drive folder as "Anyone with the link can view". If any is missing, write a finding and stop.
3. Run this integration test with 3 fake registrations: submit 3 test registrations; confirm 3 emails arrive with a working QR; scan all 3; scan one again and confirm "already checked in". Record pass/fail in the test log, then delete test rows and QR files.
4. Also check: columns A-E unchanged after check-in, duplicate scan does not overwrite the first CheckInTime, no secrets in files, quota enough for expected attendance.
If you are not sure about any step or setting, say "I'm not sure" - never invent a function name, setting, or column.
Verification test: all four stage tests pass and the integration test passes.
Final answer: copy-ready files with filenames for TEST_LOG.md and GO_NO_GO.md. Write no application code.
```

## Integration test (run together at the end)

1. Submit **3 test registrations** with fake names and emails.
2. Confirm **3 emails arrive** quickly, each with a QR that scans correctly.
3. **Scan all 3** QRs. Confirm each row shows CheckedIn = TRUE and a CheckInTime.
4. **Scan one again**. Confirm it says "already checked in" and the first CheckInTime is unchanged.
5. Confirm no other row changed and no column A–E was edited by the script.

## If something breaks

Paste the **exact error message** (or a screenshot description) and the **prompt block you used** back into your AI chat. Say what step you were on and what you expected. Do not guess a fix alone and do not change the columns or the QR format.
