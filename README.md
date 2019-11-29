# Redmine logtime reminder bot

A Slack bot remind you to [log time](https://www.redmine.org/projects/redmine/wiki/RedmineTimeTracking) everyday

# Setup and deploy
Before you start: Copy `.env.example` to `.env`, replace following value with your own:
- `REDMINE_URL`: your Redmine address (DOES NOT include trailing slash `/`)
- `TIMEZONE`: your current timezone. e.g: 7

## Slack
- Create new app at [https://api.slack.com/apps](https://api.slack.com/apps)
- Enable **Interactive Components**
- Create new slash command: `/command config`, just leave *request url* to random
- Create new Bot User
- OAuth and permissions: `bot`, `channels:read`, `chat:write:bot`, `commands`
- Replace value of `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` in **.env**
- Install app to your workspace
- Go to your slack workspace at: `your-team.slack.com`, it will redirect you to `https://app.slack.com/client/YOUR_TEAM_ID`, replace `SLACK_TEAM_ID` in .env with your id

## MongoDB
You can create a free database from [mlab](https://mlab.com/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Copy connection uri to value of `MONGODB_URI` in **.env**

## Now
This app uses Zeit Now Serverless to deploy, to get started, install [Now CLI](https://zeit.co/download)

Run `loadsecret.sh` to load .env to [now secrets](https://zeit.co/docs/v2/environment-variables-and-secrets), alternative, you can run:
```bash
now secret add KEY VALUE
# e.g: now secret MONGODB-URI YOUR_MONGODB_URI
```
and so on for each value in `.env`, remember to replace `_` with `-`

After that, run `now --prod` to deploy, update your now url in slack

- Slash command URL: `YOUR_NOW_URL/api`
- Interactive URL request URL: `YOUR_NOW_URL/api/callback`

Note: You can run `loadsecret.sh` with `--force` to force override existing secret
## Cron
To run pediod task, you can use one of Cron as a Service such as [Cron-job](https://cron-job.org/), send a `POST` request to `/api/trigger` with Basic Auth info from `AUTH_CRE`

# LICENSE
MIT