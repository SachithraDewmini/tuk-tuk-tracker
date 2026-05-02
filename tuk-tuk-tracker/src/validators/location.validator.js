const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

/**
 * Validator for GPS location ping
 */
const validateLocationPing = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .trim(),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('speed')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Speed must be a positive number'),
  body('direction')
    .optional()
    .isInt({ min: 0, max: 360 })
    .withMessage('Direction must be between 0 and 360 degrees'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number'),
  validate
];

module.exports = {
  validateLocationPing
};
