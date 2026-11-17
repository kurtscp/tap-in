# Tap In — Product Specification

This is the product contract for Tap In. It is the single source of truth for the data model and behavior; `docs/BUILD_PROMPTS.md` and the task prompts must match it.

---

## 1. Product overview

| Field | Value |
|---|---|
| Tagline | Event registration with QR check-in — built entirely on Google's free tier. |
| Problem | Events need a low-cost way to register attendees, deliver a scannable ticket, and check people in at the door without exposing personal data or paying for services. |
| Solution | A Google Form collects registrations into a Sheet; Apps Script assigns a secret `AttendeeID`, renders a QR, and emails it; a phone web scanner checks attendees in by writing back to the Sheet. |
| Users | Attendees registering and receiving a ticket, organizers monitoring status, and check-in operators scanning at the door. |
| Core promise | Attendee PII stays in the Sheet; the QR carries only an opaque ID. No paid services. |
| Scope boundary | One event per spreadsheet. No payments, no analytics, no accounts for attendees, no third-party QR services, and no real attendee data in this repo. |

**Goals**

- Collect registrations with a simple Google Form, in a fixed field order.
- Give every registration a unique, non-guessable `AttendeeID` stored as text.
- Email each attendee a QR containing only that `AttendeeID`.
- Let operators check attendees in from a phone with a web scanner.
- Keep the system on the Google free tier and keep secrets out of files.

**Non-goals**

- Paid services or paid QR/email providers.
- Exposing attendee PII in the QR, the email body, or the repo.
- Attendee accounts, login, or self-service status pages.
- Multi-event management in a single spreadsheet (copy the Sheet + script for the next event).
- Offline scanning or cached writes (connectivity is assumed).

**Success criteria**

| # | Criterion | How it is checked |
|---|---|---|
| 1 | Registrations land in the Sheet with the exact 10 headers and field order. | S1 stage test (Appendix C of BUILD_PROMPTS). |
| 2 | Every registration gets a unique `AttendeeID` as text in F and a QRUrl in G. | S2 stage test; decode QR and compare to the ID. |
| 3 | Attendees receive a scannable QR email; EmailSent becomes TRUE. | S3 stage test. |
| 4 | Scanning checks in the right row and writes only I-J; duplicates are rejected. | S4 stage test; duplicate scan shows "already checked in". |
| 5 | No secret or real attendee data is committed; no paid service is used. | QA file review and PR review (Z2). |
| 6 | End-to-end run with 3 fake registrations passes. | E2E integration test (Appendix C). |

---

## 2. Users and roles

| Capability | Attendee | Organizer | Check-in operator |
|---|---|---|---|
| Submits the registration Form | Yes | — | — |
| Receives a QR ticket by email | Yes | — | — |
| Views registration status / Sheet | No | Yes (Editor on the Sheet) | No |
| Scans QRs and checks attendees in | No | May, if acting as operator | Yes |
| Enters the shared `SCANNER_PIN` at check-in | No | — | Yes |
| Configures settings (Script Properties, alias, triggers, deployment) | No | No — project owner only | No |

The **project owner** is a separate role that owns the Form, Sheet, Script, and dummy Gmail and configures all shared settings. Team members are Editors on the files, not owners.

---

## 3. Feature scope

| ID | Feature | Notes |
|---|---|---|
| F1 | Registration Form with fixed field order | FullName, Email, Organization, Contact → columns B-E; Timestamp in A. |
| F2 | Sheet storage tab `Registrations` | 10 columns A-J; A-E form-owned, F-J script-owned. |
| F3 | `AttendeeID` generation | `Utilities.getUuid()`, lowercase, hyphens removed, text in F. |
| F4 | QR rendering and hosting | QR holds only the ID; PNG stored in a Drive folder shared as "Anyone with the link can view"; link in G. |
| F5 | Automated ticket email | `GmailApp` from a verified "Send as" alias; QR as inline image; EmailSent in H. |
| F6 | Check-in web scanner | Served by `doGet()`; `BarcodeDetector`; sends only ID + PIN to `checkIn(id, pin)`; writes I-J. |
| F7 | PIN protection | `SCANNER_PIN` in Script Properties, checked before writing; held in page session, never in source or URL. |
| F8 | Duplicate-scan protection | Reject with "Already checked in at <time>"; never overwrite the first check-in. |
| F9 | Testing and QA | Four stage tests plus a 3-registration end-to-end test; TEST_LOG.md and GO_NO_GO.md. |

---

