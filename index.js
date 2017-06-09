require('dotenv').config();
const snoowrap = require('snoowrap');
const Telegraf = require('telegraf');
const levelup = require('levelup');
const thenLevelup = require('then-levelup');

const db = thenLevelup(levelup('./post'));
const channelDB = thenLevelup(levelup('./channel'));
const bot = new Telegraf(process.env.TG_BOT_TOKEN);
const total = +process.env.TOTAL_CHANNELS;
let channels = {};
let channelIdx = 0;

channelDB.createKeyStream().on('data', async key => {
  let value = await (channelDB.get(key));
  channelIdx = Math.max(channelIdx, value + 1);
  channels[key] = value;
  if (channelIdx === total) {
    main();
  }
});

const r = new snoowrap({
  userAgent: process.env.SCRIPT_USER_AGENT,
  clientId: process.env.SCRIPT_CLIENT_ID,
  clientSecret: process.env.SCRIPT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

async function fetchPosts(options) {
  let { subreddit, channel, after = null, type, time, pages, minScore,
    spoiler } = options;
  let channelId = channels[channel];
  if (channelId === undefined) {
    channelId = +channelIdx;
    channels[channel] = +channelIdx;
    await (channelDB.put(channel, channelIdx));
    console.log('new channel created', channel, channelIdx);
    channelIdx++;
  }

  let posts = await (r.getSubreddit(subreddit)[`get${type}`]({ time, after }));
  posts
    .sort((a, b) => b.score - a.score)
    .forEach(async post => {
      if (post.spoiler !== spoiler || post.score < minScore) {
        return;
      }
      let msgId = null;
      try {
        msgId = await (db.get(`${channelId}-${post.id}`));
      } catch (e) {}
      let text = `${post.url}\n${post.title}\n` +
        `👍 Score: ${post.score} ↩️ Comments: ${post.num_comments}\n` +
        `https://redd.it/${post.id}`;
      if (msgId) {
        try {
          await (bot.telegram.editMessageText(channel, msgId, null, text));
        } catch(e) {}
      } else {
        await (bot.telegram.sendMessage(channel, text)
          .then(msg => db.put(`${channelId}-${post.id}`, msg.message_id)));
      }
    });
  options.pages--;
  if (posts.length && pages > 1) {
    options.after = posts[posts.length - 1].name;
    return fetchPosts(options);
  }
  return Promise.resolve();
}

function main() {
  console.log('Started.')
  for (let i = 0; i < total; i++) {
    let subreddit = process.env[`CHANNEL${i}_SUB`];
    let channel = process.env[`CHANNEL${i}_CHANNEL`];
    let time = process.env[`CHANNEL${i}_TIME`];
    let type = process.env[`CHANNEL${i}_TYPE`];
    let interval = process.env[`CHANNEL${i}_INTERVAL`];
    let pages = process.env[`CHANNEL${i}_PAGES`];
    let minScore = process.env[`CHANNEL${i}_MIN_SCORE`];
    let spoiler = process.env[`CHANNEL${i}_SPOILER`] === 'true';
    let options = { subreddit, channel, time, type, pages, minScore, spoiler };
    console.log(options);

    setInterval(async () => {
      fetchPosts(options);
    }, 1000 * 60 * interval);

    setTimeout(() => {
      fetchPosts(options);
    }, 1000 * i);
  }
}
