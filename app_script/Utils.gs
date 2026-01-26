// =======================
// File: Utils.gs
// =======================
function getHeaders_(sheetName) {
  const map = {
    [NAMES.ALLPOSTS]: [
      'CreatedAt','ThreadID','PostID',
      'Title','Character','Partner','Type','Status',
      'PostDate','WhoPostedLast','URL','WordCount'
    ],
    [NAMES.SUMMARY]: [
      'Year','Character','Partner','Type','Status','StatusNum','Date','DateFmt',
      'ThreadID','URL','Username','WordCount'
    ],
    [NAMES.ACTIVITY]: ['Character','LastPostDate','LastPostDateFmt','DaysSince','Action'],
    [NAMES.PLAYERS]: ['Character','Username'],
    [NAMES.INFORMATION]: ['Character','Completed','Open','Owed']
  };
  return map[sheetName];
}

function headerIndexes_(headers) {
  const idx = {}; headers.forEach((h,i)=>idx[h]=i); return idx;
}
function indexOfHeaders_(headers, names) {
  const m={}; names.forEach(n=>{ const i=headers.indexOf(n); if(i===-1) throw new Error('Missing header: '+n); m[n]=i; }); return m;
}

function readTableAsObjects_(sheet) {
  if (!sheet) return [];
  const lr = sheet.getLastRow(), lc = sheet.getLastColumn();
  if (lr < 1 || lc < 1) return [];
  const values = sheet.getRange(1,1,lr,lc).getValues();
  const headers = values[0].map(h=>String(h||'').trim());
  const out = [];
  for (let i=1;i<values.length;i++) {
    const row = values[i]; if (row.every(v=>v===''||v===null)) continue;
    const o = {}; for (let c=0;c<headers.length;c++) o[headers[c]] = row[c];
    out.push(o);
  }
  return out;
}

function writeTable_(sheet, headers, rows) {
  sheet.clearContents();
  const all = [headers, ...(rows||[])];
  if (!all.length || !headers.length) return;
  sheet.getRange(1,1,all.length, headers.length).setValues(all);
  sheet.autoResizeColumns(1, headers.length);
}

function parseDate_(v){ if(v instanceof Date)return v; const s=String(v||'').trim(); if(!s)return null; const d=new Date(s); return isNaN(d.getTime())?null:d; }
function truncateTime_(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function normalizeStatusText_(raw){ const s=String(raw||'').trim().toLowerCase(); if(['1','complete','completed','done'].includes(s))return'Complete'; if(['-1','dead','dropped'].includes(s))return'Dead'; return'Open'; }
function normalizeType_(raw){ const s=String(raw||'').trim().toUpperCase(); if(s.includes('ONE')&&s.includes('SHOT'))return'ONE SHOT'; return s||'THREAD'; }
function normalizeWhoLast_(raw){ const s=String(raw||'').trim().toLowerCase(); if(s.startsWith('you')||s==='posted')return'You'; return'Partner'; }

// why: point to your forum
function buildThreadUrl_(id){ return `https://tidesoftime.boards.net/thread/${id}`; }

// ensure PostID exists without wiping data
function ensureAllPostsHasPostIdColumn_(sh) {
  const firstRow = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const headers = firstRow.map(h => String(h||'').trim());
  if (!headers.includes('PostID')) {
    const newCol = headers.length + 1;
    sh.getRange(1, newCol).setValue('PostID');
  }
}