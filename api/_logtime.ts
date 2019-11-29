import { IUserConfig } from './_interface';
import { ChatPostMessageArguments } from '@slack/web-api';
import { getIssues, getLoggedHours } from './_redmine';
import dayjs from 'dayjs';
import { configs } from './_settings';
import { getLogTimeMessage } from './_messages';
import { getCurrentTimeZoneDate } from './_utils';

export async function getLogtimeMessagePayload(
  config: IUserConfig,
  offset: number = 0,
  loggedHours: number = -1
): Promise<ChatPostMessageArguments> {
  const issues = await getIssues(config, null, offset);
  if (loggedHours === -1) {
    loggedHours = await getLoggedHours(config, getCurrentTimeZoneDate(dayjs()));
  }
  if (loggedHours >= configs.WORK_HOURS) {
    return {
      channel: config.userId,
      as_user: true,
      text: `Logged ${loggedHours} / ${configs.WORK_HOURS} hours`,
      blocks: [],
    };
  }

  return {
    channel: config.userId,
    as_user: true,
    text: ' ',
    blocks: JSON.parse(
      getLogTimeMessage(config, issues, getCurrentTimeZoneDate(dayjs()), loggedHours)
    ),
  };
}
