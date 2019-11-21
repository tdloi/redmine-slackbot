import { WebClient } from '@slack/web-api';
import { NowRequest } from '@now/node';
import { createHmac } from 'crypto';
import { encode } from 'querystring';
import dayjs from 'dayjs';

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export function isSlackRequest(req: NowRequest): boolean {
  if (req.body === null) return false;
  const timestamp = parseInt(req.headers['x-slack-request-timestamp'] as string) || 0;
  if (Math.abs(dayjs().unix() - timestamp) > 60 * 5) {
    // The request timestamp is more than five minutes from local time.
    // It could be a replay attack, so let's ignore it.
    return false;
  }
  const verifyString = `v0:${timestamp}:${encode(req.body)}`;
  console.log(verifyString);
  const hmac = createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
  hmac.update(verifyString);
  const hex = `v0=${hmac.digest('hex')}`;
  return req.headers['x-slack-signature'] === hex;
}
