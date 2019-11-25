import { NowRequest, NowResponse } from '@now/node';
import { getUserConfig } from './_mongo';
import { IUserConfig, ISlashCommandPayload } from './_interface';
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

  const userConfig: IUserConfig = await getUserConfig(payload.user_id);

  res.status(200).json(JSON.parse(getConfigMessage(userConfig)));
};
