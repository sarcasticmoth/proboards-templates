// File: ThreadSummary.gs
// Adds a per-thread summary to eliminate duplicates caused by separate "You" and "Partner" rows.

/** Sheet name + headers for the per-thread rollup. */
const THREAD_SUMMARY_SHEET = 'Thread Summary';
const THREAD_SUMMARY_HEADERS = [
  'Character','ThreadID','Title','Partner','Type','Status',
  'LastPostDate','LastPostDateFmt','LastPostBy','LastWordCount',
  'Posts','YourWordsTotal','URL'
];

/**
 * Build per-thread rows:
 * - One row per ThreadID (latest only).
 * - If multiple entries share the same latest date, prefer the row where You posted.
 */
function buildThreadSummaryRows_(allRows) {
  const byId = new Map();

  // Group by ThreadID
  for (const r of allRows) {
    const tid = String(r.ThreadID || '').trim();
    if (!tid) continue;
    if (!byId.has(tid)) byId.set(tid, []);
    byId.get(tid).push(r);
  }

  const out = [];
  for (const [threadId, rows] of byId.entries()) {
    // Normalize dates, compute stats
    let latestDate = null;
    for (const r of rows) {
      const d = parseDate_(r.PostDate);
      if (!d) continue;
      if (!latestDate || d > latestDate) latestDate = d;
    }

    // Among rows on the latest date, prefer "You"
    const latestDayRows = rows.filter(r => sameDay_(parseDate_(r.PostDate), latestDate));
    // Prefer "You"; fallback to first available latest row
    const latestRow = (latestDayRows.find(r => normalizeWhoLast_(r.WhoPostedLast) === 'You') || latestDayRows[0]) || rows[0];

    // Counters
    const posts = rows.length;
    const yourWordsTotal = rows
      .filter(r => normalizeWhoLast_(r.WhoPostedLast) === 'You')
      .map(r => Number(r.WordCount))
      .filter(n => Number.isFinite(n))
      .reduce((a,b)=>a+b, 0);

    const d = parseDate_(latestRow.PostDate);
    const dateFmt = d ? Utilities.formatDate(d, PTZ, 'dd MMM yyyy') : '';

    // Compose output row
    out.push([
      latestRow.Character || '',
      threadId,
      latestRow.Title || '',
      latestRow.Partner || '',
      normalizeType_(latestRow.Type),
      normalizeStatusText_(latestRow.Status),
      d || '',
      dateFmt,
      normalizeWhoLast_(latestRow.WhoPostedLast),
      // LastWordCount: if You posted on the chosen latest row, keep number; else 'N/A'
      normalizeWhoLast_(latestRow.WhoPostedLast) === 'You'
        ? (Number(latestRow.WordCount) || 0)
        : 'N/A',
      posts,
      yourWordsTotal,
      latestRow.URL || (threadId ? buildThreadUrl_(threadId) : '')
    ]);
  }

  // Sort: Character asc, LastPostDate desc
  out.sort((a,b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    const ad = a[6] instanceof Date ? a[6].getTime() : 0;
    const bd = b[6] instanceof Date ? b[6].getTime() : 0;
    return bd - ad;
  });

  return out;
}

/** True if both dates fall on the same calendar day (ignores time). */
function sameDay_(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Write (or create) the Thread Summary sheet.
 * Safe to call inside your existing rebuild routine.
 */
function writeThreadSummary_(ss, rows) {
  let sh = ss.getSheetByName(THREAD_SUMMARY_SHEET);
  if (!sh) sh = ss.insertSheet(THREAD_SUMMARY_SHEET);
  sh.clearContents();
  sh.getRange(1, 1, 1, THREAD_SUMMARY_HEADERS.length).setValues([THREAD_SUMMARY_HEADERS]);
  if (rows.length) {
    sh.getRange(2, 1, rows.length, THREAD_SUMMARY_HEADERS.length).setValues(rows);
  }
  sh.autoResizeColumns(1, THREAD_SUMMARY_HEADERS.length);
}

/**
 * Drop-in replacement for your existing rebuild that also fills Thread Summary.
 * If you already have a rebuildMaterializedReports(), replace it with this version.
 */
function rebuildMaterializedReports() {
  const ss = SpreadsheetApp.getActive();
  const all = readTableAsObjects_(ss.getSheetByName(NAMES.ALLPOSTS));

  const playersMap = buildPlayersUsernameMap_(ss);

  // Per-post Summary (unchanged behavior)
  const summary = buildSummaryRows_(all, playersMap);
  writeTable_(ss.getSheetByName(NAMES.SUMMARY), getHeaders_(NAMES.SUMMARY), summary);

  // Activity & Information (unchanged behavior)
  const activity = buildActivityRows_(all);
  writeTable_(ss.getSheetByName(NAMES.ACTIVITY), getHeaders_(NAMES.ACTIVITY), activity);

  const info = buildInformationRows_(all);
  writeTable_(ss.getSheetByName(NAMES.INFORMATION), getHeaders_(NAMES.INFORMATION), info);

  // NEW: Per-thread rollup that avoids duplicates
  const threadSummary = buildThreadSummaryRows_(all);
  writeThreadSummary_(ss, threadSummary);

  CacheService.getDocumentCache().remove('PT_DASH_V2');
  SpreadsheetApp.getActiveSpreadsheet().toast('Aggregates rebuilt (incl. Thread Summary)', 'Post Tracker');
}