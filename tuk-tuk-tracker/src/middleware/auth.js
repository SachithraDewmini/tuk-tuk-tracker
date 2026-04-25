const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found or inactive',
        code: 'INVALID_USER'
      });
    }
    
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      provinceId: user.provinceId?.toString(),
      districtId: user.districtId?.toString()
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };