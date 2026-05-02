const { body, validationResult } = require('express-validator');

/**
 * Generic validation middleware to check for express-validator errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Metadata validators
 */
const validateProvince = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 50 }),
  validate
];

const validateDistrict = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('provinceId').notEmpty().isMongoId(),
  validate
];

const validatePoliceStation = [
  body('name').notEmpty().trim().isLength({ min: 5, max: 100 }),
  body('districtId').notEmpty().isMongoId(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  validate
];

const validateUserCreation = [
  body('username').notEmpty().trim().isLength({ min: 4, max: 30 }),
  body('password').notEmpty().isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['HQ', 'PROVINCIAL', 'STATION']),
  body('provinceId').optional().isMongoId(),
  body('districtId').optional().isMongoId(),
  validate
];

const validateUserUpdate = [
  body('name').optional().trim(),
  body('password').optional().isLength({ min: 6 }),
  body('isActive').optional().isBoolean(),
  validate
];

module.exports = {
  validate,
  validateProvince,
  validateDistrict,
  validatePoliceStation,
  validateUserCreation,
  validateUserUpdate
};