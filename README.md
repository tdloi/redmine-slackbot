# Redmine logtime reminder bot

A Slack bot remind you to [log time](https://www.redmine.org/projects/redmine/wiki/RedmineTimeTracking) everyday

# Setup and deploy
Before you start: Copy `.env.example` to `.env`, replace `REDMINE_URL` with your Redmine address and timezone with your current timezone.

## Slack
- Create new app at [https://api.slack.com/apps](https://api.slack.com/apps)
- Enable **Interactive Components**
- Create new slash command: `/command config`, just leave *request url* to random
- Create new Bot User
- OAuth and permissions: `bot`, `channels:read`, `chat:write:bot`, `commands`
- Replace value of `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` in **.env**
- Install app to your workspace

## MongoDB
You can create a free database from [mlab](https://mlab.com/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Copy connection uri to value of `MONGODB_URI` in **.env**

## Now
This app uses Zeit Now Serverless to deploy, to get started, install [Now CLI](https://zeit.co/download). 
To run pediod task, you also need an [EasyCron](https://www.easycron.com/) accounts, `AUTH_CRE` is used to auth with app

Run `loadsecret.sh` to load .env to [now secrets](https://zeit.co/docs/v2/environment-variables-and-secrets), alternative, you can run:
```bash
now secret add KEY VALUE
# e.g: now secret MONGODB-URI YOUR_MONGODB_URI
```
and so on for each value in `.env`, remember to replace `_` with `-`

After that, run `now --prod` to deploy, update your now url in slack

- Slash command URL: `YOUR_NOW_URL/api`
- Interactive URL request URL: `YOUR_NOW_URL/api/callback`

# LICENSE
MIT