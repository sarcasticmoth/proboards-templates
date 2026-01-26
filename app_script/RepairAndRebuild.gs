// =======================
// File: RepairAndRebuild.gs
// =======================

// Fallbacks if globals not present
var RR_PTZ = (typeof PTZ !== 'undefined' && PTZ) ? PTZ : 'America/Los_Angeles';
var RR_NAMES = (typeof NAMES !== 'undefined' && NAMES) ? NAMES : {
  ALLPOSTS: 'ALLPOSTS',
  SUMMARY: 'Summary',
  ACTIVITY: 'Activity',
  PLAYERS: 'Players',
  INFORMATION: 'Information',
  THREAD_SUMMARY: 'Thread Summary'
};

// Header synonyms → canonical keys
var RR_CANON = Object.freeze({
  CreatedAt:      ['CreatedAt','Timestamp','Form Timestamp'],
  ThreadID:       ['ThreadID','Thread ID','ID','Id'],
  PostID:         ['PostID','Post ID','Pid'],
  Title:          ['Title'],
  Character:      ['Character','Name','Character Name','Char'],
  Partner:        ['Partner','With','Who'],
  Type:           ['Type','Thread Type'],
  Status:         ['Status','State'],
  PostDate:       ['PostDate','Post Date','Date','Last Post'],
  WhoPostedLast:  ['WhoPostedLast','Who Posted Last','Last Post By','Posted Flag'],
  URL:            ['URL','Link'],
  WordCount:      ['WordCount','Word Count','Words']
});

// ===== Public entry =====
/** One-click fix: enforce headers, rebuild Summary/Activity/Information/Thread Summary. */
function repairAndRebuild() {
  var ss = SpreadsheetApp.getActive();

  // Ensure target sheets & headers (never touch ALLPOSTS data)
  RR_ensureSheetWithHeaders_(ss, RR_NAMES.SUMMARY, RR_headers_(RR_NAMES.SUMMARY), /*wipe=*/true);
  RR_ensureSheetWithHeaders_(ss, RR_NAMES.ACTIVITY, RR_headers_(RR_NAMES.ACTIVITY), /*wipe=*/true);
  RR_ensureSheetWithHeaders_(ss, RR_NAMES.INFORMATION, RR_headers_(RR_NAMES.INFORMATION), /*wipe=*/true);
  RR_ensureSheetWithHeaders_(ss, RR_NAMES.THREAD_SUMMARY, RR_threadSummaryHeaders_(), /*wipe=*/true);

  var shAll = ss.getSheetByName(RR_NAMES.ALLPOSTS);
  if (!shAll) throw new Error('Missing sheet: ' + RR_NAMES.ALLPOSTS);

  // Read ALLPOSTS → canonize
  var allRaw = RR_readTableAsObjects_(shAll);
  var all = allRaw.map(RR_canonize_).filter(function(r){ return r.ThreadID && r.Character; });

  // Build
  var playersMap = RR_buildPlayersUsernameMap_(ss, RR_NAMES.PLAYERS);
  var summary = RR_buildSummary_(all, playersMap);
  var activity = RR_buildActivity_(all);
  var info = RR_buildInformation_(all);                  // thread-level counts
  var threadSummary = RR_buildThreadSummary_(all);

  // Write
  RR_writeTable_(ss.getSheetByName(RR_NAMES.SUMMARY), RR_headers_(RR_NAMES.SUMMARY), summary);
  RR_writeTable_(ss.getSheetByName(RR_NAMES.ACTIVITY), RR_headers_(RR_NAMES.ACTIVITY), activity);
  RR_writeTable_(ss.getSheetByName(RR_NAMES.INFORMATION), RR_headers_(RR_NAMES.INFORMATION), info);
  RR_writeTable_(ss.getSheetByName(RR_NAMES.THREAD_SUMMARY), RR_threadSummaryHeaders_(), threadSummary);

  // Nuke dashboard cache if present
  try {
    CacheService.getDocumentCache().removeAll(['PT_DASH_SAFE_V1','PT_DASH_V2']);
  } catch (_){}

  SpreadsheetApp.getActiveSpreadsheet().toast('Repair + Rebuild complete', 'Post Tracker');
}

// ===== Builders (canon rows) =====
function RR_buildSummary_(rows, playersMap) {
  var out = [];
  for (var i=0;i<rows.length;i++) {
    var r = rows[i];
    var d = r.PostDate;
    var year = d ? Utilities.formatDate(d, RR_PTZ, 'yyyy') : '';
    var dateFmt = d ? Utilities.formatDate(d, RR_PTZ, 'dd MMM yyyy') : '';
    var statusNum = r.Status === 'Complete' ? 1 : (r.Status === 'Dead' ? -1 : 0);
    out.push([
      year,
      r.Character,
      r.Partner,
      r.Type,
      r.Status,
      statusNum,
      d || '',
      dateFmt,
      r.ThreadID,
      r.URL || (r.ThreadID ? RR_buildThreadUrl_(r.ThreadID) : ''),
      playersMap.get(r.Character) || '',
      r.WordCount
    ]);
  }
  out.sort(function(a,b){ return a[1]===b[1] ? ((b[6]||0)-(a[6]||0)) : (a[1]<b[1]?-1:1); });
  return out;
}

