const { router, get, post } = require('microrouter');
const { Slack, Trivia, Question } = require('./modules');

module.exports = router(
  get('/', () => 'it\'s working!'),
  get('/oauth', Slack.auth),
  post('/start', Trivia.handle),
  post('/ask', Question.ask),
);
