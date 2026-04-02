import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { Lead } from '../shared/schema';

// Store connected admin clients
const adminClients = new Set<WebSocket>();

// Initialize WebSocket server
export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('[WebSocket] New connection');
    
    // Add client to admin set (in production, you'd verify auth here)
    adminClients.add(ws);

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      adminClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      adminClients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Operly notifications' }));
  });

  console.log('[WebSocket] Server initialized on /ws');
  return wss;
}

// Broadcast new lead notification to all connected admin clients
export function notifyNewLead(lead: Lead): void {
  const message = JSON.stringify({
    type: 'new_lead',
    data: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      whatsapp: lead.whatsapp,
      teamSize: lead.teamSize,
      createdAt: lead.createdAt,
    },
    message: `Novo lead: ${lead.name}`,
  });

  let sentCount = 0;
  adminClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });

  if (sentCount > 0) {
    console.log(`[WebSocket] Notified ${sentCount} admin client(s) about new lead: ${lead.name}`);
  }
}

// Get connected clients count (for debugging/monitoring)
export function getConnectedClientsCount(): number {
  return adminClients.size;
}
