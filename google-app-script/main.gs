

/**
 * Scrawl Methods
 */
function Scrawl() { };

// functions

function ReadCharacterSummaryWorksheet() {

}

// create post code

function CreateCharacterThreadTrackerPost() {

}

function CreateAllCharacterThreadSummaryPost() {
  // go through the Summary Worksheet
  // count all threads that are open (0), for each character (not in dropped)

}

/**
 * For Debugging/Testing
 */

function generateSampleThreadTrackerPost(character) {
  Logger.log("Start generateSampleThreadTracker()");

  information.populatePlayerList();

  var character = ACTIVE_CHARS[4];

  var s_lastRow = (SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastRow() - 1);
  var s_lastCol = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastColumn();
  var threads = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getRange(2, 1, s_lastRow, s_lastCol).getValues().filter(row => row[2] == character[0]);
  threads.forEach(function (t) {
    t[4] = Utilities.formatDate(t[4], 'America/Los_Angeles', 'dd MMMM yyyy');
    t[14] = information.buildPostURL(t[13]);
    t[15] = information.getUsernameFromName(t[3]);
  });

  var active_threads = threads.filter(row => row[8] == 0);
  var completed_threads = threads.filter(row => row[8] == 1);
  var dead_threads = threads.filter(row => row[8] == -1);

  var tracker_header_template = HtmlService.createTemplateFromFile("ThreadTrackerBLANK2");
  tracker_header_template.name = character[1];
  tracker_header_template.color = character[2];
  tracker_header_template.active_threads = active_threads;
  tracker_header_template.completed_threads = completed_threads;
  tracker_header_template.dead_threads = dead_threads;

  var result = tracker_header_template.evaluate().getContent();

  Logger.log(result);

  Logger.log("End generateSampleThreadTracker()");
}




