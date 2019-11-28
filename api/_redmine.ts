import fetch from 'node-fetch';
import { IUserConfig, IRedmineTimeEntries, IRedmineIssues } from './_interface';
import { configs } from './_settings';
import { Dayjs } from 'dayjs';
import { decode } from './_utils';

export async function getIssues(
  userConfig: IUserConfig | null,
  token: string | null = null,
  offset: number = 0
): Promise<IRedmineIssues | null> {
  if (token == null && userConfig == null) {
    throw new Error("Both userConfig and Token can't be null");
  }

  let status = '*';
  if (userConfig && userConfig.includeClosed === false) {
    status = 'open';
  }
  if (userConfig && userConfig.token) {
    token = decode(userConfig.token);
  }

  const issues: IRedmineIssues = await fetch(
    `${configs.REDMINE_URL}/issues.json?assigned_to_id=me&status_id=${status}&limit=5&offset=${offset}`,
    {
      headers: {
        'X-Redmine-API-Key': token,
      },
    }
  )
    .then(res => res.json())
    .catch(_ => null);

  return issues;
}

export async function getLoggedHours(userConfig: IUserConfig, date: Dayjs): Promise<number> {
  const loggedDate = date.format('YYYY-MM-DD');
  const response: IRedmineTimeEntries = await fetch(
    `${configs.REDMINE_URL}/time_entries.json?user_id=me&from=${loggedDate}&to=${loggedDate}`,
    {
      headers: {
        'X-Redmine-API-Key': decode(userConfig.token),
      },
    }
  )
    .then(res => res.json())
    .catch(_ => {});
  const timeEntries = response.time_entries || [];
  const total = timeEntries.reduce((accumulator, curr) => accumulator + curr.hours, 0);
  return total;
}

export async function logTime(
  userConfig: IUserConfig,
  date: Dayjs,
  hour: number,
  issue_id: number
) {
  const logDate = date.format('YYYY-MM-DD');
  return await fetch(`${configs.REDMINE_URL}/time_entries.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Redmine-API-Key': decode(userConfig.token),
    },
    body: JSON.stringify({
      time_entry: {
        hours: hour,
        comments: userConfig.comment,
        activity_id: configs.REDMINE_NORMAL_HOUR_ID,
        spent_on: logDate,
      },
      issue_id: issue_id,
    }),
  }).then(res => res.json());
}
