# Build Prompts — Tap In

One guardrail block and one self-contained task prompt per team member. Copy only your own prompt into your AI chat.

**Companion to `SPEC.md`.**

---

## 0. How to use this file

1. Find **your task** in PART B below (Member 1–5). Each member has one.
2. Paste the **A1 Rules Block** into a fresh AI chat first. It is also in `AI_RULES.md`; the two are identical.
3. Copy **only your one prompt block** (the text inside its code fence) and paste it after the Rules Block. Do not copy this whole file, and do not paste another member's prompt.
4. Follow the steps the AI gives you. If it asks a question, answer it; if it says "I'm not sure," that is the correct behavior.
5. Run the **VERIFY** step in your prompt. Do not move on until it passes.
6. The prompt ends at a **CHECKPOINT** — the AI stops and sends the A2 Report. Do not let it continue into other tasks.
7. Write the Z3 handoff note, commit your branch, push it, and open a PR to `main` (see README.md for the exact commands).

> **Already set up by the project owner:** the Form ("Tap In Registration"), the `Registrations` Sheet with its 10 headers, the Apps Script project bound to that Sheet, the `SCANNER_PIN` in Script Properties, the verified Gmail "Send as" alias, and the shared QR Drive folder. Do **not** create or reconfigure any of these in your task — work inside them. The owner installs the `onFormSubmit` trigger and deploys the web app after the code is merged.

**Prompt map**

| Task | Owner | Folder | Prompts |
|---|---|---|---|
| Registration Form | Member 1 | `/form` | B1 task prompt; Z1 debugging; Z2 review; Z3 handoff |
| Backend: ID + QR | Member 2 | `/backend` | B2 task prompt; Z1 debugging; Z2 review; Z3 handoff |
| Email | Member 3 | `/email` | B3 task prompt; Z1 debugging; Z2 review; Z3 handoff |
| Scanner | Member 4 | `/scanner` | B4 task prompt; Z1 debugging; Z2 review; Z3 handoff |
| Lead/QA | Member 5 | `/docs` | B5 task prompt; Z2 review; Z3 handoff |

---

# PART A: GUARDRAILS

## A1 — Rules Block

Paste this first, verbatim, into every fresh AI chat. The same text is in `AI_RULES.md`.

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
BR1. Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.
```

## A2 — Required Report Format

Every AI response at a CHECKPOINT must end with this report. Copy the headings exactly.

```text
REPORT
Plan followed: <brief restatement of the plan you approved>
Changed files: <filenames only — must all be inside OWNED FILES>
Commands / steps run: <what you actually ran or clicked>
Verified: <what you checked, and HOW you checked it>
NOT verified: <anything you could not check, and why>
Rules touched: <which rule IDs from A1 were relevant or constrained your work>
Open questions: <anything you need from the member or project owner; write "none" if none>
```

## A3 — Stop conditions

The AI must **stop and ask** (not guess, not continue) when any of these happens:

1. A requested action would change the Sheet columns, the form field order, the `AttendeeID` rule, or the QR-contains-only-the-ID rule.
2. It is unsure about a function name, API, setting, column, or URL, or whether a Google feature exists — say "I'm not sure."
3. A step needs access it does not have (the dummy Gmail, Script Properties, trigger, deployment, or Drive sharing) — report it as a finding instead.
4. A verification test fails, or it cannot run verification in the environment.
5. It is about to edit a file not in its `OWNED FILES` list.
6. It reaches the `CHECKPOINT` — stop, then send the A2 Report.

## A4 — Ownership map

The canonical table is in `OWNERS.md`; this is the same map.

| Area | Owner | Others may edit? |
|---|---|---|
| `/form` — Form questions and setup notes (the Form itself already exists) | Member 1 | No |
| `/backend` — Config.gs, Code.gs, QR library | Member 2 | No |
| `/email` — Email.gs, template.html | Member 3 | No |
| `/scanner` — index.html, doGet.gs snippet | Member 4 | No |
| `/docs` — SPEC.md, prompts, test log, go/no-go | Member 5 (Lead/QA) | No |
| Form, Sheet, Script container, dummy Gmail, Script Properties (`SCANNER_PIN`), Gmail alias, QR Drive folder | Project owner | No — Members are Editors on files only; only the owner configures settings |
| `onFormSubmit` trigger install (after Member 2's code is merged) | Project owner | No — installable triggers run as the installer |
| Web app deployment (after Member 4's code is merged) | Project owner | No — "Execute as: Me" must be the owner |
| `main` branch merges | Member 5 (Lead/QA) | No — members push branches and open PRs |

---

# PART B: TASK PROMPTS

Each prompt is self-contained: paste A1 first, then one block below.

## B1 — Member 1: Registration Form (`/form`)

**Paste: A1**, then:

```text
TASK
You are Member 1, the Registration Form builder. Goal: configure the questions in the Form that already exists. The Form and its linked Sheet were created by the project owner — do not create them.

