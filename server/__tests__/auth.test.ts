import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';

// Mock storage
const mockStorage = {
  getUserByEmail: jest.fn(),
  getUser: jest.fn(),
  getBusiness: jest.fn(),
  createSession: jest.fn(),
  getSession: jest.fn(),
  deleteSession: jest.fn(),
  updateUser: jest.fn(),
};

jest.mock('../storage', () => ({
  storage: mockStorage,
}));

// Import routes after mocking
import { registerRoutes } from '../routes';

describe('Auth Routes', () => {
  let app: express.Express;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    server = createServer(app);
    await registerRoutes(server, app);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent user', async () => {
      mockStorage.getUserByEmail.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou senha incorretos');
    });

    it('should return 401 for wrong password', async () => {
      mockStorage.getUserByEmail.mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        passwordHash: '$2a$10$invalidhashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        name: 'Test User',
        businessId: 1,
        role: 'user',
        businessRole: 'owner',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou senha incorretos');
    });

    it('should return 200 and set cookie for valid credentials', async () => {
      const validHash = bcrypt.hashSync('correctpassword', 10);

      mockStorage.getUserByEmail.mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        passwordHash: validHash,
        name: 'Test User',
        businessId: 1,
        role: 'user',
        businessRole: 'owner',
      });

      mockStorage.createSession.mockResolvedValueOnce({
        id: 'session-123',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      mockStorage.getBusiness.mockResolvedValueOnce({
        id: 1,
        name: 'Test Business',
        slug: 'test-business',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'correctpassword' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('business');
      expect(response.body.user.email).toBe('test@test.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session and return success', async () => {
      mockStorage.deleteSession.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without session cookie', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });

    it('should return 401 for expired session', async () => {
      mockStorage.getSession.mockResolvedValueOnce({
        id: 'session-123',
        userId: 1,
        expiresAt: new Date(Date.now() - 1000), // Expired
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Session expired');
    });

    it('should return user data for valid session', async () => {
      mockStorage.getSession.mockResolvedValueOnce({
        id: 'session-123',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      mockStorage.getUser.mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        businessId: 1,
        role: 'user',
        businessRole: 'owner',
      });

      mockStorage.getBusiness.mockResolvedValueOnce({
        id: 1,
        name: 'Test Business',
        slug: 'test-business',
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('business');
      expect(response.body.user.email).toBe('test@test.com');
    });
  });
});

