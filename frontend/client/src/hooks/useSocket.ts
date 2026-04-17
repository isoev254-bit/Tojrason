// Tojrason/frontend/client/src/hooks/useSocket.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../store/slices/authSlice';

// Намудҳо барои рӯйдодҳои сокет
export interface OrderUpdateEvent {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
  data?: any;
}

export interface CourierLocationEvent {
  courierId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  };
  timestamp: string;
}

export interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ChatMessageEvent {
  id: string;
  orderId: string;
  senderId: string;
  senderType: 'client' | 'courier';
  message: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

interface SocketConfig {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export const useSocket = (config?: SocketConfig) => {
  const accessToken = useSelector(selectAccessToken);
  const socketRef = useRef<Socket | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<number | null>(null);

  const SOCKET_URL = config?.url || import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  const SOCKET_PATH = config?.path || '/socket.io';

  // Пайвастшавӣ ба сокет
  const connect = useCallback(() => {
    if (!accessToken) {
      console.warn('Cannot connect socket: No access token');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Қатъ кардани пайвасти қаблӣ агар мавҷуд бошад
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Эҷоди пайвасти нав
      const socket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: {
          token: accessToken,
        },
        transports: ['websocket', 'polling'],
        autoConnect: config?.autoConnect ?? true,
        reconnection: true,
        reconnectionAttempts: config?.reconnectionAttempts ?? 5,
        reconnectionDelay: config?.reconnectionDelay ?? 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
      });

      // Рӯйдодҳои пайвастшавӣ
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        if (reason === 'io server disconnect') {
          // Сервер пайвастро қатъ кард, кӯшиши пайвастшавии дубора
          setTimeout(() => {
            socket.connect();
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message || 'Хатогӣ ҳангоми пайвастшавӣ');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(typeof error === 'string' ? error : 'Хатогии сокет');
      });

      socket.on('ping', () => {
        setLastPing(Date.now());
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Socket reconnection attempt:', attemptNumber);
        setIsConnecting(true);
      });

      socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
        setConnectionError('Хатогӣ ҳангоми пайвастшавии дубора');
      });

      socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError('Пайвастшавии дубора ноком шуд');
      });

      socketRef.current = socket;
    } catch (error: any) {
      console.error('Failed to create socket connection:', error);
      setIsConnecting(false);
      setConnectionError(error.message || 'Хатогӣ ҳангоми эҷоди пайваст');
    }
  }, [accessToken, SOCKET_URL, SOCKET_PATH, config]);

  // Қатъ кардани пайваст
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  // Пайвастшавии автоматикӣ ҳангоми тағйири токен
  useEffect(() => {
    if (accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [accessToken, connect, disconnect]);

  // Обшавӣ ба рӯйдодҳои фармоиш
  const onOrderUpdate = useCallback((callback: (data: OrderUpdateEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('order:update', callback);
    
    return () => {
      socketRef.current?.off('order:update', callback);
    };
  }, []);

  // Обшавӣ ба макони курйер
  const onCourierLocation = useCallback((callback: (data: CourierLocationEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('courier:location', callback);
    
    return () => {
      socketRef.current?.off('courier:location', callback);
    };
  }, []);

  // Обшавӣ ба огоҳиҳо
  const onNotification = useCallback((callback: (data: NotificationEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('notification', callback);
    
    return () => {
      socketRef.current?.off('notification', callback);
    };
  }, []);

  // Обшавӣ ба паёмҳои чат
  const onChatMessage = useCallback((callback: (data: ChatMessageEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('chat:message', callback);
    
    return () => {
      socketRef.current?.off('chat:message', callback);
    };
  }, []);

  // Пайвастшавӣ ба ҳуҷраи фармоиш
  const joinOrderRoom = useCallback((orderId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot join order room: Socket not connected');
      return;
    }
    
    socketRef.current.emit('order:join', { orderId });
  }, []);

  // Баромад аз ҳуҷраи фармоиш
  const leaveOrderRoom = useCallback((orderId: string) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('order:leave', { orderId });
  }, []);

  // Пайвастшавӣ ба ҳуҷраи пайгирии курйер
  const trackCourier = useCallback((orderId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot track courier: Socket not connected');
      return;
    }
    
    socketRef.current.emit('courier:track', { orderId });
  }, []);

  // Қатъ кардани пайгирии курйер
  const stopTrackingCourier = useCallback((orderId: string) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('courier:untrack', { orderId });
  }, []);

  // Ирсоли паём ба чат
  const sendChatMessage = useCallback((orderId: string, message: string, attachments?: any[]) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot send message: Socket not connected');
      return false;
    }
    
    socketRef.current.emit('chat:send', {
      orderId,
      message,
      attachments,
    });
    
    return true;
  }, []);

  // Хондани огоҳӣ
  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('notification:read', { notificationId });
  }, []);

  // Хондани ҳамаи огоҳиҳо
  const markAllNotificationsAsRead = useCallback(() => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('notification:read-all');
  }, []);

  // Санҷиши пайваст
  const checkConnection = useCallback((): boolean => {
    return socketRef.current?.connected || false;
  }, []);

  // Гирифтани ID-и сокет
  const getSocketId = useCallback((): string | null => {
    return socketRef.current?.id || null;
  }, []);

  return {
    // Ҳолат
    isConnected,
    isConnecting,
    connectionError,
    socketId: socketRef.current?.id || null,
    lastPing,
    
    // Функсияҳои асосӣ
    connect,
    disconnect,
    checkConnection,
    getSocketId,
    
    // Рӯйдодҳо
    onOrderUpdate,
    onCourierLocation,
    onNotification,
    onChatMessage,
    
    // Идоракунии ҳуҷраҳо
    joinOrderRoom,
    leaveOrderRoom,
    trackCourier,
    stopTrackingCourier,
    
    // Чат ва огоҳиҳо
    sendChatMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};

export default useSocket;
