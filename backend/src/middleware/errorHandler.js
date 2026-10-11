const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected internal error occurred.';

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'An account with that email already exists.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // File size limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Uploaded file exceeds the maximum allowed limit of 10MB.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
