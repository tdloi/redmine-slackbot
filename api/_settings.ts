export const actions = {
  CONFIG: 'edit_config',
  DELETE: 'delete_config',
  CLOSE: 'delete_message',
  LOG: 'log_time',
  PAGINATE: 'paginate',
};

export const configs = {
  SLACK_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  TRIGGER_CREDENTIAL: process.env.TRIGGER_CREDENTIAL,
  COLLECTION: 'configs',

  // DOES NOT include trailing slash
  // e.g: https://example.com
  REDMINE_URL: process.env.REDMINE_URL,
  REDMINE_NORMAL_HOUR_ID: parseInt(process.env.REDMINE_NORMAL_HOUR_ID),
  WORK_HOURS: parseInt(process.env.WORK_HOURS),
  TIMEZONE: parseInt(process.env.TIMEZONE), // e.g: 7 or -7
};
