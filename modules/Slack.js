const { get } = require('axios');
const { send } = require('micro');
const { slack } = require('../configs/secret.json');

async function auth(req, res) {
  if (!req.query.code) {
    return send(res, 400, { error: 'No code received.' });
  }
  try {
    const slackResponse = await get('https://slack.com/api/oauth.access', {
      code: req.query.code,
      client_id: slack.clientId,
      client_secret: slack.clientSecret,
    });
    return send(res, 200, slackResponse);
  } catch (e) {
    return send(res, 500, { error: 'Trouble communicating with slack.' });
  }
}

async function listUsers() {
  return get(`https://slack.com/api/users.list?token=${slack.botToken}`);
}

async function findUser(userName) {
  try {
    const users = await listUsers();
    return users.data.members.find(user => user.name === userName);
  } catch (e) {
    throw new Error('Problem getting user list from slack api.');
  }
}

module.exports = {
  auth,
  findUser,
};
