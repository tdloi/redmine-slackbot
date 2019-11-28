import { NowRequest, NowResponse } from '@now/node';
import { getIssues, getLoggedHours } from './_redmine';
import { configs } from './_settings';
import dayjs from 'dayjs';
import { slack } from './_slack';
import { ChatPostMessageArguments } from '@slack/web-api';
import { IUserConfig } from './_interface';
import { getLogTimeMessage } from './_messages';
import { getCurrentTimeZoneDate } from './_utils';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') return res.status(405).send(null);

  if (req.headers.authorization !== `Basic ${Buffer.from(configs.SECRET).toString('base64')}`) {
    return res.status(401).send(null);
  }
  if (!req.body.config) return res.status(400).send(null);

  const config = req.body.config as IUserConfig;
  const issues = await getIssues(config);
  const logged = await getLoggedHours(config, dayjs());
  if (logged >= configs.WORK_HOURS) {
    return res.status(200).send(null);
  }

  await slack.chat.postMessage({
    channel: config.userId,
    as_user: true,
    blocks: JSON.parse(getLogTimeMessage(config, issues, getCurrentTimeZoneDate(dayjs()), logged)),
  } as ChatPostMessageArguments);
  return res.status(200).send(null);
};
