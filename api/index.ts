import { NowRequest, NowResponse } from '@now/node';
import { getDb, getGlobalConfig, getUserConfig } from './_mongo';
import { IGlobalConfig, IUserConfig, ISlashCommandPayload } from './_interface';
import { isSlackRequest } from './_slack';
import { getConfigMessage } from './_messages';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }

  const payload: ISlashCommandPayload = req.body;
  if (payload.text !== 'config') {
    res.status(200).json({ text: 'Invalid command. Available commands: `config`' });
    return;
  }

  const globalConfig: IGlobalConfig = await getGlobalConfig();
  const userConfig: IUserConfig = await getUserConfig(payload.user_id);

  res.status(200).json(JSON.parse(getConfigMessage(globalConfig, userConfig)));
};
