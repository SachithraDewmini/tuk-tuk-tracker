const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/location.controller');
const { authenticate } = require('../middleware/auth');
const { validateLocationPing } = require('../validators/location.validator');

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Receive GPS ping from device
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId, lat, lng]
 *             properties:
 *               deviceId: { type: string }
 *               lat: { type: number }
 *               lng: { type: number }
 *               speed: { type: number }
 *     responses:
 *       201:
 *         description: Location recorded
 */
router.post('/',
  validateLocationPing,
  LocationController.recordLocation
);

/**
 * @swagger
 * /locations/current/{vehicleId}:
 *   get:
 *     summary: Get current location of a vehicle
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Current location
 */
router.get('/current/:vehicleId',
  authenticate,
  LocationController.getCurrentLocation
);

/**
 * @swagger
 * /locations/history:
 *   get:
 *     summary: Get location history
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Location history
 */
router.get('/history',
  authenticate,
  LocationController.getLocationHistory
);

/**
 * @swagger
 * /locations/live:
 *   get:
 *     summary: Get live locations of all active vehicles
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Live locations
 */
router.get('/live',
  authenticate,
  LocationController.getLiveLocations
);

module.exports = router;