// Tojrason/frontend/courier/src/api/orders.api.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import axiosInstance from './axios.config';
import { 
  CourierOrder,
  CourierOrderFilter,
  UpdateOrderStatusRequest,
  AcceptOrderRequest,
} from '../../types/courier.types';
import { Order, OrderTracking, Location } from '../../types/order.types';

export const ordersApi = {
  /**
   * Гирифтани рӯйхати фармоишҳои дастрас барои курйер
   * @param filter - Филтр барои фармоишҳо
   * @returns CourierOrder[] - Рӯйхати фармоишҳои дастрас
   */
  async getAvailableOrders(filter?: CourierOrderFilter): Promise<CourierOrder[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.fromDate) params.append('fromDate', filter.fromDate);
      if (filter.toDate) params.append('toDate', filter.toDate);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    }
    
    const response = await axiosInstance.get<CourierOrder[]>(`/courier/orders/available?${params.toString()}`);
    return response.data;
  },

  /**
   * Гирифтани рӯйхати фармоишҳои қабулкардаи курйер
   * @param filter - Филтр барои фармоишҳо
   * @returns CourierOrder[] - Рӯйхати фармоишҳои ман
   */
  async getMyOrders(filter?: CourierOrderFilter): Promise<CourierOrder[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.fromDate) params.append('fromDate', filter.fromDate);
      if (filter.toDate) params.append('toDate', filter.toDate);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    }
    
    const response = await axiosInstance.get<CourierOrder[]>(`/courier/orders/my?${params.toString()}`);
    return response.data;
  },

  /**
   * Гирифтани фармоиш бо ID
   * @param orderId - ID-и фармоиш
   * @returns Order - Маълумоти муфассали фармоиш
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await axiosInstance.get<Order>(`/courier/orders/${orderId}`);
    return response.data;
  },

  /**
   * Қабул кардани фармоиш
   * @param orderId - ID-и фармоиш
   * @returns Order - Фармоиши қабулшуда
   */
  async acceptOrder(orderId: string): Promise<Order> {
    const data: AcceptOrderRequest = { orderId };
    const response = await axiosInstance.post<Order>(`/courier/orders/${orderId}/accept`, data);
    return response.data;
  },

  /**
   * Рад кардани фармоиш
   * @param orderId - ID-и фармоиш
   * @param reason - Сабаби радкунӣ (ихтиёрӣ)
   */
  async rejectOrder(orderId: string, reason?: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/courier/orders/${orderId}/reject`, { reason });
    return response.data;
  },

  /**
   * Навсозии статуси фармоиш
   * @param orderId - ID-и фармоиш
   * @param data - Маълумоти навсозӣ
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await axiosInstance.put<Order>(`/courier/orders/${orderId}/status`, data);
    return response.data;
  },

  /**
   * Тасдиқи гирифтани бор аз муштарӣ
   * @param orderId - ID-и фармоиш
   * @param note - Эзоҳ (ихтиёрӣ)
   * @param photo - Акси бор (ихтиёрӣ)
   */
  async confirmPickup(orderId: string, note?: string, photo?: File): Promise<Order> {
    const formData = new FormData();
    if (note) formData.append('note', note);
    if (photo) formData.append('photo', photo);
    
    const response = await axiosInstance.post<Order>(`/courier/orders/${orderId}/pickup`, formData, {
      headers: photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  /**
   * Тасдиқи расонидани бор ба гиранда
   * @param orderId - ID-и фармоиш
   * @param note - Эзоҳ (ихтиёрӣ)
   * @param photo - Акси бор (ихтиёрӣ)
   * @param signature - Имзои гиранда (агар лозим бошад)
   */
  async confirmDelivery(
    orderId: string, 
    note?: string, 
    photo?: File,
    signature?: string
  ): Promise<Order> {
    const formData = new FormData();
    if (note) formData.append('note', note);
    if (photo) formData.append('photo', photo);
    if (signature) formData.append('signature', signature);
    
    const response = await axiosInstance.post<Order>(`/courier/orders/${orderId}/deliver`, formData, {
      headers: photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  /**
   * Гузориш додани мушкилот бо фармоиш
   * @param orderId - ID-и фармоиш
   * @param issueType - Намуди мушкилот
   * @param description - Тавсифи мушкилот
   * @param photo - Акси мушкилот (ихтиёрӣ)
   */
  async reportIssue(
    orderId: string,
    issueType: string,
    description: string,
    photo?: File
  ): Promise<{ message: string; ticketId: string }> {
    const formData = new FormData();
    formData.append('issueType', issueType);
    formData.append('description', description);
    if (photo) formData.append('photo', photo);
    
    const response = await axiosInstance.post(`/courier/orders/${orderId}/report-issue`, formData, {
      headers: photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  /**
   * Бекор кардани фармоиш аз ҷониби курйер
   * @param orderId - ID-и фармоиш
   * @param reason - Сабаби бекоркунӣ
   */
  async cancelOrder(orderId: string, reason: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/courier/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Навсозии макони курйер
   * @param orderId - ID-и фармоиш (ихтиёрӣ, агар фармоиши фаъол дошта бошад)
   * @param location - Макони ҷорӣ
   */
  async updateLocation(orderId: string | null, location: Location): Promise<void> {
    await axiosInstance.post('/courier/location', {
      orderId,
      latitude: location.lat,
      longitude: location.lng,
    });
  },

  /**
   * Гирифтани маълумоти муштарӣ барои фармоиш
   * @param orderId - ID-и фармоиш
   */
  async getClientInfo(orderId: string): Promise<{
    clientId: string;
    name: string;
    phoneNumber: string;
    photo?: string;
  }> {
    const response = await axiosInstance.get(`/courier/orders/${orderId}/client`);
    return response.data;
  },

  /**
   * Ирсоли паём ба муштарӣ
   * @param orderId - ID-и фармоиш
   * @param message - Паём
   */
  async sendMessageToClient(orderId: string, message: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/courier/orders/${orderId}/message`, {
      message,
    });
    return response.data;
  },

  /**
   * Гирифтани таърихи фармоиш
   * @param orderId - ID-и фармоиш
   */
  async getOrderHistory(orderId: string): Promise<any[]> {
    const response = await axiosInstance.get(`/courier/orders/${orderId}/history`);
    return response.data;
  },

  /**
   * Пайгирии фармоиш (ҳамон API барои ҳама)
   * @param trackingNumber - Рақами пайгирӣ
   */
  async trackOrder(trackingNumber: string): Promise<OrderTracking> {
    const response = await axiosInstance.get<OrderTracking>(`/orders/track/${trackingNumber}`);
    return response.data;
  },

  /**
   * Гирифтани масири пешниҳодшуда барои фармоиш
   * @param orderId - ID-и фармоиш
   */
  async getSuggestedRoute(orderId: string): Promise<Array<[number, number]>> {
    const response = await axiosInstance.get(`/courier/orders/${orderId}/route`);
    return response.data;
  },

  /**
   * Ҳисоб кардани масофа ва вақти тахминӣ то суроға
   * @param from - Макони ҷорӣ
   * @param to - Макони мақсад
   */
  async calculateDistance(
    from: Location,
    to: Location
  ): Promise<{ distance: number; duration: number }> {
    const response = await axiosInstance.post('/courier/calculate-distance', {
      from: { lat: from.lat, lng: from.lng },
      to: { lat: to.lat, lng: to.lng },
    });
    return response.data;
  },
};

// Export кардани функсияҳои алоҳида
export const {
  getAvailableOrders,
  getMyOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  confirmPickup,
  confirmDelivery,
  reportIssue,
  cancelOrder,
  updateLocation,
  getClientInfo,
  sendMessageToClient,
  getOrderHistory,
  trackOrder,
  getSuggestedRoute,
  calculateDistance,
} = ordersApi;

export default ordersApi;
