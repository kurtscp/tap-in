/**
 * Tap In — Scanner web app entry point
 *
 * Paste this function into the existing Apps Script project (the same
 * project that contains Code.gs and Config.gs).
 *
 * Also add the HTML file:
 *   Apps Script editor → + (New file) → HTML → name it exactly: index
 *   (Apps Script appends .html automatically — do NOT type the extension.)
 *   Paste the contents of /scanner/index.html into that new file and save.
 *
 * DEPLOYMENT SETTINGS (project owner only, after Member 4's code is merged):
 *   Deploy → New deployment → Type: Web app
 *   Execute as:        Me          ← REQUIRED so checkIn() can write the Sheet
 *   Who has access:    Anyone      ← so the operator can open the page on any phone
 *
 * Function name: doGet
 */
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('Tap In – Check In')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
