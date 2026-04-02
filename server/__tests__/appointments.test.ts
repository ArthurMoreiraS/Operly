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
  getAppointments: jest.fn(),
  getAppointment: jest.fn(),
  createAppointment: jest.fn(),
  updateAppointment: jest.fn(),
  deleteAppointment: jest.fn(),
  getServiceOrderByAppointmentId: jest.fn(),
  getService: jest.fn(),
  createServiceOrder: jest.fn(),
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

describe('Appointment Routes', () => {
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

  describe('GET /api/appointments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/appointments');
      expect(response.status).toBe(401);
    });

    it('should return appointments list', async () => {
      mockAuthenticatedSession();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      mockStorage.getAppointments.mockResolvedValueOnce([
        { id: 1, customerId: 1, vehicleId: 1, serviceId: 1, scheduledAt: tomorrow, status: 'pending', businessId: 1 },
        { id: 2, customerId: 2, vehicleId: 2, serviceId: 2, scheduledAt: tomorrow, status: 'confirmed', businessId: 1 },
      ]);

      const response = await request(app)
        .get('/api/appointments')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should filter appointments by date', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointments.mockResolvedValueOnce([
        { id: 1, scheduledAt: new Date('2024-12-25'), status: 'pending', businessId: 1 },
      ]);

      const response = await request(app)
        .get('/api/appointments?date=2024-12-25')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(mockStorage.getAppointments).toHaveBeenCalledWith(1, expect.any(Date), undefined);
    });

    it('should filter appointments by status', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointments.mockResolvedValueOnce([
        { id: 1, status: 'pending', businessId: 1 },
        { id: 2, status: 'pending', businessId: 1 },
      ]);

      const response = await request(app)
        .get('/api/appointments?status=pending')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(mockStorage.getAppointments).toHaveBeenCalledWith(1, undefined, 'pending');
      expect(response.body).toHaveLength(2);
      expect(response.body.every((a: any) => a.status === 'pending')).toBe(true);
    });

    it('should filter appointments by date and status combined', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointments.mockResolvedValueOnce([
        { id: 1, scheduledAt: new Date('2024-12-25'), status: 'pending', businessId: 1 },
      ]);

      const response = await request(app)
        .get('/api/appointments?date=2024-12-25&status=pending')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(mockStorage.getAppointments).toHaveBeenCalledWith(1, expect.any(Date), 'pending');
    });

    it('should return empty array for status with no appointments', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointments.mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/appointments?status=completed')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return 404 for appointment from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .get('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Appointment not found');
    });

    it('should return appointment for same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        customerId: 1,
        vehicleId: 1,
        serviceId: 1,
        status: 'pending',
        businessId: 1,
      });

      const response = await request(app)
        .get('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });
  });

  describe('POST /api/appointments', () => {
    it('should return 400 for invalid data', async () => {
      mockAuthenticatedSession();

      const response = await request(app)
        .post('/api/appointments')
        .set('Cookie', 'sessionId=session-123')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should validate required fields for appointment creation', async () => {
      mockAuthenticatedSession();

      // Test that missing fields return 400
      const response = await request(app)
        .post('/api/appointments')
        .set('Cookie', 'sessionId=session-123')
        .send({
          customerId: 1,
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/appointments/:id', () => {
    it('should return 404 for appointment from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .patch('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
    });

    it('should update appointment status', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        status: 'pending',
        businessId: 1,
      });
      mockStorage.updateAppointment.mockResolvedValueOnce({
        id: 1,
        status: 'confirmed',
        businessId: 1,
      });

      const response = await request(app)
        .patch('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('confirmed');
    });

    it('should auto-create service order when status changes to completed', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        customerId: 1,
        vehicleId: 1,
        serviceId: 1,
        status: 'confirmed',
        businessId: 1,
      });
      mockStorage.updateAppointment.mockResolvedValueOnce({
        id: 1,
        status: 'completed',
        businessId: 1,
      });
      mockStorage.getServiceOrderByAppointmentId.mockResolvedValueOnce(null);
      mockStorage.getService.mockResolvedValueOnce({
        id: 1,
        name: 'Lavagem',
        price: '50.00',
      });
      mockStorage.createServiceOrder.mockResolvedValueOnce({
        id: 1,
        appointmentId: 1,
        amount: '50.00',
      });

      const response = await request(app)
        .patch('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(mockStorage.createServiceOrder).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should return 404 for appointment from different business', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        businessId: 999,
      });

      const response = await request(app)
        .delete('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
    });

    it('should delete appointment from same business', async () => {
      mockAuthenticatedSession();
      mockStorage.getAppointment.mockResolvedValueOnce({
        id: 1,
        businessId: 1,
      });
      mockStorage.deleteAppointment.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/appointments/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(204);
    });
  });
});
