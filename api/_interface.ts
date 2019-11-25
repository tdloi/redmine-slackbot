import { WebAPICallResult } from '@slack/web-api';
import { NowRequest } from '@now/node';
import { actions } from './_actions';

export interface IGlobalConfig {
  _type: 'globalConfig';
  url: string; // REDMINE URL, DOES NOT contain trailing slash
  workHours: number;
  timezone: number; // e.g: 7
  excludes: Array<string>; // day to exclude
}

export interface IUserConfig {
  _type: 'userConfig';
  token: string;
  userId: string;
  showConfirm: boolean;
  includeClosed: boolean;
  remindAt: number; // Which hour to remind, 24h format
}

export interface IRedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  subject: string;
}

export interface IChatPostMessageResult extends WebAPICallResult {
  channel: string;
  ts: string;
  message: {
    text: string;
  };
}

// https://api.slack.com/interactivity/slash-commands#responding_to_commands#app_command_handling
export interface ISlashCommandPayload extends NowRequest {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

interface IBlockAction {
  action_id: string;
  block_id: string;
  text: {
    type: string;
    text: string;
    emoji: boolean;
  };
  type: 'button';
  action_ts: string;
}

// https://api.slack.com/reference/interaction-payloads/block-actions
export interface IBlockActionsPayload extends NowRequest {
  type: 'block_actions';
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  api_app_id: string;
  token: string;
  container: {
    type: 'message';
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
  };
  trigger_id: string;
  channel: {
    id: string;
    name: string;
  };
  response_url: string;
  actions: Array<IBlockAction>;
}
