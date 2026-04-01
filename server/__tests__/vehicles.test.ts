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
  getVehiclesByCustomer: jest.fn(),
  createVehicle: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
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

describe('Vehicle Routes', () => {
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

  describe('GET /api/customers/:customerId/vehicles', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/customers/1/vehicles');
      expect(response.status).toBe(401);
    });

    it('should return vehicles for customer', async () => {
      mockAuthenticatedSession();
      mockStorage.getVehiclesByCustomer.mockResolvedValueOnce([
        { id: 1, brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', customerId: 1 },
        { id: 2, brand: 'Honda', model: 'Civic', plate: 'XYZ5678', customerId: 1 },
      ]);

      const response = await request(app)
        .get('/api/customers/1/vehicles')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].brand).toBe('Toyota');
    });
  });

  describe('POST /api/vehicles', () => {
    it('should return 400 for invalid data', async () => {
      mockAuthenticatedSession();

      const response = await request(app)
        .post('/api/vehicles')
        .set('Cookie', 'sessionId=session-123')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should create vehicle', async () => {
      mockAuthenticatedSession();
      mockStorage.createVehicle.mockResolvedValueOnce({
        id: 1,
        brand: 'Volkswagen',
        model: 'Golf',
        plate: 'NEW1234',
        color: 'Prata',
        customerId: 1,
      });

      const response = await request(app)
        .post('/api/vehicles')
        .set('Cookie', 'sessionId=session-123')
        .send({
          brand: 'Volkswagen',
          model: 'Golf',
          plate: 'NEW1234',
          color: 'Prata',
          customerId: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.brand).toBe('Volkswagen');
      expect(response.body.model).toBe('Golf');
    });
  });

  describe('PATCH /api/vehicles/:id', () => {
    it('should return 404 for non-existent vehicle', async () => {
      mockAuthenticatedSession();
      mockStorage.updateVehicle.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/vehicles/999')
        .set('Cookie', 'sessionId=session-123')
        .send({ color: 'Azul' });

      expect(response.status).toBe(404);
    });

    it('should update vehicle', async () => {
      mockAuthenticatedSession();
      mockStorage.updateVehicle.mockResolvedValueOnce({
        id: 1,
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'ABC1234',
        color: 'Azul',
        customerId: 1,
      });

      const response = await request(app)
        .patch('/api/vehicles/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ color: 'Azul' });

      expect(response.status).toBe(200);
      expect(response.body.color).toBe('Azul');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete vehicle', async () => {
      mockAuthenticatedSession();
      mockStorage.deleteVehicle.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/vehicles/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(204);
      expect(mockStorage.deleteVehicle).toHaveBeenCalledWith(1);
    });
  });
});
