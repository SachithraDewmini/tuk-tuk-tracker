const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

/**
 * Validator for user login
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validator for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validate
];

module.exports = {
  validateLogin,
  validatePasswordChange
};
