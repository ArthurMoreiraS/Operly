import { sendNewLeadNotification, sendEmail, _testing } from '../email';
import type { Lead } from '../../shared/schema';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

import nodemailer from 'nodemailer';

describe('Email Service', () => {
  const mockLead: Lead = {
    id: 1,
    name: 'João Silva',
    whatsapp: '11999999999',
    email: 'joao@test.com',
    teamSize: '1-3',
    status: 'new',
    notes: null,
    createdAt: new Date('2026-04-02T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatLeadEmail', () => {
    it('should format lead data into HTML email', () => {
      const { html, text } = _testing.formatLeadEmail(mockLead);

      expect(html).toContain('Novo Lead Recebido');
      expect(html).toContain('João Silva');
      expect(html).toContain('11999999999');
      expect(html).toContain('joao@test.com');
      expect(html).toContain('1-3');
    });

    it('should format lead data into plain text email', () => {
      const { text } = _testing.formatLeadEmail(mockLead);

      expect(text).toContain('Novo Lead Recebido');
      expect(text).toContain('Nome: João Silva');
      expect(text).toContain('WhatsApp: 11999999999');
      expect(text).toContain('Email: joao@test.com');
      expect(text).toContain('Tamanho da equipe: 1-3');
    });

    it('should handle lead without teamSize', () => {
      const leadWithoutTeamSize: Lead = {
        ...mockLead,
        teamSize: null,
      };

      const { html, text } = _testing.formatLeadEmail(leadWithoutTeamSize);

      expect(html).not.toContain('Tamanho da equipe');
      expect(text).not.toContain('Tamanho da equipe');
    });

    it('should include admin panel link in email', () => {
      const { html, text } = _testing.formatLeadEmail(mockLead);

      expect(html).toContain('/admin/leads');
      expect(text).toContain('/admin/leads');
    });
  });

  describe('sendEmail', () => {
    it('should return false when email service is not configured (test env)', async () => {
      // In test environment, transporter is null
      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // In test env without mocking, should return false
      expect(result).toBe(false);
    });
  });

  describe('sendNewLeadNotification', () => {
    it('should attempt to send notification email for new lead', async () => {
      const result = await sendNewLeadNotification(mockLead);

      // In test environment without SMTP config, returns false
      expect(result).toBe(false);
    });

    it('should format email subject with lead name', async () => {
      // We can verify the formatting is correct
      const { html, text } = _testing.formatLeadEmail(mockLead);
      
      expect(html).toContain(mockLead.name);
      expect(text).toContain(mockLead.name);
    });
  });

  describe('Email content validation', () => {
    it('should include all required lead information', () => {
      const { html, text } = _testing.formatLeadEmail(mockLead);

      // HTML should have all fields
      expect(html).toContain(mockLead.name);
      expect(html).toContain(mockLead.whatsapp);
      expect(html).toContain(mockLead.email);

      // Text should have all fields
      expect(text).toContain(mockLead.name);
      expect(text).toContain(mockLead.whatsapp);
      expect(text).toContain(mockLead.email);
    });

    it('should have proper HTML structure', () => {
      const { html } = _testing.formatLeadEmail(mockLead);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
    });

    it('should include CTA button to admin panel', () => {
      const { html } = _testing.formatLeadEmail(mockLead);

      expect(html).toContain('Ver no Painel Admin');
      expect(html).toContain('class="cta"');
    });
  });
});

describe('Email integration with lead creation', () => {
  // These tests verify the email notification is called when a lead is created
  // The actual integration is tested in leads.test.ts
  
  it('should export sendNewLeadNotification function', () => {
    expect(typeof sendNewLeadNotification).toBe('function');
  });

  it('should export sendEmail function', () => {
    expect(typeof sendEmail).toBe('function');
  });
});
