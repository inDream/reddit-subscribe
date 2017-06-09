# reddit-subscribe

> Subscribe to subreddit updates via Telegram channel

## Features
* Subscribe subreddits posts by type and submission time
* Filter by Score & Spoiler
* Auto update scores & comments count in channels

## Usage
1. Install [Node.js](https://nodejs.org/) version >= 7.6, Run `npm install`
2. Create a "Script" at https://www.reddit.com/prefs/apps/
3. Get Bot token at Telegram @BotFather
4. Enter your reddit username, password and tokens in `.env`
5. Add channel configs in `.env` with parameters listed in [Config](#config)
6. Run `node index.js` or Use [pm2](https://github.com/Unitech/pm2) as process manager

## Config
Example telegram channel: [@RedditGameDeals](https://t.me/RedditGameDeals)
```
TOTAL_CHANNELS=1 # Total number of channels
CHANNEL0_SUB=GameDeals # Subreddit to subscribe
CHANNEL0_CHANNEL=@RedditGameDeals # Telegram channel id
CHANNEL0_TIME=day # Link submitted in last: hour/day/week/month/year
CHANNEL0_TYPE=Top # Type of post: New/Hot/Rising/Controversial/Top
CHANNEL0_INTERVAL=15 # Fetch interval in minutes
CHANNEL0_PAGES=3 # Number of pages to fetch
CHANNEL0_MIN_SCORE=100 # Minimum score needed for posting to Telegram channel
CHANNEL0_SPOILER=false # Include spoiler posts: true/false
```

## License

[MIT](https://github.com/pnpm/pnpm/blob/master/LICENSE)
