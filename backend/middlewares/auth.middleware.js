const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const Admin = require('../models/admin.model');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies.token;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(payload.id).select('+password');
    if (!user) return next(new ApiError(401, 'Invalid authentication token.'));
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Token verification failed.'));
  }
}

module.exports = { authenticate };
