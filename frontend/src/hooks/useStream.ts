import { useState, useEffect, useCallback, useRef } from 'react';
import { getStreamUrl } from '../services/api';

export interface StreamEvent {
  event: string;
  data: any;
  timestamp: string;
}

export const useStream = (taskExecutionId: string | null) => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!taskExecutionId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const streamUrl = getStreamUrl(taskExecutionId);
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [...prev, data]);

        // Close connection on complete or error
        if (data.event === 'complete' || data.event === 'error') {
          eventSource.close();
          setIsConnected(false);
        }
      } catch (err) {
        console.error('Error parsing stream event:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection error');
      setIsConnected(false);
      eventSource.close();
    };

    eventSourceRef.current = eventSource;
  }, [taskExecutionId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setEvents([]);
    setError(null);
  }, [disconnect]);

  useEffect(() => {
    if (taskExecutionId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskExecutionId]);

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    reset,
  };
};
