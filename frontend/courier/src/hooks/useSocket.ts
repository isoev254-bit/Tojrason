// Tojrason/frontend/courier/src/hooks/useSocket.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../store/slices/authSlice';

// Намудҳо барои рӯйдодҳои сокет
export interface NewOrderEvent {
  orderId: string;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  price: number;
  estimatedTime: number;
  packageType: string;
  expiresAt: string;
}

export interface OrderUpdateEvent {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
  data?: any;
}

export interface OrderAcceptedEvent {
  orderId: string;
  courierId: string;
  acceptedAt: string;
}

export interface OrderCancelledEvent {
  orderId: string;
  reason: string;
  cancelledAt: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  timestamp: string;
}

export interface ChatMessageEvent {
  id: string;
  orderId: string;
  senderId: string;
  senderType: 'client' | 'courier' | 'system';
  message: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'new_order';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface EarningsUpdateEvent {
  today: number;
  week: number;
  month: number;
  lastDelivery?: {
    orderId: string;
    amount: number;
  };
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
  const [socketId, setSocketId] = useState<string | null>(null);

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
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const socket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: {
          token: accessToken,
          role: 'courier',
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

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        setSocketId(socket.id || null);
        
        // Пайваст шудан ба ҳуҷраи курйер
        socket.emit('courier:join');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        setSocketId(null);
        
        if (reason === 'io server disconnect') {
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
        socket.emit('courier:join');
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
      socketRef.current.emit('courier:leave');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setSocketId(null);
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

  // Обшавӣ ба фармоиши нав
  const onNewOrder = useCallback((callback: (data: NewOrderEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('courier:new_order', callback);
    
    return () => {
      socketRef.current?.off('courier:new_order', callback);
    };
  }, []);

  // Обшавӣ ба навсозии фармоиш
  const onOrderUpdate = useCallback((callback: (data: OrderUpdateEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('order:update', callback);
    
    return () => {
      socketRef.current?.off('order:update', callback);
    };
  }, []);

  // Обшавӣ ба қабули фармоиш (агар курйери дигар қабул карда бошад)
  const onOrderAccepted = useCallback((callback: (data: OrderAcceptedEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('courier:order_accepted', callback);
    
    return () => {
      socketRef.current?.off('courier:order_accepted', callback);
    };
  }, []);

  // Обшавӣ ба бекоршавии фармоиш
  const onOrderCancelled = useCallback((callback: (data: OrderCancelledEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('courier:order_cancelled', callback);
    
    return () => {
      socketRef.current?.off('courier:order_cancelled', callback);
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

  // Обшавӣ ба навсозии даромад
  const onEarningsUpdate = useCallback((callback: (data: EarningsUpdateEvent) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('courier:earnings_update', callback);
    
    return () => {
      socketRef.current?.off('courier:earnings_update', callback);
    };
  }, []);

  // Навсозии макони курйер
  const updateLocation = useCallback((latitude: number, longitude: number, orderId?: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot update location: Socket not connected');
      return;
    }
    
    socketRef.current.emit('courier:location_update', {
      latitude,
      longitude,
      orderId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Қабули фармоиш
  const acceptOrder = useCallback((orderId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot accept order: Socket not connected');
      return;
    }
    
    socketRef.current.emit('courier:accept_order', { orderId });
  }, []);

  // Рад кардани фармоиш
  const rejectOrder = useCallback((orderId: string, reason?: string) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('courier:reject_order', { orderId, reason });
  }, []);

  // Навсозии статуси фармоиш
  const updateOrderStatus = useCallback((orderId: string, status: string, note?: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot update order status: Socket not connected');
      return;
    }
    
    socketRef.current.emit('courier:update_order_status', {
      orderId,
      status,
      note,
      timestamp: new Date().toISOString(),
    });
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

  // Тағйири статуси онлайн/офлайн
  const setOnlineStatus = useCallback((isOnline: boolean) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot update online status: Socket not connected');
      return;
    }
    
    socketRef.current.emit('courier:status_update', {
      status: isOnline ? 'online' : 'offline',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Санҷиши пайваст
  const checkConnection = useCallback((): boolean => {
    return socketRef.current?.connected || false;
  }, []);

  return {
    // Ҳолат
    isConnected,
    isConnecting,
    connectionError,
    socketId,
    lastPing,
    
    // Функсияҳои асосӣ
    connect,
    disconnect,
    checkConnection,
    
    // Рӯйдодҳо
    onNewOrder,
    onOrderUpdate,
    onOrderAccepted,
    onOrderCancelled,
    onNotification,
    onChatMessage,
    onEarningsUpdate,
    
    // Амалҳои курйер
    updateLocation,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    setOnlineStatus,
    
    // Идоракунии ҳуҷраҳо
    joinOrderRoom,
    leaveOrderRoom,
    
    // Чат ва огоҳиҳо
    sendChatMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};

export default useSocket;
