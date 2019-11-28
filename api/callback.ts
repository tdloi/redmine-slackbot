import { NowRequest, NowResponse } from '@now/node';
import { ViewsOpenArguments } from '@slack/web-api';
import { slack, slackApi } from './_slack';
import { actions } from './_settings';
import {
  IBlockActionsPayload,
  IViewSubmissionPayload,
  ISlackAPIModalPayload,
  ISlackAPIPayload,
} from './_interface';
import { getModalConfigMessage, getConfigMessage } from './_messages';
import { getIssues, logTime } from './_redmine';
import { setUserConfig, getUserConfig, deleteUserConfig } from './_mongo';
import dayjs from 'dayjs';
import { getCurrentTimeZoneDate, encode } from './_utils';
import { getLogtimeMessagePayload } from './_logtime';

export default async (req: NowRequest, res: NowResponse) => {
  // https://api.slack.com/interactivity/handling#payloads
  const body = JSON.parse(req.body.payload);

  if (body.type === 'block_actions') {
    const payload: IBlockActionsPayload = body;
    const config = await getUserConfig(payload.user.id);

    let action = payload.actions[0].action_id;
    action = action.split('__')[0];
    switch (action) {
      case actions.DELETE:
        await deleteUserConfig(payload.user.id);
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
          view: JSON.parse(getModalConfigMessage(null, payload.response_url)),
        } as ViewsOpenArguments);
        return res.status(200).send(null);
      case actions.PAGINATE:
        const offset = Object.values(payload.actions)[0].value;
        const messages = await getLogtimeMessagePayload(config, parseInt(offset));
        await slackApi(payload.response_url, {
          response_type: 'ephemeral',
          replace_original: true,
          text: messages.text,
          blocks: messages.blocks,
        });
        return res.status(200).send(null);
      case actions.LOG:
        const [issueId, hour] = Object.values(payload.actions)[0].value.split('__');
        const date = getCurrentTimeZoneDate(dayjs(parseFloat(payload.container.message_ts) * 1000));
        await logTime(config, date, parseInt(hour), parseInt(issueId));

        const logtimeMessage = await getLogtimeMessagePayload(config);
        await slackApi(payload.response_url, {
          response_type: 'ephemeral',
          replace_original: true,
          text: logtimeMessage.text,
          blocks: logtimeMessage.blocks,
        });
        return res.status(200).send(null);
      default:
        return res.status(400).send(null);
    }
  }

  if (body.type === 'view_submission') {
    const payload: IViewSubmissionPayload = body;
    const values = payload.view.state.values;
    const { response_url } = JSON.parse(payload.view.private_metadata);

    // check if token is valid
    const issues = await getIssues(null, Object.values(values.token)[0].value);
    if (issues === null) {
      return res.status(200).send({
        response_action: 'update',
        view: JSON.parse(getModalConfigMessage('Invalid Token', response_url)),
      } as ISlackAPIModalPayload);
    }

    const updated = await setUserConfig(payload.user.id, {
      _type: 'userConfig',
      userId: payload.user.id,
      displayName: payload.user.name,
      token: encode(Object.values(values.token)[0].value),
      comment: Object.values(values.comment)[0].value,
      remindAt: parseInt(Object.values(values.remindAt)[0].selected_option.value),
      showConfirm: Object.values(values.showConfirm)[0].selected_option.value === 'true',
      includeClosed: Object.values(values.includeClosed)[0].selected_option.value === 'true',
    });

    if (updated === false) {
      return res.status(200).send({
        response_action: 'update',
        view: JSON.parse(
          getModalConfigMessage('Something went wrong. Please retry!', response_url)
        ),
      } as ISlackAPIModalPayload);
    }

    const config = await getUserConfig(payload.user.id);
    const response = await slackApi(response_url, {
      response_type: 'ephemeral',
      replace_original: true,
      ...JSON.parse(getConfigMessage(config)),
    } as ISlackAPIPayload);
    if (response.ok === false) {
      console.log('Expired response_url');
    }
    return res.status(200).json({ response_action: 'clear' });
  }

  return res.status(400).send(null);
};
