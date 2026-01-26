// =======================
// File: PlayersUtils.gs
// =======================
function buildPlayersUsernameMap_(ss) {
  ss = ss || SpreadsheetApp.getActive();
  const sheetName = NAMES.PLAYERS || 'Players';
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return new Map();

  const values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return new Map();

  const headers = values[0].map(h => String(h||'').trim());
  const idxC = findHeaderIndex_(headers, ['Character','Name','Character Name']);
  if (idxC === -1) return new Map();
  const idxU = findHeaderIndex_(headers, ['Username','Handle','User','@']);

  const out = new Map();
  for (let i=1;i<values.length;i++) {
    const name = String(values[i][idxC]||'').trim();
    if (!name) continue;
    let user = (idxU !== -1) ? String(values[i][idxU]||'').trim() : '';
    if (!user) user = '@' + name.toLowerCase();
    out.set(name, user);
  }
  return out;
}

function findHeaderIndex_(headers, candidates) {
  const lower = headers.map(h=>h.toLowerCase());
  for (const c of candidates) {
    const j = lower.indexOf(String(c).toLowerCase());
    if (j !== -1) return j;
  }
  return -1;
}