function RR_buildActivity_(rows) {
  var latest = new Map();
  rows.forEach(function(r){
    if (!r.Character || !r.PostDate) return;
    var prev = latest.get(r.Character);
    if (!prev || r.PostDate > prev) latest.set(r.Character, r.PostDate);
  });
  var now = RR_truncateTime_(new Date());
  var out = [];
  latest.forEach(function(d, charName){
    var days = Math.floor((now - RR_truncateTime_(d)) / 86400000);
    var fmt = Utilities.formatDate(d, RR_PTZ, 'dd MMM yyyy');
    var action = (d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth()) ? '' : (d < now ? 'need to post' : '');
    out.push([charName, d, fmt, days, action]);
  });
  out.sort(function(a,b){ return a[0]<b[0]?-1:1; });
  return out;
}

/** Per-thread counts from latest row per (Character, ThreadID). */
function RR_buildInformation_(rows) {
  var latestByKey = new Map();
  rows.forEach(function(r){
    var key = r.Character + '|' + r.ThreadID;
    var curD = r.PostDate, curC = r.CreatedAt || null;
    var prev = latestByKey.get(key);
    if (!prev) { latestByKey.set(key, r); return; }
    var prevD = prev.PostDate;
    if (curD && (!prevD || curD > prevD)) { latestByKey.set(key, r); return; }
    if (curD && prevD && curD.getTime() === prevD.getTime()) {
      var prevC = prev.CreatedAt || null;
      if (curC && (!prevC || curC > prevC)) latestByKey.set(key, r);
    }
  });

  var agg = new Map();
  latestByKey.forEach(function(r){
    if (!agg.has(r.Character)) agg.set(r.Character, {completed:0, open:0, owed:0});
    var a = agg.get(r.Character);
    if (r.Status === 'Complete') a.completed++;
    else if (r.Status === 'Open') { a.open++; if (r.WhoPostedLast === 'Partner') a.owed++; }
  });

  var out = [];
  Array.from(agg.keys()).sort().forEach(function(c){
    var a = agg.get(c);
    out.push([c, a.completed, a.open, a.owed]);
  });
  return out;
}

/** One row per ThreadID; tiebreak by CreatedAt on same PostDate; sum your word counts. */
function RR_buildThreadSummary_(rows) {
  var byId = new Map();
  rows.forEach(function(r){
    if (!r.ThreadID) return;
    if (!byId.has(r.ThreadID)) byId.set(r.ThreadID, []);
    byId.get(r.ThreadID).push(r);
  });

  var out = [];
  byId.forEach(function(list, tid){
    var maxPostDate = list.reduce(function(m, r){ return (!m || (r.PostDate && r.PostDate > m)) ? r.PostDate : m; }, null);
    var candidates = list.filter(function(r){ return r.PostDate && maxPostDate && r.PostDate.getTime() === maxPostDate.getTime(); });
    var latest = candidates[0] || list[0];
    for (var i=0;i<candidates.length;i++) {
      var r = candidates[i];
      var ca = r.CreatedAt, cb = latest.CreatedAt;
      if (ca && (!cb || ca > cb)) latest = r;
    }
    var posts = list.length;
    var yourWordsTotal = list
      .filter(function(r){ return r.WhoPostedLast === 'You'; })
      .map(function(r){ var n = Number(r.WordCount); return Number.isFinite(n) ? n : 0; })
      .reduce(function(a,b){ return a+b; }, 0);

    var d = latest.PostDate;
    var dateFmt = d ? Utilities.formatDate(d, RR_PTZ, 'dd MMM yyyy') : '';
    out.push([
      latest.Character || '',
      tid,
      latest.Title || '',
      latest.Partner || '',
      latest.Type,
      latest.Status,
      d || '',
      dateFmt,
      latest.WhoPostedLast,
      (latest.WhoPostedLast === 'You') ? (Number(latest.WordCount)||0) : 'N/A',
      posts,
      yourWordsTotal,
      latest.URL || (tid ? RR_buildThreadUrl_(tid) : '')
    ]);
  });

  out.sort(function(a,b){
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    var ad = a[6] instanceof Date ? a[6].getTime() : 0;
    var bd = b[6] instanceof Date ? b[6].getTime() : 0;
    return bd - ad;
  });
  return out;
}

