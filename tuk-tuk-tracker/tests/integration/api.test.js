const request = require('supertest');
const app = require('../../app');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

describe('API Integration Tests', () => {
  let connection;
  let db;

  beforeAll(async () => {
    // In a real scenario, we would use a separate test database
    // For this demonstration, we'll connect to the one specified in .env
    connection = await MongoClient.connect(process.env.MONGODB_URI);
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('Basic Endpoints', () => {
    test('GET /health should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET / should redirect to /api-docs', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(302);
      expect(response.header.location).toBe('/api-docs');
    });

    test('GET /non-existent-route should return 404', async () => {
      const response = await request(app).get('/api/v1/unknown');
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Authentication API', () => {
    test('POST /api/auth/login with invalid credentials should return 401/400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'wrongpassword'
        });
      
      // Depending on implementation, it could be 401 for wrong creds or 400 for validation
      expect([401, 400]).toContain(response.statusCode);
    });

    test('POST /api/auth/login with missing fields should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin'
          // password missing
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    test('GET /api/vehicles should return 401 without token', async () => {
      const response = await request(app).get('/api/vehicles');
      expect(response.statusCode).toBe(401);
    });

    test('GET /api/locations/live should return 401 without token', async () => {
      const response = await request(app).get('/api/locations/live');
      expect(response.statusCode).toBe(401);
    });
  });
});
