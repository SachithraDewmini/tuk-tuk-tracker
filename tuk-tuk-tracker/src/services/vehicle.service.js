const VehicleModel = require('../models/Vehicle.model');
const DistrictModel = require('../models/District.model');
const ProvinceModel = require('../models/Province.model');
const { USER_ROLES } = require('../config/constants');

class VehicleService {
  static async registerVehicle(vehicleData, userRole, userProvinceId, userDistrictId) {
    // Validate district exists
    const district = await DistrictModel.findById(vehicleData.districtId);
    if (!district) {
      throw new Error('District not found');
    }
    
    // Check permissions based on user role
    if (userRole === USER_ROLES.PROVINCIAL) {
      const province = await ProvinceModel.findById(userProvinceId);
      if (district.provinceId.toString() !== userProvinceId) {
        throw new Error('Cannot register vehicle outside your province');
      }
    }
    
    if (userRole === USER_ROLES.STATION) {
      if (district._id.toString() !== userDistrictId) {
        throw new Error('Cannot register vehicle outside your district');
      }
    }
    
    // Check for duplicate
    const existing = await VehicleModel.findByDeviceId(vehicleData.deviceId);
    if (existing) {
      throw new Error('Device ID already registered');
    }
    
    return await VehicleModel.create(vehicleData);
  }
  
  static async getAllVehicles(filters, pagination, userRole, userProvinceId, userDistrictId) {
    let queryFilters = { ...filters };
    
    // Apply role-based filtering
    if (userRole === USER_ROLES.PROVINCIAL && userProvinceId) {
      const districts = await DistrictModel.findByProvince(userProvinceId);
      const districtIds = districts.map(d => d._id.toString());
      queryFilters.districtId = { $in: districtIds };
    }
    
    if (userRole === USER_ROLES.STATION && userDistrictId) {
      queryFilters.districtId = userDistrictId;
    }
    
    const result = await VehicleModel.findAll(queryFilters, pagination);
    
    // Enrich with district and province info
    const enrichedData = await Promise.all(result.data.map(async (vehicle) => {
      const district = await DistrictModel.findById(vehicle.districtId);
      const province = district ? await ProvinceModel.findById(district.provinceId) : null;
      
      return {
        ...vehicle,
        district: district ? { id: district._id, name: district.name } : null,
        province: province ? { id: province._id, name: province.name } : null
      };
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
  
  static async getVehicleById(vehicleId, userRole, userProvinceId, userDistrictId) {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Check permissions
    const district = await DistrictModel.findById(vehicle.districtId);
    const province = await ProvinceModel.findById(district.provinceId);
    
    if (userRole === USER_ROLES.PROVINCIAL && province._id.toString() !== userProvinceId) {
      throw new Error('Access denied to this vehicle');
    }
    
    if (userRole === USER_ROLES.STATION && district._id.toString() !== userDistrictId) {
      throw new Error('Access denied to this vehicle');
    }
    
    return {
      ...vehicle,
      district: { id: district._id, name: district.name },
      province: { id: province._id, name: province.name }
    };
  }
  
  static async updateVehicle(vehicleId, updateData, userRole) {
    if (userRole !== USER_ROLES.HQ) {
      throw new Error('Only HQ can update vehicles');
    }
    
    const updated = await VehicleModel.updateById(vehicleId, updateData);
    if (!updated) {
      throw new Error('Vehicle not found or update failed');
    }
    
    return true;
  }
  
  static async deleteVehicle(vehicleId, userRole) {
    if (userRole !== USER_ROLES.HQ) {
      throw new Error('Only HQ can delete vehicles');
    }
    
    const deleted = await VehicleModel.deleteById(vehicleId);
    if (!deleted) {
      throw new Error('Vehicle not found');
    }
    
    return true;
  }
}

module.exports = VehicleService;