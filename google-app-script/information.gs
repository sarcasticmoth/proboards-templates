/**
 * Information methods
 */
function Information() {};

/**
 * 
 */
Information.prototype.populateInformationSheet = () => {
  Logger.log("Start populateInformationSheet()");

  // clear spreadsheet
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 1, 100, 100).clearContent();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 1, 100, 100).clearFormat();

  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 1).clear();
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 1).setValue("Sheet Name");
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 2).clear();
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 2).setValue("Sheet ID");

  // var sheetNames = SPREADSHEET.getSheets().map(n => [n.getName()]);
  // var sheetIDs = SPREADSHEET.getSheets().map(i => [i.getSheetId()]);

  // Logger.log(JSON.stringify(sheetNames));
  // Logger.log(JSON.stringify(sheetIDs));

  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(2, 1).clearContent();
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(2, 1, sheetNames.length).setValues(sheetNames);
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(2, 2).clearContent();
  // SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(2, 2, sheetNames.length).setValues(sheetIDs);

  // add headers for character information
  var lastRow = (SPREADSHEET.getSheetByName(SHEET_INFORMATION).getLastRow() + 2);

  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 1).clear();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 1).setValue("Character");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 2).clear();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 2).setValue("Open Threads");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 3).clear();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 3).setValue("Posts Owed");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 4).clear();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 4).setValue("Last Post Date");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 5).clear();
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 5).setValue("Days Since Last Post");

  // format headers
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(SPREADSHEET.getSheetByName(SHEET_INFORMATION).getLastRow(), 1, 1, 5)
  .setFontWeight('bold')
  .setFontColor('#000000')
  .setBackground('#CCCCCC')
  .setBorder(
    true, true, true, true, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  )
  .setHorizontalAlignment("center");

  SPREADSHEET.getSheetByName(SHEET_INFORMATION).autoResizeColumns(1, 6);

  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(1, 1, 100, 100)
  .setFontFamily("Roboto Mono")
  .setFontSize(8);

  // get character summary data
  for (var c = 0; c < ACTIVE_CHARS.length; c++) {
    Logger.log(`Getting data for ${ACTIVE_CHARS[c][0]}...`)
    information.populateCharacterMetrics(ACTIVE_CHARS[c]);
  }

  Logger.log("End populateInformationSheet()")
};

/**
 * 
 */
Information.prototype.populateCharacterMetrics = (character) => {
  Logger.log(`Start populateCharacterMetrics(${character[0]})`);

  Logger.log(`----- [ Threads for ${character[0]} ] -----`)

  var s_lastRow = (SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastRow() - 1);
  var s_lastCol = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastColumn();
  var threads = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getRange(2, 1, s_lastRow, s_lastCol).getValues();

  var lastRow = SPREADSHEET.getSheetByName(SHEET_INFORMATION).getLastRow() + 1;

  // print character name
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 1).setValue(character[0]);
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 1)
  .setBackground(character[2])
  .setFontColor(character[3]);

  var temp = threads.filter(row => row[2] == character[0]);
  var openThreads = temp.filter(t => t[8] == 0);
  var postsOwed = openThreads.filter(t => t[9] != "Posted");

  var last_date = information.getLatestPostFromAllPosts(character);
  var daysSinceLastPost = ((new Date() - last_date) / (1000 * 60 * 60 * 24)).toFixed(0);

  Logger.log(`Current Date: ${new Date()}`);
  Logger.log(`Last Date: ${last_date}`)

  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 2).setValue(openThreads.length);
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 3).setValue(postsOwed.length);
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 4).setValue(last_date);
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 5).setValue(daysSinceLastPost);

  // format remaining columns
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 2).setHorizontalAlignment("center");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 3).setHorizontalAlignment("center");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 4).setHorizontalAlignment("center");
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow, 5).setHorizontalAlignment("center");

  // calculate totals of values from lastRow to new_last_row
  var last_character = ACTIVE_CHARS[ACTIVE_CHARS.length - 1][0];

  if(character[0] == last_character){
    // create totals, need to recalculate last row
    var new_last_row = SPREADSHEET.getSheetByName(SHEET_INFORMATION).getLastRow();

    SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(new_last_row + 1, 2, 1, 2)
    .setHorizontalAlignment("center")
    .setBorder(true, false, false, false, null, null, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    var total_open_thread_values = SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange((new_last_row - ACTIVE_CHARS.length) + 1, 2, new_last_row - (new_last_row - ACTIVE_CHARS.length)).getValues();
    var total_owed_post_values = SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange((new_last_row - ACTIVE_CHARS.length) + 1, 3, new_last_row - (new_last_row - ACTIVE_CHARS.length)).getValues();
    var total_open_threads = 0;
    var total_owed_posts = 0;

    for(var i = 0; i < total_open_thread_values.length; i++) {
      total_open_threads += Number(total_open_thread_values[i]);
      total_owed_posts += Number(total_owed_post_values[i]);
    }

    SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow + 1, 2).setValue(total_open_threads);
    SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange(lastRow + 1, 3).setValue(total_owed_posts);
  }

  Logger.log(`End populateCharacterMetrics(${character})`);
}

