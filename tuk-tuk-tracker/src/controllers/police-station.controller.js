const PoliceStationModel = require('../models/PoliceStation.model');
const DistrictModel = require('../models/District.model');

class PoliceStationController {
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

  static async createPoliceStation(req, res, next) {
    try {
      const station = await PoliceStationModel.create(req.body);
      res.status(201).json({ success: true, data: station });
    } catch (error) {
      next(error);
    }
  }

  static async updatePoliceStation(req, res, next) {
    try {
      const success = await PoliceStationModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'Police station not found' });
      res.json({ success: true, message: 'Police station updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deletePoliceStation(req, res, next) {
    try {
      const success = await PoliceStationModel.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Police station not found' });
      res.json({ success: true, message: 'Police station deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PoliceStationController;
