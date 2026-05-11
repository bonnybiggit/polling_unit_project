const mongoose = require('mongoose');

const PollingUnitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  state: { type: String, trim: true },
  localGovernment: { type: String, trim: true },
  address: { type: String, trim: true },
  zone: { type: String, trim: true },
  active: { type: Boolean, default: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('PollingUnit', PollingUnitSchema);
