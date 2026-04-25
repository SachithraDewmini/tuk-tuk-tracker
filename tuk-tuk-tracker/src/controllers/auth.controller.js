const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      const result = await AuthService.login(username, password);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { id: userId } = req.user;
      
      await AuthService.changePassword(userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;