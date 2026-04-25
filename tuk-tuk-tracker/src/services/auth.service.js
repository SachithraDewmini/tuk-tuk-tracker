const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');

class AuthService {
  static async login(username, password) {
    // Find user
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Validate password
    const isValid = await UserModel.validatePassword(user, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Check if active
    if (!user.isActive) {
      throw new Error('Account disabled');
    }
    
    // Update last login
    await UserModel.updateLastLogin(user._id);
    
    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        provinceId: user.provinceId,
        districtId: user.districtId
      }
    };
  }
  
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValid = await UserModel.validatePassword(user, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    const changed = await UserModel.changePassword(userId, newPassword);
    if (!changed) {
      throw new Error('Password change failed');
    }
    
    return true;
  }
  
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = AuthService;