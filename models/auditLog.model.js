const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, refPath: 'actorType' },
  actorType: { type: String, enum: ['Admin', 'Voter'], required: true },
  action: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
