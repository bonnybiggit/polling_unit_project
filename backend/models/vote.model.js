const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true },
  pollingUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'PollingUnit', required: true },
  selections: [{
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  }],
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  audit: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

VoteSchema.index({ voter: 1, election: 1 }, { unique: true });
module.exports = mongoose.model('Vote', VoteSchema);
