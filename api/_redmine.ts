import fetch from 'node-fetch';
import { IRedmineIssue, IUserConfig, IRedmineTimeEntries } from './_interface';
import { configs } from './_settings';
import { Dayjs } from 'dayjs';

export async function getIssues(
  userConfig: IUserConfig | null,
  token: string | null = null
): Promise<Array<IRedmineIssue> | null> {
  let status = '*';
  if (userConfig && userConfig.includeClosed) {
    status = 'open';
  }
  if (userConfig && userConfig.token) {
    token = Buffer.from(userConfig.token, 'base64').toString('ascii');
  }

  const issues: Array<IRedmineIssue> = await fetch(
    `${configs.REDMINE_URL}/issues.json?assigned_to_id=me&status_id=${status}`,
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
        'X-Redmine-API-Key': Buffer.from(userConfig.token, 'base64').toString('ascii'),
      },
    }
  )
    .then(res => res.json())
    .catch(_ => {});
  const timeEntries = response.time_entries || [];
  const total = timeEntries.reduce((accumulator, curr) => accumulator + curr.hours, 0);
  return total;
}
