import nunjucks from 'nunjucks';
import { IUserConfig, IGlobalConfig, IRedmineIssue } from './_interface';
import { actions, configs } from './_settings';

nunjucks.configure({ autoescape: true });

export function getConfigMessage(userConfig: IUserConfig): string {
  return nunjucks.renderString(
    `
  {
    "blocks": [
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": "*URL:* {{ url }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Work hours:* {{ workHours }} hours"},
          { "type": "mrkdwn", "text": "*Timezone:* {{ timezone }}"}
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
      userConfig: userConfig,
      url: configs.REDMINE_URL,
      workHours: configs.WORK_HOURS,
      timezone: configs.TIMEZONE,
      actions: { edit: actions.CONFIG, close: actions.CLOSE },
    }
  );
}

export function getModalConfigMessage(error_message: string = null) {
  return nunjucks.renderString(
    `
    [
      {% if error %}
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": ":x: {{ error }}"
        }
      },
      {% endif %}
      {
        "type": "input",
        "block_id": "token",
        "element": {
          "type": "plain_text_input"
        },
        "label": {
          "type": "plain_text",
          "text": "API access token:"
        },
        "hint": {
          "type": "plain_text",
          "text": "Get at <{{ url }}/my/account>"
        }
      },
      {
        "type": "input",
        "block_id": "hour",
        "element": {
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Select an hour",
            "emoji": true
          },
          "options": [
            {% for i in range(9, 19) %}
            {
              "text": {
                "type": "plain_text",
                "text": "{{ i }}",
                "emoji": true
              },
              "value": "{{ i }}"
            }
            {{ "," if not loop.last }}
            {% endfor %}
          ]
        },
        "label": {
          "type": "plain_text",
          "text": "Reminder hours",
          "emoji": true
        }
      },
      {
        "type": "input",
        "block_id": "includeClosed",
        "element": {
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Include closed issues",
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Yes",
              },
              "value": "true"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "No",
              },
              "value": "false"
            }
          ]
        },
        "label": {
          "type": "plain_text",
          "text": "Include closed issues",
          "emoji": true
        }
      },
      {
        "type": "section",
        "block_id": "confirm",
        "fields": [
          {
            "type": "mrkdwn",
            "text": "Show confirm dialog"
          }
        ],
        "accessory": {
          "type": "radio_buttons",
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": "Yes"
            },
            "value": "true",
            "description": {
              "type": "plain_text",
              "text": "Show each time click on logtime"
            }
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Yes"
              },
              "value": "true",
              "description": {
                "type": "plain_text",
                "text": "Show each time click on logtime"
              }
            },
            {
              "text": {
                "type": "plain_text",
                "text": "No"
              },
              "value": "false",
              "description": {
                "type": "plain_text",
                "text": "Don't show"
              }
            }
          ]
        }
      }
    ]
    `,
    { url: configs.REDMINE_URL, error: error_message }
  );
}
