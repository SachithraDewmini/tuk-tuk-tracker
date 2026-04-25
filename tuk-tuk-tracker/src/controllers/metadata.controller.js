const ProvinceModel = require('../models/Province.model');
const DistrictModel = require('../models/District.model');
const PoliceStationModel = require('../models/PoliceStation.model');

class MetadataController {
  static async getProvinces(req, res, next) {
    try {
      const provinces = await ProvinceModel.findAll();
      
      res.json({
        success: true,
        data: provinces
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getDistricts(req, res, next) {
    try {
      const { provinceId } = req.query;
      const filters = {};
      if (provinceId) filters.provinceId = provinceId;
      
      const districts = await DistrictModel.findAll(filters);
      
      // Enrich with province info
      const enriched = await Promise.all(districts.map(async (district) => {
        const province = await ProvinceModel.findById(district.provinceId);
        return {
          ...district,
          province: province ? { id: province._id, name: province.name } : null
        };
      }));
      
      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getPoliceStations(req, res, next) {
    try {
      const { districtId } = req.query;
      const filters = {};
      if (districtId) filters.districtId = districtId;
      
      // Apply role-based filtering
      if (req.user.role === 'PROVINCIAL') {
        const districts = await DistrictModel.findByProvince(req.user.provinceId);
        const districtIds = districts.map(d => d._id.toString());
        filters.districtId = { $in: districtIds };
      } else if (req.user.role === 'STATION') {
        filters._id = req.user.districtId;
      }
      
      const stations = await PoliceStationModel.findAll(filters);
      
      // Enrich with district info
      const enriched = await Promise.all(stations.map(async (station) => {
        const district = await DistrictModel.findById(station.districtId);
        return {
          ...station,
          district: district ? { id: district._id, name: district.name } : null
        };
      }));
      
      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MetadataController;