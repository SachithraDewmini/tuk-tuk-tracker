const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = err.statusCode || 500;
  
  // Custom business logic mapping
  if (err.message === 'Invalid credentials' || err.message === 'Invalid or expired token') {
    statusCode = 401;
  } else if (err.message === 'Access denied' || err.message === 'Account disabled') {
    statusCode = 403;
  } else if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (err.code === 11000) {
    statusCode = 409; // Conflict/Duplicate
  } else if (
    err.message.includes('invalid') || 
    err.message.includes('required') || 
    err.message.includes('outside') ||
    err.message.includes('Cannot register')
  ) {
    statusCode = 400;
  }

  // Log error with resolved status code
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Response body
  const errorResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Handle MongoDB duplicate key specially
  if (err.code === 11000) {
    errorResponse.error = 'Duplicate entry detected';
    errorResponse.field = Object.keys(err.keyPattern)[0];
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = { errorHandler };