## 4. User stories with acceptance criteria

Grouped by task (member).

### Task 1 — Registration Form (Member 1)

**Story:** As an attendee, I want to register with a short form so that I receive a ticket.
- **AC1:** The Form is titled "Tap In Registration" with questions in order FullName (required), Email (required), Organization (required), Contact (optional).
- **AC2:** Responses land in a Sheet tab `Registrations` with Timestamp in A and the four fields in B-E.
- **AC3:** Columns F-J below row 1 are left empty by the Form.

### Task 2 — Backend: ID + QR (Member 2)

**Story:** As the system, I want to give each registration a secret ID and QR so that tickets cannot be guessed or forged.
- **AC1:** On submit, `AttendeeID` is generated with `Utilities.getUuid()`, lowercased, hyphens removed, checked against column F for collisions, and written as text in F.
- **AC2:** A QR containing only the `AttendeeID` is saved to the Drive folder with "Anyone with the link can view" and its link written to G (QRUrl).
- **AC3:** The email function is called exactly as `sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}` and H (EmailSent) is set from its result.
- **AC4:** `checkIn(id, pin)` checks the PIN against Script Properties `SCANNER_PIN`, finds the row by F, rejects an already-checked-in row with "already checked in at <time>", otherwise sets I and J only. It never writes A-E.
- **AC5:** The installable trigger `onFormSubmit` runs "From spreadsheet → On form submit".

### Task 3 — Email (Member 3)

**Story:** As an attendee, I want an email with my QR so that I can present it at the door.
- **AC1:** `sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}` sends via `GmailApp.sendEmail` with `from: SENDER_ALIAS`, an `htmlBody` referencing inline image key `"qr"`, name, and replyTo.
- **AC2:** The email contains the name and event details but never the `AttendeeID`.
- **AC3:** The alias is verified and listed by `GmailApp.getAliases()`; the real address is not in any file (use `SENDER_ALIAS = "PASTE_LATER"`).
- **AC4:** The function checks `MailApp.getRemainingDailyQuota()` first (returns `{sent:false}` if 0) and catches errors, returning `{sent:false, error}`.
- **AC5:** On success EmailSent becomes TRUE; a bad address leaves it FALSE.

### Task 4 — Scanner (Member 4)

**Story:** As an operator, I want to scan a QR on my phone so that the attendee is checked in quickly and safely.
- **AC1:** `doGet()` serves the scanner page via `HtmlService`.
- **AC2:** The page uses `BarcodeDetector` and shows a clear "use a supported browser" message when unavailable; no paid library.
- **AC3:** A scan yields only the `AttendeeID`; the operator enters `SCANNER_PIN` once per session (kept in session memory, never in source or URL).
- **AC4:** The page calls `checkIn(id, pin)` via `google.script.run` and shows success with the name, "Already checked in at <time>" for duplicates, and a clear error for unknown ID, wrong PIN, or no connection. Nothing is cached offline.
- **AC5:** The web app is deployed with Execute as: Me, Who has access: Anyone (owner configures).

### Task 5 — Lead/QA (Member 5)

**Story:** As the lead, I want merged files and a passing end-to-end test so that we can make a go/no-go decision.
- **AC1:** Files from Tasks 1-4 are merged into their folders without renaming or column changes.
- **AC2:** Owner setup items are verified as present; any missing item is a finding, not a self-fix.
- **AC3:** The four stage tests and the 3-registration integration test pass and are recorded in TEST_LOG.md.
- **AC4:** GO_NO_GO.md states the final decision with any findings.
- **AC5:** No application code is written by QA.

---

## 5. Core user flows

1. **Attendee registers:** Attendee fills the Form in order → response appends a row to `Registrations` with Timestamp in A and fields in B-E → `onFormSubmit` trigger fires → script generates `AttendeeID`, builds the QR, writes F-H, and emails the QR → attendee receives the email with the scannable QR.
2. **Organizer checks status:** Organizer opens the Sheet → reads EmailSent / CheckedIn checkboxes and CheckInTime in H-J → no script writes A-E and no manual edits to F-J.
3. **Operator scans:** Operator opens the web app URL → enters `SCANNER_PIN` once per session → scans a QR → page sends only the ID and PIN to `checkIn(id, pin)` → script verifies PIN, finds the row by F, sets CheckedIn and CheckInTime → success shown with the name.
4. **Duplicate scan:** The same QR is scanned again → `checkIn` sees I already TRUE → returns "Already checked in at <time>" → first check-in is never overwritten; a clear duplicate message is shown.
5. **Session of the event day:** Owner completes setup once (Sheet tab, Editors, Script Properties, trigger, web app deployment, Drive sharing, Gmail alias) → attendees register and receive tickets → operators scan through the day → organizer monitors status in the Sheet → at close QA records results and the go/no-go decision. No offline caching; connectivity is assumed.

