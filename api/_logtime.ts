import { IUserConfig } from './_interface';
import { ChatPostMessageArguments } from '@slack/web-api';
import { getIssues, getLoggedHours } from './_redmine';
import dayjs from 'dayjs';
import { configs } from './_settings';
import { getLogTimeMessage } from './_messages';

export async function getLogtimeMessagePayload(
  config: IUserConfig,
  offset: number = 0
): Promise<ChatPostMessageArguments> {
  const issues = await getIssues(config, null, offset);
  const logged = await getLoggedHours(config, dayjs());
  if (logged >= configs.WORK_HOURS) {
    return {
      channel: config.userId,
      as_user: true,
      text: `Logged ${logged} / ${configs.WORK_HOURS} hours`,
      blocks: [],
    };
  }

  return {
    channel: config.userId,
    as_user: true,
    text: ' ',
    blocks: JSON.parse(getLogTimeMessage(config, issues, dayjs(), logged)),
  };
}
