// =======================
// File: Constants.gs
// =======================
const PTZ = 'America/Los_Angeles';

const NAMES = Object.freeze({
  ALLPOSTS: 'ALLPOSTS',
  SUMMARY: 'Summary',
  ACTIVITY: 'Activity',
  PLAYERS: 'Players',
  INFORMATION: 'Information',
  FORM_RESPONSES: 'Form Responses 1',
  THREAD_SUMMARY: 'Thread Summary'
});

const FORM_SPEC = Object.freeze({
  TITLE: 'Post Tracker Entry',
  FIELDS: {
    THREAD_ID: 'Thread ID',
    POST_ID: 'Post ID', // NEW
    TITLE: 'Title',
    CHARACTER: 'Character',
    CHARACTER_OTHER: 'Character (Other)',
    PARTNER: 'Partner',
    TYPE: 'Type',
    STATUS: 'Status',
    POST_DATE: 'Post Date',
    WHO_POSTED_LAST: 'Who Posted Last',
    WORD_COUNT: 'Word Count',
    NOTES: 'Notes'
  },
  TYPES: ['THREAD', 'ONE SHOT'],
  STATUSES: ['Open', 'Complete', 'Dead'],
  WHO_LAST: ['You', 'Partner'],
  FORM_TIMESTAMP_HEADER: 'Timestamp'
});

const SYNC_PROP = 'PT_LAST_SYNCED_ROW_V2';