OWNED FILES
/form/README.md only. Do not create or edit any other file.

CONTEXT (shared contract — do not change)
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.

STEPS (beginner — where to click)
1. Open the existing Form titled "Tap In Registration" (owned by the project owner; you are an Editor). Do not create a new Form.
2. Add questions in this exact order: FullName (Short answer, required), Email (Email, required), Organization (Short answer, required), Contact (Short answer, optional).
3. In Responses, confirm the Form is linked to the project owner's existing spreadsheet — do NOT click "Create a new spreadsheet". If it is not linked, use the green Sheets icon -> "Select existing spreadsheet" and choose the owner's Sheet.
4. Confirm the Sheet's bottom tab is "Registrations" and row 1 already has the 10 headers A-J. Do not retype or change them. Leave F-J empty below row 1.
5. Write /form/README.md: a short setup note listing the field order and the Sheet ID for teammates, plus a plain list of the 10 headers.
If you are not sure about any step or setting, say "I'm not sure" — never invent a function name, setting, or column.

CONSTRAINTS
Own: the Form's questions and your setup note. Do NOT create the Form, Sheet, Script, Gmail alias, Drive folder, trigger, or deployment — the project owner already did those. Do not build Apps Script, ID generation, QR, email, scanner, or anything in columns F-J below row 1. No secrets, no real attendee data in files.

VERIFY
Submit a test registration. Confirm one new row in the owner's Sheet with Timestamp in A and the four form fields in B-E, and F-J empty. Confirm the question order and required/optional settings.

CHECKPOINT
Stop, then send the A2 Report. Do not continue to another task.
```

## B2 — Member 2: Backend, ID + QR (`/backend`)

**Paste: A1**, then:

```text
TASK
You are Member 2, the Backend builder. Goal: give each new registration a secret ID and a QR image. Write the Apps Script source files in the Script project the project owner already created and bound to the Sheet.

OWNED FILES
/backend/Config.gs, /backend/Code.gs, and the QR library source file in /backend (name it). Do not create or edit any other file.

CONTEXT (shared contract — do not change)
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.

STEPS (beginner — where to click)
1. Open the existing Apps Script project from the Sheet: Extensions -> Apps Script. It already exists — do not create a new one. Add files Config.gs and Code.gs in that project.
2. In Config.gs set SHEET_NAME="Registrations", EVENT_TIMEZONE to the event's local zone, DRIVE_FOLDER_ID to the folder the project owner already created and shared with you, and SENDER_ALIAS="PASTE_LATER" (the real alias is already verified in the owner's Gmail; never hardcode it).
3. Do NOT add the onFormSubmit trigger. The project owner installs it after your code is merged so it runs as the owner (needed for the Gmail alias and quota). Your job is only to provide the onFormSubmit function in Code.gs.
4. On submit: make the ID with Utilities.getUuid(), lowercase it, remove hyphens, check column F for a duplicate, write it as text in F.
5. Make a QR containing ONLY that ID using a small QR library placed in our /backend folder — never a third-party QR website.
6. Save the QR PNG into the Drive folder whose ID the owner gave you (it is already shared "Anyone with the link can view") and put the link in G (QRUrl). Do not change the folder's sharing.
7. Call the email builder's function exactly as: sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}. Set H (EmailSent) from its result.
8. Provide checkIn(id, pin): check PIN against Script Properties key SCANNER_PIN (already set by the owner — read it, never write it into a file); find the row by F; if I is already true return "already checked in at <time>"; otherwise set I and J only. Never write A-E.
If you are not sure about any step or setting, say "I'm not sure" — never invent a function name, setting, or column.

