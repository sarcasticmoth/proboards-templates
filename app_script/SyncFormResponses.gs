// =======================
// File: SyncFormResponses.gs
// =======================
function syncFormResponsesToAllPosts() { return syncFormResponsesToAllPosts_({}); }
function fullRescanFormResponses() { return syncFormResponsesToAllPosts_({ fullRescan: true }); }
function clearSyncState() {
  PropertiesService.getDocumentProperties().deleteProperty(SYNC_PROP);
  SpreadsheetApp.getActive().toast('Sync state cleared', 'Post Tracker');
}
function enableAutoSyncOnEdit() {
  const ssId = SpreadsheetApp.getActive().getId();
  const has = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'onEditSync_' && t.getTriggerSourceId() === ssId);
  if (!has) ScriptApp.newTrigger('onEditSync_').forSpreadsheet(ssId).onEdit().create();
  SpreadsheetApp.getActive().toast('Auto Sync enabled', 'Post Tracker');
}
function onEditSync_(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.range.getSheet();
    if (!sh || sh.getName() !== NAMES.FORM_RESPONSES) return;
    const row = e.range.getRow();
    if (row <= 1) return;
    syncFormResponsesToAllPosts_({ specificRows: [row] });
  } catch (err) { console.error(err); }
}

function syncFormResponsesToAllPosts_({ fullRescan = false, specificRows = null } = {}) {
  const lock = LockService.getDocumentLock();
  lock.tryLock(30000);

  const ss = SpreadsheetApp.getActive();
  const formSh = ss.getSheetByName(NAMES.FORM_RESPONSES);
  const allSh  = ss.getSheetByName(NAMES.ALLPOSTS);
  if (!formSh || !allSh) { lock.releaseLock(); return; }

  ensureAllPostsHasPostIdColumn_(allSh);

  const formValues = formSh.getDataRange().getValues();
  if (formValues.length < 2) { lock.releaseLock(); return; }

  const formHeaders = formValues[0].map(h => String(h || '').trim());
  const allHeaders  = allSh.getRange(1,1,1,Math.max(1, allSh.getLastColumn())).getValues()[0].map(h=>String(h||'').trim());

  const allValues = allSh.getDataRange().getValues();
  const allIndex = buildAllPostsIndexFlexible_(allValues, allHeaders);

  let startRow = 2;
  const props = PropertiesService.getDocumentProperties();
  if (!fullRescan && !specificRows) {
    const last = parseInt(props.getProperty(SYNC_PROP) || '1', 10);
    startRow = Math.max(2, last + 1);
  }
  const rowsToProcess = specificRows
    ? specificRows.filter(r => r >= 2 && r <= formValues.length)
    : Array.from({ length: (formValues.length - startRow + 1) }, (_, i) => startRow + i);

  if (!rowsToProcess.length) { lock.releaseLock(); return; }

  const updates = [];
  const appends = [];
  for (const r of rowsToProcess) {
    const rowArr = formValues[r - 1];
    const obj = mapFormRowToAllPostsObject_(formHeaders, rowArr);
    if (!obj) continue;
    const key = makeFlexibleKey_(obj.ThreadID, obj.PostID, obj.CreatedAt);
    if (allIndex.has(key)) {
      const targetRow = allIndex.get(key);
      const rowValues = allHeaders.map(h => obj[h] ?? '');
      updates.push({ row: targetRow, values: rowValues });
    } else {
      const rowValues = allHeaders.map(h => obj[h] ?? '');
      appends.push(rowValues);
      allIndex.set(key, Math.max(2, allSh.getLastRow()) + appends.length);
    }
  }

  if (updates.length) {
    updates.sort((a,b) => a.row - b.row);
    let i = 0;
    while (i < updates.length) {
      let j = i + 1;
      while (j < updates.length && updates[j].row === updates[j-1].row + 1) j++;
      const start = Math.max(2, updates[i].row);
      const block = updates.slice(i, j).map(u => u.values);
      allSh.getRange(start, 1, block.length, allHeaders.length).setValues(block);
      i = j;
    }
  }
  if (appends.length) {
    const startRowAppend = Math.max(2, allSh.getLastRow() + 1);
    const neededRows = startRowAppend + appends.length - 1;
    const toAdd = neededRows - allSh.getMaxRows();
    if (toAdd > 0) allSh.insertRowsAfter(allSh.getMaxRows(), toAdd);
    allSh.getRange(startRowAppend, 1, appends.length, allHeaders.length).setValues(appends);
  }

  if (!specificRows) props.setProperty(SYNC_PROP, String(formValues.length));

  try { rebuildMaterializedReports(); } catch (_) {}
  lock.releaseLock();
  SpreadsheetApp.getActive().toast(`Synced ${updates.length} updates, ${appends.length} appends`, 'Post Tracker');
}

function buildAllPostsIndexFlexible_(values, headers) {
  if (values.length === 0) return new Map();
  const idx = {}; headers.forEach((h,i)=>idx[h]=i);
  const map = new Map();
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const tid = String(row[idx.ThreadID] || '').trim();
    const pid = String(row[idx.PostID] || '').trim();
    const ca  = row[idx.CreatedAt] instanceof Date ? row[idx.CreatedAt] : parseDate_(row[idx.CreatedAt]);
    const key = makeFlexibleKey_(tid, pid, ca);
    if (!tid) continue;
    map.set(key, r + 1);
  }
  return map;
}

function mapFormRowToAllPostsObject_(headers, row) {
  const pick = t => row[headers.indexOf(t)];
  const createdAt = parseDate_(pick(FORM_SPEC.FORM_TIMESTAMP_HEADER)) || new Date();
  const tid = String(pick(FORM_SPEC.FIELDS.THREAD_ID) || '').trim();
  const pid = String(pick(FORM_SPEC.FIELDS.POST_ID) || '').trim();
  const character = String(pick(FORM_SPEC.FIELDS.CHARACTER) || '').trim();
  const other = String(pick(FORM_SPEC.FIELDS.CHARACTER_OTHER) || '').trim();
  const charFinal = character === 'Other (type below)' ? other : character;
  const d = parseDate_(pick(FORM_SPEC.FIELDS.POST_DATE));
  if (!tid || !charFinal || !d) return null;

  const who = normalizeWhoLast_(pick(FORM_SPEC.FIELDS.WHO_POSTED_LAST));
  const wcRaw = String(pick(FORM_SPEC.FIELDS.WORD_COUNT) || '').trim();
  const wcNum = wcRaw === '' ? '' : (isNaN(Number(wcRaw)) ? '' : String(Math.max(0, parseInt(wcRaw, 10))));
  const wordCount = (who === 'Partner') ? 'N/A' : wcNum;

  return {
    CreatedAt: createdAt,
    ThreadID: tid,
    PostID: pid,
    Title: String(pick(FORM_SPEC.FIELDS.TITLE) || '').trim(),
    Character: charFinal,
    Partner: String(pick(FORM_SPEC.FIELDS.PARTNER) || '').trim(),
    Type: normalizeType_(pick(FORM_SPEC.FIELDS.TYPE)),
    Status: normalizeStatusText_(pick(FORM_SPEC.FIELDS.STATUS)),
    PostDate: d,
    WhoPostedLast: who,
    URL: tid ? buildThreadUrl_(tid) : '',
    WordCount: wordCount
  };
}
