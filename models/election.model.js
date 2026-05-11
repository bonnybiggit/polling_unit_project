const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['draft', 'open', 'closed', 'archived'], default: 'draft' },
  positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }],
  startDate: Date,
  endDate: Date,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Election', ElectionSchema);