CONSTRAINTS
Own: the Apps Script source files that fill F, G, H on submit plus checkIn(id, pin). Do NOT create the Sheet, Form, Script container, Gmail alias, SCANNER_PIN property, trigger, web app deployment, or Drive folder — the project owner already did those. Do NOT build: email text, scanner page, or anything in columns A-E. PIN stays in Script Properties, never in source or URL. No secrets or real attendee data in files.

VERIFY
A test submission gets a unique ID as text in F and a QR image/URL in G. Decode the QR and confirm it equals exactly the AttendeeID. Confirm A-E are unchanged. Re-run the trigger after the owner installs it (post-merge) and confirm no duplicate row or ID — if you cannot yet, list this as NOT verified in your report.

CHECKPOINT
Stop, then send the A2 Report. In it, list the two function names (sendTicketEmail, checkIn) and confirm SCANNER_PIN is read from Script Properties. Do not continue to another task.
```

## B3 — Member 3: Email (`/email`)

**Paste: A1**, then:

```text
TASK
You are Member 3, the Email builder. Goal: email each attendee their QR from the dummy Gmail address. Write the email module and HTML template; the Gmail alias is already verified by the project owner.

OWNED FILES
/email/Email.gs and /email/template.html. Do not create or edit any other file.

CONTEXT (shared contract — do not change)
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.

STEPS (beginner — where to click)
1. The project owner has already created the dummy Gmail account and verified the "Send as" alias. Do NOT set up, verify, or log into that account. Take the exact alias string from your handoff brief (the owner gives it to you privately).
2. Add a file Email.gs in the existing Apps Script project (owned by the project owner). Confirm the alias is available to the script with GmailApp.getAliases(); keep SENDER_ALIAS = "PASTE_LATER" as a placeholder in the repo — never put the real address in a file. Note: SENDER_ALIAS is defined in Member 2's Config.gs, which you do not own; report the exact alias in your handoff note so the owner can fill it in.
3. Write sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}. Send with GmailApp.sendEmail(to, subject, text, {from: SENDER_ALIAS, htmlBody, inlineImages with key "qr", name, replyTo}).
4. In the HTML body, reference the inline image using the key "qr". Keep the subject and message in /email/template.html. Include the name and event details — never the ID.
5. Check MailApp.getRemainingDailyQuota() first; if it is 0 return {sent:false}. Catch errors and return {sent:false, error}.
6. Never put the password, the email address, or real attendee data into any file.
If you are not sure about any step or setting, say "I'm not sure" — never invent a function name, setting, or column.

CONSTRAINTS
Own: the email module and HTML template files. Do NOT create or configure the Gmail account/alias, the Form, Sheet, Script container, ID/QR generation, scanner, or Sheet columns — the project owner already did the setup. NEVER show the AttendeeID in the email. Quota note: 100 recipients/day (consumer Gmail) or 1,500 (Workspace).

VERIFY
A test inbox gets the email quickly with a scannable QR displayed and template-correct subject/content; EmailSent becomes TRUE. A bad address leaves EmailSent FALSE.

CHECKPOINT
Stop, then send the A2 Report. State the exact function name and its inputs. Do not continue to another task.
```

## B4 — Member 4: Scanner (`/scanner`)

**Paste: A1**, then:

```text
TASK
You are Member 4, the Scanner builder. Goal: a phone web page that scans a QR and marks that row checked in. Write the scanner page and the doGet() snippet; the project owner deploys the web app after your code is merged.

OWNED FILES
/scanner/index.html and the /scanner/doGet.gs snippet. Do not create or edit any other file. (The Backend owner copies the snippet into the existing Apps Script project.)

CONTEXT (shared contract — do not change)
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.

