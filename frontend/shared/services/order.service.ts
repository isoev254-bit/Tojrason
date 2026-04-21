// Tojrason/frontend/shared/services/order.service.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { ApiClient, PaginatedResponse, FilterParams } from './api/apiClient';

// Намудҳои фармоиш
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  weight?: number;
  price?: number;
}

export interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pickupAddress: string;
  pickupDetails?: string;
  pickupLocation?: Location;
  deliveryAddress: string;
  deliveryDetails?: string;
  deliveryLocation?: Location;
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  description?: string;
  isFragile: boolean;
  requiresSignature: boolean;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  courier?: any;
  timeline: any[];
  route?: Array<[number, number]>;
  rating?: number;
  review?: string;
}

export interface CreateOrderRequest {
  pickupAddress: string;
  pickupDetails?: string;
  deliveryAddress: string;
  deliveryDetails?: string;
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  description?: string;
  isFragile?: boolean;
  requiresSignature?: boolean;
  paymentMethod: string;
  promoCode?: string;
  savedCardId?: string;
}

export interface UpdateOrderRequest {
  pickupAddress?: string;
  pickupDetails?: string;
  deliveryAddress?: string;
  deliveryDetails?: string;
  recipientName?: string;
  recipientPhone?: string;
  packageType?: string;
  weight?: number;
  dimensions?: Dimensions;
  description?: string;
  isFragile?: boolean;
  requiresSignature?: boolean;
  paymentMethod?: string;
}

export interface OrderFilter extends FilterParams {
  status?: string;
  paymentStatus?: string;
  courierId?: string;
  clientId?: string;
}

export interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  pickupAddress: string;
  deliveryAddress: string;
  courier?: {
    id: string;
    name: string;
    phoneNumber: string;
    photo?: string;
    location?: Location & { updatedAt: string };
  };
  timeline: any[];
  route?: Array<[number, number]>;
}

export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageRating?: number;
}

export interface OrderEstimateRequest {
  pickupLocation: Location;
  deliveryLocation: Location;
  packageType: string;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  isFragile?: boolean;
  promoCode?: string;
}

export interface OrderEstimateResponse {
  price: number;
  distance: number;
  estimatedTime: number;
  currency: string;
  breakdown?: {
    basePrice: number;
    distanceFee: number;
    weightFee: number;
    fragileFee?: number;
    promoDiscount?: number;
  };
}

// Конфигуратсияи сервис
export interface OrderServiceConfig {
  apiClient: ApiClient;
  endpoints?: {
    orders?: string;
    orderById?: string;
    track?: string;
    estimate?: string;
    stats?: string;
    active?: string;
    completed?: string;
    cancelled?: string;
    cancel?: string;
    rate?: string;
    history?: string;
    location?: string;
    repeat?: string;
    draft?: string;
    cities?: string;
    checkAvailability?: string;
  };
}

// Интерфейси сервис
export interface IOrderService {
  createOrder(data: CreateOrderRequest): Promise<Order>;
  getOrders(filter?: OrderFilter): Promise<PaginatedResponse<Order>>;
  getOrderById(orderId: string): Promise<Order>;
  updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order>;
  cancelOrder(orderId: string, reason?: string): Promise<{ message: string }>;
  trackOrder(trackingNumber: string): Promise<OrderTracking>;
  getOrderLocation(orderId: string): Promise<Location>;
  getOrderHistory(orderId: string): Promise<any[]>;
  rateOrder(orderId: string, rating: number, comment?: string): Promise<{ message: string }>;
  getOrderStats(): Promise<OrderStats>;
  calculateEstimate(data: OrderEstimateRequest): Promise<OrderEstimateResponse>;
  getActiveOrders(): Promise<Order[]>;
  getCompletedOrders(): Promise<Order[]>;
  getCancelledOrders(): Promise<Order[]>;
  confirmDelivery(orderId: string): Promise<{ message: string }>;
  reportIssue(orderId: string, issueType: string, description: string): Promise<{ message: string; ticketId: string }>;
  getCourierInfo(orderId: string): Promise<any>;
  sendMessageToCourier(orderId: string, message: string): Promise<{ message: string }>;
  repeatOrder(orderId: string): Promise<Order>;
  saveOrderDraft(data: Partial<CreateOrderRequest>): Promise<{ draftId: string }>;
  getOrderDraft(draftId: string): Promise<Partial<CreateOrderRequest>>;
  deleteOrderDraft(draftId: string): Promise<void>;
  getAvailableCities(): Promise<Array<{ id: string; name: string; region: string }>>;
  checkDeliveryAvailability(address: string): Promise<{ available: boolean; estimatedTime?: number; minPrice?: number }>;
}

/**
 * Сервиси фармоишҳо
 */
export class OrderService implements IOrderService {
  private apiClient: ApiClient;
  private endpoints: Required<OrderServiceConfig['endpoints']>;

  constructor(config: OrderServiceConfig) {
    this.apiClient = config.apiClient;
    this.endpoints = {
      orders: '/orders',
      orderById: '/orders',
      track: '/orders/track',
      estimate: '/orders/estimate',
      stats: '/orders/stats',
      active: '/orders/active',
      completed: '/orders/completed',
      cancelled: '/orders/cancelled',
      cancel: '/cancel',
      rate: '/rate',
      history: '/history',
      location: '/location',
      repeat: '/repeat',
      draft: '/orders/draft',
      cities: '/orders/cities',
      checkAvailability: '/orders/check-availability',
      ...config.endpoints,
    };
  }

