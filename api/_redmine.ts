import fetch from 'node-fetch';
import { IRedmineIssue, IUserConfig } from './_interface';
import { configs } from './_settings';

export async function getIssues(
  userConfig: IUserConfig | null,
  token: string | null
): Promise<Array<IRedmineIssue> | null> {
  let status = '*';
  if (userConfig && userConfig.includeClosed) {
    status = 'open';
  }

  if (userConfig && userConfig.token) {
    token = atob(userConfig.token);
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