STEPS (beginner — where to click)
1. Add an HTML file in the existing Apps Script project; in our repo keep it as /scanner/index.html. Do not create a new Script project.
2. Add doGet() in Apps Script using HtmlService so the web app URL opens the page. Keep the snippet in /scanner/doGet.gs.
3. Do NOT deploy the web app. The project owner does that after your merge, with Execute as: Me and Who has access: Anyone, so checkIn writes run as the owner. Your deliverable is the snippet plus a one-line note of the exact deployment settings the owner must use.
4. Open the phone camera with BarcodeDetector. If the browser does not support it, show a clear message to use a supported browser — no paid library.
5. A scan gives only the AttendeeID. Ask the operator for the shared PIN once per session (keep it in session memory, never in source or URL). The PIN is already set in Script Properties by the owner.
6. Call checkIn(id, pin) through google.script.run. Show success with the name; "Already checked in at <time>" for a duplicate; a clear error for unknown ID, wrong PIN, or no connection. Cache nothing offline.
If you are not sure about any step or setting, say "I'm not sure" — never invent a function name, setting, or column.

CONSTRAINTS
Own: the scanner page and doGet() that serves it. Do NOT create the Form, Sheet, Script container, Gmail alias, Drive folder, trigger, or web app deployment — the project owner already did or will do those. Do NOT build: ID/QR generation, email, or direct Sheet writes from the page. The page sends ONLY the ID and PIN to checkIn(id, pin). PIN never in source or URL.

VERIFY
Scanning a valid test QR marks the right row CheckedIn=TRUE with a CheckInTime. An unknown/tampered ID is rejected; a duplicate scan shows "already checked in"; no other rows change. Note: the web app is not deployed until after merge — if you cannot run this yet, list it as NOT verified.

CHECKPOINT
Stop, then send the A2 Report. List the function name doGet(). Do not continue to another task.
```

## B5 — Member 5: Lead/QA (`/docs`)

**Paste: A1**, then:

```text
TASK
You are Member 5, the Lead/QA. Goal: merge everyone's files and run the end-to-end test. You are not the project owner; you only check, never configure.

OWNED FILES
/docs/TEST_LOG.md, /docs/GO_NO_GO.md, and /docs/handoff/task-<N>.md notes. Do not create or edit application code.

CONTEXT (shared contract — do not change)
Sheet tab: "Registrations". Row 1, columns A-J, exactly: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR contains ONLY the AttendeeID. No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.

STEPS (beginner — where to click)
1. Collect Tasks 1-4 and merge their files into /form, /backend, /email, /scanner without renaming files or changing columns.
2. Confirm the owner has already: created the Form and the Sheet tab "Registrations" with the 10 headers, bound the Script project, added everyone as Editors, set SCANNER_PIN in Script Properties, verified the Gmail alias, shared the QR Drive folder as "Anyone with the link can view", installed the onFormSubmit trigger (after the backend merge), and deployed the web app (Execute as: Me, Anyone) after the scanner merge. If any is missing, write a finding and stop.
3. Run the integration test (Appendix C) with 3 fake registrations: submit 3 test registrations; confirm 3 emails arrive with a working QR; scan all 3; scan one again and confirm "already checked in". Record pass/fail in /docs/TEST_LOG.md, then delete test rows and QR files.
4. Also check: columns A-E unchanged after check-in, duplicate scan does not overwrite the first CheckInTime, no secrets in files, quota enough for expected attendance.
5. Write /docs/GO_NO_GO.md with the final decision and any findings.
If you are not sure about any step or setting, say "I'm not sure" — never invent a function name, setting, or column.

CONSTRAINTS
Own: file merging, testing, and test logs. Do NOT build application code. Do NOT create or configure the Form, Sheet, Script, Gmail alias, Script Properties, triggers, deployments, or Drive sharing — the project owner already did those. If a setup item is missing, report it as a finding; do not fix it yourself.

VERIFY
All four stage tests pass and the 3-registration integration test passes, with results recorded in TEST_LOG.md.

