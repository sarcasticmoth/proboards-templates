// =======================
// File: Setup.gs
// =======================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Post Tracker')
    .addItem('Setup Tracker (one-time)', 'setupPostTracker')
    .addSeparator()
    .addItem('Open Dashboard', 'openDashboardSidebar')
    .addItem('Rebuild Aggregates', 'rebuildMaterializedReports')
    .addItem('Repair + Rebuild (tolerant)', 'repairAndRebuild')
    .addSeparator()
    .addItem('Sync Now (Form → ALLPOSTS)', 'syncFormResponsesToAllPosts')
    .addItem('Enable Auto Sync on Edit', 'enableAutoSyncOnEdit')
    .addItem('Full Rescan (all form rows)', 'fullRescanFormResponses')
    .addItem('Clear Sync State', 'clearSyncState')
    .addSeparator()
    .addItem('Freeze Selection (Values)', 'freezeSelectionToValues')
    .addItem('Backup Active Sheet', 'backupActiveSheet')
    .addToUi();
}

function setupPostTracker() {
  const ss = SpreadsheetApp.getActive();
  ensureSheetsAndHeaders_(ss);
  const form = ensureFormAndDestination_(ss);
  ensureFormFields_(form, ss);
  ensureFormTrigger_(form);
  SpreadsheetApp.getActiveSpreadsheet().toast('Setup complete', 'Post Tracker');
}

function ensureSheetsAndHeaders_(ss) {
  const want = [
    { name: NAMES.ALLPOSTS, headers: getHeaders_(NAMES.ALLPOSTS), wipe: false },
    { name: NAMES.SUMMARY, headers: getHeaders_(NAMES.SUMMARY), wipe: true },
    { name: NAMES.ACTIVITY, headers: getHeaders_(NAMES.ACTIVITY), wipe: true },
    { name: NAMES.PLAYERS, headers: getHeaders_(NAMES.PLAYERS), wipe: false },
    { name: NAMES.INFORMATION, headers: getHeaders_(NAMES.INFORMATION), wipe: true },
    { name: NAMES.THREAD_SUMMARY, headers: ['Character','ThreadID','Title','Partner','Type','Status','LastPostDate','LastPostDateFmt','LastPostBy','LastWordCount','Posts','YourWordsTotal','URL'], wipe: true }
  ];
  want.forEach(({name, headers, wipe}) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (wipe || sh.getLastRow() === 0) {
      sh.clearContents();
      sh.getRange(1,1,1,headers.length).setValues([headers]);
    } else {
      // light header ensure
      const first = sh.getRange(1,1,1,Math.max(headers.length, sh.getLastColumn())).getValues()[0].map(x=>String(x||'').trim());
      if (name === NAMES.ALLPOSTS && !first.includes('PostID')) ensureAllPostsHasPostIdColumn_(sh);
    }
    sh.autoResizeColumns(1, sh.getLastColumn()||headers.length);
  });
}

function ensureFormAndDestination_(ss) {
  const props = PropertiesService.getDocumentProperties();
  const existingId = props.getProperty('PT_FORM_ID');
  let form;
  if (existingId) { try { form = FormApp.openById(existingId); } catch(_){} }
  if (!form) {
    form = FormApp.create(FORM_SPEC.TITLE);
    props.setProperty('PT_FORM_ID', form.getId());
  }
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  return form;
}

function ensureFormFields_(form, ss) {
  form.getItems().forEach(i => form.deleteItem(i));
  form.setShuffleQuestions(false);
  form.setProgressBar(false);
  form.setCollectEmail(false);
  form.setConfirmationMessage('Thanks! Entry recorded. The dashboard updates shortly.');

  form.addSectionHeaderItem().setTitle('Thread Details');

  const idItem = form.addTextItem().setTitle(FORM_SPEC.FIELDS.THREAD_ID).setRequired(true);
  idItem.setHelpText('Numeric ID at the end of the thread URL, e.g. 11330');
  idItem.setValidation(FormApp.createTextValidation().requireTextMatchesPattern('^\\d+$').setHelpText('Digits only').build());

  form.addTextItem().setTitle(FORM_SPEC.FIELDS.POST_ID).setRequired(false).setHelpText('Optional per-post ID');

  form.addTextItem().setTitle(FORM_SPEC.FIELDS.TITLE).setRequired(false);

  const charChoices = getCharacterChoicesFromPlayers_(ss) || ['Add characters to Players sheet','Other (type below)'];
  form.addListItem().setTitle(FORM_SPEC.FIELDS.CHARACTER).setRequired(true)
      .setChoiceValues(charChoices.includes('Other (type below)') ? charChoices : [...charChoices, 'Other (type below)']);
  form.addTextItem().setTitle(FORM_SPEC.FIELDS.CHARACTER_OTHER).setRequired(false);

  form.addTextItem().setTitle(FORM_SPEC.FIELDS.PARTNER).setRequired(false);
  form.addListItem().setTitle(FORM_SPEC.FIELDS.TYPE).setChoiceValues(FORM_SPEC.TYPES).setRequired(true);
  form.addListItem().setTitle(FORM_SPEC.FIELDS.STATUS).setChoiceValues(FORM_SPEC.STATUSES).setRequired(true);
  form.addDateItem().setTitle(FORM_SPEC.FIELDS.POST_DATE).setRequired(true);

  form.addMultipleChoiceItem().setTitle(FORM_SPEC.FIELDS.WHO_POSTED_LAST).setChoiceValues(FORM_SPEC.WHO_LAST).setRequired(true);

  const wc = form.addTextItem().setTitle(FORM_SPEC.FIELDS.WORD_COUNT).setRequired(false);
  wc.setHelpText('If YOU posted, enter your word count. If PARTNER posted, leave blank (auto N/A).');
  wc.setValidation(FormApp.createTextValidation().requireTextMatchesPattern('^\\d*$').setHelpText('Digits only or blank').build());

  form.addParagraphTextItem().setTitle(FORM_SPEC.FIELDS.NOTES).setRequired(false);
}

function ensureFormTrigger_(form) {
  const formId = form.getId();
  const has = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'ingestFromForm');
  if (!has) ScriptApp.newTrigger('ingestFromForm').forForm(formId).onFormSubmit().create();
}

function getCharacterChoicesFromPlayers_(ss) {
  const sh = ss.getSheetByName(NAMES.PLAYERS); if (!sh) return null;
  const n = Math.max(0, sh.getLastRow() - 1);
  if (!n) return null;
  const values = sh.getRange(2,1,n,1).getValues().map(r => String(r[0]||'').trim()).filter(Boolean);
  const uniq = [...new Set(values)];
  return uniq.length ? [...uniq, 'Other (type below)'] : null;
}