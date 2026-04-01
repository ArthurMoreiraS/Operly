import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
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
  getServices: jest.fn(),
  getActiveServices: jest.fn(),
  getService: jest.fn(),
  createService: jest.fn(),
  updateService: jest.fn(),
  deleteService: jest.fn(),
};

jest.mock('../storage', () => ({
  storage: mockStorage,
}));

import { registerRoutes } from '../routes';

const mockAuthenticatedSession = () => {
  mockStorage.getSession.mockResolvedValue({
    id: 'session-123',
    userId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  mockStorage.getUser.mockResolvedValue({
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    businessId: 1,
    role: 'user',
    businessRole: 'owner',
    passwordHash: 'hash',
  });
  mockStorage.getBusiness.mockResolvedValue({
    id: 1,
    name: 'Test Business',
    slug: 'test-business',
  });
};

describe('Service Routes', () => {
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

  describe('GET /api/services', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/services');
      expect(response.status).toBe(401);
    });

    it('should return all services', async () => {
      mockAuthenticatedSession();
      mockStorage.getServices.mockResolvedValueOnce([
        { id: 1, name: 'Lavagem Simples', price: 5000, duration: 30, businessId: 1, isActive: true },
        { id: 2, name: 'Lavagem Completa', price: 8000, duration: 60, businessId: 1, isActive: false },
      ]);

      const response = await request(app)
        .get('/api/services')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return only active services when filter is applied', async () => {
      mockAuthenticatedSession();
      mockStorage.getActiveServices.mockResolvedValueOnce([
        { id: 1, name: 'Lavagem Simples', price: 5000, duration: 30, businessId: 1, isActive: true },
      ]);

      const response = await request(app)
        .get('/api/services?active=true')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(mockStorage.getActiveServices).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return 404 for service from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        name: 'Serviço Outro',
        businessId: 999,
      });

      const response = await request(app)
        .get('/api/services/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Service not found');
    });

    it('should return service for same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        name: 'Lavagem Premium',
        price: 15000,
        businessId: 1,
      });

      const response = await request(app)
        .get('/api/services/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Lavagem Premium');
    });
  });

  describe('POST /api/services', () => {
    it('should return 400 for invalid data', async () => {
      mockAuthenticatedSession();

      const response = await request(app)
        .post('/api/services')
        .set('Cookie', 'sessionId=session-123')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should create service with businessId from session', async () => {
      mockAuthenticatedSession();
      mockStorage.createService.mockResolvedValueOnce({
        id: 1,
        name: 'Polimento',
        category: 'estetica',
        price: '200.00',
        duration: 120,
        businessId: 1,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/services')
        .set('Cookie', 'sessionId=session-123')
        .send({
          name: 'Polimento',
          category: 'estetica',
          price: '200.00',
          duration: 120,
          businessId: 999, // Should be ignored
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Polimento');
      expect(mockStorage.createService).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 1 })
      );
    });
  });

  describe('PATCH /api/services/:id', () => {
    it('should return 404 for service from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .patch('/api/services/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ price: 25000 });

      expect(response.status).toBe(404);
    });

    it('should update service from same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        name: 'Lavagem',
        category: 'lavagem',
        price: '50.00',
        duration: 30,
        businessId: 1,
      });
      mockStorage.updateService.mockResolvedValueOnce({
        id: 1,
        name: 'Lavagem',
        category: 'lavagem',
        price: '60.00',
        duration: 30,
        businessId: 1,
      });

      const response = await request(app)
        .patch('/api/services/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ price: '60.00' });

      expect(response.status).toBe(200);
      expect(response.body.price).toBe('60.00');
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should return 404 for service from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .delete('/api/services/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
    });

    it('should delete service from same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        businessId: 1,
      });
      mockStorage.deleteService.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/services/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(204);
    });
  });
});
