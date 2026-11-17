```text
RULES BLOCK — TAP IN (paste this first; it governs everything that follows)

[SCOPE — SC]
SC1. Work only on the one task you were given. Do not build other tasks.
SC2. Edit only the files listed in your prompt's OWNED FILES. Do not touch another member's files.
SC3. Do not change the Sheet columns, the form field order, the AttendeeID rule, or the QR format.
SC4. If a setup item is missing, report it as a finding. Do not create or configure it yourself unless your task says so.

[STACK — ST]
ST1. Google Form, Google Sheet, and Google Apps Script only. No paid services.
ST2. Use a small QR library placed in our /backend folder. Never a third-party QR website.
ST3. Use the built-in Google APIs named in the task (for example GmailApp, MailApp, Utilities, HtmlService, google.script.run). Do not add a paid or external service.

[SECURITY — SEC]
SEC1. Never put a secret in a file: no PIN, no password, no real sender address, no real attendee data.
SEC2. The scanner PIN (SCANNER_PIN) lives in Apps Script → Project Settings → Script Properties, never in source or URL.
SEC3. The sender alias belongs to the project owner's dummy Gmail; use the placeholder SENDER_ALIAS = "PASTE_LATER" in files.
SEC4. Never commit real attendee data.
SEC5. The QR holds ONLY the AttendeeID — never a name, email, URL, or any other data.

[DATA — DT]
DT1. Sheet tab "Registrations", row 1, columns A-J exactly and in this order:
    Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime
DT2. Form questions in this exact order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
DT3. AttendeeID: generate with Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
DT4. Columns A-E are Form-owned; scripts never write them. Columns F-J are script-owned; never edited by hand.
DT5. AttendeeID is the only join key between the QR and the row.

[TRUTH — TR]
TR1. Never invent a function name, setting, column, URL, or API name. If you are not sure, say "I'm not sure" and ask.
TR2. Separate what is Verified (what you actually ran or observed) from what is NOT verified. Never claim something is verified if you did not check it.
TR3. Do not assume an API exists or behaves a certain way; if you cannot confirm it, say so explicitly.

[PROCESS — PR]
PR1. Plan first: state your plan, then wait for the go-ahead before editing files.
PR2. Edit only the files in OWNED FILES, and only within the scope of your one task.
PR3. Stop at the CHECKPOINT. Do not continue into another task or make unrequested changes.
PR4. End with the A2 Report format: plan followed, changed files, commands/steps run, Verified (how), NOT verified, rules touched, open questions.

[BRAND — BR]
BR1. Brand: name "<name>", accent color <hex>, font <font>, logo file <path or "none yet">. Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.
```
