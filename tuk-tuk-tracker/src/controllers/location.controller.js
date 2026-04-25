const LocationService = require('../services/location.service');

class LocationController {
  static async recordLocation(req, res, next) {
    try {
      const { deviceId, lat, lng, speed, direction, accuracy } = req.body;
      
      const ping = await LocationService.recordLocation(deviceId, {
        lat, lng, speed, direction, accuracy
      });
      
      res.status(201).json({
        success: true,
        message: 'Location recorded successfully',
        data: {
          timestamp: ping.timestamp
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getCurrentLocation(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { role, provinceId, districtId } = req.user;
      
      const location = await LocationService.getCurrentLocation(
        vehicleId,
        role,
        provinceId,
        districtId
      );
      
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getLocationHistory(req, res, next) {
    try {
      const {
        startTime,
        endTime,
        vehicleId,
        provinceId,
        districtId,
        limit = 1000,
        page = 1
      } = req.query;
      
      const filters = { startTime, endTime, vehicleId, provinceId, districtId };
      const pagination = { limit: parseInt(limit), page: parseInt(page) };
      const { role, provinceId: userProvinceId, districtId: userDistrictId } = req.user;
      
      const result = await LocationService.getLocationHistory(
        filters,
        pagination,
        role,
        userProvinceId,
        userDistrictId
      );
      
      res.json({
        success: true,
        ...result,
        filters
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getLiveLocations(req, res, next) {
    try {
      const { role, provinceId, districtId } = req.user;
      
      const liveData = await LocationService.getLiveLocations(role, provinceId, districtId);
      
      res.json({
        success: true,
        ...liveData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController;