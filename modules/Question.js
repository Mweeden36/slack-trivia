const { send } = require('micro');
const parseRequest = require('urlencoded-body-parser');
const Question = require('../models/Question');
const Session = require('../models/TriviaSession');
const { findUser } = require('./Slack');
const { MCOnly } = require('../lib/middleware');
const { sendPublicMessage } = require('../utils/messaging');

const questionRegex = new RegExp(/\*?\(?(\d)\s?\w*\)?\*?\s*(.*)/mi);
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

const award = MCOnly(async (req, res) => {
  try {
    const params = await parseRequest(req);
    const matches = params.text.match(awardRegex);
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
    const question = await Question.findOneAndUpdate(
      { teamId: params.team_id },
      { $set: { ...updateObject } },
      {
        sort: { $natural: -1 },
        new: true,
      },
    );
    sendPublicMessage(params.response_url, `<@${slackUser.id}> gets ${question.points} points.`);
    return send(res, 200);
  } catch (e) {
    return send(res, 200, e.message);
  }
});

const ask = MCOnly(async (req, res) => {
  try {
    const params = await parseRequest(req);
    const currentSession = await Session.getCurrentSession(params.team_id);
    const { questionText, points } = parse(params.text);
    await new Question({
      question: questionText,
      MCName: currentSession.name,
      MCId: currentSession.MCId,
      sessionId: currentSession.id,
      points,
      winnerName: null,
      winnerId: null,
      teamId: params.team_id,
      timeAsked: new Date(),
    }).save();
    sendPublicMessage(params.response_url, 'Here\'s the question:', [`*(${points} pts)* ${questionText}`]);
    return send(res, 200);
  } catch (e) {
    return send(res, 200, 'Oops, that didn\'t work. Usage: `/ask *(<points> pts)* <Question>`');
  }
});


module.exports = {
  ask,
  award,
};
