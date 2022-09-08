/**
 * Variables
 */

let SPREADSHEET_ID         = "17QoPpxLljptucq351CSLdYgGeILuO6bqvHN-rX0rqzc"
var SPREADSHEET            = SpreadsheetApp.openById(SPREADSHEET_ID);

var BASE_URL               = "https://alohomorax0.proboards.com"

let SHEET_INFORMATION      = "Information";

const SHEET_SUMMARY        = "Summary";
const SHEET_THREAD_SUMMARY = "Thread Summary";
const SHEET_ALL_POSTS      = "ALLPOSTS";
const SHEET_PLAYERS        = "Players"

const SHEET_RHYS           = "Rhys";
const SHEET_ANASTASIA      = "Anastasia";
const SHEET_LAYLA          = "Layla";
const SHEET_LEONARDO       = "Leonardo";
const SHEET_CADE           = "Cade";
const SHEET_ADDILYN        = "Addilyn";
const SHEET_JAMES          = "James";
const SHEET_DIANA          = "Diana";
const SHEET_OCTAVIAN       = "Octavian";
const SHEET_ASHER          = "Asher";
const SHEET_EVELYN         = "Evelyn";
const SHEET_TEMPERANCE     = "Temperance";
const SHEET_LEA            = "Lea";
const SHEET_GEHRY          = "Gehry";
const SHEET_EWAN           = "Ewan";

const COLOR_RHYS           = "#507B9C";
const COLOR_ANASTASIA      = "#7B2D26";
const COLOR_LAYLA          = "#F7D002";
const COLOR_LEONARDO       = "#C0C0C0";
const COLOR_CADE           = "#62A87C";
const COLOR_ADDILYN        = "#593F62";
const COLOR_JAMES          = "#F7996E";
const COLOR_DIANA          = "#549DA0";
const COLOR_OCTAVIAN       = "#2A2A72";
const COLOR_ASHER          = "#A4AC96";
const COLOR_EVELYN         = "#CEABB1";
const COLOR_TEMPERANCE     = "#6F5D68";
const COLOR_LEA            = "#A2AEBB";
const COLOR_GEHRY          = "#DEB12A";
const COLOR_EWAN           = "#CEEAF7";    

const RHYS_HEADER          = "RHYS GREYBACK";
const ANASTASIA_HEADER     = "ANASTASIA KARKAROFF";
const LAYLA_HEADER         = "LAYLA HENDRICKS";
const LEONARDO_HEADER      = "LEONARDO ALMEDA";
const CADE_HEADER          = "CADE WOODWARD";
const ADDILYN_HEADER       = "ADDILYN SLATER";
const JAMES_HEADER         = "JAMES POTTER";
const DIANA_HEADER         = "DIANA BAINBRIDGE";
const OCTAVIAN_HEADER      = "OCTAVIAN VECTOR";
const ASHER_HEADER         = "ASHER BURKE";
const EVELYN_HEADER        = "EVELYN OLIVEIRA";
const TEMPERANCE_HEADER    = "TEMPERANCE FLEMING";
const LEA_HEADER           = "LEA MALKIN";
const GEHRY_HEADER         = "GEHRY OLLIVANDER";
const EWAN_HEADER          = "EWAN MCGONAGALL"

const COLOR_FOREGROUND_WHITE = "#FFFFFF";
const COLOR_FOREGROUND_BLACK = "#000000";

var ACTIVE_CHARS = [
  [ SHEET_RHYS      , RHYS_HEADER      , COLOR_RHYS      , COLOR_FOREGROUND_WHITE ],
  [ SHEET_ANASTASIA , ANASTASIA_HEADER , COLOR_ANASTASIA , COLOR_FOREGROUND_WHITE ],
  [ SHEET_CADE      , CADE_HEADER      , COLOR_CADE      , COLOR_FOREGROUND_WHITE ],
  [ SHEET_ADDILYN   , ADDILYN_HEADER   , COLOR_ADDILYN   , COLOR_FOREGROUND_WHITE ],
  [ SHEET_JAMES     , JAMES_HEADER     , COLOR_JAMES     , COLOR_FOREGROUND_BLACK ],
  [ SHEET_DIANA     , DIANA_HEADER     , COLOR_DIANA     , COLOR_FOREGROUND_WHITE ],
  [ SHEET_OCTAVIAN  , OCTAVIAN_HEADER  , COLOR_OCTAVIAN  , COLOR_FOREGROUND_WHITE ],
  [ SHEET_ASHER     , ASHER_HEADER     , COLOR_ASHER     , COLOR_FOREGROUND_BLACK ],
  [ SHEET_EVELYN    , EVELYN_HEADER    , COLOR_EVELYN    , COLOR_FOREGROUND_BLACK ],
  [ SHEET_TEMPERANCE, TEMPERANCE_HEADER, COLOR_TEMPERANCE, COLOR_FOREGROUND_WHITE ],
  [ SHEET_LEA       , LEA_HEADER       , COLOR_LEA       , COLOR_FOREGROUND_BLACK ],
  [ SHEET_GEHRY     , GEHRY_HEADER     , COLOR_GEHRY     , COLOR_FOREGROUND_BLACK ],
  [ SHEET_EWAN      , EWAN_HEADER      , COLOR_EWAN      . COLOR_FOREGROUND_BLACK ]
];

var DROPPED_CHARS = [
  [ SHEET_LAYLA   , LAYLA_HEADER   , COLOR_LAYLA   , COLOR_FOREGROUND_BLACK ],
  [ SHEET_LEONARDO, LEONARDO_HEADER, COLOR_LEONARDO, COLOR_FOREGROUND_BLACK ]
];

var PLAYER_LIST = [];

