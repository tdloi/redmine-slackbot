import { WebAPICallResult } from '@slack/web-api';

export interface IGlobalConfig {
  _type: 'globalConfig';
  url: string; // REDMINE URL
  workHours: number;
  timezone: number; // e.g: 7
  excludes: Array<string>; // day to exclude
}

export interface IChatPostMessageResult extends WebAPICallResult {
  channel: string;
  ts: string;
  message: {
    text: string;
  };
}
