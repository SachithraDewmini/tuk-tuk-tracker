const express = require('express');
const router = express.Router();
const PoliceStationController = require('../controllers/police-station.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { validatePoliceStation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Police Stations
 *   description: Police Station administration
 */

/**
 * @swagger
 * /police-stations:
 *   get:
 *     summary: Get all police stations
 *     tags: [Police Stations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of police stations
 */
router.get('/', 
  authenticate, 
  PoliceStationController.getPoliceStations
);

/**
 * @swagger
 * /police-stations:
 *   post:
 *     summary: Create a police station
 *     tags: [Police Stations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Police station created
 */
router.post('/',
  authenticate,
  authorize(USER_ROLES.HQ, USER_ROLES.PROVINCIAL),
  validatePoliceStation,
  PoliceStationController.createPoliceStation
);

/**
 * @swagger
 * /police-stations/{id}:
 *   put:
 *     summary: Update a police station
 *     tags: [Police Stations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Police station updated
 */
router.put('/:id',
  authenticate,
  authorize(USER_ROLES.HQ, USER_ROLES.PROVINCIAL),
  validatePoliceStation,
  PoliceStationController.updatePoliceStation
);

/**
 * @swagger
 * /police-stations/{id}:
 *   delete:
 *     summary: Delete a police station
 *     tags: [Police Stations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Police station deleted
 */
router.delete('/:id',
  authenticate,
  authorize(USER_ROLES.HQ),
  PoliceStationController.deletePoliceStation
);

module.exports = router;
