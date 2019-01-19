const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: String,
  MCName: String,
  MCId: String,
  points: Number,
  winnerName: String,
  winnerId: String,
  teamId: String,
  timeAsked: Date,
});

module.exports = mongoose.model('Question', QuestionSchema);
