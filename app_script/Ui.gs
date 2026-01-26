// =======================
// File: Ui.gs
// =======================
function openDashboardSidebar() {
  const html = HtmlService.createTemplateFromFile('Dashboard').evaluate()
    .setTitle('Post Tracker')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(html);
}

function doGet() {
  return HtmlService.createTemplateFromFile('Dashboard')
    .evaluate()
    .setTitle('Post Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardData() {
  const cache = CacheService.getDocumentCache();
  const key = 'PT_DASH_SAFE_V1';
  const hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  const ss = SpreadsheetApp.getActive();
  let summary = readTableAsObjects_(ss.getSheetByName(NAMES.SUMMARY));
  let activity = readTableAsObjects_(ss.getSheetByName(NAMES.ACTIVITY));

  const needRebuild = (!summary || summary.length === 0) || (!activity || activity.length === 0);
  if (needRebuild) {
    try { rebuildMaterializedReports(); } catch (_) {}
    summary = readTableAsObjects_(ss.getSheetByName(NAMES.SUMMARY));
    activity = readTableAsObjects_(ss.getSheetByName(NAMES.ACTIVITY));
  }

  if (!summary || summary.length === 0 || !activity || activity.length === 0) {
    const all = readTableAsObjects_(ss.getSheetByName(NAMES.ALLPOSTS)) || [];
    const playersMap = buildPlayersUsernameMap_(ss);
    if (!summary || summary.length === 0) summary = computeSummaryFromAll_(all, playersMap);
    if (!activity || activity.length === 0) activity = computeActivityFromAll_(all);
  }

  const payload = { summary, activity };
  cache.put(key, JSON.stringify(payload), 180);
  return payload;
}

function computeSummaryFromAll_(all, playersMap) {
  const out = [];
  for (const r of all) {
    const d = parseDate_(r.PostDate);
    const year = d ? Utilities.formatDate(d, PTZ, 'yyyy') : '';
    const dateFmt = d ? Utilities.formatDate(d, PTZ, 'dd MMM yyyy') : '';
    const status = normalizeStatusText_(r.Status);
    out.push({
      Year: year,
      Character: String(r.Character||'').trim(),
      Partner: String(r.Partner||'').trim(),
      Type: normalizeType_(r.Type),
      Status: status,
      StatusNum: status==='Complete'?1:status==='Dead'?-1:0,
      Date: d || '',
      DateFmt: dateFmt,
      ThreadID: String(r.ThreadID||'').trim(),
      URL: r.URL || (r.ThreadID ? buildThreadUrl_(r.ThreadID) : ''),
      Username: playersMap.get(String(r.Character||'').trim()) || '',
      WordCount: r.WordCount ?? ''
    });
  }
  out.sort((a,b)=>a.Character===b.Character?((b.Date||0)-(a.Date||0)):(a.Character<b.Character?-1:1));
  return out;
}

function computeActivityFromAll_(all) {
  const latest = new Map();
  for (const r of all) {
    const c = String(r.Character||'').trim();
    const d = parseDate_(r.PostDate);
    if (!c || !d) continue;
    const prev = latest.get(c);
    if (!prev || d > prev) latest.set(c, d);
  }
  const now = new Date(); now.setHours(0,0,0,0);
  const out = [];
  for (const [charName, d] of latest.entries()) {
    const days = Math.floor((now - new Date(d.getFullYear(), d.getMonth(), d.getDate()))/86400000);
    const fmt = Utilities.formatDate(d, PTZ, 'dd MMM yyyy');
    const action = (d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth()) ? '' : (d < now ? 'need to post' : '');
    out.push({ Character: charName, LastPostDate: d, LastPostDateFmt: fmt, DaysSince: days, Action: action });
  }
  out.sort((a,b)=>a.Character<b.Character?-1:1);
  return out;
}

function freezeSelectionToValues() {
  const r = SpreadsheetApp.getActiveRange();
  if (!r) return;
  r.setValues(r.getValues());
}

function backupActiveSheet() {
  const sh = SpreadsheetApp.getActiveSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sh.copyTo(ss).setName(`${sh.getName()}__bak__${Utilities.formatDate(new Date(), PTZ, 'yyyy-MM-dd_HH-mm')}`);
}

