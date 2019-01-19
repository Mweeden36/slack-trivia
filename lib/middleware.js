const { send } = require('micro');
const parseRequest = require('urlencoded-body-parser');
const { getCurrentMC } = require('../utils/triviaInfo');

function authAction(params, currentMC) {
  if (!currentMC) {
    return 'Oops, you need to run `/trivia start` first';
  }
  if (currentMC.id !== params.user_id) {
    return `Only the MC can do that. You weren't trying to cheat, were you, <@${params.user_id}>?`;
  }
  return undefined;
}

exports.MCOnly = next => (
  async (req, res) => {
    const params = await parseRequest(req);
    const currentMC = getCurrentMC(params.team_id);
    const errorMessage = authAction(params, currentMC);
    if (errorMessage) {
      return send(res, 200, errorMessage);
    }
    return next(req, res);
  }
);
