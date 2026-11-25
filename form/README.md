# Tap In — Registration Form Setup Note

This setup note documents the configuration for the **Tap In Registration** Form and its linked Google Sheet.

---

## 1. Google Form Configuration

- **Form Title:** Tap In Registration
- **Owner:** Project Owner (Team members are Editors)
- **Brand Theme:**
  - **Brand Name:** Tap In (plain text wordmark, no logo)
  - **Accent Color:** `#4F46E5`
  - **Font:** `Montserrat`
  - **Logo:** None yet (plain, no logo overlay)

### Field Order and Configuration (Exact Order)

Questions are configured in this exact order:

1. **FullName**
   - Type: Short answer
   - Setting: **Required**
   - Target Column: `B`
2. **Email**
   - Type: Short answer
   - Setting: **Required**
   - Validation: Response validation enabled (Email format)
   - Target Column: `C`
3. **Organization**
   - Type: Short answer
   - Setting: **Required**
   - Target Column: `D`
4. **Contact**
   - Type: Short answer
   - Setting: **Optional** (stored as plain text to preserve leading zeros)
   - Target Column: `E`

*(Google Forms automatically manages Column A: `Timestamp`)*

---

## 2. Linked Google Sheet Reference

- **Spreadsheet URL:** `https://docs.google.com/spreadsheets/d/192H_95Hpqmw-UVlHDUNjp5kimf9YeK-MrES5Y2TiHJU/edit?resourcekey=&gid=18237625#gid=18237625`
- **Spreadsheet ID:** `192H_95Hpqmw-UVlHDUNjp5kimf9YeK-MrES5Y2TiHJU`
- **Destination Tab Name:** `Registrations`
- **Destination Setting:** Linked to the existing spreadsheet (not creating a new spreadsheet)

### Sheet Headers Contract (Row 1, Columns A–J)

The `Registrations` tab contains exactly these 10 column headers in Row 1 in this exact order:

`Timestamp | FullName | Email | Organization | Contact | AttendeeID | QRUrl | EmailSent | CheckedIn | CheckInTime`

| Column | Header | Owner | Description / Notes |
|---|---|---|---|
| **A** | `Timestamp` | Form | Form submission date-time |
| **B** | `FullName` | Form | Attendee full name |
| **C** | `Email` | Form | Attendee email address (ticket delivery target) |
| **D** | `Organization` | Form | School, company, or organization |
| **E** | `Contact` | Form | Contact number (plain text, optional) |
| **F** | `AttendeeID` | Script | Generated UUID (`Utilities.getUuid()`, lowercase, no hyphens) |
| **G** | `QRUrl` | Script | Drive URL to the generated QR code PNG |
| **H** | `EmailSent` | Script | Delivery status checkbox (`TRUE` / `FALSE`) |
| **I** | `CheckedIn` | Scanner | Door check-in checkbox (`TRUE` / `FALSE`) |
| **J** | `CheckInTime` | Scanner | Timestamp of check-in (blank until scanned) |

---

## 3. Ownership & Data Boundaries

- **Columns A–E (Form-Owned):** Populated exclusively by Google Form submissions. Backend scripts and operators never write to columns A–E.
- **Columns F–J (Script-Owned):** Managed by Apps Script and the web scanner. These columns remain empty below Row 1 upon initial form submission and are never edited by hand.
- **Security:** No secrets, credentials, PINs, or real attendee PII are committed to this repository.

---

## 4. Verification (Stage Test S1)

- **Test Registration Submitted:** 1 test response submitted to verify question order and field settings.
- **Validation Checked:** Verified required field enforcement on FullName, Email, and Organization; verified email address format validation.
- **Sheet Output Confirmed:**
  - Column A received the submission Timestamp.
  - Columns B–E received the submitted form field values.
  - Columns F–J were confirmed completely blank.
- **Cleanup:** Test row and form response were deleted after verification so no test data remains in the Sheet or Form.

