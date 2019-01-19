const { post } = require('axios');
const { send } = require('micro');
const parse = require('urlencoded-body-parser');
const directions = require('../directions.json');

function sendStartMessages(res, params) {
  try {
    const resp = send(res, 200, {
      response_type: 'ephemeral',
      text: directions.welcome,
      attachments: directions.help.map(message => ({ text: message })),
    });
    post(params.response_url, {
      response_type: 'in_channel',
      text: 'Hey, <!here>, we\'re starting Friday Trivia!',
      attachments: [{
        text: `Say hello to your host, <@${params.user_id}>.`,
      }],
    });
    return resp;
  } catch (e) {
    return 'Problem sending directions. This is embarassing.';
  }
}

function start(res, params) {
  return sendStartMessages(res, params);
}

async function handle(req, res) {
  try {
    const reqParams = await parse(req);
    console.log(reqParams);
    if (reqParams.text === 'start') {
      try {
        return start(res, reqParams);
      } catch (e) {
        return 'Problem starting trivia. This is embarassing.';
      }
    } else if (reqParams.text === 'report') {
      return 'reporting';
    } else if (reqParams.text === 'end') {
      return 'ending';
    }
    return send(res, 200, 'Oops, that didn\'t work. Usage: `/trivia [start | stop | score]`');
  } catch (e) {
    return send(res, 400, 'Oops, that didn\'t work. Usage: `/trivia [start | stop | score]`');
  }
}

module.exports = {
  handle,
};
