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
  getLeads: jest.fn(),
  createLead: jest.fn(),
  updateLead: jest.fn(),
  deleteLead: jest.fn(),
  getArchivedLeads: jest.fn(),
};

jest.mock('../storage', () => ({
  storage: mockStorage,
}));

// Mock email service
const mockSendNewLeadNotification = jest.fn().mockResolvedValue(true);
jest.mock('../email', () => ({
  sendNewLeadNotification: mockSendNewLeadNotification,
}));

// Mock websocket service
const mockNotifyNewLead = jest.fn();
jest.mock('../websocket', () => ({
  notifyNewLead: mockNotifyNewLead,
}));

import { registerRoutes } from '../routes';

// Helper to create admin session mock
const mockAdminSession = () => {
  mockStorage.getSession.mockResolvedValue({
    id: 'session-123',
    userId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  mockStorage.getUser.mockResolvedValue({
    id: 1,
    email: 'admin@test.com',
    name: 'Admin User',
    businessId: 1,
    role: 'admin',
    businessRole: 'owner',
    passwordHash: 'hash',
  });
  mockStorage.getBusiness.mockResolvedValue({
    id: 1,
    name: 'Test Business',
    slug: 'test-business',
  });
};

// Helper to create regular user session mock
const mockUserSession = () => {
  mockStorage.getSession.mockResolvedValue({
    id: 'session-123',
    userId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  mockStorage.getUser.mockResolvedValue({
    id: 1,
    email: 'user@test.com',
    name: 'Regular User',
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

describe('Lead Routes', () => {
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

  describe('POST /api/leads (public)', () => {
    it('should create a new lead', async () => {
      mockStorage.createLead.mockResolvedValueOnce({
        id: 1,
        name: 'João Silva',
        whatsapp: '11999999999',
        email: 'joao@test.com',
        teamSize: '1-3',
        status: 'new',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'João Silva',
          whatsapp: '11999999999',
          email: 'joao@test.com',
          teamSize: '1-3',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('João Silva');
      expect(response.body.status).toBe('new');
    });

    it('should send email notification when lead is created', async () => {
      const createdLead = {
        id: 1,
        name: 'Maria Santos',
        whatsapp: '11888888888',
        email: 'maria@test.com',
        teamSize: '4-10',
        status: 'new',
        createdAt: new Date(),
      };
      mockStorage.createLead.mockResolvedValueOnce(createdLead);

      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'Maria Santos',
          whatsapp: '11888888888',
          email: 'maria@test.com',
          teamSize: '4-10',
        });

      expect(response.status).toBe(201);
      expect(mockSendNewLeadNotification).toHaveBeenCalledTimes(1);
      expect(mockSendNewLeadNotification).toHaveBeenCalledWith(createdLead);
    });

    it('should still create lead even if email notification fails', async () => {
      const createdLead = {
        id: 2,
        name: 'Carlos Oliveira',
        whatsapp: '11777777777',
        email: 'carlos@test.com',
        teamSize: '1-3',
        status: 'new',
        createdAt: new Date(),
      };
      mockStorage.createLead.mockResolvedValueOnce(createdLead);
      mockSendNewLeadNotification.mockRejectedValueOnce(new Error('Email service unavailable'));

      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'Carlos Oliveira',
          whatsapp: '11777777777',
          email: 'carlos@test.com',
          teamSize: '1-3',
        });

      // Lead should still be created successfully
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Carlos Oliveira');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/leads (admin only)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/leads');
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin user', async () => {
      mockUserSession();

      const response = await request(app)
        .get('/api/leads')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(403);
    });

    it('should return leads list for admin user', async () => {
      mockAdminSession();
      mockStorage.getLeads.mockResolvedValueOnce([
        { id: 1, name: 'Lead 1', whatsapp: '11999999999', email: 'lead1@test.com', status: 'new' },
        { id: 2, name: 'Lead 2', whatsapp: '11888888888', email: 'lead2@test.com', status: 'contacted' },
      ]);

      const response = await request(app)
        .get('/api/leads')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Lead 1');
    });
  });

  describe('PATCH /api/leads/:id (admin only)', () => {
    it('should return 403 for non-admin user', async () => {
      mockUserSession();

      const response = await request(app)
        .patch('/api/leads/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'contacted' });

      expect(response.status).toBe(403);
    });

    it('should update lead status', async () => {
      mockAdminSession();
      mockStorage.updateLead.mockResolvedValueOnce({
        id: 1,
        name: 'Lead 1',
        status: 'contacted',
      });

      const response = await request(app)
        .patch('/api/leads/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'contacted' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('contacted');
    });

    it('should archive a lost lead', async () => {
      mockAdminSession();
      mockStorage.updateLead.mockResolvedValueOnce({
        id: 1,
        name: 'Lead 1',
        status: 'archived',
      });

      const response = await request(app)
        .patch('/api/leads/1')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'archived' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('archived');
    });

    it('should return 404 for non-existent lead', async () => {
      mockAdminSession();
      mockStorage.updateLead.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .patch('/api/leads/999')
        .set('Cookie', 'sessionId=session-123')
        .send({ status: 'contacted' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/leads/archived (admin only)', () => {
    it('should return 403 for non-admin user', async () => {
      mockUserSession();

      const response = await request(app)
        .get('/api/leads/archived')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(403);
    });

    it('should return only archived leads', async () => {
      mockAdminSession();
      mockStorage.getArchivedLeads.mockResolvedValueOnce([
        { id: 1, name: 'Archived Lead 1', status: 'archived' },
        { id: 2, name: 'Archived Lead 2', status: 'archived' },
      ]);

      const response = await request(app)
        .get('/api/leads/archived')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].status).toBe('archived');
    });
  });

  describe('DELETE /api/leads/:id (admin only)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).delete('/api/leads/1');
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin user', async () => {
      mockUserSession();

      const response = await request(app)
        .delete('/api/leads/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(403);
    });

    it('should delete an archived lead', async () => {
      mockAdminSession();
      mockStorage.deleteLead.mockResolvedValueOnce({ id: 1, status: 'archived' });

      const response = await request(app)
        .delete('/api/leads/1')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent lead', async () => {
      mockAdminSession();
      mockStorage.deleteLead.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/leads/999')
        .set('Cookie', 'sessionId=session-123');

      expect(response.status).toBe(404);
    });
  });
});
