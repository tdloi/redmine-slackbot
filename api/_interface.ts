import { WebAPICallResult, View, Block } from '@slack/web-api';

export interface IGlobalConfig {
  excludesDate: Array<string>; // day to exclude
}

export interface IUserConfig {
  _type: 'userConfig';
  token: string;
  userId: string;
  displayName: string;
  showConfirm: boolean;
  includeClosed: boolean;
  remindAt: number; // Which hour to remind, 24h format
  comment: string; // default comment when log time
  assignToMe: boolean; // issue assign to you only
  createdByMe: boolean; // issue create by you only
}

export interface IRedmineIssueQuery {
  status_id: '*' | 'open';
  offset: number;
  limit: number;
  assigned_to_id?: 'me';
  author_id?: 'me';
  [key: string]: string | number;
}

interface IRedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  subject: string;
}

export interface IRedmineIssues {
  issues: Array<IRedmineIssue>;
  total_count: number;
  offset: number;
  limit: number;
}

interface IRedmineTimeEntry {
  id: number;
  project: {
    id: number;
    name: string;
  };
  hours: number;
  comments: string;
  spent_on: string;
}

export interface IRedmineTimeEntries {
  time_entries: Array<IRedmineTimeEntry>;
  total_count: number;
}

export interface IChatPostMessageResult extends WebAPICallResult {
  channel: string;
  ts: string;
  message: {
    text: string;
  };
}

// https://api.slack.com/interactivity/slash-commands#responding_to_commands#app_command_handling
export interface ISlashCommandPayload {
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
  value: string;
  type: 'button';
  action_ts: string;
}

// https://api.slack.com/reference/interaction-payloads/block-actions
export interface IBlockActionsPayload {
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

export interface ISlackAPIPayload {
  response_type?: 'ephemeral' | 'in_channel';
  replace_original: boolean;
  delete_original?: boolean;
  text?: string;
  blocks: any;
}

export interface ISlackAPIModalPayload {
  response_action: 'update';
  view: View;
}

export interface IViewSubmissionPayload {
  type: 'view_submission';
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
  trigger_id: string;
  view: {
    id: string;
    team_id: string;
    type: 'modal';
    hash: string;
    private_metadata: string;
    state: {
      values: {
        token: {
          [key: string]: {
            type: 'plain_text_input';
            value: string;
          };
        };
        comment: {
          [key: string]: {
            type: 'plain_text_input';
            value: string;
          };
        };
        remindAt: {
          [key: string]: {
            type: 'static_select';
            selected_option: { value: string };
          };
        };
        showConfirm: {
          [key: string]: {
            type: 'static_select';
            selected_option: { value: 'true' | 'false' };
          };
        };
        includeClosed: {
          [key: string]: {
            type: 'static_select';
            selected_option: { value: 'true' | 'false' };
          };
        };
        assignToMe: {
          [key: string]: {
            type: 'static_select';
            selected_option: { value: 'true' | 'false' };
          };
        };
        createdByMe: {
          [key: string]: {
            type: 'static_select';
            selected_option: { value: 'true' | 'false' };
          };
        };
      };
    };
  };
}
