const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ 
      success: false,
      error: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // Custom business logic errors
  if (err.message.includes('not found') || 
      err.message === 'Invalid credentials' ||
      err.message === 'Access denied') {
    return res.status(err.message === 'Access denied' ? 403 : 404).json({ 
      success: false,
      error: err.message 
    });
  }
  
  if (err.message.includes('outside Sri Lanka') || 
      err.message.includes('invalid') || 
      err.message.includes('required')) {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };