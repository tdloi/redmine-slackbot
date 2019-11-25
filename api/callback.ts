import { NowRequest, NowResponse } from '@now/node';
import { ChatDeleteArguments } from '@slack/web-api';
import { isSlackRequest, slack } from './_slack';
import { actions } from './_actions';
import { IBlockActionsPayload } from './_interface';
import fetch from 'node-fetch';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }

  // https://api.slack.com/interactivity/handling#payloads
  const body = JSON.parse(req.body.payload);
  if (body.type === 'block_actions') {
    const payload: IBlockActionsPayload = body;
    if (
      payload.actions == null ||
      payload.actions.length == 0 ||
      !Object.values(actions).includes(payload.actions[0].action_id)
    ) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }
    switch (payload.actions[0].action_id) {
      case actions.CLOSE:
        // can't delete ephemeral message via delete api
        fetch(payload.response_url, {
          method: 'POST',
          body: JSON.stringify({
            response_type: 'ephemeral',
            replace_original: true,
            delete_original: true,
            blocks: [],
          }),
          headers: {
            Authorization: 'Bearer ' + process.env.SLACK_BOT_TOKEN,
          },
        });
        res.status(200).send(null);
        return;
      default:
        break;
    }
  }

  res.status(200).send(null);
};
