/**
 * Scrawl Methods
 */
function Scrawl() { };

function LoadSummary() {
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
}

function createMenu() {
  Logger.log("Start createMenu()");

  var ui = SpreadsheetApp.getUi();

  ui.createMenu("Scripts")
  .addItem("Update Summary", LoadSummary)
  .addSeparator()
  .addItem("Create Thread Tracker Posts", CreateCharacterThreadTrackerPosts)
  .addToUi();

  Logger.log("Start createMenu()");
}

function CreateCharacterThreadTrackerPosts() {

  for(var i = 0; i < ACTIVE_CHARS.length; i = i + 1) {
    Logger.log(`... ${ACTIVE_CHARS[i][1]} ...`)
    var character = ACTIVE_CHARS[i];
    var content = generateThreadTrackerPost(character);
    createFile(character[0], content);
  }
}

function generateThreadTrackerPost(character) {
  Logger.log("Start generateSampleThreadTracker()");

  information.populatePlayerList();

  // var character = ACTIVE_CHARS[4];

  var s_lastRow = (SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastRow() - 1);
  var s_lastCol = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getLastColumn();
  var threads = SPREADSHEET.getSheetByName(SHEET_SUMMARY).getRange(2, 1, s_lastRow, s_lastCol).getValues().filter(row => row[2] == character[0]);
  threads.forEach(function (t) {
    t[10] = Utilities.formatDate(t[4], 'America/Los_Angeles', 'dd MMMM yyyy');
    t[14] = information.buildPostURL(t[13]);
    t[15] = information.getUsernameFromName(t[3]);
  });

  var active_threads = threads.filter(row => row[8] == 0).sort(compareDates);
  var completed_threads = threads.filter(row => row[8] == 1).sort(compareDates);
  var dead_threads = threads.filter(row => row[8] == -1).sort(compareDates);

  var tracker_header_template = HtmlService.createTemplateFromFile("ThreadTrackerBLANK2");
  tracker_header_template.name = character[1];
  tracker_header_template.color = character[2];
  tracker_header_template.active_threads = active_threads;
  tracker_header_template.completed_threads = completed_threads;
  tracker_header_template.dead_threads = dead_threads;

  var result = tracker_header_template.evaluate().getContent();

  Logger.log(result);
  Logger.log("End generateSampleThreadTracker()");

  return result;
}

function createFile(char, content) {
  var fileName = `ThreadPage_${char}.txt`
  var folder1 = 'ALO'
  var folder2 = 'trackers'

  var folderList1 = DriveApp.getFoldersByName(folder1);
  
  if(folderList1.hasNext()) {
    var f1 = folderList1.next(); 
    Logger.log(f1.getName());

    folderList2 = DriveApp.getFoldersByName(folder2);

    if(folderList2.hasNext()) {
      var f2 = folderList2.next();
      Logger.log(f2.getName());

      var files = f2.getFilesByName(fileName);
      Logger.log(files);  

      if(files.hasNext()) {
        var file = files.next();
        Logger.log(`Updating ${fileName}...`)
        file.setContent(content);
      } else {
        Logger.log(`Creating ${fileName}...`)
        f2.createFile(fileName, content);
      }
    }
  }
}

function compareDates(val1, val2) {
  var date1 = val1[4];
  var date2 = val2[4];

  if(date1 > date2)
    return 1;
  if(date1 < date2)
    return -1;
  return 0;
}

