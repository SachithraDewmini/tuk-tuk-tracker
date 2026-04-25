const VehicleModel = require('../models/Vehicle.model');
const LocationPingModel = require('../models/LocationPing.model');
const DistrictModel = require('../models/District.model');
const ProvinceModel = require('../models/Province.model');
const { USER_ROLES, TIME_CONSTANTS } = require('../config/constants');

class LocationService {
  static async recordLocation(deviceId, locationData) {
    // Find vehicle by device ID
    const vehicle = await VehicleModel.findByDeviceId(deviceId);
    if (!vehicle) {
      throw new Error('Vehicle not found or inactive');
    }
    
    // Validate coordinates (Sri Lanka bounds)
    const { lat, lng } = locationData;
    if (lat < 5.9 || lat > 9.8 || lng < 79.5 || lng > 81.9) {
      throw new Error('Coordinates outside Sri Lanka');
    }
    
    // Create location ping
    const ping = await LocationPingModel.create({
      vehicleId: vehicle._id,
      lat,
      lng,
      speed: locationData.speed || 0,
      direction: locationData.direction || 0,
      accuracy: locationData.accuracy || null,
      coordinates: { type: 'Point', coordinates: [lng, lat] }
    });
    
    // Update vehicle's current location
    await VehicleModel.updateCurrentLocation(vehicle._id, {
      lat,
      lng,
      speed: locationData.speed || 0,
      direction: locationData.direction || 0
    });
    
    return ping;
  }
  
  static async getCurrentLocation(vehicleId, userRole, userProvinceId, userDistrictId) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Check permissions
    const district = await DistrictModel.findById(vehicle.districtId);
    const province = await ProvinceModel.findById(district.provinceId);
    
    if (userRole === USER_ROLES.PROVINCIAL && province._id.toString() !== userProvinceId) {
      throw new Error('Access denied');
    }
    
    if (userRole === USER_ROLES.STATION && district._id.toString() !== userDistrictId) {
      throw new Error('Access denied');
    }
    
    if (!vehicle.currentLocation) {
      throw new Error('No location data available');
    }
    
    const staleThreshold = new Date(Date.now() - TIME_CONSTANTS.STALE_THRESHOLD);
    const isStale = new Date(vehicle.currentLocation.timestamp) < staleThreshold;
    
    return {
      vehicleId: vehicle._id,
      registrationNumber: vehicle.registrationNumber,
      location: vehicle.currentLocation,
      isStale,
      lastUpdate: vehicle.currentLocation.timestamp
    };
  }
  
  static async getLocationHistory(filters, pagination, userRole, userProvinceId, userDistrictId) {
    // Build vehicle filter based on role
    let vehicleFilter = {};
    
    if (userRole === USER_ROLES.PROVINCIAL && userProvinceId) {
      const districts = await DistrictModel.findByProvince(userProvinceId);
      const districtIds = districts.map(d => d._id.toString());
      vehicleFilter.districtId = { $in: districtIds };
    }
    
    if (userRole === USER_ROLES.STATION && userDistrictId) {
      vehicleFilter.districtId = userDistrictId;
    }
    
    if (filters.vehicleId) {
      vehicleFilter._id = filters.vehicleId;
    }
    
    if (filters.districtId) {
      vehicleFilter.districtId = filters.districtId;
    }
    
    if (filters.provinceId) {
      const districts = await DistrictModel.findByProvince(filters.provinceId);
      const districtIds = districts.map(d => d._id.toString());
      vehicleFilter.districtId = { $in: districtIds };
    }
    
    // Get matching vehicles
    const vehicles = await VehicleModel.findAll(vehicleFilter, { limit: 10000 });
    const vehicleIds = vehicles.data.map(v => v._id.toString());
    
    if (vehicleIds.length === 0) {
      return {
        data: [],
        pagination: { page: pagination.page, limit: pagination.limit, total: 0, pages: 0 }
      };
    }
    
    // Get location pings
    const result = await LocationPingModel.findWithFilters(
      {},
      {
        ...pagination,
        startTime: filters.startTime,
        endTime: filters.endTime,
        vehicleIds
      }
    );
    
    // Map vehicle info
    const vehicleMap = new Map(vehicles.data.map(v => [v._id.toString(), v.registrationNumber]));
    const enrichedData = result.data.map(ping => ({
      ...ping,
      registrationNumber: vehicleMap.get(ping.vehicleId.toString())
    }));
    
    return {
      data: enrichedData,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit)
      }
    };
  }
  
  static async getLiveLocations(userRole, userProvinceId, userDistrictId) {
    // Build vehicle filter based on role
    let vehicleFilter = {};
    
    if (userRole === USER_ROLES.PROVINCIAL && userProvinceId) {
      const districts = await DistrictModel.findByProvince(userProvinceId);
      const districtIds = districts.map(d => d._id.toString());
      vehicleFilter.districtId = { $in: districtIds };
    }
    
    if (userRole === USER_ROLES.STATION && userDistrictId) {
      vehicleFilter.districtId = userDistrictId;
    }
    
    const vehicles = await VehicleModel.findAll(vehicleFilter, { limit: 1000 });
    
    const liveData = vehicles.data
      .filter(v => v.currentLocation)
      .map(v => ({
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        location: v.currentLocation,
        age: Date.now() - new Date(v.currentLocation.timestamp).getTime()
      }));
    
    return {
      count: liveData.length,
      timestamp: new Date(),
      data: liveData
    };
  }
}

module.exports = LocationService;