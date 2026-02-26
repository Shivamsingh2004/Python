const request = require('supertest');

process.env.JWT_SECRET = 'test_jwt_secret_for_testing';

const { app } = require('../src/index');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if credentials are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
