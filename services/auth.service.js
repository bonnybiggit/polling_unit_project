const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

function signToken(admin) {
  return jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

async function loginAdmin(email, password) {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    throw new Error('Admin credentials are invalid.');
  }
  const valid = await admin.comparePassword(password);
  if (!valid) {
    throw new Error('Admin credentials are invalid.');
  }
  return { admin, token: signToken(admin) };
}

module.exports = { loginAdmin, signToken };