CHECKPOINT
Stop, then send the A2 Report. Write no application code. Do not continue to another task.
```

---

# ANY TIME PROMPTS

## Z1 — Debugging prompt

Use when something breaks. Paste A1 first, then:

```text
DEBUGGING
Context: I am Member <N> working on task <N> (<folder>). I was on step <step> of my task prompt.
Expected: <what you expected to happen>.
Actual: <the exact error message, or a description of a screenshot — paste exact text>.
Prompt used: <paste the exact task prompt block you used>.
What I already tried: <list, or "nothing yet">.

Help me find the likely cause using Appendix D (Troubleshooting) in BUILD_PROMPTS.md.
Rules: do not guess a fix alone, do not change the Sheet columns or the QR format, and do not edit files outside my OWNED FILES. If you are not sure, say "I'm not sure" and ask. If the cause is a missing setting or access item, tell me to report it to the project owner instead of changing it.
End with: the likely cause, the concrete next step I should take, and which rule IDs apply.
```

## Z2 — Code review prompt for PRs

Use when reviewing a teammate's PR. Paste A1 first, then:

```text
CODE REVIEW
Review the diff for task <N> (<folder>) against SPEC.md's contract and the A1 Rules Block.
Check specifically:
- Sheet columns A-J and their order; form field order; AttendeeID rule (Utilities.getUuid, lowercase, no hyphens, text in F); QR contains only the ID.
- Function names and signatures used exactly: sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}; checkIn(id, pin); doGet().
- Settings SCANNER_PIN, SENDER_ALIAS, EVENT_TIMEZONE are used as specified; no secret or real attendee data in files; no invented API names or URLs.
- Files changed are inside the PR owner's OWNED FILES only.

Output findings as a table: Severity (BLOCKER / SUGGESTION / QUESTION) | File | Line | Finding | Required change.
Rules: a BLOCKER must be fixed before merge. Do not change the code yourself — report findings only. If you are not sure whether something is a violation, say "I'm not sure" and mark it QUESTION. End by stating which rule IDs apply and whether you approve the PR.
```

## Z3 — Handoff note template

Use at the end of your task. Fill this in and save it as `docs/handoff/task-<N>.md`. The empty template also lives in `docs/handoff/README.md`.

```text
# Handoff — Task <N>: <task name>

- Member: Member <N>
- Branch: feature/task-<N>-<slug>
- Folder / files: <folder> — <filenames>
- Date: <YYYY-MM-DD>

## What was built
<one short paragraph>

## How to verify
<the exact steps the next member or reviewer should run>

## Contract checks
- [ ] Columns A-J and order unchanged
- [ ] Form field order / AttendeeID rule / QR-only-ID rule respected (as applicable to this task)
- [ ] Function names and signatures exact (if this task defines them)
- [ ] SCANNER_PIN / SENDER_ALIAS / EVENT_TIMEZONE handled as specified (if applicable)
- [ ] No secrets or real attendee data in files

## Setup items needed from the project owner
<list, or "none"> — report missing items; do not change them yourself.

## Known issues / NOT verified
<list, or "none">

## A2 Report
<paste the full A2 Report from your AI here>
---

# APPENDICES

## Appendix A — Shared contract (single source of truth)

Every prompt's CONTEXT block must match this text exactly. Nobody changes it.

```text
Sheet tab: "Registrations". Row 1, columns A-J, exactly:
Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime
Form questions asked in this order: FullName, Email, Organization, Contact -> responses land in columns B-E; Timestamp is in A.
AttendeeID: generated with Utilities.getUuid(), lowercase, hyphens removed, plain text in column F. Unique, not guessable, not the email, never Math.random().
QR code contains ONLY the AttendeeID — nothing else, ever.
No paid services. Nobody changes the columns or the QR format.
Brand: name "Tap In", accent color #4F46E5, font Montserrat, logo file "none yet". Applies only to scanner page header + page title, email template header, and Form theme; QR image stays plain (no logo overlay); no lockups and no app icons.
```

Function names and signatures (exact, do not rename or reshape):

```text
sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}
checkIn(id, pin)
doGet()
```

Settings (exact names): `SCANNER_PIN` (Script Properties), `SENDER_ALIAS`, `EVENT_TIMEZONE`.

