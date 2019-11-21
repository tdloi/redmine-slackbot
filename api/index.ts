import { NowRequest, NowResponse } from '@now/node';
import { getDb } from './_mongo';
import { IGlobalConfig, IChatPostMessageResult } from './_interface';
import { isSlackRequest, slack } from './_slack';

export default async (req: NowRequest, res: NowResponse) => {
  const db = await getDb();
  const globalConfig: IGlobalConfig = await db.collection('configs').findOne({
    _type: 'global_config',
  });
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }
  res.status(200).send(null);
  const message = (await slack.chat.postMessage({
    channel: '@loi.tran',
    as_user: true,
    text: 'hello',
  })) as IChatPostMessageResult;
  slack.chat.update({
    channel: message.channel,
    ts: message.ts,
    text: `Hello ${message.ts}`,
  });
};