---

## 6. Data model

### 6.1 Sheet columns (tab `Registrations`)

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
| AttendeeID | Script | Unique, non-guessable **text** (see §6.2). |
| QRUrl | Script | Shareable link to the QR PNG in Drive (see §6.4). |
| EmailSent | Script | Checkbox (TRUE/FALSE). |
| CheckedIn | Scanner | Checkbox (TRUE/FALSE). |
| CheckInTime | Scanner | Date-time; blank until check-in. |

`AttendeeID` is the only join key between QR and row. Columns A-E are Form-owned (never written by scripts); columns F-J are script-owned (never edited by hand).

### 6.2 ID rules

- Use `Utilities.getUuid()` (v4, ~122 random bits) — never `Math.random()`, emails, or counters.
- Store as plain text; strip hyphens to a canonical lowercase form before comparing.
- Check column F for a collision before writing; regenerate if found.
- Treat the ID as a secret: possession = authority to check in, so it must not be derivable from public data.
- The ID is never shown in the email body.

### 6.3 QR rules

- Encodes **only the `AttendeeID`** string — no name, email, or URL.
- `QRUrl` links to the rendered PNG emailed to the attendee; scanning yields the ID, which the scanner resolves to a row. No PII is exposed by the code itself.

### 6.4 Drive storage

The QR PNG is saved by the script to a dedicated Drive folder shared as "Anyone with the link can view"; the link is stored in `QRUrl` (G). The QR reveals only an opaque ID, so public read access is safe.

---

## 7. Technical architecture

### 7.1 Stack

| Layer | Technology |
|---|---|
| Form | Google Forms |
| Data store | Google Sheets (tab `Registrations`) |
| Backend | Google Apps Script (`.gs`) |
| ID | `Utilities.getUuid()` |
| QR | Small QR library in `/backend` (no third-party QR website) |
| QR storage | Google Drive folder shared as "Anyone with the link can view" |
| Email | `GmailApp` from a verified "Send as" alias; quota via `MailApp.getRemainingDailyQuota()` |
| Scanner | Apps Script web app (`HtmlService`, `BarcodeDetector`, `google.script.run`) |
| Collaboration | Git + PRs; no member pushes to `main` |

### 7.2 Data flow

1. Attendee submits the Form (FullName, Email, Organization, Contact — asked in exactly that order so responses land in B-E).
2. Response appends a row to `Registrations` (Timestamp in A + the four form fields).
3. `onFormSubmit` trigger runs Apps Script: generates `AttendeeID`, builds the QR, writes F-H, emails the QR.
4. Scanner reads the QR (`AttendeeID`), finds the row, sets I-J. Form-owned columns (A-E) are never touched by scripts; script-owned columns (F-J) are never edited by hand.

### 7.3 Function contract (exact names and signatures)

```text
sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}
checkIn(id, pin)
doGet()
```

Settings: `SCANNER_PIN` (Apps Script → Project Settings → Script Properties), `SENDER_ALIAS`, `EVENT_TIMEZONE`.

### 7.4 Project structure

```text
/form      Form questions, field IDs, setup notes
/backend   Apps Script source (.gs), trigger config, QR library
/email     Email subject/HTML template
/scanner   Web scanner page (HTML/CSS/JS) and doGet snippet
/docs      SPEC.md and supporting docs
```

### 7.5 Branding

| Item | Value |
|---|---|
| Name | "Tap In" |
| Accent color | `#4F46E5` |
| Font | Montserrat |
| Logo file | "none yet" |

Scope: the scanner page header + page title, the email template header, and the Form theme. The QR image stays plain — **no logo overlay**. No lockups and no app icons. Until a logo file exists, use a plain text wordmark "Tap In" in the accent color — no substitute icon. These are presentation values only; they do not change the data contract, function signatures, settings, or test steps.

---

## 8. Non-functional requirements

