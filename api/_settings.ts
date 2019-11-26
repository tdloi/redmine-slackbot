export const actions = {
  CONFIG: 'edit_config',
  CLOSE: 'delete_message',
  LOG: 'log_time',
};

export const configs = {
  SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
  SLACK_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  AUTH_CRE: process.env.AUTH_CRE,

  // DOES NOT include trailing slash
  // e.g: https://example.com
  REDMINE_URL: process.env.REDMINE_URL,
  WORK_HOURS: parseInt(process.env.WORK_HOURS),
  TIMEZONE: parseInt(process.env.TIME_ZONE), // e.g: 7 or -7
  SECRET: process.env.SECRET,
};
