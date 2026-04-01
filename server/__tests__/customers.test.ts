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
  getCustomers: jest.fn(),
  getCustomer: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
};

jest.mock('../storage', () => ({
  storage: mockStorage,
}));

import { registerRoutes } from '../routes';

// Helper to create authenticated session mock
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

describe('Customer Routes', () => {
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

  describe('GET /api/customers', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/customers');
      expect(response.status).toBe(401);
    });

    it('should return customers list for authenticated user', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomers.mockResolvedValueOnce([
        { id: 1, name: 'Cliente 1', phone: '11999999999', businessId: 1, vehicleCount: 2 },
        { id: 2, name: 'Cliente 2', phone: '11888888888', businessId: 1, vehicleCount: 1 },
      ]);

      const response = await request(app)
        .get('/api/customers')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Cliente 1');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return 404 for customer from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Outro',
        businessId: 999, // Different business
      });

      const response = await request(app)
        .get('/api/customers/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Customer not found');
    });

    it('should return customer for same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Test',
        phone: '11999999999',
        businessId: 1,
      });

      const response = await request(app)
        .get('/api/customers/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Cliente Test');
    });
  });

  describe('POST /api/customers', () => {
    it('should return 400 for invalid data', async () => {
      mockAuthenticatedSession();

      const response = await request(app)
        .post('/api/customers')
        .set('Cookie', 'sessionId=session-123')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should create customer with businessId from session', async () => {
      mockAuthenticatedSession();
      mockStorage.createCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Novo Cliente',
        phone: '11999999999',
        businessId: 1,
      });

      const response = await request(app)
        .post('/api/customers')
        .set('Cookie', 'sessionId=session-123')
        .send({
          name: 'Novo Cliente',
          phone: '11999999999',
          businessId: 999, // Should be ignored
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Novo Cliente');
      // Verify businessId comes from session, not request
      expect(mockStorage.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 1 })
      );
    });
  });

  describe('PATCH /api/customers/:id', () => {
    it('should return 404 for customer from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Outro',
        businessId: 999,
      });

      const response = await request(app)
        .patch('/api/customers/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
    });

    it('should update customer from same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Test',
        businessId: 1,
      });
      mockStorage.updateCustomer.mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Atualizado',
        businessId: 1,
      });

      const response = await request(app)
        .patch('/api/customers/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ name: 'Cliente Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Cliente Atualizado');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should return 404 for customer from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .delete('/api/customers/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
    });

    it('should delete customer from same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getCustomer.mockResolvedValueOnce({
        id: 1,
        businessId: 1,
      });
      mockStorage.deleteCustomer.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/customers/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(204);
    });
  });
});
