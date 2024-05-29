function FillColor() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange("F2").activate();
  spreadsheet.getActiveRangeList().setBackground("#7eb09b");
}
