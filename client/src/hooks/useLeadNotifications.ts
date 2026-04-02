import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface LeadNotification {
  type: 'new_lead';
  data: {
    id: number;
    name: string;
    email: string;
    whatsapp: string;
    teamSize: string | null;
    createdAt: string;
  };
  message: string;
}

interface WebSocketMessage {
  type: string;
  message?: string;
  data?: any;
}

export function useLeadNotifications() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Don't connect in non-browser environments
    if (typeof window === 'undefined') return;

    // Clean up existing connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected to notifications');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'new_lead') {
            const notification = message as LeadNotification;
            
            // Show toast notification
            toast.success(`🎉 Novo Lead: ${notification.data.name}`, {
              description: `${notification.data.email} • ${notification.data.whatsapp}`,
              duration: 8000,
              action: {
                label: 'Ver leads',
                onClick: () => {
                  window.location.href = '/admin/leads';
                },
              },
            });

            // Invalidate leads query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected, reconnecting in 5s...');
        wsRef.current = null;
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
    }
  }, [queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
