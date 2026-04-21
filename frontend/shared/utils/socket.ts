// Tojrason/frontend/shared/utils/socket.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { io, Socket } from 'socket.io-client';

// ========== НАМУДҲОИ РӮЙДОДҲО ==========
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

export interface EarningsUpdateEvent {
  today: number;
  week: number;
  month: number;
  lastDelivery?: {
    orderId: string;
    amount: number;
  };
}

export type EventCallback<T = any> = (data: T) => void;

// ========== КОНФИГУРАТСИЯ ==========
export interface SocketConfig {
  url?: string;
  path?: string;
  role?: 'client' | 'courier' | 'admin';
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  token?: string;
}

// ========== СИНФИ ИДОРАКУНАНДАИ СОКЕТ ==========
export class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private config: SocketConfig = {};

  /**
   * Пайваст шудан ба сервер
   */
  connect(config?: SocketConfig): Socket | null {
    this.config = { ...this.config, ...config };
    const { url = 'ws://localhost:5000', path = '/socket.io', role = 'client', token } = this.config;

    if (!token) {
      console.error('Cannot connect socket: No token provided');
      return null;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    try {
      this.socket = io(url, {
        path,
        auth: { token, role },
        transports: ['websocket', 'polling'],
        autoConnect: config?.autoConnect ?? true,
        reconnection: true,
        reconnectionAttempts: config?.reconnectionAttempts ?? this.maxReconnectAttempts,
        reconnectionDelay: config?.reconnectionDelay ?? this.reconnectDelay,
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
   * Танзими рӯйдодҳои асосӣ
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
      
      // Пайваст шудан ба ҳуҷраи махсус вобаста ба нақш
      if (this.config.role === 'courier') {
        this.socket?.emit('courier:join');
      } else if (this.config.role === 'admin') {
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

    // Рӯйдодҳои умумӣ
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

    // Рӯйдодҳои махсус барои курйер
    this.socket.on('courier:new_order', (data: NewOrderEvent) => {
      this.emitToListeners('courier:new_order', data);
    });

    this.socket.on('courier:earnings_update', (data: EarningsUpdateEvent) => {
      this.emitToListeners('courier:earnings_update', data);
    });
  }

  /**
   * Қатъ кардани пайваст
   */
  disconnect(): void {
    if (this.socket) {
      if (this.config.role === 'courier') {
        this.socket.emit('courier:leave');
      } else if (this.config.role === 'admin') {
        this.socket.emit('admin:leave');
      }
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connectionListeners.clear();
    }
  }

  /**
   * Санҷиши пайваст будан
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
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
    
    // Баргардонидани функсия барои қатъ кардани обшавӣ
    return () => this.off(event, callback);
  }

  /**
   * Қатъ кардани обшавӣ ба рӯйдод
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
   * Қатъ кардани ҳамаи обшавиҳо ба рӯйдод
   */
  offAll(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Ирсоли рӯйдод ба сервер
   */
  emit(event: string, data?: any): void {
    if (this.isConnected()) {
      this.socket!.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`);
    }
  }

  /**
   * Пахш кардани рӯйдод ба обшавандагон
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
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.offConnectionChange(callback);
  }

  /**
   * Қатъ кардани обшавӣ ба тағйири ҳолати пайваст
   */
  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionListeners.delete(callback);
  }

  /**
   * Огоҳ кардани обшавандагони ҳолати пайваст
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

  // ========== УСУЛҲОИ МАХСУС ==========
  
  /**
   * Пайваст шудан ба ҳуҷраи фармоиш
   */
  joinOrderRoom(orderId: string): void {
    this.emit('order:join', { orderId });
  }

  /**
   * Баромад аз ҳуҷраи фармоиш
   */
  leaveOrderRoom(orderId: string): void {
    this.emit('order:leave', { orderId });
  }

  /**
   * Ирсоли паёми чат
   */
  sendChatMessage(orderId: string, message: string, attachments?: any[]): void {
    this.emit('chat:send', { orderId, message, attachments });
  }

  /**
   * Хонда шудани огоҳӣ
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

  /**
   * Навсозии макони курйер
   */
  updateCourierLocation(latitude: number, longitude: number, orderId?: string): void {
    this.emit('courier:location_update', {
      latitude,
      longitude,
      orderId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Тағйири статуси курйер
   */
  updateCourierStatus(status: 'online' | 'offline' | 'break'): void {
    this.emit('courier:status_update', {
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Қабули фармоиш (барои курйер)
   */
  acceptOrder(orderId: string): void {
    this.emit('courier:accept_order', { orderId });
  }

  /**
   * Рад кардани фармоиш (барои курйер)
   */
  rejectOrder(orderId: string, reason?: string): void {
    this.emit('courier:reject_order', { orderId, reason });
  }

  /**
   * Навсозии статуси фармоиш (барои курйер)
   */
  updateOrderStatus(orderId: string, status: string, note?: string): void {
    this.emit('courier:update_order_status', {
      orderId,
      status,
      note,
      timestamp: new Date().toISOString(),
    });
  }
}

// ========== ЭКЗЕМПЛЯРИ ЯГОНА ==========
export const socketManager = new SocketManager();

// ========== ФУНКСИЯҲОИ ЁРИРАСОН ==========
export const connectSocket = (config?: SocketConfig) => socketManager.connect(config);
export const disconnectSocket = () => socketManager.disconnect();
export const isSocketConnected = () => socketManager.isConnected();
export const getSocketId = () => socketManager.getSocketId();

export const onOrderUpdate = (callback: EventCallback<OrderUpdateEvent>) => 
  socketManager.on('order:update', callback);

export const onCourierLocation = (callback: EventCallback<CourierLocationEvent>) => 
  socketManager.on('courier:location', callback);

export const onNotification = (callback: EventCallback<NotificationEvent>) => 
  socketManager.on('notification', callback);

export const onChatMessage = (callback: EventCallback<ChatMessageEvent>) => 
  socketManager.on('chat:message', callback);

export const onNewOrder = (callback: EventCallback<NewOrderEvent>) => 
  socketManager.on('courier:new_order', callback);

export const onEarningsUpdate = (callback: EventCallback<EarningsUpdateEvent>) => 
  socketManager.on('courier:earnings_update', callback);

export default socketManager;
