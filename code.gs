const ORDERS_SHEET = "Orders";
const LOG_SHEET = "DebugLogs";
const SECRET_TOKEN = "my-secret-123"; // change this

function doGet() {
  const rows = SpreadsheetApp
    .getActive()
    .getSheetByName(LOG_SHEET)
    .getDataRange()
    .getValues();

  let html = "<h2>Debug Logs</h2><table border=1>";
  rows.forEach(r => {
    html += "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
  });
  html += "</table>";

  return HtmlService.createHtmlOutput(html);
}

function doPost(e) {
  log("INFO", "doPost called", e);

  try {
    if (!e || !e.parameter) {
      log("ERROR", "No event / parameter", e);
      return json({ ok: false, error: "No data received" });
    }

    // 🔐 Token validation
    if (e.parameter.token !== SECRET_TOKEN) {
      log("WARN", "Invalid token", e.parameter);
      return json({ ok: false, error: "Unauthorized" });
    }

    const order = [
      new Date(),
      e.parameter.name || "",
      e.parameter.phone || "",
      e.parameter.product || "",
      e.parameter.notes || ""
    ];

    SpreadsheetApp
      .getActive()
      .getSheetByName(ORDERS_SHEET)
      .appendRow(order);

    log("SUCCESS", "Order saved", order);

    return json({ ok: true, message: "Order saved" });

  } catch (err) {
    log("FATAL", err.toString(), e);
    return json({ ok: false, error: err.toString() });
  }
}

/* ---------- helpers ---------- */

function log(level, message, payload) {
  SpreadsheetApp
    .getActive()
    .getSheetByName(LOG_SHEET)
    .appendRow([
      new Date(),
      level,
      message,
      payload ? JSON.stringify(payload) : ""
    ]);

  Logger.log(`[${level}] ${message}`);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
