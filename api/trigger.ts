import { getUsersConfig } from './_mongo';
import { NowRequest, NowResponse } from '@now/node';
import fetch from 'node-fetch';
import { configs } from './_settings';
import dayjs from 'dayjs';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') return res.status(405).send(null);

  const usersConfig = await getUsersConfig();
  if (usersConfig === null) {
    return res.status(200).send(null);
  }

  const currentHour = dayjs().hour();
  const proto = req.headers['x-forwarded-proto'];
  const url = req.headers['x-now-deployment-url'];
  Promise.all(
    usersConfig
      .filter(user => user.remindAt === currentHour)
      .map(config =>
        fetch(`${proto}://${url}/api/message`, {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(configs.SECRET).toString('base64'),
          },
          body: JSON.stringify({ config: config }),
        })
      )
  );
  return res.status(200).send(null);
};
