/**
 * Variables
 */

var BASE_URL               = "https://alohomorax0.proboards.com"

const SHEET_ID             = "17QoPpxLljptucq351CSLdYgGeILuO6bqvHN-rX0rqzc";

const SHEET_INFORMATION    = "Information";
const SHEET_TECH_DETAILS   = "Tech Details";

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
const SHEET_OBERON         = "Oberon";
const SHEET_EDWARD         = "Edward";
const SHEET_EZIO           = "Ezio";

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
const COLOR_OBERON         = "#8E5572";
const COLOR_EDWARD         = "#255957";
const COLOR_EZIO           = "#FFE381";

const ACCENT_COLOR_RHYS           = "#A1BBCE";
const ACCENT_COLOR_ANASTASIA      = "#7B2D26";
const ACCENT_COLOR_LAYLA          = "#F7D002";
const ACCENT_COLOR_LEONARDO       = "#C0C0C0";
const ACCENT_COLOR_CADE           = "#62A87C";
const ACCENT_COLOR_ADDILYN        = "#593F62";
const ACCENT_COLOR_JAMES          = "#F7996E";
const ACCENT_COLOR_DIANA          = "#549DA0";
const ACCENT_COLOR_OCTAVIAN       = "#2A2A72";
const ACCENT_COLOR_ASHER          = "#A4AC96";
const ACCENT_COLOR_EVELYN         = "#CEABB1";
const ACCENT_COLOR_TEMPERANCE     = "#6F5D68";
const ACCENT_COLOR_LEA            = "#A2AEBB";
const ACCENT_COLOR_GEHRY          = "#EED895";
const ACCENT_COLOR_EWAN           = "#CEEAF7";
const ACCENT_COLOR_OBERON         = "#8E5572";
const ACCENT_COLOR_EDWARD         = "#255957";
const ACCENT_COLOR_EZIO           = "#FFE381";

const USERNAME_RHYS           = "vanessa";
const USERNAME_ANASTASIA      = "anastasia";
const USERNAME_LAYLA          = "layla";
const USERNAME_LEONARDO       = "leo";
const USERNAME_CADE           = "cade";
const USERNAME_ADDILYN        = "addy";
const USERNAME_JAMES          = "jamesp";
const USERNAME_DIANA          = "dianab";
const USERNAME_OCTAVIAN       = "octavian";
const USERNAME_ASHER          = "asher";
const USERNAME_EVELYN         = "evy";
const USERNAME_TEMPERANCE     = "temperance";
const USERNAME_LEA            = "lea";
const USERNAME_GEHRY          = "gehry";
const USERNAME_EWAN           = "wwan";
const USERNAME_OBERON         = "oberon";
const USERNAME_EDWARD         = "lupin";
const USERNAME_EZIO           = "ezio";

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
const EWAN_HEADER          = "EWAN MCGONAGALL";
const OBERON_HEADER        = "OBERON BLISHWICK";
const EDWARD_HEADER        = "EDWARD LUPIN";
const EZIO_HEADER          = "EZIO WEEKLY";

const COLOR_FOREGROUND_WHITE = "#FFFFFF";
const COLOR_FOREGROUND_BLACK = "#000000";

var ACTIVE_CHARS = [
    [ SHEET_RHYS      , RHYS_HEADER      , COLOR_RHYS      , ACCENT_COLOR_RHYS      , COLOR_FOREGROUND_WHITE, USERNAME_RHYS ]
  , [ SHEET_ANASTASIA , ANASTASIA_HEADER , COLOR_ANASTASIA , ACCENT_COLOR_ANASTASIA , COLOR_FOREGROUND_WHITE, USERNAME_ANASTASIA ]
  , [ SHEET_CADE      , CADE_HEADER      , COLOR_CADE      , ACCENT_COLOR_CADE      , COLOR_FOREGROUND_WHITE, USERNAME_CADE ]
  , [ SHEET_ADDILYN   , ADDILYN_HEADER   , COLOR_ADDILYN   , ACCENT_COLOR_ADDILYN   , COLOR_FOREGROUND_WHITE, USERNAME_ADDILYN ]
  , [ SHEET_JAMES     , JAMES_HEADER     , COLOR_JAMES     , ACCENT_COLOR_JAMES     , COLOR_FOREGROUND_BLACK, USERNAME_JAMES ]
  , [ SHEET_DIANA     , DIANA_HEADER     , COLOR_DIANA     , ACCENT_COLOR_DIANA     , COLOR_FOREGROUND_WHITE, USERNAME_DIANA ]
  , [ SHEET_OCTAVIAN  , OCTAVIAN_HEADER  , COLOR_OCTAVIAN  , ACCENT_COLOR_OCTAVIAN  , COLOR_FOREGROUND_WHITE, USERNAME_OCTAVIAN ]
  , [ SHEET_ASHER     , ASHER_HEADER     , COLOR_ASHER     , ACCENT_COLOR_ASHER     , COLOR_FOREGROUND_BLACK, USERNAME_ASHER ]
  , [ SHEET_EVELYN    , EVELYN_HEADER    , COLOR_EVELYN    , ACCENT_COLOR_EVELYN    , COLOR_FOREGROUND_BLACK, USERNAME_EVELYN ]
  , [ SHEET_TEMPERANCE, TEMPERANCE_HEADER, COLOR_TEMPERANCE, ACCENT_COLOR_TEMPERANCE, COLOR_FOREGROUND_WHITE, USERNAME_TEMPERANCE ]
  , [ SHEET_LEA       , LEA_HEADER       , COLOR_LEA       , ACCENT_COLOR_LEA       , COLOR_FOREGROUND_BLACK, USERNAME_LEA ]
  , [ SHEET_GEHRY     , GEHRY_HEADER     , COLOR_GEHRY     , ACCENT_COLOR_GEHRY     , COLOR_FOREGROUND_BLACK, USERNAME_GEHRY ]
  , [ SHEET_EWAN      , EWAN_HEADER      , COLOR_EWAN      , ACCENT_COLOR_EWAN      , COLOR_FOREGROUND_BLACK, USERNAME_EWAN ]
  , [ SHEET_OBERON    , OBERON_HEADER    , COLOR_OBERON    , ACCENT_COLOR_OBERON    , COLOR_FOREGROUND_WHITE, USERNAME_OBERON ]
  , [ SHEET_EDWARD    , EDWARD_HEADER    , COLOR_EDWARD    , ACCENT_COLOR_EDWARD    , COLOR_FOREGROUND_WHITE, USERNAME_EDWARD ]
  , [ SHEET_EZIO      , EZIO_HEADER      , COLOR_EZIO      , ACCENT_COLOR_EZIO      , COLOR_FOREGROUND_BLACK, USERNAME_EZIO ]
];

var DROPPED_CHARS = [
  [ SHEET_LAYLA   , LAYLA_HEADER   , COLOR_LAYLA   , COLOR_FOREGROUND_BLACK, USERNAME_LAYLA ],
  [ SHEET_LEONARDO, LEONARDO_HEADER, COLOR_LEONARDO, COLOR_FOREGROUND_BLACK, USERNAME_LEONARDO ]
];

var PLAYER_LIST = [];

