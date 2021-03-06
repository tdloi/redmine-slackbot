import { NowRequest, NowResponse } from '@now/node';
import { ViewsOpenArguments } from '@slack/web-api';
import { slack, slackApi, isSlackRequest } from './_slack';
import { actions, configs } from './_settings';
import {
  IBlockActionsPayload,
  IViewSubmissionPayload,
  ISlackAPIModalPayload,
  ISlackAPIPayload,
  IUserConfig,
  IRedmineTimeEntries,
} from './_interface';
import { getModalConfigMessage, getConfigMessage } from './_messages';
import { getIssues, logTime, getLoggedHours } from './_redmine';
import { setUserConfig, getUserConfig, deleteUserConfig } from './_mongo';
import { getDate, encode } from './_utils';
import { getLogtimeMessagePayload } from './_logtime';

export default async (req: NowRequest, res: NowResponse) => {
  if (isSlackRequest(req) === false) {
    return res.status(400).json({ error: 'Your request is not comming from Slack' });
  }

  // https://api.slack.com/interactivity/handling#payloads
  const body = JSON.parse(req.body.payload);
  const config = await getUserConfig(body.user.id);

  if (body.type === 'block_actions') {
    const payload: IBlockActionsPayload = body;

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
        const showAll = Object.values(payload.actions)[0].value === 'true';
        await slack.views.open({
          trigger_id: payload.trigger_id,
          view: JSON.parse(getModalConfigMessage(null, payload.response_url, config, showAll)),
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
        const [issueId, hour, currentOffset] = Object.values(payload.actions)[0].value.split('__');
        const date = getDate(parseFloat(payload.container.message_ts) * 1000);
        let totalHour = await getLoggedHours(config, date);
        if (totalHour < configs.WORK_HOURS) {
          const timeEntries: IRedmineTimeEntries = await logTime(
            config,
            date,
            parseInt(hour),
            parseInt(issueId)
          );
          totalHour += timeEntries.time_entry.hours;
        }
        const logtimeMessage = await getLogtimeMessagePayload(
          config,
          parseInt(currentOffset),
          totalHour
        );
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
    const showAll = values.showConfirm !== undefined;
    const newUserConfig: IUserConfig = {
      _type: 'userConfig',
      userId: payload.user.id,
      displayName: payload.user.name,
      token: encode(Object.values(values.token)[0].value),
      comment: Object.values(values.comment)[0].value,
      remindAt: parseInt(Object.values(values.remindAt)[0].selected_option.value),
      includeClosed: Object.values(values.includeClosed)[0].selected_option.value === 'true',
      showConfirm: values.showConfirm
        ? Object.values(values.showConfirm)[0].selected_option.value === 'true'
        : (config && config.showConfirm) || true,
      assignToMe: values.assignToMe
        ? Object.values(values.assignToMe)[0].selected_option.value === 'true'
        : (config && config.assignToMe) || true,
      createdByMe: values.createdByMe
        ? Object.values(values.createdByMe)[0].selected_option.value === 'true'
        : (config && config.createdByMe) || false,
    };

    // check if token is valid
    const issues = await getIssues(null, Object.values(values.token)[0].value);
    if (issues === null) {
      return res.status(200).send({
        response_action: 'update',
        view: JSON.parse(
          getModalConfigMessage('Invalid Token', response_url, newUserConfig, showAll)
        ),
      } as ISlackAPIModalPayload);
    }

    const updated = await setUserConfig(payload.user.id, newUserConfig);
    if (updated === false) {
      return res.status(200).send({
        response_action: 'update',
        view: JSON.parse(
          getModalConfigMessage(
            'Something went wrong. Please retry!',
            response_url,
            newUserConfig,
            showAll
          )
        ),
      } as ISlackAPIModalPayload);
    }

    const response = await slackApi(response_url, {
      response_type: 'ephemeral',
      replace_original: true,
      ...JSON.parse(getConfigMessage(newUserConfig, showAll)),
    } as ISlackAPIPayload);
    if (response.ok === false) {
      console.log('Expired response_url');
    }
    return res.status(200).json({ response_action: 'clear' });
  }

  return res.status(400).send(null);
};
