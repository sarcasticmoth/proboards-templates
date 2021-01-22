function GenerateDirectoryCode() {
  /* 
    Conditions:
    - Column J - Picture link [no validation for 'proper' link]
    - Column H - check for empty cell (means not posted)
    - Column G - if Tumblr set posted, not required
    - Column F - eye color
    - Column E - hair color
    - Column D - ethnicity
    - Column C - gender
    - Column B - age
    - Column A - name
  */

  // create a new Google Doc to hold output 
  var doc_output = DocumentApp.create("Output");
  // doc_output.getBody().appendParagraph('testing adding content.');

  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var range_data = sheet.getDataRange();
  var last_column = range_data.getLastColumn();
  var last_row = range_data.getLastRow();
  var search_range = sheet.getRange(1,1,last_row - 1, last_row - 1);

  // loop through the spreadsheet and check for conditions
  
  var range_values = search_range.getValues();

//   A				     B    C        D       E      F           H      J
// jay mcguiness	20s	male	white	brown	blue		Yes		HTTP://

// <a href="tumblr-link">
// <div class="grid-item 20s white male brunette blue">
// <div class="name"> NAME </div>
// <img src="link.png">
// <div class="info">
// 	20's | White | male <br>
// 	Brown hair | blue eyes
// </div>
// </div>
// </a>

  for(i = 1; i < last_row - 1; i++)
  {
      // check column J
      if(range_values[i][9])
      {
        Logger.log(range_values[i][0].toString().toUpperCase());
        if(!range_values[i][7])
        {
          if((range_values[i][0]) && (range_values[i][1]) && (range_values[i][2]) && (range_values[i][3]) && (range_values[i][4]) && (range_values[i][5]))
          {
            doc_output.getBody().appendParagraph('<a href="">');
            doc_output.getBody().appendParagraph('<div class="grid-item ' + range_values[i][1] + ' ' + format_gender(range_values[i][2]) + ' ' + format_ethnicity(range_values[i][3]) + ' ' + range_values[i][4].toString().toLowerCase() + ' ' + range_values[i][5].toString().toLowerCase() + '">');
            doc_output.getBody().appendParagraph('<div class="name">' + range_values[i][0].toString().toUpperCase() + '</div>');
            doc_output.getBody().appendParagraph('<img src="' + range_values[i][9] + '">');
            doc_output.getBody().appendParagraph('<div class="info">');
            doc_output.getBody().appendParagraph('\t' + format_age(range_values[i][1]) + ' | ' + format_ethnicity(range_values[i][3]) + ' | ' + format_gender(range_values[i][2]));
            doc_output.getBody().appendParagraph('\t' + format_haircolor(range_values[i][4]) + ' | ' + range_values[i][5]);
            doc_output.getBody().appendParagraph('</div>');
            doc_output.getBody().appendParagraph('</div>');
            doc_output.getBody().appendParagraph('</a>\n');
          }
        }
      }
  }   

  // send result as email
  var url = doc_output.getUrl();
  var email = Session.getActiveUser().getEmail();
  var subject = doc_output.getName();
  var body = 'Link to Output: ' + url;
  GmailApp.sendEmail(email, subject, body);

}

function format_age(str)
{
  if(typeof str != "string")
  {
    throw `Expected string but got a ${typeof str} value.`;
  }

  return str.toLowerCase().split(/s/)[0] + "'s";
}

function format_ethnicity(str)
{
  if(typeof str != "string")
  {
    throw `Expected string but got a ${typeof str} value.`;
  }

  return str.toLowerCase().split(/\(/)[0].trim();
}

function format_gender(str)
{
  if(typeof str != "string")
  {
    throw `Expected string but got a ${typeof str} value.`;
  }

  return str.toLowerCase();
}

function format_haircolor(str)
{
  if(typeof str != "string")
  {
    throw `Expected string but got a ${typeof str} value.`;
  }

  return str.toLowerCase() + " hair";
}

function format_eyes(str)
{
  if(typeof str != "string")
  {
    throw `Expected string but got a ${typeof str} value.`;
  }

  return str.toLowerCase() + " eyes";
}