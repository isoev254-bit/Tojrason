// Tojrason/frontend/client/src/api/orders.api.ts

import axiosInstance from './axios.config';
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  OrderStatus,
  OrderFilter,
  OrderTracking,
  OrderHistory,
  CancelOrderRequest,
  RateOrderRequest,
  OrderStats,
  DeliveryLocation,
  OrderItem
} from '../../types/order.types';

export const ordersApi = {
  /**
   * Эҷоди фармоиши нав
   * @param data - Маълумоти фармоиш
   * @returns Order - Фармоиши эҷодшуда
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await axiosInstance.post<Order>('/orders', data);
    return response.data;
  },

  /**
   * Гирифтани рӯйхати ҳамаи фармоишҳои корбар
   * @param filter - Филтр барои фармоишҳо
   * @returns Order[] - Рӯйхати фармоишҳо
   */
  async getOrders(filter?: OrderFilter): Promise<Order[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.fromDate) params.append('fromDate', filter.fromDate.toISOString());
      if (filter.toDate) params.append('toDate', filter.toDate.toISOString());
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    }
    
    const response = await axiosInstance.get<Order[]>(`/orders?${params.toString()}`);
    return response.data;
  },

  /**
   * Гирифтани фармоиш бо ID
   * @param orderId - ID-и фармоиш
   * @returns Order - Маълумоти фармоиш
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Навсозии фармоиш
   * @param orderId - ID-и фармоиш
   * @param data - Маълумот барои навсозӣ
   * @returns Order - Фармоиши навшуда
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await axiosInstance.put<Order>(`/orders/${orderId}`, data);
    return response.data;
  },

  /**
   * Бекор кардани фармоиш
   * @param orderId - ID-и фармоиш
   * @param reason - Сабаби бекоркунӣ
   */
  async cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
    const data: CancelOrderRequest = { reason };
    const response = await axiosInstance.post<{ message: string }>(`/orders/${orderId}/cancel`, data);
    return response.data;
  },

  /**
   * Пайгирии фармоиш
   * @param trackingNumber - Рақами пайгирӣ
   * @returns OrderTracking - Маълумоти пайгирӣ
   */
  async trackOrder(trackingNumber: string): Promise<OrderTracking> {
    const response = await axiosInstance.get<OrderTracking>(`/orders/track/${trackingNumber}`);
    return response.data;
  },

  /**
   * Гирифтани макони ҷории фармоиш
   * @param orderId - ID-и фармоиш
   * @returns DeliveryLocation - Макони ҷорӣ
   */
  async getOrderLocation(orderId: string): Promise<DeliveryLocation> {
    const response = await axiosInstance.get<DeliveryLocation>(`/orders/${orderId}/location`);
    return response.data;
  },

  /**
   * Гирифтани таърихи фармоиш
   * @param orderId - ID-и фармоиш
   * @returns OrderHistory[] - Таърихи фармоиш
   */
  async getOrderHistory(orderId: string): Promise<OrderHistory[]> {
    const response = await axiosInstance.get<OrderHistory[]>(`/orders/${orderId}/history`);
    return response.data;
  },

  /**
   * Баҳо додан ба фармоиш
   * @param orderId - ID-и фармоиш
   * @param rating - Баҳо (1-5)
   * @param comment - Шарҳ (ихтиёрӣ)
   */
  async rateOrder(orderId: string, rating: number, comment?: string): Promise<{ message: string }> {
    const data: RateOrderRequest = { rating, comment };
    const response = await axiosInstance.post<{ message: string }>(`/orders/${orderId}/rate`, data);
    return response.data;
  },

  /**
   * Гирифтани омори фармоишҳои корбар
   * @returns OrderStats - Омори фармоишҳо
   */
  async getOrderStats(): Promise<OrderStats> {
    const response = await axiosInstance.get<OrderStats>('/orders/stats');
    return response.data;
  },

  /**
   * Ҳисоб кардани нархи тахминии расонидан
   * @param pickupLocation - Макони гирифтан
   * @param deliveryLocation - Макони расонидан
   * @param items - Маҳсулотҳо (ихтиёрӣ)
   * @returns Нархи тахминӣ ва вақти расонидан
   */
  async calculateEstimate(
    pickupLocation: { lat: number; lng: number; address: string },
    deliveryLocation: { lat: number; lng: number; address: string },
    items?: OrderItem[]
  ): Promise<{
    price: number;
    distance: number;
    estimatedTime: number;
    currency: string;
  }> {
    const response = await axiosInstance.post('/orders/estimate', {
      pickupLocation,
      deliveryLocation,
      items,
    });
    return response.data;
  },

  /**
   * Гирифтани фармоишҳои фаъол
   * @returns Order[] - Фармоишҳои фаъол
   */
  async getActiveOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('/orders/active');
    return response.data;
  },

  /**
   * Гирифтани фармоишҳои анҷомёфта
   * @returns Order[] - Фармоишҳои анҷомёфта
   */
  async getCompletedOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('/orders/completed');
    return response.data;
  },

  /**
   * Гирифтани фармоишҳои бекоршуда
   * @returns Order[] - Фармоишҳои бекоршуда
   */
  async getCancelledOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('/orders/cancelled');
    return response.data;
  },

  /**
   * Тасдиқи гирифтани фармоиш аз ҷониби муштарӣ
   * @param orderId - ID-и фармоиш
   */
  async confirmDelivery(orderId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/orders/${orderId}/confirm-delivery`);
    return response.data;
  },

  /**
   * Гузориш додани мушкилот бо фармоиш
   * @param orderId - ID-и фармоиш
   * @param issueType - Намуди мушкилот
   * @param description - Тавсифи мушкилот
   */
  async reportIssue(
    orderId: string, 
    issueType: string, 
    description: string
  ): Promise<{ message: string; ticketId: string }> {
    const response = await axiosInstance.post(`/orders/${orderId}/report-issue`, {
      issueType,
      description,
    });
    return response.data;
  },

  /**
   * Гирифтани маълумоти курйер барои фармоиш
   * @param orderId - ID-и фармоиш
   */
  async getCourierInfo(orderId: string): Promise<{
    courierId: string;
    name: string;
    phoneNumber: string;
    photo?: string;
    rating: number;
    location?: DeliveryLocation;
  }> {
    const response = await axiosInstance.get(`/orders/${orderId}/courier`);
    return response.data;
  },

  /**
   * Ирсоли паём ба курйер
   * @param orderId - ID-и фармоиш
   * @param message - Паём
   */
  async sendMessageToCourier(orderId: string, message: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/orders/${orderId}/message`, {
      message,
    });
    return response.data;
  },

  /**
   * Такрори фармоиши қаблӣ
   * @param orderId - ID-и фармоиши қаблӣ
   * @returns Order - Фармоиши нав
   */
  async repeatOrder(orderId: string): Promise<Order> {
    const response = await axiosInstance.post<Order>(`/orders/${orderId}/repeat`);
    return response.data;
  },

  /**
   * Захира кардани фармоиш барои баъдтар
   * @param data - Маълумоти фармоиш
   */
  async saveOrderDraft(data: Partial<CreateOrderRequest>): Promise<{ draftId: string }> {
    const response = await axiosInstance.post('/orders/draft', data);
    return response.data;
  },

  /**
   * Гирифтани фармоиши захирашуда
   * @param draftId - ID-и фармоиши захирашуда
   */
  async getOrderDraft(draftId: string): Promise<Partial<CreateOrderRequest>> {
    const response = await axiosInstance.get(`/orders/draft/${draftId}`);
    return response.data;
  },

  /**
   * Нест кардани фармоиши захирашуда
   * @param draftId - ID-и фармоиши захирашуда
   */
  async deleteOrderDraft(draftId: string): Promise<void> {
    await axiosInstance.delete(`/orders/draft/${draftId}`);
  },

  /**
   * Гирифтани рӯйхати шаҳрҳои дастрас
   */
  async getAvailableCities(): Promise<Array<{ id: string; name: string; region: string }>> {
    const response = await axiosInstance.get('/orders/cities');
    return response.data;
  },

  /**
   * Текшири имконияти расонидан ба суроға
   * @param address - Суроға барои текшир
   */
  async checkDeliveryAvailability(address: string): Promise<{
    available: boolean;
    estimatedTime?: number;
    minPrice?: number;
  }> {
    const response = await axiosInstance.post('/orders/check-availability', { address });
    return response.data;
  },
};

// Export кардани функсияҳои алоҳида
export const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  trackOrder,
  getOrderLocation,
  getOrderHistory,
  rateOrder,
  getOrderStats,
  calculateEstimate,
  getActiveOrders,
  getCompletedOrders,
  getCancelledOrders,
  confirmDelivery,
  reportIssue,
  getCourierInfo,
  sendMessageToCourier,
  repeatOrder,
  saveOrderDraft,
  getOrderDraft,
  deleteOrderDraft,
  getAvailableCities,
  checkDeliveryAvailability,
} = ordersApi;

export default ordersApi;
