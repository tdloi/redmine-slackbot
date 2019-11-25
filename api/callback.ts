import { NowRequest, NowResponse } from '@now/node';
import { ViewsOpenArguments } from '@slack/web-api';
import { isSlackRequest, slack } from './_slack';
import { actions } from './_actions';
import { IBlockActionsPayload, IGlobalConfig } from './_interface';
import fetch from 'node-fetch';
import { getModalConfigMessage } from './_messages';
import { getGlobalConfig } from './_mongo';

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.body);
  if (isSlackRequest(req) === false) {
    res.status(400).json({ error: 'Your request is not comming from Slack' });
    return;
  }

  // https://api.slack.com/interactivity/handling#payloads
  const body = JSON.parse(req.body.payload);
  const globalConfig: IGlobalConfig = await getGlobalConfig();

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
        res.status(200).send(null);
        return;
      case actions.CONFIG:
        await slack.views.open({
          trigger_id: payload.trigger_id,
          view: JSON.parse(getModalConfigMessage(globalConfig)),
        } as ViewsOpenArguments);
        res.status(200).send(null);
        return;
      default:
        break;
    }
  } else if (body.type === 'view_submission') {
  }

  res.status(200).send(null);
};
