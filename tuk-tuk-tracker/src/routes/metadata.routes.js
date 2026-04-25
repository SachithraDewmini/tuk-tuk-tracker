const express = require('express');
const router = express.Router();
const MetadataController = require('../controllers/metadata.controller');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;