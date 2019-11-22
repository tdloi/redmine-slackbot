import { NowRequest, NowResponse } from '@now/node';
import { getDb } from './_mongo';
import { IGlobalConfig, IUserConfig } from './_interface';
import { isSlackRequest } from './_slack';
import { getConfigMessage } from './_messages';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }
  if (req.body.text !== 'config') {
    res.status(200).json({ text: 'Invalid command. Available commands: `config`' });
    return;
  }

  const db = await getDb();
  const globalConfig: IGlobalConfig = await db.collection('configs').findOne({
    _type: 'globalConfig',
  });
  const userConfig: IUserConfig = await db.collection('configs').findOne({
    _type: 'userConfig',
    userId: req.body.user_id,
  } as IUserConfig);
  res.status(200).json(JSON.parse(getConfigMessage(globalConfig, userConfig)));
};
