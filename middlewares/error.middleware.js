const ApiError = require('../utils/apiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Resource not found - ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const response = {
    status: 'error',
    statusCode,
    message,
  };
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    if (err.details) response.details = err.details;
  }
  res.status(statusCode).json(response);
}

module.exports = { notFoundHandler, errorHandler };
