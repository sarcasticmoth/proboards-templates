// =======================
// File: Ingest.gs
// =======================
function ingestFromForm(e) {
  const ss = SpreadsheetApp.getActive();
  const obj = formEventToObject_(e);
  upsertAllPostsRow_(ss, obj);
  try { rebuildMaterializedReports(); } catch(e2) {}
}

function formEventToObject_(e) {
  const r = e && e.namedValues ? e.namedValues : {};
  const pick = k => (Array.isArray(r[k]) ? r[k][0] : r[k]) || '';

  const createdAt = parseDate_(pick(FORM_SPEC.FORM_TIMESTAMP_HEADER)) || new Date();
  const rawChar = String(pick(FORM_SPEC.FIELDS.CHARACTER)).trim();
  const charOther = String(pick(FORM_SPEC.FIELDS.CHARACTER_OTHER)).trim();
  const character = rawChar === 'Other (type below)' ? charOther : rawChar;

  const threadId = String(pick(FORM_SPEC.FIELDS.THREAD_ID)).trim();
  const postId = String(pick(FORM_SPEC.FIELDS.POST_ID) || '').trim();
  const date = parseDate_(pick(FORM_SPEC.FIELDS.POST_DATE));
  const who = normalizeWhoLast_(pick(FORM_SPEC.FIELDS.WHO_POSTED_LAST));

  const wcRaw = String(pick(FORM_SPEC.FIELDS.WORD_COUNT)).trim();
  const wcNum = wcRaw === '' ? '' : (isNaN(Number(wcRaw)) ? '' : String(Math.max(0, parseInt(wcRaw,10))));
  const wordCount = (who === 'Partner') ? 'N/A' : wcNum;

  return {
    CreatedAt: createdAt,
    ThreadID: threadId,
    PostID: postId,
    Title: String(pick(FORM_SPEC.FIELDS.TITLE)).trim(),
    Character: character,
    Partner: String(pick(FORM_SPEC.FIELDS.PARTNER)).trim(),
    Type: normalizeType_(pick(FORM_SPEC.FIELDS.TYPE)),
    Status: normalizeStatusText_(pick(FORM_SPEC.FIELDS.STATUS)),
    PostDate: date || '',
    WhoPostedLast: who,
    URL: threadId ? buildThreadUrl_(threadId) : '',
    WordCount: wordCount
  };
}

function upsertAllPostsRow_(ss, obj) {
  const sh = ss.getSheetByName(NAMES.ALLPOSTS);
  ensureAllPostsHasPostIdColumn_(sh);

  const sheetHeaders = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0].map(h=>String(h||'').trim());
  const key = makeFlexibleKey_(obj.ThreadID, obj.PostID, obj.CreatedAt);

  // scan for existing key
  let rowIdx = -1;
  const lr = sh.getLastRow();
  if (lr >= 2) {
    const data = sh.getRange(2,1,lr-1,sheetHeaders.length).getValues();
    const idx = indexOfHeaders_(sheetHeaders, ['ThreadID','PostID','CreatedAt']);
    for (let i=0;i<data.length;i++) {
      const tid = String(data[i][idx.ThreadID] || '').trim();
      const pid = String(data[i][idx.PostID] || '').trim();
      const ca  = data[i][idx.CreatedAt] instanceof Date ? data[i][idx.CreatedAt] : parseDate_(data[i][idx.CreatedAt]);
      const k = makeFlexibleKey_(tid, pid, ca);
      if (k === key) { rowIdx = i + 2; break; }
    }
  }

  const row = sheetHeaders.map(h => (obj[h] !== undefined ? obj[h] : ''));

  if (rowIdx === -1) {
    const startRow = Math.max(2, sh.getLastRow() + 1);
    const neededRows = startRow;
    const toAdd = neededRows - sh.getMaxRows();
    if (toAdd > 0) sh.insertRowsAfter(sh.getMaxRows(), toAdd);
    sh.getRange(startRow, 1, 1, sheetHeaders.length).setValues([row]);
  } else {
    sh.getRange(rowIdx, 1, 1, sheetHeaders.length).setValues([row]);
  }
}

function makeFlexibleKey_(threadId, postId, createdAt) {
  const tid = String(threadId||'').trim();
  const pid = String(postId||'').trim();
  if (tid && pid) return `${tid}|${pid}`;
  const t = (createdAt instanceof Date) ? createdAt.getTime() : (parseDate_(createdAt)?.getTime() || '');
  return `${tid}|${t}`;
}