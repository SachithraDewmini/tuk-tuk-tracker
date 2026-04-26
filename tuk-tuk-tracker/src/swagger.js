const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sri Lanka Police Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: 'Real-time three-wheeler tracking system for law enforcement',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication management' },
      { name: 'Vehicles', description: 'Vehicle asset management' },
      { name: 'Users', description: 'User account management (HQ only)' },
      { name: 'Locations', description: 'Real-time tracking and history' },
      { name: 'Metadata', description: 'Administrative data (Provinces, Districts, Stations)' }
    ]
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);