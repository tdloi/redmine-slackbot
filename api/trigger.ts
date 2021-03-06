import { getUsersConfig } from './_mongo';
import { NowRequest, NowResponse } from '@now/node';
import { configs } from './_settings';
import { ChatPostMessageArguments } from '@slack/web-api';
import { getLogtimeMessagePayload } from './_logtime';
import { slack } from './_slack';
import { IUserConfig } from './_interface';
import { encode, getDate } from './_utils';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') return res.status(405).send(null);
  if (req.headers.authorization !== `Basic ${encode(configs.TRIGGER_CREDENTIAL)}`) {
    return res.status(401).send(null);
  }

  const usersConfig = await getUsersConfig();
  if (usersConfig === null) {
    return res.status(200).send(null);
  }

  const currentHour = getDate().hour();
  const response = await Promise.all(
    usersConfig.filter(user => user.remindAt === currentHour).map(sendMessage)
  );
  return res.status(200).json({ total: response.length });
};

async function sendMessage(config: IUserConfig) {
  const logtimeMessage: ChatPostMessageArguments = await getLogtimeMessagePayload(config);
  if (logtimeMessage.blocks.length === 0) {
    return { ok: true };
  }
  return await slack.chat.postMessage(logtimeMessage);
}
