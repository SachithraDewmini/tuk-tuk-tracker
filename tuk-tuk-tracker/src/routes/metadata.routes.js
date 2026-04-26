const express = require('express');
const router = express.Router();
const MetadataController = require('../controllers/metadata.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { validateProvince, validateDistrict, validatePoliceStation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Metadata
 *   description: Administrative data (Provinces, Districts, Police Stations)
 */

// Provinces
/**
 * @swagger
 * /metadata/provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get('/provinces', 
  authenticate, 
  MetadataController.getProvinces
);

/**
 * @swagger
 * /metadata/provinces:
 *   post:
 *     summary: Create a province
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Province created
 */
router.post('/provinces',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateProvince,
  MetadataController.createProvince
);

/**
 * @swagger
 * /metadata/provinces/{id}:
 *   put:
 *     summary: Update a province
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Province updated
 */
router.put('/provinces/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateProvince,
  MetadataController.updateProvince
);

/**
 * @swagger
 * /metadata/provinces/{id}:
 *   delete:
 *     summary: Delete a province
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Province deleted
 */
router.delete('/provinces/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  MetadataController.deleteProvince
);

// Districts
/**
 * @swagger
 * /metadata/districts:
 *   get:
 *     summary: Get all districts
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/districts', 
  authenticate, 
  MetadataController.getDistricts
);

/**
 * @swagger
 * /metadata/districts:
 *   post:
 *     summary: Create a district
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: District created
 */
router.post('/districts',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateDistrict,
  MetadataController.createDistrict
);

/**
 * @swagger
 * /metadata/districts/{id}:
 *   put:
 *     summary: Update a district
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: District updated
 */
router.put('/districts/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  validateDistrict,
  MetadataController.updateDistrict
);

/**
 * @swagger
 * /metadata/districts/{id}:
 *   delete:
 *     summary: Delete a district
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: District deleted
 */
router.delete('/districts/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  MetadataController.deleteDistrict
);

// Police Stations
/**
 * @swagger
 * /metadata/police-stations:
 *   get:
 *     summary: Get all police stations
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of police stations
 */
router.get('/police-stations', 
  authenticate, 
  MetadataController.getPoliceStations
);

/**
 * @swagger
 * /metadata/police-stations:
 *   post:
 *     summary: Create a police station
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Police station created
 */
router.post('/police-stations',
  authenticate,
  authorize(USER_ROLES.HQ, USER_ROLES.PROVINCIAL),
  validatePoliceStation,
  MetadataController.createPoliceStation
);

/**
 * @swagger
 * /metadata/police-stations/{id}:
 *   put:
 *     summary: Update a police station
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Police station updated
 */
router.put('/police-stations/:id',
  authenticate,
  authorize(USER_ROLES.HQ, USER_ROLES.PROVINCIAL),
  validatePoliceStation,
  MetadataController.updatePoliceStation
);

/**
 * @swagger
 * /metadata/police-stations/{id}:
 *   delete:
 *     summary: Delete a police station
 *     tags: [Metadata]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Police station deleted
 */
router.delete('/police-stations/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  MetadataController.deletePoliceStation
);

module.exports = router;