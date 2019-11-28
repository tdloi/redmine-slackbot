import { NowRequest, NowResponse } from '@now/node';
import { ViewsOpenArguments } from '@slack/web-api';
import { isSlackRequest, slack, slackApi } from './_slack';
import { actions } from './_settings';
import { IBlockActionsPayload } from './_interface';
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
    let action = payload.actions[0].action_id;
    action = action.split('__')[0];
    switch (action) {
      case actions.CLOSE:
        // can't delete ephemeral message via delete api
        await slackApi(payload.response_url, {
          response_type: 'ephemeral',
          replace_original: true,
          delete_original: true,
          blocks: [],
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
        return res.status(400).send(null);
    }
  } else if (body.type === 'view_submission') {
  }
};
