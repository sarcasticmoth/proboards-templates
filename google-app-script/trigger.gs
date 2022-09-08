let information = new Information();

/**
 * Trigger Methods
 */
function Trigger() {};

function onOpen(e) {
  Logger.log("Start onOpen()");

  // Create Custom Menu
  var ui = SpreadsheetApp.getUi().createMenu("Scripts");
  ui.addItem('Refresh Information Sheet', 'onOpen');
  ui.addToUi();

  // Create Information Sheet if not created
  var sheet = SPREADSHEET.getSheetByName(SHEET_INFORMATION);

  // create sheet if it does not exist
  Logger.log("Checking if Information Sheet Exists.");
  if(!sheet) {
    Logger.log("Creating Information Sheet.");
    SPREADSHEET.insertSheet(SHEET_INFORMATION);
  }

  Logger.log("Initial Population");
  information.populateInformationSheet();
  // information.formatInformationSheet();

  Logger.log("End onOpen()");
}

function onChange(e) {
  Logger.log("Start onChange()");

  information.populateInformationSheet();
  information.formatInformationSheet();

  Logger.log("End onChange()");
}




