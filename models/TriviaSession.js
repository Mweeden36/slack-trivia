const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  MCId: String,
  MCName: String,
  teamId: String,
  closed: Boolean,
}, {
  timestamps: true,
});

SessionSchema.statics = {
  async getCurrentSession(teamId) {
    return this.findOne({
      $and: [{
        teamId,
      }, {
        closed: {
          $in: [
            null,
            false,
          ],
        },
      }],
    });
  },

  async closeSession(teamId) {
    return this.findOneAndUpdate(
      {
        $and: [
          { teamId },
          {
            closed: {
              $in: [
                false,
                null,
              ],
            },
          },
        ],
      },
      {
        $set: {
          closed: true,
        },
      }, {
        sort: { $updatedAt: 1 },
        new: true,
      },
    );
  },
};

module.exports = mongoose.model('Session', SessionSchema);