- **Security:** `SCANNER_PIN` lives in Script Properties and is checked before any write; held in page session, never in source or URL. The ID is unguessable and treated as a secret. No secrets or real attendee data in files. QR holds only the ID.
- **Performance:** `MailApp.getRemainingDailyQuota()` is checked before sending; the scanner sends only the ID and PIN and caches nothing.
- **Reliability:** Duplicate scans never overwrite the first check-in. Unknown/tampered IDs are rejected. On scanner error a clear message is shown and nothing is cached, so no stale writes.
- **Compatibility:** Scanner relies on `BarcodeDetector`; unsupported browsers get a clear message to use a supported browser. Camera permission and HTTPS assumed.
- **Free tier:** No paid services. Quota is 100 recipients/day (consumer Gmail) or 1,500 (Workspace); check with `MailApp.getRemainingDailyQuota()`.
- **Timezone:** One `EVENT_TIMEZONE` constant in the script, set to the event's local zone, used for all timestamps.

---

## 9. Team task segmentation

| Member | Role | Owns | Hands off |
|---|---|---|---|
| Member 1 | Registration Form | `/form` | Form questions + field-order/Sheet-ID note (the Form and Sheet already exist, owner-created) → Member 2 |
| Member 2 | Backend: ID + QR | `/backend` | Config.gs, Code.gs, QR library; `onFormSubmit` function and function contract → Member 3. The owner installs the trigger after merge. |
| Member 3 | Email | `/email` | Email.gs, template.html; `sendTicketEmail` contract and confirmed alias → Member 4 |
| Member 4 | Scanner | `/scanner` | index.html, doGet.gs snippet + deployment settings note → Member 5. The owner deploys the web app after merge. |
| Member 5 | Lead/QA | `/docs` | Merged files, TEST_LOG.md, GO_NO_GO.md, handoff notes; final go/no-go |
| Project owner | Setup/configuration (separate role) | Form, Sheet, Script container, dummy Gmail, Script Properties (`SCANNER_PIN`), Gmail alias, QR Drive folder; installs trigger and deploys web app after merges | Configured environment to the team |

### Workflow (gates)

| Stage | Work mode | Gate to proceed |
|---|---|---|
| Setup (Phase 0 — owner, before tasks) | Owner only | Form ("Tap In Registration"), Sheet tab `Registrations` with the 10 headers, Script container, Editors, `SCANNER_PIN` in Script Properties, verified Gmail alias, and shared QR Drive folder all in place. |
| Tasks 1-4 | Parallel — each member in their own folder/branch | Each stage test (S1-S4) passes and the Z3 handoff note + A2 Report are written. Members do not create the Form, Sheet, Script, Gmail alias, or Drive folder — the owner already did. |
| Merge + Phase 2 setup | Sequential, lead only, in order Form → Backend → Email → Scanner → QA. Owner installs the `onFormSubmit` trigger after the backend merge and deploys the web app (Execute as: Me, Anyone) after the scanner merge. | Each PR reviewed (Z2) and approved before the next merge; trigger install and web app URL confirmed present before QA. Triggers and deployments run as the person who performs them, so the owner must do both. |
| QA | Member 5 after all merges and Phase 2 setup | E2E test (Appendix C) passes; TEST_LOG.md and GO_NO_GO.md written. |
| Go/No-go | Lead decision | GO_NO_GO.md states the decision; no BLOCKER findings open. |

### Git rules

- Members work in parallel on their own folder/branch; only the team lead (Member 5) merges into `main`.
- Branch names: `feature/task-1-form`, `feature/task-2-backend`, `feature/task-3-email`, `feature/task-4-scanner`, `feature/task-5-qa`.
- Never commit secrets or real attendee data. Use placeholders like `<repo-url>` and `SENDER_ALIAS = "PASTE_LATER"`.
- See README.md for the handoff and PR process.

---

## 10. Deployment outputs

