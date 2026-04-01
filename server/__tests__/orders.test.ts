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
  getServiceOrders: jest.fn(),
  getServiceOrder: jest.fn(),
  createServiceOrder: jest.fn(),
  updateServiceOrder: jest.fn(),
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

describe('Service Order Routes', () => {
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

  describe('GET /api/service-orders', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/service-orders');
      expect(response.status).toBe(401);
    });

    it('should return service orders list', async () => {
      mockAuthenticatedSession();
      mockStorage.getServiceOrders.mockResolvedValueOnce([
        { id: 1, customerId: 1, vehicleId: 1, serviceId: 1, amount: '50.00', paymentStatus: 'paid', businessId: 1 },
        { id: 2, customerId: 2, vehicleId: 2, serviceId: 2, amount: '100.00', paymentStatus: 'pending', businessId: 1 },
      ]);

      const response = await request(app)
        .get('/api/service-orders')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/service-orders', () => {
    it('should return 400 for invalid data', async () => {
      mockAuthenticatedSession();

      const response = await request(app)
        .post('/api/service-orders')
        .set('Cookie', 'sessionId=session-123')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should create service order with businessId from session', async () => {
      mockAuthenticatedSession();
      mockStorage.createServiceOrder.mockResolvedValueOnce({
        id: 1,
        customerId: 1,
        vehicleId: 1,
        serviceId: 1,
        amount: '75.00',
        paymentStatus: 'paid',
        paymentMethod: 'pix',
        businessId: 1,
      });

      const response = await request(app)
        .post('/api/service-orders')
        .set('Cookie', 'sessionId=session-123')
        .send({
          customerId: 1,
          vehicleId: 1,
          serviceId: 1,
          amount: '75.00',
          paymentStatus: 'paid',
          paymentMethod: 'pix',
          businessId: 999, // Should be ignored
        });

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe('75.00');
      expect(mockStorage.createServiceOrder).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 1 })
      );
    });
  });

  describe('PATCH /api/service-orders/:id', () => {
    it('should return 404 for order from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getServiceOrder.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .patch('/api/service-orders/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ paymentStatus: 'paid' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Service order not found');
    });

    it('should update service order payment status', async () => {
      mockAuthenticatedSession();
      mockStorage.getServiceOrder.mockResolvedValueOnce({
        id: 1,
        customerId: 1,
        amount: '50.00',
        paymentStatus: 'pending',
        businessId: 1,
      });
      mockStorage.updateServiceOrder.mockResolvedValueOnce({
        id: 1,
        customerId: 1,
        amount: '50.00',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        businessId: 1,
      });

      const response = await request(app)
        .patch('/api/service-orders/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ paymentStatus: 'paid', paymentMethod: 'cash' });

      expect(response.status).toBe(200);
      expect(response.body.paymentStatus).toBe('paid');
    });
  });
});
