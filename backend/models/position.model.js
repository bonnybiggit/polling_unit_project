const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Position', PositionSchema);
