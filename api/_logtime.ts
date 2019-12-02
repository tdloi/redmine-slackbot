import { IUserConfig } from './_interface';
import { ChatPostMessageArguments } from '@slack/web-api';
import { getIssues, getLoggedHours } from './_redmine';
import { configs } from './_settings';
import { getLogTimeMessage } from './_messages';
import { getDate } from './_utils';

export async function getLogtimeMessagePayload(
  config: IUserConfig,
  offset: number = 0,
  loggedHours: number = -1
): Promise<ChatPostMessageArguments> {
  const issues = await getIssues(config, null, offset);
  if (loggedHours === -1) {
    loggedHours = await getLoggedHours(config, getDate());
  }
  if (loggedHours >= configs.WORK_HOURS) {
    return {
      channel: config.userId,
      as_user: true,
      text: `You have logged ${loggedHours} / ${configs.WORK_HOURS} hours today`,
      blocks: [],
    };
  }

  return {
    channel: config.userId,
    as_user: true,
    text: 'Redmine logtime reminder',
    blocks: JSON.parse(getLogTimeMessage(config, issues, getDate(), loggedHours)),
  };
}
