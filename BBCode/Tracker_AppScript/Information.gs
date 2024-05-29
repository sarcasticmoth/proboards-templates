function PopulateInformationSheet() {
  Logger.log("Start populateInformationSheet()");

  // clear spreadsheet
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(1, 1, 100, 100)
    .clearContent();
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(1, 1, 100, 100)
    .clearFormat();

  // add headers for character information
  var lastRow =
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getLastRow() + 2;

  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 2)
    .setValue("Character");
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 3)
    .setValue("Completed");
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 4)
    .setValue("Open");
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 5)
    .setValue("Owed");

  // format headers
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(
      SpreadsheetApp.openById(SHEET_ID)
        .getSheetByName(SHEET_INFORMATION)
        .getLastRow(),
      2,
      1,
      4
    )
    .setFontWeight("bold")
    .setFontColor("#000000")
    .setBackground("#CCCCCC")
    .setBorder(
      true,
      true,
      true,
      true,
      null,
      null,
      "#000000",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    )
    .setHorizontalAlignment("center");

  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .autoResizeColumns(2, 7);

  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(1, 2, 100, 100)
    .setFontFamily("Roboto Mono")
    .setFontSize(8);

  // get character summary data
  for (var c = 0; c < ACTIVE_CHARS.length; c++) {
    Logger.log(`Getting data for ${ACTIVE_CHARS[c][0]}...`);
    PopulateCharacterMetrics(ACTIVE_CHARS[c]);
  }

  // resize columns
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .autoResizeColumns(2, 1);

  Logger.log("End populateInformationSheet()");
}

/**
 *
 */
function PopulateCharacterMetrics(character) {
  Logger.log(`Start populateCharacterMetrics(${character[0]})`);

  Logger.log(`----- [ Threads for ${character[0]} ] -----`);

  var s_lastRow =
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_SUMMARY)
      .getLastRow() - 1;
  var s_lastCol = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_SUMMARY)
    .getLastColumn();
  var threads = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_SUMMARY)
    .getRange(2, 1, s_lastRow, s_lastCol)
    .getValues();

  var lastRow =
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getLastRow() + 1;

  // print character name
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 2)
    .setValue(character[0]);
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange(lastRow, 2)
    .setBackground(character[2])
    .setFontColor(character[4]);

  var temp = threads.filter((row) => row[2] == character[0]);

  if (temp.length > 0) {
    var openThreads = temp.filter((t) => t[8] == 0);
    var completedThreads = temp.filter((t) => t[8] == 1);
    var postsOwed = openThreads.filter(
      (t) => t[9] != "Posted" && t[11] == "THREAD"
    );

    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 3)
      .setValue(completedThreads.length);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 4)
      .setValue(openThreads.length);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 5)
      .setValue(postsOwed.length);

    // format remaining columns
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 3)
      .setHorizontalAlignment("center");
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 4)
      .setHorizontalAlignment("center");
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 5)
      .setHorizontalAlignment("center");
  } else {
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 3)
      .setValue(0);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 3)
      .setHorizontalAlignment("center");
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 4)
      .setValue(0);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 4)
      .setHorizontalAlignment("center");
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 5)
      .setValue(0);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow, 5)
      .setHorizontalAlignment("center");
  }

  // calculate totals of values from lastRow to new_last_row
  var last_character = ACTIVE_CHARS[ACTIVE_CHARS.length - 1][0];

  if (character[0] == last_character) {
    // create totals, need to recalculate last row
    var new_last_row = SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getLastRow();

    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(new_last_row + 1, 3, 1, 3)
      .setHorizontalAlignment("center")
      .setBorder(
        true,
        false,
        false,
        false,
        null,
        null,
        "#000000",
        SpreadsheetApp.BorderStyle.SOLID_MEDIUM
      );

    var total_open_thread_values = SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(
        new_last_row - ACTIVE_CHARS.length + 1,
        3,
        new_last_row - (new_last_row - ACTIVE_CHARS.length)
      )
      .getValues();
    var total_completed_thread_values = SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(
        new_last_row - ACTIVE_CHARS.length + 1,
        4,
        new_last_row - (new_last_row - ACTIVE_CHARS.length)
      )
      .getValues();
    var total_owed_post_values = SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(
        new_last_row - ACTIVE_CHARS.length + 1,
        5,
        new_last_row - (new_last_row - ACTIVE_CHARS.length)
      )
      .getValues();

    var total_open_threads = 0;
    var total_completed_threads = 0;
    var total_owed_posts = 0;

    for (var i = 0; i < total_open_thread_values.length; i++) {
      total_open_threads += Number(total_open_thread_values[i]);
      total_completed_threads += Number(total_completed_thread_values[i]);
      total_owed_posts += Number(total_owed_post_values[i]);
    }

    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow + 1, 3)
      .setValue(total_open_threads);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow + 1, 4)
      .setValue(total_completed_threads);
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_INFORMATION)
      .getRange(lastRow + 1, 5)
      .setValue(total_owed_posts);
  }

  Logger.log(`End populateCharacterMetrics(${character})`);
}

