const mongoose = require('mongoose');

const { Schema } = mongoose;
const question = new Schema({
  question: String,
  MCName: String,
  MCId: String,
  points: Number,
  winnerName: String,
  winnerId: String,
  teamId: String,
  timeAsked: Date,
});

module.exports = question;
