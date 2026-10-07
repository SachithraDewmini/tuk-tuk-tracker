const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');
const logger = require('../utils/logger');
const { USER_ROLES } = require('../config/constants');

let io;

class WebSocketService {
  static init(server) {
    io = socketIo(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware for WebSocket
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);

        if (!user || !user.isActive) {
          return next(new Error('Authentication error: User inactive or not found'));
        }

        socket.user = {
          id: user._id,
          username: user.username,
          role: user.role,
          provinceId: user.provinceId?.toString(),
          districtId: user.districtId?.toString()
        };
        
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      const { role, provinceId, districtId, username } = socket.user;
      logger.info(`WebSocket connected: User ${username} (Role: ${role})`);

      // Join appropriate rooms based on role
      socket.join('hq'); // Everyone can technically be in hq, but we control broadcast

      if (role === USER_ROLES.HQ) {
        // HQ can listen to all updates
        socket.join('all_locations');
      } else if (role === USER_ROLES.PROVINCIAL && provinceId) {
        socket.join(`province_${provinceId}`);
      } else if (role === USER_ROLES.STATION && districtId) {
        socket.join(`district_${districtId}`);
      }

      socket.on('disconnect', () => {
        logger.info(`WebSocket disconnected: User ${username}`);
      });
    });

    logger.info('WebSocket server initialized');
  }

  static broadcastLocation(vehicle, locationPing, districtId, provinceId) {
    if (!io) return; // Not initialized

    const payload = {
      vehicleId: vehicle._id,
      registrationNumber: vehicle.registrationNumber,
      location: locationPing,
      timestamp: locationPing.timestamp
    };

    // Broadcast to HQ
    io.to('all_locations').emit('location_update', payload);

    // Broadcast to specific province room
    if (provinceId) {
      io.to(`province_${provinceId}`).emit('location_update', payload);
    }

    // Broadcast to specific district room
    if (districtId) {
      io.to(`district_${districtId}`).emit('location_update', payload);
    }
  }
}

module.exports = WebSocketService;
