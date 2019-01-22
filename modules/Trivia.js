const { send } = require('micro');
const parse = require('urlencoded-body-parser');
const Question = require('../models/Question');
const directions = require('../configs/directions.json');
const { MCOnly } = require('../lib/middleware');
const { sendPublicMessage, sendPrivateMessage } = require('../utils/messaging');
const { getCurrentMC, setCurrentMC } = require('../utils/triviaInfo');

async function sendStartMessages(res, params) {
  try {
    await sendPrivateMessage(
      params.response_url,
      directions.welcome,
      directions.help,
    );
    await sendPublicMessage(
      params.response_url,
      'Hey, <!here>, we\'re starting Friday Trivia!',
      [`Say hello to your host, <@${params.user_id}>.`],
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function start(res, params) {
  const currentMC = getCurrentMC(params.team_id);
  if (currentMC) {
    return send(res, 200, `Trivia is already in progress. The current MC is <@${currentMC.id}>. They need to run \`/trivia start\`.`);
  }
  setCurrentMC({ id: params.user_id, name: params.user_name }, params.team_id);
  return sendStartMessages(res, params);
}

async function printScoreboard(responseUrl, final = false) {
  const scoreboard = await Question.getScore();
  const scoreboardMessage = scoreboard.reduce((msg, player) => (
    `${msg}\n${player._id}: ${player.points}` // eslint-disable-line no-underscore-dangle
  ), '');
  return sendPublicMessage(responseUrl, `${final ? '*Final Score*:' : ''}\`\`\`${scoreboardMessage}\`\`\``);
}

async function printBrainbusters(responseUrl) {
  const brainbusters = await Question.todaysBrainbusters();
  if (brainbusters.length) {
    const brainbusterMessage = brainbusters.reduce((msg, brainbuster) => (
      `${msg}\n${brainbuster.question}`
    ), '');
    return sendPublicMessage(responseUrl, `${brainbusters.length} brainbusters today:\`\`\`${brainbusterMessage}\`\`\``);
  }
  return sendPublicMessage(responseUrl, 'No brainbusters today. Next week: Harder questions.');
}

const end = MCOnly(async (req, res) => {
  const params = await parse(req);
  printScoreboard(params.response_url, true);
  printBrainbusters(params.response_url);
  setCurrentMC(null, params.team_id);
  return send(res, 200);
});

async function handle(req, res) {
  try {
    const params = await parse(req);
    if (params.text === 'start') {
      try {
        await start(res, params);
        return send(res, 200);
      } catch (e) {
        return send(res, 200, 'Problem starting trivia. This is embarassing.');
      }
    } else if (params.text === 'report') {
      printScoreboard(params.response_url);
      printBrainbusters(params.response_url);
      return send(res, 200);
    } else if (params.text === 'end') {
      return end(req, res);
    }
    return send(res, 200, 'Command not recognized. Usage: `/trivia [start | stop | score]`');
  } catch (e) {
    return send(res, 200, 'Oops, that didn\'t work. Usage: `/trivia [start | stop | score]`');
  }
}

module.exports = {
  handle,
};
