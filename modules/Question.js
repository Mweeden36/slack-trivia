const { send } = require('micro');
const parseRequest = require('urlencoded-body-parser');
const Question = require('../models/Question');
const { findUser } = require('./Slack');
const { getCurrentMC } = require('../utils/triviaInfo');

const questionRegex = new RegExp(/\*\(?(\d)\s?\w*\)?\*?\s*(.*)/mi);
const awardRegex = new RegExp(/@?(\S*)\s?(\d*)/mi);

function parse(text) {
  const matches = text.match(questionRegex);

  if (matches.length !== 3) {
    throw new Error('Question does not match format: *(<points> pts)* <Question>');
  }

  return {
    questionText: matches[2],
    points: Number(matches[1]),
  };
}

function authAction(params, currentMC) {
  if (!currentMC) {
    return 'Oops, you need to run `/trivia start` first';
  }
  if (currentMC.id !== params.user_id) {
    return `Only the MC can do that. You weren't trying to cheat, were you, <@${params.user_id}>?`;
  }
  return undefined;
}

async function award(req, res) {
  try {
    const reqParams = await parseRequest(req);
    const currentMC = getCurrentMC(reqParams.team_id);
    const errorMessage = authAction(reqParams, currentMC);
    if (errorMessage) {
      return send(res, 200, errorMessage);
    }
    const matches = reqParams.text.match(awardRegex);
    const slackUser = await findUser(matches[1]);
    let updateObject = {
      winnerName: matches[1],
      winnerId: slackUser.id,
    };
    if (matches.length === 3 && matches[2]) {
      updateObject = {
        ...updateObject,
        points: Number(matches[2]),
      };
    }
    Question.findOneAndUpdate(
      { teamId: reqParams.team_id },
      { $set: { ...updateObject } },
      {
        sort: { $natural: -1 },
        new: true,
      },
    );
    return send(res, 200, 'Score updated.');
  } catch (e) {
    return send(res, 200, e.message);
  }
}

async function ask(req, res) {
  try {
    const reqParams = await parseRequest(req);
    const currentMC = getCurrentMC(reqParams.team_id);
    const errorMessage = authAction(reqParams, currentMC);
    if (errorMessage) {
      return send(res, 200, errorMessage);
    }
    const { questionText, points } = parse(reqParams.text);
    await new Question({
      question: questionText,
      MCName: currentMC.name,
      MCId: currentMC.id,
      points,
      winnerName: null,
      winnerId: null,
      teamId: reqParams.team_id,
      timeAsked: new Date(),
    }).save();
    return send(res, 200, 'Question Accepted');
  } catch (e) {
    console.log(e.message);
    return send(res, 200, 'Oops, that didn\'t work. Usage: `/ask *(<points> pts)* <Question>`');
  }
}


module.exports = {
  ask,
  award,
};
