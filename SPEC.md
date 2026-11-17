# Tap In — Event Registration & QR Check-in

## Overview

No paid services. Pipeline: **Google Form → Google Sheet → Apps Script (QR + email) → web scanner → Sheet write-back.** Attendee PII stays in the Sheet; the QR carries only an opaque ID. The Sheet tab is named **`Registrations`**.

## 1. Data flow

1. Attendee submits the Form (FullName, Email, Organization, Contact — asked in exactly that order so responses land in columns B–E).
2. Response appends a row to `Registrations` (`Timestamp` in A + the 4 form fields).
3. `onFormSubmit` trigger runs Apps Script: generates `AttendeeID`, builds the QR, writes F–H, emails the QR.
4. Scanner reads the QR (`AttendeeID`), finds the row, sets I–J. Form-owned columns (A–E) are never touched by scripts; script-owned columns (F–J) are never edited by hand.

## 2. Sheet columns (tab `Registrations`)

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
| AttendeeID | Script | Unique, non-guessable **text** (see §3). |
| QRUrl | Script | Shareable link to the QR PNG in Drive (see §7). |
| EmailSent | Script | Checkbox (TRUE/FALSE). |
| CheckedIn | Scanner | Checkbox (TRUE/FALSE). |
| CheckInTime | Scanner | Date-time; blank until check-in. |

`AttendeeID` is the only join key between QR and row.

## 3. AttendeeID generation

- Use `Utilities.getUuid()` (v4, ~122 random bits) — never `Math.random()`, emails, or counters.
- Store as plain text; strip hyphens to a canonical lowercase form before comparing.
- Check column F for a collision before writing; regenerate if found.
- Treat the ID as a secret: possession = authority to check in, so it must not be derivable from public data.

## 4. QR content

- Encodes **only the `AttendeeID`** string — no name, email, or URL.
- `QRUrl` links to the rendered PNG emailed to the attendee; scanning yields the ID, which the scanner resolves to a row. No PII is exposed by the code itself.

## 5. Folder layout

```
/form      Form questions, field IDs, setup notes
/backend   Apps Script source (.gs), trigger config
/email     Email subject/HTML template
/scanner   Web scanner page (HTML/CSS/JS)
/docs      SPEC.md and supporting docs
```

## 6. Test steps

**Stage 1 — Form → Sheet:** Submit a test response; confirm one new row with correct B–E + Timestamp in A, F–J still empty; verify required-field/format validation.

**Stage 2 — Script (ID + QR):** Confirm a unique, non-guessable AttendeeID as text in F and a QRUrl in G; decode the QR and verify it equals exactly the AttendeeID; re-run trigger and confirm no duplicate row/ID.

**Stage 3 — Email:** Confirm the email arrives with a scannable QR and template-correct subject/content; confirm EmailSent becomes TRUE; test a bad address and confirm EmailSent stays FALSE.

**Stage 4 — Scanner → Sheet:** Scan a valid QR and confirm the right row gets CheckedIn=TRUE + CheckInTime; scan an unknown/tampered ID and confirm rejection; scan the same QR twice and confirm the "already checked in" warning; confirm no other rows changed.

## 7. Decisions & beginner-friendly mitigations

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
