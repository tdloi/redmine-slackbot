import nunjucks from 'nunjucks';
import { IUserConfig, IRedmineIssues } from './_interface';
import { actions, configs } from './_settings';
import { Dayjs } from 'dayjs';
import { decode } from './_utils';

nunjucks.configure({ autoescape: true });

export function getConfigMessage(userConfig: IUserConfig, showAll: boolean = false): string {
  const token = userConfig ? decode(userConfig.token) : '';
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
        ]
      },
      {% if userConfig !== null %}
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": "*User:* {{ userConfig.displayName }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Default logtime comment:* {{ userConfig.comment }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Token:* {{ token }}******"}
        ]
      },
      {% endif %}
      {% if userConfig !== null %}
      {
        "type": "section",
        "fields": [
          {% if showAll %}
          { "type": "mrkdwn", "text": "*Assign to me only:* {{ userConfig.assignToMe }}"},
          { "type": "mrkdwn", "text": "*Created by me only:* {{ userConfig.createdByMe }}"},
          { "type": "mrkdwn", "text": "*Custom query:* {{ userConfig.customQuery }}"},
          { "type": "mrkdwn", "text": " "},
          {% endif %}
          { "type": "mrkdwn", "text": "*Remind at:* {{ userConfig.remindAt }}"},
          { "type": "mrkdwn", "text": " "},
          { "type": "mrkdwn", "text": "*Include closed issue:* {{ userConfig.includeClosed }}"}
          {% if showAll %}
          ,
          { "type": "mrkdwn", "text": "*Show confirm box:* {{ userConfig.showConfirm }}"}
          {% endif %}
        ]
      },
      {% endif %}
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
            "action_id": "{{ actions.edit }}",
            "value": "{% if showAll %}true{% else %}false{% endif %}"
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
      showAll: showAll,
    }
  );
}

export function getModalConfigMessage(
  error_message: string = null,
  response_url: string = '',
  userConfig: IUserConfig = null,
  showAll: boolean = false
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
          {% if token %}
          "initial_value": "{{ token }}",
          {% endif %}
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
        "block_id": "comment",
        "element": {
          "type": "plain_text_input",
          {% if config %}
          "initial_value": "{{ config.comment }}"
          {% else %}
          "placeholder": {
            "type": "plain_text",
            "text": "Logtime comment"
          }
          {% endif %}
        },
        "label": {
          "type": "plain_text",
          "text": "Default logtime comment:"
        }
      },
      {% if showAll %}
      {
        "type": "input",
        "block_id": "customQuery",
        "element": {
          "type": "plain_text_input",
          {% if config and config.customQuery %}
          "initial_value": "{{ config.customQuery }}"
          {% else %}
          "placeholder": {
            "type": "plain_text",
            "text": "Custom issues query"
          }
          {% endif %}
        },
        "label": {
          "type": "plain_text",
          "text": "Custom query:"
        },
        "optional": true,
        "hint": {
          "type": "plain_text",
          "text": "<https://www.redmine.org/projects/redmine/wiki/Rest_Issues#Listing-issues>"
        }
      },
      {
        "type": "input",
        "block_id": "assignToMe",
        "element": {
          "type": "static_select",
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": "{% if config and not config.assignToMe %}No{% else %}Yes{% endif %}"
            },
            "value": "{% if config %}{{ config.assignToMe }}{% else %}true{% endif %}"
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
          "text": "List issues assigned to me only",
          "emoji": true
        }
      },
      {
        "type": "input",
        "block_id": "createdByMe",
        "element": {
          "type": "static_select",
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": "{% if config and config.createdByMe %}Yes{% else %}No{% endif %}"
            },
            "value": "{% if config %}{{ config.createdByMe }}{% else %}false{% endif %}"
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
          "text": "List issues created by me only",
          "emoji": true
        }
      },
      {
        "type": "input",
        "block_id": "showConfirm",
        "element": {
          "type": "static_select",
          "initial_option": {
            "text": {
              "type": "plain_text",
              {% if config and config.showConfirm %}
              "text": "Yes"
              {% else %}
              "text": "No"
              {% endif %}
            },
            "value": "{% if config %}{{ config.showConfirm }}{% else %}false{% endif %}"
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
      },
      {% endif %}
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
          {% if config %}
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": "{{ config.remindAt }}"
            },
            "value": "{{ config.remindAt }}"
          },
          {% endif %}
          "options": [
            {% for i in range(7, 19) %}
            {
              "text": {
                "type": "plain_text",
                "text": "{{ i }}"
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
          "initial_option": {
            "text": {
              "type": "plain_text",
              {% if config and config.includeClosed %}
              "text": "Yes"
              {% else %}
              "text": "No"
              {% endif %}
            },
            "value": "{% if config %}{{ config.includeClosed }}{% else %}false{% endif %}"
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
      }
    ]}
    `,
    {
      url: configs.REDMINE_URL,
      error: error_message,
      message: { url: response_url },
      config: userConfig,
      token: (userConfig && userConfig.token && decode(userConfig.token)) || null,
      showAll: showAll,
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
  const prev = issues.offset - 5;
  const next = issues.offset + 5;
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
      {% for issue in issues.issues %}
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
            "action_id": "{{ actions.log }}__8",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "8h"
            },
            "style": "primary",
            "value": "{{ issue.id }}__8__{{ pagination.current }}",
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
            "action_id": "{{ actions.log }}__4",
            "text": {
              "type": "plain_text",
              "text": "4h"
            },
            "value": "{{ issue.id }}__4__{{ pagination.current }}",
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
            "action_id": "{{ actions.log }}__2",
            "text": {
              "type": "plain_text",
              "text": "2h"
            },
            "value": "{{ issue.id }}__2__{{ pagination.current }}",
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
          {% if remainHour >= 1 %}
          {
            "type": "button",
            "action_id": "{{ actions.log }}__1",
            "text": {
              "type": "plain_text",
              "text": "1h"
            },
            "value": "{{ issue.id }}__1__{{ pagination.current }}",
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
          {% if pagination.prev >= 0 %}
          {
            "type": "button",
            "action_id": "{{ actions.paginate }}__0",
            "text": {
              "type": "plain_text",
              "text": "Previous issue"
            },
            "value": "{{ pagination.prev }}"
          },
          {% endif %}
          {% if pagination.next < issues.total_count %}
          {
            "type": "button",
            "action_id": "{{ actions.paginate }}__1",
            "text": {
              "type": "plain_text",
              "text": "Next issue"
            },
            "style": "primary",
            "value": "{{ pagination.next }}"
          },
          {% endif %}
          {
            "type": "button",
            "action_id": "{{ actions.close }}",
            "text": {
              "type": "plain_text",
              "text": "Close"
            },
            "style": "danger",
            "value": " ",
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
      issues: issues,
      date: logDate,
      hour: loggedHour,
      remainHour: configs.WORK_HOURS - loggedHour,
      actions: { log: actions.LOG, close: actions.CLOSE, paginate: actions.PAGINATE },
      pagination: { prev: prev, next: next, current: issues.offset },
    }
  );
}
