const { router, get, post } = require('microrouter');
const mongoose = require('mongoose');
const { Slack, Trivia, Question } = require('./modules');
const { mongo } = require('./configs/secret.json');

mongoose.connect(mongo.connectionString, {
  server: {
    socketOptions: {
      keepAlive: 1,
    },
  },
});
mongoose.connection.on('error', () => {
  throw new Error('Unable to connect to database.');
});

module.exports = router(
  get('/', () => 'it\'s working!'),
  get('/oauth', Slack.auth),
  post('/start', Trivia.handle),
  post('/ask', Question.ask),
  post('/award', Question.award),
);
