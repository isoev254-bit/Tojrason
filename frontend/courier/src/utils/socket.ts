// Tojrason/frontend/courier/src/utils/socket.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, WS_BASE_URL } from './constants';

// Намудҳои рӯйдодҳои сокет барои курйер
export interface NewOrderData {
  orderId: string;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  price: number;
  estimatedTime: number;
  packageType: string;
  weight: number;
  expiresAt: string;
}

export interface OrderUpdateData {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
  data?: Record<string, any>;
}

export interface OrderAcceptedData {
  orderId: string;
  courierId: string;
  acceptedAt: string;
}

export interface OrderCancelledData {
  orderId: string;
  reason: string;
  cancelledAt: string;
}

export interface EarningsUpdateData {
  today: number;
  week: number;
  month: number;
  lastDelivery?: {
    orderId: string;
    amount: number;
  };
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

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'new_order';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  timestamp: string;
}

// Намуди функсияҳои бозгашт (callback)
export type EventCallback<T = any> = (data: T) => void;

// Синфи идоракунандаи сокет барои курйер
class CourierSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private locationUpdateInterval: NodeJS.Timeout | null = null;

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
        auth: {
          token,
          role: 'courier',
        },
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
      
      // Пайваст шудан ба ҳуҷраи курйер
      this.socket?.emit(SOCKET_EVENTS.COURIER_JOIN);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionListeners(false);
      this.stopLocationUpdates();

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
    this.socket.on(SOCKET_EVENTS.NEW_ORDER, (data: NewOrderData) => {
      this.emitToListeners(SOCKET_EVENTS.NEW_ORDER, data);
    });

    this.socket.on(SOCKET_EVENTS.ORDER_ACCEPTED, (data: OrderAcceptedData) => {
      this.emitToListeners(SOCKET_EVENTS.ORDER_ACCEPTED, data);
    });

    this.socket.on(SOCKET_EVENTS.ORDER_CANCELLED, (data: OrderCancelledData) => {
      this.emitToListeners(SOCKET_EVENTS.ORDER_CANCELLED, data);
    });

    this.socket.on(SOCKET_EVENTS.ORDER_UPDATE, (data: OrderUpdateData) => {
      this.emitToListeners(SOCKET_EVENTS.ORDER_UPDATE, data);
    });

    this.socket.on(SOCKET_EVENTS.EARNINGS_UPDATE, (data: EarningsUpdateData) => {
      this.emitToListeners(SOCKET_EVENTS.EARNINGS_UPDATE, data);
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
    this.stopLocationUpdates();
    
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.COURIER_LEAVE);
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
   * Навсозии макони курйер
   * @param latitude - Арз
   * @param longitude - Тул
   * @param orderId - ID-и фармоиш (ихтиёрӣ)
   */
  updateLocation(latitude: number, longitude: number, orderId?: string): void {
    this.emit(SOCKET_EVENTS.COURIER_LOCATION_UPDATE, {
      latitude,
      longitude,
      orderId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Оғози навсозии даврагии макон
   * @param getLocation - Функсия барои гирифтани макони ҷорӣ
   * @param orderId - ID-и фармоиш (ихтиёрӣ)
   * @param interval - Фосилаи навсозӣ (миллисония)
   */
  startLocationUpdates(
    getLocation: () => { lat: number; lng: number } | null,
    orderId?: string,
    interval: number = 5000
  ): void {
    this.stopLocationUpdates();
    
    this.locationUpdateInterval = setInterval(() => {
      const location = getLocation();
      if (location) {
        this.updateLocation(location.lat, location.lng, orderId);
      }
    }, interval);
  }

  /**
   * Қатъ кардани навсозии даврагии макон
   */
  stopLocationUpdates(): void {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  /**
   * Тағйири статуси курйер
   * @param status - Статуси нав ('online' | 'offline' | 'break')
   */
  updateStatus(status: 'online' | 'offline' | 'break'): void {
    this.emit(SOCKET_EVENTS.COURIER_STATUS_UPDATE, {
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Қабули фармоиш
   * @param orderId - ID-и фармоиш
   */
  acceptOrder(orderId: string): void {
    this.emit('courier:accept_order', { orderId });
  }

  /**
   * Рад кардани фармоиш
   * @param orderId - ID-и фармоиш
   * @param reason - Сабаби радкунӣ
   */
  rejectOrder(orderId: string, reason?: string): void {
    this.emit('courier:reject_order', { orderId, reason });
  }

  /**
   * Навсозии статуси фармоиш
   * @param orderId - ID-и фармоиш
   * @param status - Статуси нав
   * @param note - Эзоҳ
   */
  updateOrderStatus(orderId: string, status: string, note?: string): void {
    this.emit('courier:update_order_status', {
      orderId,
      status,
      note,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Пайвастшавӣ ба ҳуҷраи фармоиш
   * @param orderId - ID-и фармоиш
   */
  joinOrderRoom(orderId: string): void {
    this.emit('order:join', { orderId });
  }

  /**
   * Баромад аз ҳуҷраи фармоиш
   * @param orderId - ID-и фармоиш
   */
  leaveOrderRoom(orderId: string): void {
    this.emit('order:leave', { orderId });
  }

  /**
   * Ирсоли паёми чат
   * @param orderId - ID-и фармоиш
   * @param message - Матни паём
   * @param attachments - Файлҳои замима
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
export const socketManager = new CourierSocketManager();

// Export кардани функсияҳои ёрирасон
export const connectSocket = (token: string) => socketManager.connect(token);
export const disconnectSocket = () => socketManager.disconnect();
export const isSocketConnected = () => socketManager.isConnected();
export const getSocketId = () => socketManager.getSocketId();

export const onNewOrder = (callback: EventCallback<NewOrderData>) => {
  socketManager.on(SOCKET_EVENTS.NEW_ORDER, callback);
  return () => socketManager.off(SOCKET_EVENTS.NEW_ORDER, callback);
};

export const onOrderUpdate = (callback: EventCallback<OrderUpdateData>) => {
  socketManager.on(SOCKET_EVENTS.ORDER_UPDATE, callback);
  return () => socketManager.off(SOCKET_EVENTS.ORDER_UPDATE, callback);
};

export const onOrderAccepted = (callback: EventCallback<OrderAcceptedData>) => {
  socketManager.on(SOCKET_EVENTS.ORDER_ACCEPTED, callback);
  return () => socketManager.off(SOCKET_EVENTS.ORDER_ACCEPTED, callback);
};

export const onOrderCancelled = (callback: EventCallback<OrderCancelledData>) => {
  socketManager.on(SOCKET_EVENTS.ORDER_CANCELLED, callback);
  return () => socketManager.off(SOCKET_EVENTS.ORDER_CANCELLED, callback);
};

export const onEarningsUpdate = (callback: EventCallback<EarningsUpdateData>) => {
  socketManager.on(SOCKET_EVENTS.EARNINGS_UPDATE, callback);
  return () => socketManager.off(SOCKET_EVENTS.EARNINGS_UPDATE, callback);
};

export const onNotification = (callback: EventCallback<NotificationData>) => {
  socketManager.on(SOCKET_EVENTS.NOTIFICATION, callback);
  return () => socketManager.off(SOCKET_EVENTS.NOTIFICATION, callback);
};

export const onChatMessage = (callback: EventCallback<ChatMessageData>) => {
  socketManager.on(SOCKET_EVENTS.CHAT_MESSAGE, callback);
  return () => socketManager.off(SOCKET_EVENTS.CHAT_MESSAGE, callback);
};

export const updateLocation = (lat: number, lng: number, orderId?: string) => 
  socketManager.updateLocation(lat, lng, orderId);

export const updateCourierStatus = (status: 'online' | 'offline' | 'break') => 
  socketManager.updateStatus(status);

export const acceptOrder = (orderId: string) => socketManager.acceptOrder(orderId);
export const rejectOrder = (orderId: string, reason?: string) => socketManager.rejectOrder(orderId, reason);
export const updateOrderStatus = (orderId: string, status: string, note?: string) => 
  socketManager.updateOrderStatus(orderId, status, note);

export default socketManager;
