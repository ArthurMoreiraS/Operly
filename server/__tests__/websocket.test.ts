import { notifyNewLead, getConnectedClientsCount } from '../websocket';
import type { Lead } from '../../shared/schema';

describe('WebSocket Service', () => {
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

  describe('notifyNewLead', () => {
    it('should not throw when no clients are connected', () => {
      expect(() => notifyNewLead(mockLead)).not.toThrow();
    });

    it('should return without error for valid lead data', () => {
      const result = notifyNewLead(mockLead);
      expect(result).toBeUndefined(); // void function
    });
  });

  describe('getConnectedClientsCount', () => {
    it('should return 0 when no clients are connected', () => {
      expect(getConnectedClientsCount()).toBe(0);
    });

    it('should return a number', () => {
      const count = getConnectedClientsCount();
      expect(typeof count).toBe('number');
    });
  });

  describe('Lead notification format', () => {
    it('should handle lead with all fields', () => {
      const fullLead: Lead = {
        id: 1,
        name: 'Maria Santos',
        whatsapp: '11888888888',
        email: 'maria@test.com',
        teamSize: '4-10',
        status: 'new',
        notes: 'Test notes',
        createdAt: new Date(),
      };

      expect(() => notifyNewLead(fullLead)).not.toThrow();
    });

    it('should handle lead with null teamSize', () => {
      const leadNoTeam: Lead = {
        ...mockLead,
        teamSize: null,
      };

      expect(() => notifyNewLead(leadNoTeam)).not.toThrow();
    });
  });
});
