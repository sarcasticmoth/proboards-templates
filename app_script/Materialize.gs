// =======================
// File: Materialize.gs
// =======================
function rebuildMaterializedReports() {
  const ss = SpreadsheetApp.getActive();
  const all = readTableAsObjects_(ss.getSheetByName(NAMES.ALLPOSTS));

  const playersMap = buildPlayersUsernameMap_(ss);
  const summary = buildSummaryRows_(all, playersMap);
  writeTable_(ss.getSheetByName(NAMES.SUMMARY), getHeaders_(NAMES.SUMMARY), summary);

  const activity = buildActivityRows_(all);
  writeTable_(ss.getSheetByName(NAMES.ACTIVITY), getHeaders_(NAMES.ACTIVITY), activity);

  // thread-level Information (latest per (Character, ThreadID))
  const info = buildInformationRows_(all);
  writeTable_(ss.getSheetByName(NAMES.INFORMATION), getHeaders_(NAMES.INFORMATION), info);

  const threadSummary = buildThreadSummaryRows_(all);
  writeTable_(ss.getSheetByName(NAMES.THREAD_SUMMARY),
    ['Character','ThreadID','Title','Partner','Type','Status','LastPostDate','LastPostDateFmt','LastPostBy','LastWordCount','Posts','YourWordsTotal','URL'],
    threadSummary
  );

  try { CacheService.getDocumentCache().removeAll(['PT_DASH_SAFE_V1','PT_DASH_V2']); } catch(_){}
  SpreadsheetApp.getActiveSpreadsheet().toast('Aggregates rebuilt', 'Post Tracker');
}

function buildSummaryRows_(rows, playersMap) {
  const out = [];
  for (const r of rows) {
    const d = parseDate_(r.PostDate);
    const year = d ? Utilities.formatDate(d, PTZ, 'yyyy') : '';
    const dateFmt = d ? Utilities.formatDate(d, PTZ, 'dd MMM yyyy') : '';
    const status = normalizeStatusText_(r.Status);
    const statusNum = status === 'Complete' ? 1 : status === 'Dead' ? -1 : 0;
    out.push([
      year,
      r.Character || '',
      r.Partner || '',
      normalizeType_(r.Type),
      status,
      statusNum,
      d || '',
      dateFmt,
      r.ThreadID || '',
      r.URL || (r.ThreadID ? buildThreadUrl_(r.ThreadID) : ''),
      playersMap.get(String(r.Character||'').trim()) || '',
      r.WordCount ?? ''
    ]);
  }
  out.sort((a,b) => a[1]===b[1] ? ((b[6]||0)-(a[6]||0)) : (a[1]<b[1]?-1:1));
  return out;
}

function buildActivityRows_(rows) {
  const latest = new Map();
  rows.forEach(r => {
    const c = String(r.Character||'').trim();
    const d = parseDate_(r.PostDate);
    if (!c || !d) return;
    const prev = latest.get(c);
    if (!prev || d > prev) latest.set(c, d);
  });
  const now = truncateTime_(new Date());
  const out = [];
  for (const [charName, d] of latest.entries()) {
    const days = Math.floor((now - truncateTime_(d)) / 86400000);
    const fmt = Utilities.formatDate(d, PTZ, 'dd MMM yyyy');
    const action = (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) ? '' : (d < now ? 'need to post' : '');
    out.push([charName, d, fmt, days, action]);
  }
  out.sort((a,b)=>a[0]<b[0]?-1:1);
  return out;
}

function buildInformationRows_(rows) {
  // latest per (Character, ThreadID)
  const latestByKey = new Map();
  for (const r of rows) {
    const char = String(r.Character||'').trim();
    const tid  = String(r.ThreadID||'').trim();
    if (!char || !tid) continue;
    const key = `${char}|${tid}`;
    const curD = parseDate_(r.PostDate);
    const curC = parseDate_(r.CreatedAt);
    const prev = latestByKey.get(key);
    if (!prev) { latestByKey.set(key, r); continue; }
    const prevD = parseDate_(prev.PostDate);
    if (curD && (!prevD || curD > prevD)) { latestByKey.set(key, r); continue; }
    if (curD && prevD && curD.getTime() === prevD.getTime()) {
      const prevC = parseDate_(prev.CreatedAt);
      if (curC && (!prevC || curC > prevC)) latestByKey.set(key, r);
    }
  }
  const aggByChar = new Map();
  latestByKey.forEach(r => {
    const char = String(r.Character||'').trim();
    if (!aggByChar.has(char)) aggByChar.set(char, { completed:0, open:0, owed:0 });
    const status = normalizeStatusText_(r.Status);
    const who = normalizeWhoLast_(r.WhoPostedLast);
    const a = aggByChar.get(char);
    if (status === 'Complete') a.completed++;
    else if (status === 'Open') { a.open++; if (who === 'Partner') a.owed++; }
  });
  const out = [];
  [...aggByChar.keys()].sort().forEach(c => {
    const a = aggByChar.get(c);
    out.push([c, a.completed, a.open, a.owed]);
  });
  return out;
}

function buildThreadSummaryRows_(rows) {
  const byId = new Map();
  for (const r of rows) {
    const tid = String(r.ThreadID||'').trim();
    if (!tid) continue;
    if (!byId.has(tid)) byId.set(tid, []);
    byId.get(tid).push(r);
  }
  const out = [];
  for (const [tid, list] of byId.entries()) {
    const maxDate = list.reduce((m, r) => {
      const d = parseDate_(r.PostDate);
      return (!m || (d && d > m)) ? d : m;
    }, null);
    const candidates = list.filter(r => {
      const d = parseDate_(r.PostDate);
      return (d && maxDate && d.getTime() === maxDate.getTime());
    });
    let latest = candidates[0] || list[0];
    for (const r of candidates) {
      const ca = parseDate_(r.CreatedAt);
      const cb = parseDate_(latest.CreatedAt);
      if (ca && (!cb || ca > cb)) latest = r;
    }
    const posts = list.length;
    const yourWordsTotal = list
      .filter(r => normalizeWhoLast_(r.WhoPostedLast) === 'You')
      .map(r => Number(r.WordCount))
      .filter(Number.isFinite)
      .reduce((a,b)=>a+b,0);

    const d = parseDate_(latest.PostDate);
    const dateFmt = d ? Utilities.formatDate(d, PTZ, 'dd MMM yyyy') : '';
    out.push([
      latest.Character || '',
      tid,
      String(latest.Title||''),
      String(latest.Partner||''),
      normalizeType_(latest.Type),
      normalizeStatusText_(latest.Status),
      d || '',
      dateFmt,
      normalizeWhoLast_(latest.WhoPostedLast),
      normalizeWhoLast_(latest.WhoPostedLast)==='You' ? (Number(latest.WordCount)||0) : 'N/A',
      posts,
      yourWordsTotal,
      latest.URL || (tid ? buildThreadUrl_(tid) : '')
    ]);
  }
  out.sort((a,b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    const ad = a[6] instanceof Date ? a[6].getTime() : 0;
    const bd = b[6] instanceof Date ? b[6].getTime() : 0;
    return bd - ad;
  });
  return out;
}
