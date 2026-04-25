const VehicleService = require('../services/vehicle.service');
const { PAGINATION } = require('../config/constants');

class VehicleController {
  static async registerVehicle(req, res, next) {
    try {
      const vehicleData = req.body;
      const { role, provinceId, districtId } = req.user;
      
      const vehicle = await VehicleService.registerVehicle(
        vehicleData,
        role,
        provinceId,
        districtId
      );
      
      res.status(201).json({
        success: true,
        message: 'Vehicle registered successfully',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllVehicles(req, res, next) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        registrationNumber,
        districtId,
        isActive
      } = req.query;
      
      // Build filters
      const filters = {};
      if (registrationNumber) filters.registrationNumber = { $regex: registrationNumber, $options: 'i' };
      if (districtId) filters.districtId = districtId;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const pagination = { page, limit, sortBy, sortOrder };
      const { role, provinceId, districtId: userDistrictId } = req.user;
      
      const result = await VehicleService.getAllVehicles(
        filters,
        pagination,
        role,
        provinceId,
        userDistrictId
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getVehicleById(req, res, next) {
    try {
      const { id } = req.params;
      const { role, provinceId, districtId } = req.user;
      
      const vehicle = await VehicleService.getVehicleById(id, role, provinceId, districtId);
      
      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const { role } = req.user;
      
      await VehicleService.updateVehicle(id, updateData, role);
      
      res.json({
        success: true,
        message: 'Vehicle updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.user;
      
      await VehicleService.deleteVehicle(id, role);
      
      res.json({
        success: true,
        message: 'Vehicle deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VehicleController;