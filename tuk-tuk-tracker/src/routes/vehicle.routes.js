const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateVehicleCreation, validateVehicleUpdate } = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: registrationNumber
 *         schema: { type: string }
 *       - in: query
 *         name: districtId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of vehicles
 */
router.get('/', 
  authenticate, 
  VehicleController.getAllVehicles
);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle details
 */
router.get('/:id', 
  authenticate, 
  VehicleController.getVehicleById
);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Register a new vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [registrationNumber, deviceId, districtId]
 *             properties:
 *               registrationNumber: { type: string }
 *               deviceId: { type: string }
 *               districtId: { type: string }
 *     responses:
 *       201:
 *         description: Vehicle registered successfully
 */
router.post('/', 
  authenticate, 
  authorize(USER_ROLES.HQ, USER_ROLES.PROVINCIAL, USER_ROLES.STATION),
  validateVehicleCreation,
  VehicleController.registerVehicle
);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Update vehicle details
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 */
router.put('/:id', 
  authenticate, 
  authorize(USER_ROLES.HQ),
  validateVehicleUpdate,
  VehicleController.updateVehicle
);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Deactivate a vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle deactivated successfully
 */
router.delete('/:id', 
  authenticate, 
  authorize(USER_ROLES.HQ),
  VehicleController.deleteVehicle
);

module.exports = router;