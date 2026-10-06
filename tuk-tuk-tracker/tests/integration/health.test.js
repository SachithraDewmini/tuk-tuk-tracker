const request = require('supertest');
const app = require('../../app');

describe('Health Check API', () => {
  it('should return 200 OK for /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should redirect / to /api-docs', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/api-docs');
  });
});
