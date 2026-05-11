const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  party: { type: String, required: true, trim: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  bio: { type: String, trim: true },
  manifesto: { type: String, trim: true },
  active: { type: Boolean, default: true },
  votes: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
