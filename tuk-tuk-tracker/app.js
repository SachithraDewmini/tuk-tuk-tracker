const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger');

// Security & Performance Middleware
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

const authRoutes = require('./src/routes/auth.routes');
const vehicleRoutes = require('./src/routes/vehicle.routes');
const locationRoutes = require('./src/routes/location.routes');
const provinceRoutes = require('./src/routes/province.routes');
const districtRoutes = require('./src/routes/district.routes');
const policeStationRoutes = require('./src/routes/police-station.routes');
const userRoutes = require('./src/routes/user.routes');

const { errorHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const logger = require('./src/utils/logger');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL Query Injection
app.use((req, res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

// Data sanitization against Cross-Site Scripting (XSS)
const { clean } = require('xss-clean/lib/xss');
app.use((req, res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    if (req[key]) {
      const cleaned = clean(req[key]);
      for (const k in req[key]) delete req[key][k];
      Object.assign(req[key], cleaned);
    }
  });
  next();
});

// Compress responses for better performance
app.use(compression());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use('/api/', apiLimiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    docs: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const path = require('path');
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'live-dashboard.html'));
});

app.use('/api/auth', authRoutes);

// Vehicles and related Users
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);

// Locations
app.use('/api/locations', locationRoutes);

// Metadata split into separate resource routes
app.use('/api/provinces', provinceRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/police-stations', policeStationRoutes);

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.use(errorHandler);

module.exports = app;