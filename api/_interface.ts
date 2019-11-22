import { WebAPICallResult } from '@slack/web-api';

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
