function FillCellColor() {

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TECH_DETAILS);

  var sheetLastRow = sheet.getLastRow() - 1;
  var sheeLastCol = sheet.getLastColumn();

  var contents = sheet.getRange(1, 1, sheetLastRow, sheeLastCol).getValues();

  contents.forEach(function (data, row) {
    // Logger.log("[" + row + "] - " + data);

    data.forEach(function(d, col) {

      // Logger.log("\t[" + col + "] - " + d);
      
      if(d.toString() != '') {
        Logger.log(IntToAlpha(col) + (row + 1) + " : " + d);
      }

    });
  });
  
}

function IntToAlpha(index) {
  const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
];
  return alpha[index];
}