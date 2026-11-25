# Handoff — Task 1: Registration Form

- Member: Member 1
- Branch: feature/task-1-form
- Folder / files: /form — /form/README.md
- Date: 2026-11-25

## What was built
Configured the shared "Tap In Registration" Google Form with the exact required field order (`FullName`, `Email`, `Organization`, `Contact`) and Tap In branding (`#4F46E5`, `Montserrat`, plain text wordmark), verified live response routing directly to the `Registrations` tab (`A–E`) with columns `F–J` left blank, cleaned up test entries, and documented the setup note and Sheet ID in `/form/README.md`.

## How to verify
1. Open the shared "Tap In Registration" Google Form and confirm the 4 questions appear in exact order: `FullName` (required), `Email` (email validation, required), `Organization` (required), `Contact` (optional).
2. Open the linked spreadsheet (`Registrations` tab, ID `192H_95Hpqmw-UVlHDUNjp5kimf9YeK-MrES5Y2TiHJU`) and confirm row 1 has the exact 10 headers A–J (`Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime`) with no leftover test rows.
3. Submit a test entry in the published Form and verify Timestamp lands in A, fields land in B–E, and F–J remain blank (delete the test entry afterward).

## Contract checks
- [x] Columns A-J and order unchanged
- [x] Form field order / AttendeeID rule / QR-only-ID rule respected (as applicable to this task)
- [x] Function names and signatures exact (if this task defines them)
- [x] SCANNER_PIN / SENDER_ALIAS / EVENT_TIMEZONE handled as specified (if applicable)
- [x] No secrets or real attendee data in files

## Setup items needed from the project owner
none

## Known issues / NOT verified
none

## A2 Report
REPORT
Plan followed: Configured the existing Google Form "Tap In Registration" with brand theme and the 4 questions in exact order, confirmed linking to the existing Sheet tab "Registrations" with its 10 exact headers (A-J), authored the setup note in /form/README.md, verified integration via S1 test submission, and cleaned up test data.
Changed files: form/README.md
Commands / steps run:
1. Checked git branch and directory status (verified on branch feature/task-1-form).
2. Configured Form theme in Google Forms: title "Tap In Registration", accent color #4F46E5, font Montserrat, plain text wordmark "Tap In" with no logo.
3. Configured 4 questions in exact order: FullName (Short answer, required), Email (Short answer with email validation, required), Organization (Short answer, required), Contact (Short answer, optional).
4. Verified destination is linked to the existing spreadsheet (ID: 192H_95Hpqmw-UVlHDUNjp5kimf9YeK-MrES5Y2TiHJU), tab "Registrations" with row 1 headers A-J.
5. Authored setup documentation in form/README.md.
6. Submitted 1 test registration to verify form-to-sheet data landing.
7. Deleted the test submission row from the Sheet and response from the Form.
Verified:
- Form field order and configuration: FullName (Short answer, required) -> Column B, Email (Short answer with email format validation, required) -> Column C, Organization (Short answer, required) -> Column D, Contact (Short answer, optional) -> Column E.
- Brand theme applied: accent color #4F46E5, font Montserrat, wordmark "Tap In" without logo.
- Row 1 headers in tab "Registrations" confirmed exact: Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime.
- S1 Stage Verification: submitted 1 test registration and observed Timestamp landed in column A, form inputs landed in columns B-E, and columns F-J remained completely blank; confirmed required/email validation enforcement; confirmed test row and response were deleted afterward.
NOT verified:
- Backend automation (columns F-H: AttendeeID generation, QR generation, email dispatch) and web app check-in (columns I-J), as these belong to Tasks 2-4 and depend on downstream code, triggers, and deployment.
Rules touched: SC1, SC2, SC3, ST1, ST3, SEC1, SEC4, DT1, DT2, DT4, TR1, TR2, PR1, PR2, PR3, PR4, BR1.
Open questions: none