## Appendix B — Sheet columns (tab `Registrations`)

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime |

| Column | Owner | Format / notes |
|---|---|---|
| Timestamp | Form | Date-time. |
| FullName | Form | Text. |
| Email | Form | Text; delivery target. |
| Organization | Form | Text. |
| Contact | Form | Phone as **plain text** to preserve leading zeros; optional. |
| AttendeeID | Script | Unique, non-guessable **text** (see Appendix A). |
| QRUrl | Script | Shareable link to the QR PNG in Drive. |
| EmailSent | Script | Checkbox (TRUE/FALSE). |
| CheckedIn | Scanner | Checkbox (TRUE/FALSE). |
| CheckInTime | Scanner | Date-time; blank until check-in. |

`AttendeeID` is the only join key between QR and row. Columns A-E are Form-owned; F-J are script-owned.

## Appendix C — Integration test matrix

The four stage tests (run at each task's VERIFY) plus the end-to-end test (Member 5).

| ID | Area | Test | Must |
|---|---|---|---|
| S1 | Form → Sheet | Submit a test response; one new row with correct B-E + Timestamp in A, F-J empty; check required/format validation. | Pass before Task 1 is done |
| S2 | Script (ID + QR) | Unique, non-guessable AttendeeID as text in F and a QRUrl in G; decode QR and confirm it equals exactly the AttendeeID; re-run trigger and confirm no duplicate row/ID. | Pass before Task 2 is done |
| S3 | Email | Email arrives with a scannable QR and template-correct subject/content; EmailSent becomes TRUE; bad address leaves EmailSent FALSE. | Pass before Task 3 is done |
| S4 | Scanner → Sheet | Valid QR marks the right row CheckedIn=TRUE + CheckInTime; unknown/tampered ID rejected; same QR twice warns "already checked in"; no other rows changed. | Pass before Task 4 is done |
| E2E | All | Submit 3 test registrations; confirm 3 emails arrive with a working QR; scan all 3; scan one again and confirm "already checked in" with first CheckInTime unchanged; confirm A-E unchanged and no other row changed. Delete test rows and QR files afterward. | Pass before GO |

Quota context: 100 recipients/day (consumer Gmail) or 1,500 (Workspace); check with `MailApp.getRemainingDailyQuota()`.

## Appendix D — Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Trigger not firing (`onFormSubmit` never runs) | Installable trigger missing, wrong event ("On form submit" not selected), or script bound to the wrong Sheet. | In Apps Script check clock icon → Triggers → `onFormSubmit` → From spreadsheet → On form submit. Rebind to the correct Sheet. Owner configures; member reports as finding. |
| Email not sending / alias not verified | The dummy Gmail send-as address was not verified, or `SENDER_ALIAS` does not match a verified alias. | Owner completes Gmail "Send mail as" verification and approves the link in the dummy inbox; confirm with `GmailApp.getAliases()` and set `SENDER_ALIAS` to that exact address. |
| Quota exhausted (email fails, `getRemainingDailyQuota()` is 0) | 100/day consumer Gmail or 1,500/day Workspace limit reached. | Check `MailApp.getRemainingDailyQuota()`; stop bulk sending until the quota resets, or confirm the account is Workspace. Do not add a paid service. |
| QR image not showing in email | Inline image key `"qr"` in `htmlBody` does not match the `inlineImages` key, or the QR blob was not passed. | Ensure the HTML references `cid:qr` / the key `"qr"` and that `sendTicketEmail` receives `qrBlob` with `inlineImages` key `"qr"`. |
| Camera blocked on the scanner page | Browser lacks `BarcodeDetector`, or camera permission was denied / page is not HTTPS. | Use a supported browser, allow camera permission, and serve over HTTPS. Show a clear "use a supported browser" message when unsupported. |
| Web app deployed with the wrong access setting | Deployment uses "Execute as: User" or a restricted access level, so the page or `checkIn` fails for operators. | Owner redeploys: Deploy → New deployment → Web app → Execute as: **Me** → Who has access: **Anyone**. Do not change this in member code. |
