import { NowRequest, NowResponse } from '@now/node';
import { getUserConfig } from './_mongo';
import { IUserConfig, ISlashCommandPayload } from './_interface';
import { isSlackRequest } from './_slack';
import { getConfigMessage } from './_messages';
import { configs } from './_settings';
import fetch from 'node-fetch';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }

  const payload: ISlashCommandPayload = req.body;
  const userConfig: IUserConfig = await getUserConfig(payload.user_id);

  switch (payload.text) {
    case 'config':
      return res.status(200).json(JSON.parse(getConfigMessage(userConfig)));
    case 'log':
      if (!userConfig) {
        return res.status(200).json({ text: 'Please add your Redmine Token first' });
      }
      const proto = req.headers['x-forwarded-proto'];
      const url = req.headers['x-now-deployment-url'];
      fetch(`${proto}://${url}/api/message`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(configs.SECRET).toString('base64'),
        },
        body: JSON.stringify({ config: userConfig }),
      });
      return res.status(200).send(null);
    default:
      return res.status(200).json({
        text: 'Invalid command. Available commands: `config`, `log`',
      });
  }
};
