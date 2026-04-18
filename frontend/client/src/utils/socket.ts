// Tojrason/frontend/client/src/utils/socket.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, WS_BASE_URL } from './constants';

// Намудҳои рӯйдодҳои сокет
export interface OrderUpdateData {
  orderId: string;
  status: string;
  message?: string;
  timestamp: string;
  data?: Record<string, any>;
}

export interface CourierLocationData {
  courierId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
  };
  timestamp: string;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface ChatMessageData {
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
    size?: number;
  }>;
}

// Намуди функсияҳои бозгашт (callback)
export type EventCallback<T = any> = (data: T) => void;

// Синфи идоракунандаи сокет
class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  /**
   * Пайваст шудан ба сервери сокет
   * @param token - Токени дастрасӣ барои аутентификатсия
   * @returns Socket ё null дар ҳолати хатогӣ
   */
  connect(token: string): Socket | null {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    if (!token) {
      console.error('Cannot connect socket: No token provided');
      return null;
    }

    try {
      this.socket = io(WS_BASE_URL, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
      });

      this.setupListeners();
      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  /**
   * Танзими рӯйдодҳои асосии сокет
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionListeners(false);

      if (reason === 'io server disconnect') {
        setTimeout(() => this.socket?.connect(), 5000);
      }
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.notifyConnectionListeners(false);
    });

    // Рӯйдодҳои фармоишӣ
    this.socket.on(SOCKET_EVENTS.ORDER_UPDATE, (data: OrderUpdateData) => {
      this.emitToListeners(SOCKET_EVENTS.ORDER_UPDATE, data);
    });

    this.socket.on(SOCKET_EVENTS.COURIER_LOCATION, (data: CourierLocationData) => {
      this.emitToListeners(SOCKET_EVENTS.COURIER_LOCATION, data);
    });

    this.socket.on(SOCKET_EVENTS.NOTIFICATION, (data: NotificationData) => {
      this.emitToListeners(SOCKET_EVENTS.NOTIFICATION, data);
    });

    this.socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (data: ChatMessageData) => {
      this.emitToListeners(SOCKET_EVENTS.CHAT_MESSAGE, data);
    });
  }

  /**
   * Қатъ кардани пайвасти сокет
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connectionListeners.clear();
    }
  }

  /**
   * Санҷиши пайваст будани сокет
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Гирифтани ID-и сокет
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Обшавӣ ба рӯйдод
   * @param event - Номи рӯйдод
   * @param callback - Функсияи бозгашт
   */
  on<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  /**
   * Қатъ кардани обшавӣ ба рӯйдод
   * @param event - Номи рӯйдод
   * @param callback - Функсияи бозгашт
   */
  off<T = any>(event: string, callback: EventCallback<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback as EventCallback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Қатъ кардани ҳамаи обшавиҳо ба рӯйдоди мушаххас
   * @param event - Номи рӯйдод
   */
  offAll(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Ирсоли рӯйдод ба сервер
   * @param event - Номи рӯйдод
   * @param data - Маълумот барои ирсол
   */
  emit(event: string, data?: any): void {
    if (this.isConnected()) {
      this.socket!.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`);
    }
  }

  /**
   * Пахш кардани рӯйдод ба ҳамаи обшавандагон
   * @param event - Номи рӯйдод
   * @param data - Маълумоти рӯйдод
   */
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

  /**
   * Обшавӣ ба тағйири ҳолати пайваст
   * @param callback - Функсияи бозгашт
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionListeners.add(callback);
  }

  /**
   * Қатъ кардани обшавӣ ба тағйири ҳолати пайваст
   * @param callback - Функсияи бозгашт
   */
  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionListeners.delete(callback);
  }

  /**
   * Огоҳ кардани обшавандагони ҳолати пайваст
   * @param connected - Ҳолати пайваст
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Пайваст шудан ба ҳуҷраи фармоиш
   * @param orderId - ID-и фармоиш
   */
  joinOrderRoom(orderId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_ORDER_ROOM, { orderId });
  }

  /**
   * Баромад аз ҳуҷраи фармоиш
   * @param orderId - ID-и фармоиш
   */
  leaveOrderRoom(orderId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_ORDER_ROOM, { orderId });
  }

  /**
   * Оғози пайгирии курйер
   * @param orderId - ID-и фармоиш
   */
  trackCourier(orderId: string): void {
    this.emit(SOCKET_EVENTS.TRACK_COURIER, { orderId });
  }

  /**
   * Қатъ кардани пайгирии курйер
   * @param orderId - ID-и фармоиш
   */
  untrackCourier(orderId: string): void {
    this.emit(SOCKET_EVENTS.UNTRACK_COURIER, { orderId });
  }

  /**
   * Ирсоли паёми чат
   * @param orderId - ID-и фармоиш
   * @param message - Матни паём
   * @param attachments - Файлҳои замима (ихтиёрӣ)
   */
  sendChatMessage(orderId: string, message: string, attachments?: any[]): void {
    this.emit('chat:send', { orderId, message, attachments });
  }

  /**
   * Хонда шудани огоҳӣ
   * @param notificationId - ID-и огоҳӣ
   */
  markNotificationAsRead(notificationId: string): void {
    this.emit('notification:read', { notificationId });
  }

  /**
   * Хонда шудани ҳамаи огоҳиҳо
   */
  markAllNotificationsAsRead(): void {
    this.emit('notification:read-all');
  }
}

// Экземпляри ягонаи сокет
export const socketManager = new SocketManager();

// Export кардани функсияҳои ёрирасон
export const connectSocket = (token: string) => socketManager.connect(token);
export const disconnectSocket = () => socketManager.disconnect();
export const isSocketConnected = () => socketManager.isConnected();
export const getSocketId = () => socketManager.getSocketId();

export const onOrderUpdate = (callback: EventCallback<OrderUpdateData>) => {
  socketManager.on(SOCKET_EVENTS.ORDER_UPDATE, callback);
  return () => socketManager.off(SOCKET_EVENTS.ORDER_UPDATE, callback);
};

export const onCourierLocation = (callback: EventCallback<CourierLocationData>) => {
  socketManager.on(SOCKET_EVENTS.COURIER_LOCATION, callback);
  return () => socketManager.off(SOCKET_EVENTS.COURIER_LOCATION, callback);
};

export const onNotification = (callback: EventCallback<NotificationData>) => {
  socketManager.on(SOCKET_EVENTS.NOTIFICATION, callback);
  return () => socketManager.off(SOCKET_EVENTS.NOTIFICATION, callback);
};

export const onChatMessage = (callback: EventCallback<ChatMessageData>) => {
  socketManager.on(SOCKET_EVENTS.CHAT_MESSAGE, callback);
  return () => socketManager.off(SOCKET_EVENTS.CHAT_MESSAGE, callback);
};

export const joinOrderRoom = (orderId: string) => socketManager.joinOrderRoom(orderId);
export const leaveOrderRoom = (orderId: string) => socketManager.leaveOrderRoom(orderId);
export const trackCourier = (orderId: string) => socketManager.trackCourier(orderId);
export const untrackCourier = (orderId: string) => socketManager.untrackCourier(orderId);
export const sendChatMessage = (orderId: string, message: string, attachments?: any[]) => 
  socketManager.sendChatMessage(orderId, message, attachments);

export default socketManager;
