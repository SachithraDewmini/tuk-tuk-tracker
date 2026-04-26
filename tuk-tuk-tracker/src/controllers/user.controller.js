const UserModel = require('../models/User.model');

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const filters = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.provinceId) filters.provinceId = req.query.provinceId;
      if (req.query.districtId) filters.districtId = req.query.districtId;
      
      const users = await UserModel.findAll(filters);
      // Remove password hashes from response
      const sanitized = users.map(u => {
        const { passwordHash, ...rest } = u;
        return rest;
      });
      
      res.json({ success: true, data: sanitized });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
      const { passwordHash, ...sanitized } = user;
      res.json({ success: true, data: sanitized });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const user = await UserModel.create(req.body);
      const { passwordHash, ...sanitized } = user;
      res.status(201).json({ success: true, data: sanitized });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const success = await UserModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const success = await UserModel.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'User deactivated successfully' });
      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
