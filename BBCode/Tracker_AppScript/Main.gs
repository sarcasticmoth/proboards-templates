/**
 * MENU
 */

function createMenu() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Scripts")
  .addItem("Update Summary", 'LoadSummary')
  .addSeparator()
  .addItem("Create Thread Tracker Posts", 'CreateCharacterThreadTrackerPosts')
  .addItem("Create Rhys-Juniper Post List", 'CreateRhysJuniTracker')
  .addToUi();
}

function onOpen() {
  createMenu();
}

function LoadSummary() {
  // Create Information Sheet if not created
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_INFORMATION);

  // create sheet if it does not exist
  Logger.log("Checking if Information Sheet Exists.");
  if(!sheet) {
    Logger.log("Creating Information Sheet.");
    SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_INFORMATION);
  }

  Logger.log("Initial Population");
  PopulateInformationSheet();
}

function CreateRhysJuniTracker() {
  Logger.log(`... ${ACTIVE_CHARS[0][1]} ...`)
  var character = ACTIVE_CHARS[0];
  var content = GenerateThreadTrackerPost2(character, "Juniper", "ThreadTrackerSPECIFIC");
  CreateFile(character[0], content, "ThreadList", 0);
}

function CreateCharacterThreadTrackerPosts() {
  for(var i = 0; i < ACTIVE_CHARS.length; i = i + 1) {
    Logger.log(`... ${ACTIVE_CHARS[i][1]} ...`)
    var character = ACTIVE_CHARS[i];
    // var content = GenerateThreadTrackerPost(character, "ThreadTrackerBLANK3");
    var content = GenerateThreadTrackerPost(character, "NewThreadTrackerBLANK1");
    CreateFile(character[0], content, 'ThreadPage', i+1);
  } 
}

function GenerateThreadTrackerPost2(character,who, template) {
  Logger.log("Start generateThreadTrackerPost2()");

  PopulatePlayerList();

  var s_lastRow = (SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getLastRow() - 1);
  var s_lastCol = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getLastColumn();
  var threads = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getRange(2, 1, s_lastRow, s_lastCol).getValues().filter(row => (row[2] == character[0] && row[3] == who) || (row[10] == "RHYS/JUNIPER"));
  threads.forEach(function (t) {
    t[10] = Utilities.formatDate(t[4], 'America/Los_Angeles', 'dd MMMM yyyy');
    t[14] = BuildPostURL(t[13]);
    t[15] = GetUsernameFromName(t[3]);

    if(t[8] == 1) {
      t[16] = "COMPLETED";
    }

    if(t[8] == 0) {
      t[16] = "OPEN";
    }

    if(t[11] == "ONE SHOT") {
      t[16] = "ONE SHOT";
    }
  });

  var tracker_header_template = HtmlService.createTemplateFromFile(template);;
  tracker_header_template.threads = threads.sort(compareDates);

  var result = tracker_header_template.evaluate().getContent();

  Logger.log("End generateThreadTrackerPost2()");

  return result;
}

function GenerateThreadTrackerPost(character, template) {
  Logger.log("Start generateSampleThreadTracker()");

  PopulatePlayerList();

  char_threads = {};

  var s_lastRow = (SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getLastRow() - 1);
  var s_lastCol = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getLastColumn();
  var threads = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_SUMMARY).getRange(2, 1, s_lastRow, s_lastCol).getValues().filter(row => row[2] == character[0]);
  threads.forEach(function (t) {
    t[9] = Utilities.formatDate(t[4], 'America/Los_Angeles', 'yyyy');

    t[10] = Utilities.formatDate(t[4], 'America/Los_Angeles', 'dd MMM yyyy');
    t[14] = BuildPostURL(t[13]);
    t[15] = GetUsernameFromName(t[3]);
  });

  var active_threads = threads.filter(row => row[8] == 0).sort(compareDates);
  var completed_threads = threads.filter(row => (row[8] == 1) && (row[11] != 'ONE SHOT')).sort(compareDates);
  var dead_threads = threads.filter(row => row[8] == -1).sort(compareDates);
  var one_shots = threads.filter(row => row[11] == 'ONE SHOT').sort(compareDates);

  var tracker_header_template = HtmlService.createTemplateFromFile(template);
  tracker_header_template.name = character[1];
  tracker_header_template.color = character[2];
  tracker_header_template.accent_color = character[3];
  tracker_header_template.username = character[5];
  tracker_header_template.active_threads = active_threads;
  tracker_header_template.completed_threads = completed_threads;
  tracker_header_template.dead_threads = dead_threads;
  tracker_header_template.one_shots = one_shots;

  // Logger.log("--");
  // active_threads.forEach(function (t) {
  //   Logger.log(t[15])
  // });
  // Logger.log("--");
  // completed_threads.forEach(function (t) {
  //   Logger.log(t[15])
  // });
  // Logger.log("--");
  // dead_threads.forEach(function (t) {
  //   Logger.log(t[15])
  // });
  // Logger.log("--");

  var result = tracker_header_template.evaluate().getContent();
  // Logger.log(result);

  Logger.log("End generateSampleThreadTracker()");

  return result;
}

function CreateFile(char, content, filename, i) {
  var fileName = `${i}_${filename}_${char}.txt`
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

  // verify file exists
  while(!checkFile(fileName)) {
    Logger.log(`looking for ${fileName}`);
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

function checkFile(filename){
  var results;
  var haBDs  = DriveApp.getFilesByName(filename)
  //Does not exist
  if(!haBDs.hasNext()) {
    results =  haBDs.hasNext();
    Logger.log(`${filename} does not exist`);
  }
  //Does exist
  else {
    results =  haBDs.hasNext();
    Logger.log(`found ${filename}`);
  }
  return results;
}

// 

