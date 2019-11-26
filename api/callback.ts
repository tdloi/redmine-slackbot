import { NowRequest, NowResponse } from '@now/node';
import { ViewsOpenArguments } from '@slack/web-api';
import { isSlackRequest, slack } from './_slack';
import { actions } from './_settings';
import { IBlockActionsPayload } from './_interface';
import fetch from 'node-fetch';
import { getModalConfigMessage } from './_messages';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }

  // https://api.slack.com/interactivity/handling#payloads
  const body = JSON.parse(req.body.payload);

  if (body.type === 'block_actions') {
    const payload: IBlockActionsPayload = body;
    switch (payload.actions[0].action_id) {
      case actions.CLOSE:
        // can't delete ephemeral message via delete api
        await fetch(payload.response_url, {
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
        return res.status(200).send(null);
      case actions.CONFIG:
        await slack.views.open({
          trigger_id: payload.trigger_id,
          view: JSON.parse(getModalConfigMessage()),
        } as ViewsOpenArguments);
        return res.status(200).send(null);
      case actions.LOG:
        return;
      default:
        break;
    }
  } else if (body.type === 'view_submission') {
  }

  res.status(200).send(null);
};
