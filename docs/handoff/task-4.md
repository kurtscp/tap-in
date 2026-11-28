# Handoff — Task 4: Scanner

- Member: Member 4
- Branch: feature/task-4-scanner
- Folder / files: /scanner/ — index.html, doGet.gs
- Date: 2026-11-28

## What was built

Built the mobile web check-in scanner page (`/scanner/index.html`) and the Apps Script web app entry-point snippet (`/scanner/doGet.gs`). On load, the page prompts the operator once per browser session for the shared PIN (held only in `sessionStorage` and an in-memory variable, never in source, URLs, or `localStorage`), opens the rear phone camera using the native browser `BarcodeDetector` API (with an unsupported-browser fallback and zero paid libraries), and calls `google.script.run.checkIn(id, scannerPin)` upon reading a QR code. The UI renders distinct status banners for successful check-ins (`checked_in`), duplicate scans (`already_checked_in`), invalid PINs (`invalid_pin`, clearing the session PIN and re-prompting), unknown/invalid IDs (`not_found` / `invalid_id`), and connection failures, with no offline caching and strict adherence to the "Tap In" brand rules (`#4F46E5`, `Montserrat`, no logo).

## How to verify

1. Run `git status` on `feature/task-4-scanner` and confirm only `scanner/index.html` and `scanner/doGet.gs` were added.
2. In the existing Google Apps Script project, create a new HTML file named `index` (no `.html` extension in the Apps Script editor) and paste the contents of `/scanner/index.html`.
3. Paste `doGet()` from `/scanner/doGet.gs` into a `.gs` file in the same Apps Script project.
4. Deploy the web app (`Deploy → New deployment → Web app → Execute as: Me | Who has access: Anyone`).
5. Open the deployed web app URL on a mobile browser that supports `BarcodeDetector` (e.g., Chrome on Android), enter the `SCANNER_PIN` stored in Script Properties, and scan a valid test QR code. Confirm the matching row in `Registrations` updates to `CheckedIn = TRUE` with a `CheckInTime` value and no other rows change.
6. Re-scan the same QR code to verify the `"Already checked in at <time>"` message, scan an unknown/tampered QR code to verify rejection, and test a wrong PIN to verify it clears the session PIN and re-prompts.

## Contract checks

- [x] Columns A-J and order unchanged
- [x] Form field order / AttendeeID rule / QR-only-ID rule respected (as applicable to this task)
- [x] Function names and signatures exact (if this task defines them)
- [x] SCANNER_PIN / SENDER_ALIAS / EVENT_TIMEZONE handled as specified (if applicable)
- [x] No secrets or real attendee data in files

## Setup items needed from the project owner

- Add `/scanner/index.html` into the existing Apps Script project as an HTML file named `index`.
- Paste `doGet()` from `/scanner/doGet.gs` into the existing Apps Script project.
- Deploy the web app with `Execute as: Me` and `Who has access: Anyone`.
- Confirm `SCANNER_PIN` is set in Script Properties.
- Confirm whether `setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)` should remain (if embedding is needed) or be removed in favor of default `SAMEORIGIN`.

## Known issues / NOT verified

- Live end-to-end QR scan (`BarcodeDetector` reading a real QR code and `google.script.run.checkIn()` writing `CheckedIn` and `CheckInTime` in columns I–J) — NOT verified because web app deployment happens after merge.
- Runtime behavior of `setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)` in the deployed Apps Script web app context — NOT verified prior to deployment.
- Network loading of `Montserrat` from Google Fonts on operator devices — falls back cleanly to system sans-serif if offline.

## A2 Report

Plan followed: Exactly as stated in the pre-approved plan. Two files written inside /scanner/ only. No other files touched.

Changed files:
- /scanner/index.html — Created — the phone check-in scanner page
- /scanner/doGet.gs — Created — the doGet() snippet for the Backend owner to paste

Commands / steps run:
1. Read OWNERS.md, docs/handoff/README.md, backend/Code.gs, backend/Config.gs, docs/handoff/task-1.md to understand the shared contract before writing anything.
2. Wrote /scanner/index.html.
3. Wrote /scanner/doGet.gs.
4. Grep-confirmed google.script.run…checkIn(id, scannerPin) is the only outbound call in the page.
5. Grep-confirmed no localStorage, no hardcoded PIN, no fetch() / XMLHttpRequest in the page.

Verified (what was actually checked in this session):
- doGet() uses HtmlService.createHtmlOutputFromFile('index') — correct Apps Script API (TR1/TR3 satisfied).
- The page calls checkIn(id, scannerPin) — sends exactly the two arguments the backend checkIn(id, pin) expects, nothing more.
- PIN is stored only in sessionStorage (clears on tab close) and in the scannerPin variable — never in source, URL, or localStorage (SEC2 satisfied).
- No hardcoded PIN, no real sender address, no attendee data in either file (SEC1/SEC4).
- BarcodeDetector unsupported path shows a clear message; no paid QR library used (ST2, task step 4).
- google.script.run failure handler shows a connection-error message; no offline caching (task step 6).
- Brand applied only to the page header (name "Tap In", color #4F46E5, font Montserrat) — not to the QR image (BR1).
- All five response status values from Code.gs are handled: checked_in, already_checked_in, invalid_pin (clears PIN + re-prompts), not_found, invalid_id.
- Files confirmed readable with correct content after write.

NOT verified (cannot test without the deployed web app):
- End-to-end scan: BarcodeDetector reading a real QR and the checkIn round-trip actually marking columns I/J in the Sheet — requires the web app to be deployed and a live Apps Script project. Listed per TR2.
- setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) behavior in the deployed context — API name is from Apps Script docs but runtime behavior is not verified.
- Google Fonts loading on the operator's device (requires network; not critical �� the CSS fallback chain covers it).

Rules touched: SC1, SC2, SC3, SC4, ST1, ST2, ST3, SEC1, SEC2, SEC4, DT1, DT4, DT5, TR1, TR2, TR3, PR1, PR2, PR3, PR4, BR1.

Deployment note (for the project owner):
Deploy → New deployment → Web app → Execute as: Me | Who has access: Anyone
The owner must also create one HTML file inside the Apps Script editor: New file → HTML → name it exactly "index" (no extension), then paste the contents of /scanner/index.html into it and save. doGet() from /scanner/doGet.gs goes into any .gs file in the same project.

Open questions:
1. setXFrameOptionsMode(ALLOWALL) is included so the page can be embedded if needed; if the owner does not intend to embed it, SAMEORIGIN is the safer default — confirm preference.
2. The page loads Montserrat from Google Fonts via a <link>. If the event venue has no internet, the font will silently fall back to system sans-serif (functionally fine). No action needed unless fully offline operation is a requirement.
3. No task-3.md handoff was visible in the repo — if Member 3 (Email) defines additional shared constants (e.g. EVENT_TIMEZONE override), no changes are needed here since the scanner page does not use it directly.

CHECKPOINT — stopping here. Function name: doGet().
