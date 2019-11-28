import nunjucks from 'nunjucks';
import { IUserConfig, IRedmineIssues } from './_interface';
import { actions, configs } from './_settings';
import { Dayjs } from 'dayjs';

nunjucks.configure({ autoescape: true });

export function getConfigMessage(userConfig: IUserConfig): string {
  const token = userConfig ? Buffer.from(userConfig.token, 'base64').toString('ascii') : '';
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
          { "type": "mrkdwn", "text": "*User:* {{ userConfig.displayName }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Token:* {{ token }}******"},
          { "type": "mrkdwn", "text": "*Remind at:* {{ userConfig.remindAt }} "},
          { "type": "mrkdwn", "text": "*Show confirm box:* {{ userConfig.showConfirm }}"},
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
            "action_id": "{{ actions.close }}"
          }
          {% if userConfig !== null %}
          ,          
          {
            "type": "button",
            "text": { "type": "plain_text", "text": "Delete", "emoji": true },
            "style": "danger",
            "action_id": "{{ actions.delete }}",
            "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "Do you want to delete your config?"
              },
              "confirm": {
                "type": "plain_text",
                "text": "Do it"
              },
              "deny": {
                "type": "plain_text",
                "text": "Stop, I've changed my mind!"
              }
            }
          }
          {% endif %}
        ]
      }
    ]
  }
  `,
    {
      userConfig: userConfig,
      token: token.substr(0, 5),
      url: configs.REDMINE_URL,
      workHours: configs.WORK_HOURS,
      timezone: configs.TIMEZONE,
      actions: { edit: actions.CONFIG, close: actions.CLOSE, delete: actions.DELETE },
    }
  );
}

export function getModalConfigMessage(
  error_message: string = null,
  response_url: string = ''
): string {
  return nunjucks.renderString(
    `
    {
    "type": "modal",
    "private_metadata": "{\\"response_url\\": \\"{{ message.url }}\\"}",
    "title": {
      "type": "plain_text",
      "text": "Redmine bot",
      "emoji": true
    },
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "blocks": [
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
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "Your Redmine API access token"
          }
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
        "block_id": "remindAt",
        "element": {
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Select an hour",
            "emoji": true
          },
          "options": [
            {% for i in range(7, 19) %}
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
            "text": "Include closed issues"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Yes"
              },
              "value": "true"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "No"
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
        "type": "input",
        "block_id": "showConfirm",
        "element": {
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Show confirm dialog"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Yes"
              },
              "value": "true"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "No"
              },
              "value": "false"
            }
          ]
        },
        "label": {
          "type": "plain_text",
          "text": "Show confirm dialog"
        },
        "hint": {
          "type": "plain_text",
          "text": "Show confirm dialog each time click logtime"
        }
      }
    ]}
    `,
    {
      url: configs.REDMINE_URL,
      error: error_message,
      message: { url: response_url },
    }
  );
}

export function getLogTimeMessage(
  userConfig: IUserConfig,
  issues: IRedmineIssues,
  date: Dayjs,
  loggedHour: number
): string {
  const logDate = date.format('DD/MM/YYYY');
  return nunjucks.renderString(
    `
    [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Date:*\\t\\t{{ date }}\\n*Logged:*\\t{{ hour }} hours"
        }
      },
      {
        "type": "divider"
      },
      {% for issue in issues %}
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "\`[{{ issue.project.name }}]\` \`#{{ issue.id }}\`: {{ issue.subject }}"
        }
      },
      {
        "type": "actions",
        "elements": [
          {% if remainHour >= 8 %}
          {
            "type": "button",
            "action_id": "{{ action.log }}",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "8h"
            },
            "style": "primary",
            "value": "8",
            "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "You can't change once logged"
              },
              "confirm": {
                "type": "plain_text",
                "text": "Do it"
              },
              "deny": {
                "type": "plain_text",
                "text": "Stop, I've changed my mind!"
              }
            }
          },
          {% endif %}
          {% if remainHour >= 4 %}
          {
            "type": "button",
            "action_id": "{{ action.log }}__1",
            "text": {
              "type": "plain_text",
              "text": "4h"
            },
            "value": "4",
            "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "You can't change once logged"
              },
              "confirm": {
                "type": "plain_text",
                "text": "Do it"
              },
              "deny": {
                "type": "plain_text",
                "text": "Stop, I've changed my mind!"
              }
            }
          },
          {% endif %}
          {% if remainHour >= 2 %}
          {
            "type": "button",
            "action_id": "{{ action.log }}__2",
            "text": {
              "type": "plain_text",
              "text": "2h"
            },
            "value": "2",
            "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "You can't change once logged"
              },
              "confirm": {
                "type": "plain_text",
                "text": "Do it"
              },
              "deny": {
                "type": "plain_text",
                "text": "Stop, I've changed my mind!"
              }
            }
          }
          {% endif %}
        ]
      },
      {% endfor %}
      {
        "type": "divider"
      },          
      {
        "type": "actions",
        "elements": [
        {
          "type": "button",
          "action_id": "{{ action.close }}",
          "text": {
            "type": "plain_text",
            "text": "Close"
          },
          "style": "danger",
          "value": "0",
                  "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "You don't want to log time for {{ date }}"
              },
              "confirm": {
                "type": "plain_text",
                "text": "Yes"
              },
              "deny": {
                "type": "plain_text",
                "text": "Exit"
              }
            }
        }
        ]
      }
    ]
    `,
    {
      config: userConfig,
      issues: issues.issues,
      date: logDate,
      hour: loggedHour,
      remainHour: configs.WORK_HOURS - loggedHour,
      action: { log: actions.LOG, close: actions.CLOSE },
    }
  );
}
