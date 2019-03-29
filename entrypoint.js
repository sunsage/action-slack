const axios = require('axios');
const _ = require('lodash');
const querystring = require('querystring');
const { argv } = require('yargs');
const fs = require("fs");

const EVENT_PAYLOAD = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
);

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const args = argv._.join(' ');
let fullMessage = _.template(args)({ ...process.env, EVENT_PAYLOAD });

if (process.env.SLACK_OVERRIDE_MESSAGE) {
  if (process.env.SLACK_OVERRIDE_MESSAGE === true || process.env.SLACK_OVERRIDE_MESSAGE === 'true') {
    fullMessage = message;
  } else {
    fullMessage = _.template(process.env.SLACK_OVERRIDE_MESSAGE)({ ...process.env, EVENT_PAYLOAD });
  }
}

const payload = {
    username: process.env.GITHUB_ACTION,
    ...process.env.SLACK_CHANNEL ? { channel: process.env.SLACK_CHANNEL } : {},
    text: fullMessage,
    icon_url: 'https://raw.githubusercontent.com/quintessence/slack-icons/master/images/github-logo-slack-icon.png',
};

const url = process.env.SLACK_WEBHOOK;

(async () => {
    console.log('Sending message ...');
    await axios.post(url, querystring.stringify({ payload: JSON.stringify(payload) }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    console.log('Message sent ! Shutting down ...');
    process.exit(0);
})()
    .catch((err) => {
        console.error('Message :', err.response ? err.response.data : err.message);
        process.exit(1);
    });
