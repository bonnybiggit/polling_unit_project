const { loginAdmin } = require('../services/auth.service');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }
  const { admin, token } = await loginAdmin(email, password);
  await logAction({ actor: admin._id, actorType: 'Admin', action: 'admin_login', category: 'auth', req });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 2,
  });
  res.status(200).json({ status: 'success', token, data: { admin: { id: admin._id, email: admin.email, role: admin.role } } });
});

exports.me = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized.');
  }
  res.status(200).json({ status: 'success', data: { admin: { id: req.user._id, email: req.user.email, role: req.user.role } } });
});
