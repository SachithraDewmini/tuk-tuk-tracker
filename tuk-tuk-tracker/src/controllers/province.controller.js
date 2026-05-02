const ProvinceModel = require('../models/Province.model');

class ProvinceController {
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

  static async createProvince(req, res, next) {
    try {
      const province = await ProvinceModel.create(req.body);
      res.status(201).json({ success: true, data: province });
    } catch (error) {
      next(error);
    }
  }

  static async updateProvince(req, res, next) {
    try {
      const success = await ProvinceModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'Province not found' });
      res.json({ success: true, message: 'Province updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProvince(req, res, next) {
    try {
      const success = await ProvinceModel.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Province not found' });
      res.json({ success: true, message: 'Province deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProvinceController;
