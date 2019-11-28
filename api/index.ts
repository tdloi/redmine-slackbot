import { NowRequest, NowResponse } from '@now/node';
import { getUserConfig } from './_mongo';
import { IUserConfig, ISlashCommandPayload } from './_interface';
import { isSlackRequest, slack } from './_slack';
import { getConfigMessage } from './_messages';
import { getLogtimeMessagePayload } from './_logtime';

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

      const logtimeMessage = await getLogtimeMessagePayload(userConfig);
      if (!logtimeMessage.blocks) {
        return res.status(200).json({ text: logtimeMessage.text });
      }
      return res.status(200).json({ blocks: logtimeMessage.blocks });
    default:
      return res.status(200).json({
        text: 'Invalid command. Available commands: `config`, `log`',
      });
  }
};
