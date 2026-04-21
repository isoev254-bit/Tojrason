// Tojrason/frontend/shared/hooks/useSocket.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Намудҳои умумии рӯйдодҳои сокет
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
  senderType: 'client' | 'courier' | 'admin' | 'system';
  message: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

// Намуди функсияҳои бозгашт (callback)
export type EventCallback<T = any> = (data: T) => void;

// Конфигуратсияи сокет
export interface SocketConfig {
  url?: string;
  path?: string;
  role?: 'client' | 'courier' | 'admin';
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

// Намуди баргаштандаи useSocket
export interface UseSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  socketId: string | null;
  lastPing: number | null;
  connect: () => void;
  disconnect: () => void;
  checkConnection: () => boolean;
  getSocketId: () => string | null;
  onOrderUpdate: (callback: EventCallback<OrderUpdateEvent>) => () => void;
  onCourierLocation: (callback: EventCallback<CourierLocationEvent>) => () => void;
  onNotification: (callback: EventCallback<NotificationEvent>) => () => void;
  onChatMessage: (callback: EventCallback<ChatMessageEvent>) => () => void;
  on: <T = any>(event: string, callback: EventCallback<T>) => () => void;
  emit: (event: string, data?: any) => void;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
  sendChatMessage: (orderId: string, message: string, attachments?: any[]) => boolean;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

// Синфи идоракунандаи сокет
class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  connect(token: string, config?: SocketConfig): Socket | null {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    if (!token) {
      console.error('Cannot connect socket: No token provided');
      return null;
    }

    try {
      const SOCKET_URL = config?.url || 'ws://localhost:5000';
      const SOCKET_PATH = config?.path || '/socket.io';

      this.socket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: {
          token,
          role: config?.role || 'client',
        },
        transports: ['websocket', 'polling'],
        autoConnect: config?.autoConnect ?? true,
        reconnection: true,
        reconnectionAttempts: config?.reconnectionAttempts ?? this.maxReconnectAttempts,
        reconnectionDelay: config?.reconnectionDelay ?? this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
      });

      this.setupListeners(config?.role);
      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  private setupListeners(role?: string): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
      
      if (role === 'courier') {
        this.socket?.emit('courier:join');
      } else if (role === 'admin') {
        this.socket?.emit('admin:join');
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionListeners(false);

      if (reason === 'io server disconnect') {
        setTimeout(() => this.socket?.connect(), 5000);
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.notifyConnectionListeners(false);
    });

    this.socket.on('order:update', (data: OrderUpdateEvent) => {
      this.emitToListeners('order:update', data);
    });

    this.socket.on('courier:location', (data: CourierLocationEvent) => {
      this.emitToListeners('courier:location', data);
    });

    this.socket.on('notification', (data: NotificationEvent) => {
      this.emitToListeners('notification', data);
    });

    this.socket.on('chat:message', (data: ChatMessageEvent) => {
      this.emitToListeners('chat:message', data);
    });

    this.socket.on('ping', () => {
      this.emitToListeners('ping', Date.now());
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connectionListeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  on<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback as EventCallback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.isConnected()) {
      this.socket!.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`);
    }
  }

  private emitToListeners<T>(event: string, data: T): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket listener for event "${event}":`, error);
        }
      });
    }
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionListeners.add(callback);
  }

  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionListeners.delete(callback);
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  joinOrderRoom(orderId: string): void {
    this.emit('order:join', { orderId });
  }

  leaveOrderRoom(orderId: string): void {
    this.emit('order:leave', { orderId });
  }

  sendChatMessage(orderId: string, message: string, attachments?: any[]): void {
    this.emit('chat:send', { orderId, message, attachments });
  }

  markNotificationAsRead(notificationId: string): void {
    this.emit('notification:read', { notificationId });
  }

  markAllNotificationsAsRead(): void {
    this.emit('notification:read-all');
  }
}

// Экземпляри ягонаи сокет
const socketManager = new SocketManager();

/**
 * Hook-и умумии сокет
 * @param accessToken - Токени дастрасӣ
 * @param config - Конфигуратсияи сокет
 */
export const useSocket = (
  accessToken: string | null,
  config?: SocketConfig
): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<number | null>(null);

  const connect = useCallback(() => {
    if (!accessToken) {
      console.warn('Cannot connect socket: No access token');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    socketManager.connect(accessToken, config);
  }, [accessToken, config]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setSocketId(null);
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setSocketId(socketManager.getSocketId());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setSocketId(null);
    };

    const handleError = (error: string) => {
      setConnectionError(error);
      setIsConnecting(false);
    };

    const handlePing = (timestamp: number) => {
      setLastPing(timestamp);
    };

    socketManager.onConnectionChange((connected) => {
      if (connected) {
        handleConnect();
      } else {
        handleDisconnect();
      }
    });

    socketManager.on('ping', handlePing);

    if (accessToken) {
      connect();
    }

    return () => {
      socketManager.offConnectionChange(handleConnect);
      socketManager.off('ping', handlePing);
      disconnect();
    };
  }, [accessToken, connect, disconnect]);

  const onOrderUpdate = useCallback((callback: EventCallback<OrderUpdateEvent>) => {
    socketManager.on('order:update', callback);
    return () => socketManager.off('order:update', callback);
  }, []);

  const onCourierLocation = useCallback((callback: EventCallback<CourierLocationEvent>) => {
    socketManager.on('courier:location', callback);
    return () => socketManager.off('courier:location', callback);
  }, []);

  const onNotification = useCallback((callback: EventCallback<NotificationEvent>) => {
    socketManager.on('notification', callback);
    return () => socketManager.off('notification', callback);
  }, []);

  const onChatMessage = useCallback((callback: EventCallback<ChatMessageEvent>) => {
    socketManager.on('chat:message', callback);
    return () => socketManager.off('chat:message', callback);
  }, []);

  const on = useCallback(<T = any>(event: string, callback: EventCallback<T>) => {
    socketManager.on(event, callback);
    return () => socketManager.off(event, callback);
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    socketId,
    lastPing,
    connect,
    disconnect,
    checkConnection: () => socketManager.isConnected(),
    getSocketId: () => socketManager.getSocketId(),
    onOrderUpdate,
    onCourierLocation,
    onNotification,
    onChatMessage,
    on,
    emit: (event: string, data?: any) => socketManager.emit(event, data),
    joinOrderRoom: (orderId: string) => socketManager.joinOrderRoom(orderId),
    leaveOrderRoom: (orderId: string) => socketManager.leaveOrderRoom(orderId),
    sendChatMessage: (orderId: string, message: string, attachments?: any[]) => {
      socketManager.sendChatMessage(orderId, message, attachments);
      return socketManager.isConnected();
    },
    markNotificationAsRead: (notificationId: string) => socketManager.markNotificationAsRead(notificationId),
    markAllNotificationsAsRead: () => socketManager.markAllNotificationsAsRead(),
  };
};

export default useSocket;
