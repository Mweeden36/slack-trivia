const mongoose = require('mongoose');
const moment = require('moment');
const Session = require('./TriviaSession');

const QuestionSchema = new mongoose.Schema({
  question: String,
  MCName: String,
  MCId: String,
  sessionId: mongoose.Schema.Types.ObjectId,
  points: Number,
  winnerName: String,
  winnerId: String,
  teamId: String,
}, {
  timestamps: true,
});

QuestionSchema.statics = {
  async getScore(teamId) {
    const currentSession = await Session.getCurrentSession(teamId);
    const pipeline = [{
      $match: {
        sessionId: currentSession._id,
        winnerId: {
          $ne: null,
        },
      },
    }, {
      $group: {
        _id: '$winnerName',
        points: {
          $sum: '$points',
        },
      },
    }, {
      $sort: {
        points: -1,
      },
    }];
    return this.aggregate(pipeline);
  },

  async todaysBrainbusters() {
    return this.find({
      createdAt: {
        $gte: moment().subtract(1, 'hours').toDate(),
      },
      winnerId: {
        $eq: null,
      },
    }, {
      question: 1,
    });
  },
};

module.exports = mongoose.model('Question', QuestionSchema);