  /**
   * Эҷоди фармоиши нав
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.apiClient.post<Order>(this.endpoints.orders, data);
  }

  /**
   * Гирифтани рӯйхати фармоишҳо
   */
  async getOrders(filter?: OrderFilter): Promise<PaginatedResponse<Order>> {
    return this.apiClient.getPaginated<Order>(this.endpoints.orders, filter);
  }

  /**
   * Гирифтани фармоиш бо ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    return this.apiClient.get<Order>(`${this.endpoints.orderById}/${orderId}`);
  }

  /**
   * Навсозии фармоиш
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    return this.apiClient.put<Order>(`${this.endpoints.orderById}/${orderId}`, data);
  }

  /**
   * Бекор кардани фармоиш
   */
  async cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.endpoints.orderById}/${orderId}${this.endpoints.cancel}`, { reason });
  }

  /**
   * Пайгирии фармоиш
   */
  async trackOrder(trackingNumber: string): Promise<OrderTracking> {
    return this.apiClient.get<OrderTracking>(`${this.endpoints.track}/${trackingNumber}`);
  }

  /**
   * Гирифтани макони фармоиш
   */
  async getOrderLocation(orderId: string): Promise<Location> {
    return this.apiClient.get<Location>(`${this.endpoints.orderById}/${orderId}${this.endpoints.location}`);
  }

  /**
   * Гирифтани таърихи фармоиш
   */
  async getOrderHistory(orderId: string): Promise<any[]> {
    return this.apiClient.get<any[]>(`${this.endpoints.orderById}/${orderId}${this.endpoints.history}`);
  }

  /**
   * Баҳо додан ба фармоиш
   */
  async rateOrder(orderId: string, rating: number, comment?: string): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.endpoints.orderById}/${orderId}${this.endpoints.rate}`, { rating, comment });
  }

  /**
   * Гирифтани омори фармоишҳо
   */
  async getOrderStats(): Promise<OrderStats> {
    return this.apiClient.get<OrderStats>(this.endpoints.stats);
  }

  /**
   * Ҳисобкунии нархи тахминӣ
   */
  async calculateEstimate(data: OrderEstimateRequest): Promise<OrderEstimateResponse> {
    return this.apiClient.post<OrderEstimateResponse>(this.endpoints.estimate, data);
  }

  /**
   * Гирифтани фармоишҳои фаъол
   */
  async getActiveOrders(): Promise<Order[]> {
    return this.apiClient.get<Order[]>(this.endpoints.active);
  }

  /**
   * Гирифтани фармоишҳои анҷомёфта
   */
  async getCompletedOrders(): Promise<Order[]> {
    return this.apiClient.get<Order[]>(this.endpoints.completed);
  }

  /**
   * Гирифтани фармоишҳои бекоршуда
   */
  async getCancelledOrders(): Promise<Order[]> {
    return this.apiClient.get<Order[]>(this.endpoints.cancelled);
  }

  /**
   * Тасдиқи расонидани фармоиш
   */
  async confirmDelivery(orderId: string): Promise<{ message: string }> {
    return this.apiClient.post(`${this.endpoints.orderById}/${orderId}/confirm-delivery`);
  }

  /**
   * Гузориш додани мушкилот
   */
  async reportIssue(orderId: string, issueType: string, description: string): Promise<{ message: string; ticketId: string }> {
    return this.apiClient.post(`${this.endpoints.orderById}/${orderId}/report-issue`, { issueType, description });
  }

  /**
   * Гирифтани маълумоти курйер
   */
  async getCourierInfo(orderId: string): Promise<any> {
    return this.apiClient.get(`${this.endpoints.orderById}/${orderId}/courier`);
  }

  /**
   * Ирсоли паём ба курйер
   */
  async sendMessageToCourier(orderId: string, message: string): Promise<{ message: string }> {
    return this.apiClient.post(`${this.endpoints.orderById}/${orderId}/message`, { message });
  }

  /**
   * Такрори фармоиш
   */
  async repeatOrder(orderId: string): Promise<Order> {
    return this.apiClient.post<Order>(`${this.endpoints.orderById}/${orderId}${this.endpoints.repeat}`);
  }

  /**
   * Захира кардани фармоиш
   */
  async saveOrderDraft(data: Partial<CreateOrderRequest>): Promise<{ draftId: string }> {
    return this.apiClient.post(this.endpoints.draft, data);
  }

  /**
   * Гирифтани фармоиши захирашуда
   */
  async getOrderDraft(draftId: string): Promise<Partial<CreateOrderRequest>> {
    return this.apiClient.get(`${this.endpoints.draft}/${draftId}`);
  }

  /**
   * Нест кардани фармоиши захирашуда
   */
  async deleteOrderDraft(draftId: string): Promise<void> {
    await this.apiClient.delete(`${this.endpoints.draft}/${draftId}`);
  }

  /**
   * Гирифтани рӯйхати шаҳрҳои дастрас
   */
  async getAvailableCities(): Promise<Array<{ id: string; name: string; region: string }>> {
    return this.apiClient.get(this.endpoints.cities);
  }

  /**
   * Текшири имконияти расонидан
   */
  async checkDeliveryAvailability(address: string): Promise<{ available: boolean; estimatedTime?: number; minPrice?: number }> {
    return this.apiClient.post(this.endpoints.checkAvailability, { address });
  }
}

/**
 * Эҷоди сервиси фармоишҳо
 */
export const createOrderService = (config: OrderServiceConfig): IOrderService => {
  return new OrderService(config);
};

export default OrderService;
