const express = require('express');
const router = express.Router();
const ProvinceController = require('../controllers/province.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { validateProvince } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Provinces
 *   description: Province administration
 */

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Provinces]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get('/', 
  authenticate, 
  ProvinceController.getProvinces
);

/**
 * @swagger
 * /provinces:
 *   post:
 *     summary: Create a province
 *     tags: [Provinces]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Province created
 */
router.post('/',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateProvince,
  ProvinceController.createProvince
);

/**
 * @swagger
 * /provinces/{id}:
 *   put:
 *     summary: Update a province
 *     tags: [Provinces]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Province updated
 */
router.put('/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateProvince,
  ProvinceController.updateProvince
);

/**
 * @swagger
 * /provinces/{id}:
 *   delete:
 *     summary: Delete a province
 *     tags: [Provinces]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Province deleted
 */
router.delete('/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  ProvinceController.deleteProvince
);

module.exports = router;
