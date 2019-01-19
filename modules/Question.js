const { send } = require('micro');
const parseRequest = require('urlencoded-body-parser');
const mongoQuestion = require('../models/Question');
const { getCurrentMC } = require('../utils/triviaInfo');

const questionRegex = new RegExp(/\*\(?(\d)\s?\w*\)?\*?\s*(.*)/mi);

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

async function ask(req, res) {
  try {
    const reqParams = await parseRequest(req);
    const { questionText, points } = parse(reqParams.text);
    const currentMC = getCurrentMC();
    if (!currentMC) {
      return send(res, 200, 'Oops, you need to run `/trivia start` first');
    }
    const question = await mongoQuestion.create({
      question: questionText,
      MCName: currentMC.name,
      MCId: currentMC.id,
      points,
      winnerName: null,
      winnerId: null,
      teamId: reqParams.team_id,
      timeAsked: new Date(),
    });
    console.log(question);
    return send(res, 200, 'Question Accepted');
  } catch (e) {
    console.log(e.message);
    return send(res, 200, 'Oops, that didn\'t work. Usage: `/ask *(<points> pts)* <Question>`');
  }
}


module.exports = {
  ask,
};
