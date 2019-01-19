const { router, get, post } = require('microrouter');
const { Slack, Trivia } = require('./modules');

module.exports = router(
  get('/', () => {
    return 'it\'s working!';
  }),
  get('/oauth', Slack.auth),
  post('/start', Trivia.handle),
);