function GetLatestPostFromAllPosts(character) {
  Logger.log(`Start getLatestPostFromAllPosts(${character[0]})`);

  var s_lastRow =
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_ALL_POSTS)
      .getLastRow() - 1;
  var s_lastCol = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_ALL_POSTS)
    .getLastColumn();
  var posts = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_ALL_POSTS)
    .getRange(2, 1, s_lastRow, s_lastCol)
    .getValues();

  var temp = posts.filter((row) => row[6] == character[0]);
  var lastPost = getLatestDate(temp);

  Logger.log(`End getLatestPostFromAllPosts(${character[0]})`);
  return lastPost;
}

function GetUsernameFromName(name) {
  Logger.log(`looking for ${name}`);

  var p = GetUserNameFromList(name);
  var players = [];

  // username not found, likely a group thread
  if (p == undefined) {
    var split_p = name.split("/");

    if (split_p.length == 1) {
      switch (name) {
        case "ABC":
          players.push(GetUserNameFromList("Addilyn")[2]);
          players.push(GetUserNameFromList("Brígh")[2]);
          players.push(GetUserNameFromList("Raphael")[2]);
          return players;
        case "ABCDE":
          players.push(GetUserNameFromList("Addilyn")[2]);
          players.push(GetUserNameFromList("Brígh")[2]);
          players.push(GetUserNameFromList("Raphael")[2]);
          players.push(GetUserNameFromList("Richard")[2]);
          players.push(GetUserNameFromList("Penelope")[2]);
          return players;
        case "Ollivanders":
          players.push(GetUserNameFromList("Veronica")[2]);
          players.push(GetUserNameFromList("Frankie")[2]);
          players.push(GetUserNameFromList("Nell")[2]);
          players.push(GetUserNameFromList("Gideon")[2]);
          return players;
        case "Potters":
          players.push(GetUserNameFromList("Harry")[2]);
          players.push(GetUserNameFromList("Ginny")[2]);
          players.push(GetUserNameFromList("James")[2]);
          players.push(GetUserNameFromList("Albus")[2]);
          players.push(GetUserNameFromList("Lily")[2]);
          return players;
        case "BÊTE NOIRE":
          players.push(GetUserNameFromList("Lance")[2]);
          players.push(GetUserNameFromList("Emrys")[2]);
          players.push(GetUserNameFromList("Levi")[2]);
          players.push(GetUserNameFromList("Layla")[2]);
          return players;
        case "Bainbridges":
          players.push(GetUserNameFromList("Cara")[2]);
          players.push(GetUserNameFromList("Penelope")[2]);
          return players;
        case "Flemings":
          players.push(GetUserNameFromList("Calliope")[2]);
          players.push(GetUserNameFromList("Elijah")[2]);
          players.push(GetUserNameFromList("Shiloh")[2]);
          return players;
        case "Weeklys":
          players.push(GetUserNameFromList("Charlie W")[2]);
          players.push(GetUserNameFromList("Monday")[2]);
        default:
          return createNameString(name);
      }
    }

    for (var i = 0; i < split_p.length; i = i + 1) {
      var x = GetUserNameFromList(split_p[i]);

      if (x == undefined) {
        players.push(createNameString(split_p[i]));
      } else {
        players.push(x[2]);
      }
    }

    return players;

    // if still not found, then its not on the list
  } else {
    return p[2];
  }
}

function GetUserNameFromList(name) {
  return PLAYER_LIST.filter((c) => c[0] == name)[0];
}

function createNameString(name) {
  return `@${name}`.toLowerCase();
}

function PopulatePlayerList() {
  Logger.log(`populating player list`);

  var s_lastRow =
    SpreadsheetApp.openById(SHEET_ID)
      .getSheetByName(SHEET_PLAYERS)
      .getLastRow() - 1;
  var s_lastCol = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_PLAYERS)
    .getLastColumn();
  PLAYER_LIST = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_PLAYERS)
    .getRange(2, 1, s_lastRow, s_lastCol)
    .getValues();
}

function getLatestDate(arr) {
  var max = arr[0][4];
  var max_date = new Date(max);

  arr.forEach(function (t, i) {
    var d = new Date(t[4]);
    Logger.log(`${d} > ${max_date}`);
    if (d > max_date) {
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
function FormatInformationSheet() {
  Logger.log("Start formatInformationSheet()");

  var headerRange = SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange("A1:B1");

  // Format the Header Row
  headerRange
    .setFontWeight("bold")
    .setFontColor("#000000")
    .setBackground("#CCCCCC")
    .setBorder(
      true,
      true,
      true,
      true,
      null,
      null,
      "#000000",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    )
    .setHorizontalAlignment("center");

  // format the rest of the spreadsheet
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange("A1:A")
    .setFontFamily("Roboto Mono")
    .setFontSize(8);

  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .getRange("B2:B")
    .setFontFamily("Roboto Mono")
    .setFontSize(8)
    .setHorizontalAlignment("center");

  // auto resize cells
  SpreadsheetApp.openById(SHEET_ID)
    .getSheetByName(SHEET_INFORMATION)
    .autoResizeColumns(1, 2);

  Logger.log("End formatInformationSheet()");
}

/**
 *
 */
function BuildPostURL(id) {
  // https://alohomorax0.proboards.com/thread/11330
  return `${BASE_URL}/thread/${id}`;
}
