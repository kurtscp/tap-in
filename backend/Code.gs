/**
 * Tap In — Backend (ID generation, QR storage, Email handoff, Check-In)
 *
 * Sheet tab "Registrations" columns A-J:
 *   A(1): Timestamp    [Form-owned]
 *   B(2): FullName     [Form-owned]
 *   C(3): Email        [Form-owned]
 *   D(4): Organization [Form-owned]
 *   E(5): Contact      [Form-owned]
 *   F(6): AttendeeID   [Script-owned, plain text]
 *   G(7): QRUrl        [Script-owned]
 *   H(8): EmailSent    [Script-owned]
 *   I(9): CheckedIn    [Scanner-owned]
 *   J(10): CheckInTime [Scanner-owned]
 *
 * Scripts NEVER write columns A-E.
 */

const COL = {
  FULL_NAME: 2,
  EMAIL: 3,
  ATTENDEE_ID: 6,
  QR_URL: 7,
  EMAIL_SENT: 8,
  CHECKED_IN: 9,
  CHECK_IN_TIME: 10
};

/**
 * Installable trigger handler ("From spreadsheet -> On form submit").
 * Note: The project owner installs this trigger post-merge.
 *
 * @param {GoogleAppsScript.Events.SheetsOnFormSubmit=} e
 */
function onFormSubmit(e) {
  const sheet = getRegistrationsSheet_();
  const row = e && e.range ? e.range.getRow() : findLastDataRow_(sheet);
  if (row <= 1) {
    return;
  }

  // Prevent duplicate processing if AttendeeID is already populated
  const idCell = sheet.getRange(row, COL.ATTENDEE_ID);
  const existingId = String(idCell.getValue() || "").trim();
  if (existingId !== "") {
    return;
  }

  const fullName = String(sheet.getRange(row, COL.FULL_NAME).getValue() || "").trim();
  const email = String(sheet.getRange(row, COL.EMAIL).getValue() || "").trim();

  // 1. Generate unique, non-guessable AttendeeID and store as plain text in F
  const attendeeId = generateUniqueAttendeeId_(sheet);
  idCell.setNumberFormat("@");
  idCell.setValue(attendeeId);

  // 2. Generate QR PNG containing ONLY AttendeeID and save to Drive folder
  const qrBlob = createQrPngBlob(attendeeId, attendeeId + ".png");
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const qrFile = folder.createFile(qrBlob);
  const qrUrl = qrFile.getUrl();
  sheet.getRange(row, COL.QR_URL).setValue(qrUrl);

  // 3. Call email builder's sendTicketEmail and record result in H
  let emailSent = false;
  if (typeof sendTicketEmail === "function") {
    const emailResult = sendTicketEmail({
      to: email,
      fullName: fullName,
      attendeeId: attendeeId,
      qrBlob: qrBlob,
      qrUrl: qrUrl
    });
    emailSent = Boolean(emailResult && emailResult.sent);
  }
  sheet.getRange(row, COL.EMAIL_SENT).setValue(emailSent);
}

/**
 * Checks in an attendee by AttendeeID after verifying SCANNER_PIN from Script Properties.
 * Writes ONLY columns I (CheckedIn) and J (CheckInTime). Never writes A-E.
 *
 * @param {string} id - Scanned AttendeeID.
 * @param {string} pin - Operator-entered PIN.
 * @return {Object} Check-in result object.
 */
function checkIn(id, pin) {
  const expectedPin = PropertiesService.getScriptProperties().getProperty("SCANNER_PIN");
  if (!expectedPin || pin === null || pin === undefined || String(pin) !== String(expectedPin)) {
    return {
      ok: false,
      status: "invalid_pin",
      message: "Invalid PIN"
    };
  }

  const normalizedId = normalizeAttendeeId_(id);
  if (!normalizedId) {
    return {
      ok: false,
      status: "invalid_id",
      message: "Invalid AttendeeID"
    };
  }

  const sheet = getRegistrationsSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      ok: false,
      status: "not_found",
      message: "Attendee not found"
    };
  }

  const idValues = sheet.getRange(2, COL.ATTENDEE_ID, lastRow - 1, 1).getValues();
  let matchRow = -1;
  for (let i = 0; i < idValues.length; i++) {
    if (normalizeAttendeeId_(idValues[i][0]) === normalizedId) {
      matchRow = i + 2;
      break;
    }
  }

  if (matchRow === -1) {
    return {
      ok: false,
      status: "not_found",
      message: "Attendee not found"
    };
  }

  const fullName = String(sheet.getRange(matchRow, COL.FULL_NAME).getValue() || "").trim();
  const checkedInVal = sheet.getRange(matchRow, COL.CHECKED_IN).getValue();
  const isAlreadyCheckedIn = checkedInVal === true || String(checkedInVal).toUpperCase() === "TRUE";

  if (isAlreadyCheckedIn) {
    const existingTimeVal = sheet.getRange(matchRow, COL.CHECK_IN_TIME).getValue();
    const formattedExisting = formatTimestamp_(existingTimeVal);
    return {
      ok: false,
      status: "already_checked_in",
      fullName: fullName,
      checkInTime: formattedExisting,
      message: "already checked in at " + formattedExisting
    };
  }

  const formattedNow = Utilities.formatDate(new Date(), EVENT_TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  sheet.getRange(matchRow, COL.CHECKED_IN).setValue(true);
  sheet.getRange(matchRow, COL.CHECK_IN_TIME).setValue(formattedNow);

  return {
    ok: true,
    status: "checked_in",
    fullName: fullName,
    checkInTime: formattedNow,
    message: "Checked in: " + fullName
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getRegistrationsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet tab "' + SHEET_NAME + '" not found.');
  }
  return sheet;
}

/**
 * Finds the last row containing registration data in column A (Timestamp) or B (FullName),
 * ignoring trailing rows that only have pre-formatted checkboxes in H-I.
 */
function findLastDataRow_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return lastRow;
  }
  const abValues = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (let i = abValues.length - 1; i >= 0; i--) {
    const hasA = abValues[i][0] !== "" && abValues[i][0] !== null;
    const hasB = String(abValues[i][1] || "").trim() !== "";
    if (hasA || hasB) {
      return i + 2;
    }
  }
  return 1;
}

function normalizeAttendeeId_(raw) {
  return String(raw || "").trim().toLowerCase().replace(/-/g, "");
}

function generateUniqueAttendeeId_(sheet) {
  const existingSet = {};
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const colF = sheet.getRange(2, COL.ATTENDEE_ID, lastRow - 1, 1).getValues();
    for (let i = 0; i < colF.length; i++) {
      const normalized = normalizeAttendeeId_(colF[i][0]);
      if (normalized) {
        existingSet[normalized] = true;
      }
    }
  }

  let candidate = "";
  do {
    candidate = Utilities.getUuid().toLowerCase().replace(/-/g, "");
  } while (existingSet[candidate]);

  return candidate;
}

function formatTimestamp_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, EVENT_TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  }
  return String(value || "").trim();
}