// ===== Canon & utils =====
function RR_canonize_(o) {
  var out = {};
  // pick values by synonyms
  Object.keys(RR_CANON).forEach(function(k){ out[k] = RR_pickAny_(o, RR_CANON[k]); });

  // coerce
  out.CreatedAt = RR_parseDate_(out.CreatedAt) || null;
  out.PostDate  = RR_parseDate_(out.PostDate) || null;
  out.ThreadID  = (out.ThreadID || '').toString().trim();
  out.PostID    = (out.PostID || '').toString().trim();
  out.Title     = (out.Title || '').toString().trim();
  out.Character = (out.Character || '').toString().trim();
  out.Partner   = (out.Partner || '').toString().trim();
  out.Type      = RR_normalizeType_(out.Type);
  out.Status    = RR_normalizeStatus_(out.Status);
  out.WhoPostedLast = RR_normalizeWhoLast_(out.WhoPostedLast);
  out.URL = out.URL || (out.ThreadID ? RR_buildThreadUrl_(out.ThreadID) : '');

  // WordCount: keep "N/A" for Partner; otherwise numeric or ''
  var wc = (out.WordCount || '').toString().trim();
  out.WordCount = (out.WhoPostedLast === 'Partner') ? 'N/A' : (wc === '' ? '' : String(Math.max(0, parseInt(wc, 10) || 0)));
  return out;
}

function RR_pickAny_(o, names) {
  for (var i=0;i<names.length;i++) {
    var n = names[i];
    if (Object.prototype.hasOwnProperty.call(o, n) && o[n] !== '' && o[n] != null) return o[n];
  }
  return '';
}

function RR_headers_(sheetName) {
  var map = {};
  map[RR_NAMES.SUMMARY] = ['Year','Character','Partner','Type','Status','StatusNum','Date','DateFmt','ThreadID','URL','Username','WordCount'];
  map[RR_NAMES.ACTIVITY] = ['Character','LastPostDate','LastPostDateFmt','DaysSince','Action'];
  map[RR_NAMES.INFORMATION] = ['Character','Completed','Open','Owed'];
  return map[sheetName];
}
function RR_threadSummaryHeaders_() {
  return ['Character','ThreadID','Title','Partner','Type','Status','LastPostDate','LastPostDateFmt','LastPostBy','LastWordCount','Posts','YourWordsTotal','URL'];
}

// Sheet helpers
function RR_findOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
function RR_ensureSheetWithHeaders_(ss, name, headers, wipe) {
  var sh = RR_findOrCreateSheet_(ss, name);
  if (wipe) sh.clearContents();
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.autoResizeColumns(1, headers.length);
}
function RR_writeTable_(sh, headers, rows) {
  var all = [headers].concat(rows || []);
  sh.clearContents();
  if (!all.length || !headers.length) return;
  sh.getRange(1,1,all.length, headers.length).setValues(all);
  sh.autoResizeColumns(1, headers.length);
}
function RR_readTableAsObjects_(sheet) {
  if (!sheet) return [];
  var lr = sheet.getLastRow(), lc = sheet.getLastColumn();
  if (lr < 1 || lc < 1) return [];
  var values = sheet.getRange(1,1,lr,lc).getValues();
  var headers = values[0].map(function(h){ return String(h||'').trim(); });
  var out = [];
  for (var i=1;i<values.length;i++) {
    var row = values[i];
    if (row.every(function(v){ return v===''||v===null; })) continue;
    var o = {};
    for (var c=0;c<headers.length;c++) o[headers[c]] = row[c];
    out.push(o);
  }
  return out;
}

// Normalizers
function RR_parseDate_(v){ if (v instanceof Date) return v; var s=String(v||'').trim(); if(!s) return null; var d=new Date(s); return isNaN(d.getTime())?null:d; }
function RR_truncateTime_(d){ var x=new Date(d); x.setHours(0,0,0,0); return x; }
function RR_normalizeStatus_(raw){ var s=String(raw||'').trim().toLowerCase(); if(['1','complete','completed','done'].includes(s))return'Complete'; if(['-1','dead','dropped'].includes(s))return'Dead'; return'Open'; }
function RR_normalizeType_(raw){ var s=String(raw||'').trim().toUpperCase(); if(s.includes('ONE')&&s.includes('SHOT'))return'ONE SHOT'; return s||'THREAD'; }
function RR_normalizeWhoLast_(raw){ var s=String(raw||'').trim().toLowerCase(); if(s.startsWith('you')||s==='posted')return'You'; return'Partner'; }
function RR_buildThreadUrl_(id){ return 'https://alohomorax0.proboards.com/thread/' + id; }

// Players map (tolerant)
function RR_buildPlayersUsernameMap_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName || 'Players');
  if (!sh) return new Map();
  var values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return new Map();
  var headers = values[0].map(function(h){ return String(h||'').trim(); });
  var idxC = RR_findHeaderIndex_(headers, ['Character','Name','Character Name']);
  var idxU = RR_findHeaderIndex_(headers, ['Username','Handle','User','@']);
  if (idxC === -1) return new Map();
  var out = new Map();
  for (var i=1;i<values.length;i++) {
    var name = String(values[i][idxC]||'').trim(); if (!name) continue;
    var user = (idxU !== -1) ? String(values[i][idxU]||'').trim() : '';
    if (!user) user = '@' + name.toLowerCase();
    out.set(name, user);
  }
  return out;
}
function RR_findHeaderIndex_(headers, candidates) {
  var lower = headers.map(function(h){ return h.toLowerCase(); });
  for (var i=0;i<candidates.length;i++) {
    var j = lower.indexOf(String(candidates[i]).toLowerCase());
    if (j !== -1) return j;
  }
  return -1;
}