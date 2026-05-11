const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  cardNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  pollingUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'PollingUnit', required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  hasVoted: { type: Boolean, default: false },
  faceDescriptor: { type: [Number], default: [] },
  faceImage: { type: String },
  audit: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

VoterSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Voter', VoterSchema);
