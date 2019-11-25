import nunjucks from 'nunjucks';
import { IUserConfig, IGlobalConfig, IRedmineIssue } from './_interface';
import { actions } from './_actions';

nunjucks.configure({ autoescape: true });

export function getConfigMessage(globalConfig: IGlobalConfig, userConfig: IUserConfig): string {
  return nunjucks.renderString(
    `
  {
    "blocks": [
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": "*URL:* {{ globalConfig.url }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Work hours:* {{ globalConfig.workHours }} hours"},
          { "type": "mrkdwn", "text": "*Timezone:* {{ globalConfig.timezone }}"}
          {% if userConfig !== null %}
          ,
          { "type": "mrkdwn", "text": "*Userid:* {{ userConfig.userId }}"},
          { "type": "mrkdwn", "text": "*Show confirm box:* {{ userConfig.showConfirm }}"},
          { "type": "mrkdwn", "text": "*Token:* {{ atoa(userConfig.token) }}"},
          { "type": "mrkdwn", "text": "*Include closed issue:* {{ userConfig.includeClosed }}"}
          {% endif %}
        ]
      },
      {% if userConfig === null %}
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":x: You have not registered yet. Click *Edit* to add info"
        }
      },
      {% endif %}
      {
        "type": "actions",
        "elements": [
          { "type": "button", 
            "text": { "type": "plain_text", "text": "Edit", "emoji": true },
            "style": "primary",
            "action_id": "{{ actions.edit }}"
          },
          {
            "type": "button",
            "text": { "type": "plain_text", "text": "Close", "emoji": true },
            "style": "danger",
            "action_id": "{{ actions.close }}"
          }
        ]
      }
    ]
  }
  `,
    {
      globalConfig: globalConfig,
      userConfig: userConfig,
      actions: { edit: actions.CONFIG, close: actions.CLOSE },
    }
  );
}
