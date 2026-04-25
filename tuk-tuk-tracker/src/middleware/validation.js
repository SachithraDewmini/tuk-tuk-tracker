const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

const validateVehicleCreation = [
  body('registrationNumber').notEmpty().trim().isLength({ min: 5, max: 20 }),
  body('deviceId').notEmpty().trim().isLength({ min: 5, max: 50 }),
  body('ownerName').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('ownerNic').optional().trim(),
  body('ownerPhone').optional().trim(),
  body('districtId').notEmpty().isMongoId(),
  validate
];

const validateVehicleUpdate = [
  body('ownerName').optional().trim(),
  body('ownerNic').optional().trim(),
  body('ownerPhone').optional().trim(),
  body('isActive').optional().isBoolean(),
  validate
];

const validateLocationPing = [
  body('deviceId').notEmpty().trim(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
  body('speed').optional().isFloat({ min: 0 }),
  body('direction').optional().isInt({ min: 0, max: 360 }),
  body('accuracy').optional().isFloat({ min: 0 }),
  validate
];

const validateLogin = [
  body('username').notEmpty().trim(),
  body('password').notEmpty(),
  validate
];

const validatePasswordChange = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validate
];

module.exports = {
  validateVehicleCreation,
  validateVehicleUpdate,
  validateLocationPing,
  validateLogin,
  validatePasswordChange
};