const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

/**
 * Validator for vehicle registration
 */
const validateVehicleCreation = [
  body('registrationNumber')
    .notEmpty()
    .withMessage('Registration number is required')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Registration number must be between 5 and 20 characters'),
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Device ID must be between 5 and 50 characters'),
  body('ownerName')
    .notEmpty()
    .withMessage('Owner name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Owner name must be between 2 and 100 characters'),
  body('ownerNic')
    .optional()
    .trim()
    .matches(/^[0-9]{9}[vVxX]|[0-9]{12}$/)
    .withMessage('Invalid NIC format'),
  body('ownerPhone')
    .optional()
    .trim()
    .matches(/^(?:\+94|0)[1-9][0-9]{8}$/)
    .withMessage('Invalid Sri Lankan phone number format'),
  body('districtId')
    .notEmpty()
    .withMessage('District ID is required')
    .isMongoId()
    .withMessage('Invalid District ID format'),
  validate
];

/**
 * Validator for vehicle updates
 */
const validateVehicleUpdate = [
  body('ownerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }),
  body('ownerNic')
    .optional()
    .trim()
    .matches(/^[0-9]{9}[vVxX]|[0-9]{12}$/)
    .withMessage('Invalid NIC format'),
  body('ownerPhone')
    .optional()
    .trim()
    .matches(/^(?:\+94|0)[1-9][0-9]{8}$/)
    .withMessage('Invalid Sri Lankan phone number format'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

module.exports = {
  validateVehicleCreation,
  validateVehicleUpdate
};
