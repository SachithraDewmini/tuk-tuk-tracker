const DistrictModel = require('../models/District.model');
const ProvinceModel = require('../models/Province.model');

class DistrictController {
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

  static async createDistrict(req, res, next) {
    try {
      const district = await DistrictModel.create(req.body);
      res.status(201).json({ success: true, data: district });
    } catch (error) {
      next(error);
    }
  }

  static async updateDistrict(req, res, next) {
    try {
      const success = await DistrictModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'District not found' });
      res.json({ success: true, message: 'District updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDistrict(req, res, next) {
    try {
      const success = await DistrictModel.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'District not found' });
      res.json({ success: true, message: 'District deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DistrictController;
