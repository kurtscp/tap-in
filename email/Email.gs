/**
 * Tap In — Email Module (Member 3)
 *
 * Responsibilities:
 * - Render ticket email from /email/template.html with recipient name and event details
 * - Embed scannable QR PNG as an inline image with key "qr" (cid:qr)
 * - Send email via GmailApp.sendEmail using the verified sender alias
 * - Check daily quota before sending via MailApp.getRemainingDailyQuota()
 * - Respect security constraints: NEVER expose AttendeeID in email subject or body,
 *   never commit real sender address or attendee data.
 */

/**
 * Sends a ticket email with the scannable QR code to the registered attendee.
 *
 * Exact function signature required by the Tap In contract:
 * sendTicketEmail({to, fullName, attendeeId, qrBlob, qrUrl}) -> {sent, error}
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email address.
 * @param {string} params.fullName - Attendee's full name.
 * @param {string} params.attendeeId - Secret AttendeeID (NEVER exposed in email content).
 * @param {GoogleAppsScript.Base.Blob} params.qrBlob - Binary PNG blob of the QR code.
 * @param {string} [params.qrUrl] - Drive URL of the QR image file.
 * @return {{sent: boolean, error?: string}} Result object with sent status and optional error.
 */
function sendTicketEmail(params) {
  try {
    if (!params || typeof params !== "object") {
      return { sent: false, error: "Missing or invalid parameters object" };
    }

    const to = params.to ? String(params.to).trim() : "";
    if (!to || to.indexOf("@") === -1) {
      return { sent: false, error: "Invalid recipient email address: " + to };
    }

    if (!params.qrBlob) {
      return { sent: false, error: "Missing QR code blob" };
    }

    // 1. Quota check: 100/day consumer Gmail or 1,500/day Workspace
    const remainingQuota = MailApp.getRemainingDailyQuota();
    if (remainingQuota <= 0) {
      Logger.log("sendTicketEmail: Daily email quota reached (quota: " + remainingQuota + ")");
      return { sent: false, error: "Daily email quota reached" };
    }

    const fullName = params.fullName ? String(params.fullName).trim() : "";

    // 2. Render HTML body from template.html (never contains AttendeeID)
    const htmlBody = renderTicketHtmlBody_({
      fullName: fullName
    });

    // 3. Extract subject from template <title> or fallback
    const subject = extractEmailSubject_(htmlBody);

    // 4. Generate plain-text fallback (never contains AttendeeID)
    const textBody = createPlainTextFallback_(fullName);

    // 5. Build send options with inline QR image (key: "qr")
    const options = {
      name: "Tap In",
      htmlBody: htmlBody,
      inlineImages: {
        qr: params.qrBlob
      }
    };

    // SENDER_ALIAS is declared in Config.gs as placeholder "PASTE_LATER".
    // When configured with a real verified alias, send from that alias.
    if (typeof SENDER_ALIAS !== "undefined" && SENDER_ALIAS && SENDER_ALIAS !== "PASTE_LATER") {
      options.from = SENDER_ALIAS;
      options.replyTo = SENDER_ALIAS;
    }

    // 6. Send the email
    GmailApp.sendEmail(to, subject, textBody, options);

    return { sent: true };
  } catch (err) {
    const errorMsg = err && err.message ? err.message : String(err);
    Logger.log("sendTicketEmail error: " + errorMsg);
    return {
      sent: false,
      error: errorMsg
    };
  }
}

/**
 * Helper to render the HTML template for the ticket email.
 * Evaluates template.html and passes fullName.
 * AttendeeID is intentionally omitted to prevent PII/ID leakage.
 *
 * @param {Object} data
 * @param {string} data.fullName - Attendee's full name.
 * @return {string} Evaluated HTML content.
 * @private
 */
function renderTicketHtmlBody_(data) {
  let template = null;
  const candidateNames = ["email/template", "template", "email/template.html", "template.html"];

  for (let i = 0; i < candidateNames.length; i++) {
    try {
      template = HtmlService.createTemplateFromFile(candidateNames[i]);
      if (template) {
        break;
      }
    } catch (e) {
      // Check next candidate filename
    }
  }

  if (!template) {
    throw new Error("Could not locate email/template.html in script project");
  }

  template.fullName = data.fullName || "Attendee";

  return template.evaluate().getContent();
}

/**
 * Extracts the subject line from the HTML <title> tag, or returns a default subject.
 *
 * @param {string} html - Rendered HTML string.
 * @return {string} Email subject line.
 * @private
 */
function extractEmailSubject_(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match && match[1] ? match[1].trim() : "Your Tap In Event Ticket";
}

/**
 * Creates a plain-text fallback message for email clients that do not support HTML.
 * Ensures AttendeeID is NOT included.
 *
 * @param {string} fullName - Attendee's full name.
 * @return {string} Plain-text message.
 * @private
 */
function createPlainTextFallback_(fullName) {
  const name = fullName ? fullName : "Attendee";
  return (
    "Hello " + name + ",\n\n" +
    "Thank you for registering for Tap In!\n\n" +
    "Your registration is confirmed. Your admission ticket QR code is attached to this email.\n" +
    "Please present the QR code at the entrance for check-in.\n\n" +
    "Event: Tap In\n\n" +
    "— The Tap In Team"
  );
}

/**
 * Utility function to list verified "Send as" aliases in the active Gmail account.
 * Run this to confirm the alias configured in Google Workspace / Gmail settings.
 *
 * @return {string[]} List of available alias addresses.
 */
function getAvailableAliases() {
  const aliases = GmailApp.getAliases();
  Logger.log("Available Gmail aliases: " + JSON.stringify(aliases));
  return aliases;
}