Information.prototype.getLatestPostFromAllPosts = (character) => {
  Logger.log(`Start getLatestPostFromAllPosts(${character[0]})`);

  var s_lastRow = (SPREADSHEET.getSheetByName(SHEET_ALL_POSTS).getLastRow() - 1);
  var s_lastCol = SPREADSHEET.getSheetByName(SHEET_ALL_POSTS).getLastColumn();
  var posts = SPREADSHEET.getSheetByName(SHEET_ALL_POSTS).getRange(2, 1, s_lastRow, s_lastCol).getValues();

  var temp = posts.filter(row => row[6] == character[0]);
  var lastPost = getLatestDate(temp);

  Logger.log(`End getLatestPostFromAllPosts(${character[0]})`);
  return lastPost;
}

Information.prototype.getUsernameFromName = (name) => {
  Logger.log(`looking for ${name}`)

  var p = PLAYER_LIST.filter(c => c[0] == name)[0];

  if(p == undefined) {
    var username = `${name}`;
  } else {
    var username = p[2];
  }
  
  return username;
}

Information.prototype.populatePlayerList = () => {
  Logger.log(`populating player list`);

  var s_lastRow = (SPREADSHEET.getSheetByName(SHEET_PLAYERS).getLastRow() - 1);
  var s_lastCol = SPREADSHEET.getSheetByName(SHEET_PLAYERS).getLastColumn();
  PLAYER_LIST = SPREADSHEET.getSheetByName(SHEET_PLAYERS).getRange(2, 1, s_lastRow, s_lastCol).getValues();
}

function getLatestDate(arr) {
  var max = arr[0][4];
  var max_date = new Date(max);

  arr.forEach(function(t, i) {
    var d = new Date(t[4]);
    Logger.log(`${d} > ${max_date}`);
    if(d > max_date) {
      max = t[4];
      max_date = new Date(max);
      Logger.log(`max_date updated: ${max_date}`);
    }
  });

  return max_date;
}

function getDays(start_date, end_date) {
  // gets number of days between two dates subtracting months
  var s_day = start_date.getDate();
  var s_month = start_date.getMonth();
  var s_year = start_date.getYear();

  var e_day = end_date.getDate();

  var start_number = daysInMonth(s_month, s_year) - s_day;
  var endnum = e_day;
  
  return start_number + endnum;
}

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 
 */
Information.prototype.formatInformationSheet = () => {
  Logger.log("Start formatInformationSheet()")

  var headerRange = SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange("A1:B1");

  // Format the Header Row
  headerRange
  .setFontWeight('bold')
  .setFontColor('#000000')
  .setBackground('#CCCCCC')
  .setBorder(
    true, true, true, true, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  )
  .setHorizontalAlignment("center");

  // format the rest of the spreadsheet
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange("A1:A")
  .setFontFamily("Roboto Mono")
  .setFontSize(8);

  SPREADSHEET.getSheetByName(SHEET_INFORMATION).getRange("B2:B")
  .setFontFamily("Roboto Mono")
  .setFontSize(8)
  .setHorizontalAlignment("center");

  // auto resize cells
  SPREADSHEET.getSheetByName(SHEET_INFORMATION).autoResizeColumns(1, 2);

  Logger.log("End formatInformationSheet()")
}

/**
 * 
 */
Information.prototype.buildPostURL = (id) => {
  // https://alohomorax0.proboards.com/thread/11330
  return `${BASE_URL}/post/thread/${id}`;
}



