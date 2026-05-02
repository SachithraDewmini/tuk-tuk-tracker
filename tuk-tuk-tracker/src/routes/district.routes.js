const express = require('express');
const router = express.Router();
const DistrictController = require('../controllers/district.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { validateDistrict } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Districts
 *   description: District administration
 */

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: Get all districts
 *     tags: [Districts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/', 
  authenticate, 
  DistrictController.getDistricts
);

/**
 * @swagger
 * /districts:
 *   post:
 *     summary: Create a district
 *     tags: [Districts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: District created
 */
router.post('/',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateDistrict,
  DistrictController.createDistrict
);

/**
 * @swagger
 * /districts/{id}:
 *   put:
 *     summary: Update a district
 *     tags: [Districts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: District updated
 */
router.put('/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateDistrict,
  DistrictController.updateDistrict
);

/**
 * @swagger
 * /districts/{id}:
 *   delete:
 *     summary: Delete a district
 *     tags: [Districts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: District deleted
 */
router.delete('/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  DistrictController.deleteDistrict
);

module.exports = router;