- A Google Form titled "Tap In Registration" with the linked Sheet tab `Registrations` and 10 headers.
- Apps Script bound to the Sheet: `Config.gs`, `Code.gs`, the QR library, `Email.gs`, and the `doGet.gs` snippet — exposing `sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}`, `checkIn(id, pin)`, and `doGet()`.
- An installable `onFormSubmit` trigger ("From spreadsheet → On form submit").
- Script Properties entry `SCANNER_PIN`; config constants `SENDER_ALIAS` and `EVENT_TIMEZONE`.
- A Drive folder for QR PNGs shared as "Anyone with the link can view".
- A verified Gmail "Send as" alias on the project owner's dummy Gmail.
- A web app deployment: Execute as: Me, Who has access: Anyone.
- Repo outputs: `docs/TEST_LOG.md`, `docs/GO_NO_GO.md`, and `docs/handoff/task-<N>.md` notes.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| QR reveals personal data | QR encodes only the opaque `AttendeeID`; no PII in the code. |
| ID can be guessed | `Utilities.getUuid()` v4, lowercased, hyphens removed, collision-checked; never `Math.random()` or email-derived. |
| PIN leaks from published code | `SCANNER_PIN` in Script Properties; entered by operator and kept only in page session, not source or URL. |
| Duplicate / conflicting check-ins | Reject duplicates with "Already checked in at <time>"; never overwrite the first check-in. |
| Gmail quota exhausted | Check `MailApp.getRemainingDailyQuota()` before sending; 100/day consumer or 1,500/day Workspace; do not add a paid service. |
| Sheet columns drift | Contract fixed across SPEC, prompts, and handoff checks; PR review (Z2) flags changes. |
| Setup item missing at QA | QA reports as a finding and stops; only the project owner configures settings. |
| Scanner fails offline | Connectivity assumed; clear error on failure, nothing cached, so no stale writes. |
| Wrong web app access setting | Owner deploys with Execute as: Me, Who has access: Anyone (Appendix D). |

---

## 12. Glossary

| Term | Meaning |
|---|---|
| `Registrations` | The single Sheet tab holding all registration rows. |
| `AttendeeID` | Unique, non-guessable opaque ID generated with `Utilities.getUuid()`, lowercased, hyphen-free, stored as text in column F. The only join key between QR and row. |
| `QRUrl` | Column G; the shareable Drive link to the attendee's QR PNG. |
| `EmailSent` | Column H; checkbox set by the script after a successful send. |
| `CheckedIn` | Column I; checkbox set by the scanner. |
| `CheckInTime` | Column J; date-time of check-in, blank until scanned. |
| Form-owned / script-owned | Columns A-E are written by the Form only; columns F-J are written by scripts only. |
| `SCANNER_PIN` | Shared PIN in Script Properties, required before a check-in write. |
| `SENDER_ALIAS` | Config constant for the verified "Send as" address; real value owned by the project owner. |
| `EVENT_TIMEZONE` | Config constant for the event's local timezone, used for all timestamps. |
| `onFormSubmit` | Installable Apps Script trigger ("From spreadsheet → On form submit") that starts the ID/QR/email pipeline. |
| Project owner | Separate role owning the Form, Sheet, Script, and dummy Gmail, and configuring all shared settings. |
| Member 1-5 | Team roles: Form, Backend (ID + QR), Email, Scanner, Lead/QA respectively. |
| Stage test / E2E | S1-S4 verify each task; E2E is the 3-registration end-to-end integration test. |

---

## 13. Decisions and beginner-friendly mitigations

| Topic | Decision |
|---|---|
| QR hosting (`QRUrl`) | Script saves the PNG to a dedicated Drive folder, "anyone with the link can view," and stores that link. The QR reveals only an opaque ID, so public read access is safe. |
| Scanner write access | Web app executes as the owner; scanner only ever sends an AttendeeID, and the script only writes I–J for the matching row. Operator enters a shared PIN at event time (held in the page session, not in source or URL) that the script checks before writing — keeps the secret out of published code. |
| Duplicate scans | Reject with "Already checked in at <time>"; never overwrite the first check-in. |
| Status formats | Native checkboxes for EmailSent/CheckedIn; blank for "not yet." |
| Timezone | One `EVENT_TIMEZONE` constant in the script, set to the event's local zone; used for all timestamps. |
| Contact | Optional phone number, stored as text. |
| Email transport / quota | `GmailApp` sending from the dummy Gmail address as a **verified "Send as" alias** in the project owner's Gmail. Address lives in a config constant (`SENDER_ALIAS`), not in code or this spec. Quota is 100 recipients/day (consumer Gmail) or 1,500 (Workspace); check with `MailApp.getRemainingDailyQuota()`. |
| Team access | You own the Form, Sheet, and Apps Script and add the other 4 as **Editors on the files** — no shared passwords. Only you touch the dummy account and verify the alias, so the email stage stays isolated. |
| ID in email body | Never shown — email contains only the QR plus name/event details. |
| Unknown / expired IDs | Valid only if the row exists and CheckedIn is FALSE; no expiry window. Owner can untick CheckedIn to retry. |
| Offline scanning | Connectivity assumed; on error the scanner shows a clear message and caches nothing, so no stale writes. |
| Reuse | Single event per spreadsheet; copy the Sheet + script for the next event. |
