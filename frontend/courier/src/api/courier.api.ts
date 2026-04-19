// Tojrason/frontend/courier/src/api/courier.api.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import axiosInstance from './axios.config';
import {
  CourierProfile,
  CourierStatus,
  CourierStats,
  EarningsDetails,
  CourierRating,
  WorkSchedule,
  CourierSettings,
  UpdateLocationRequest,
  UpdateStatusRequest,
  Vehicle,
  CourierDocuments,
} from '../../types/courier.types';

export const courierApi = {
  /**
   * Гирифтани профили курйер
   * @returns CourierProfile - Маълумоти пурраи курйер
   */
  async getProfile(): Promise<CourierProfile> {
    const response = await axiosInstance.get<CourierProfile>('/courier/profile');
    return response.data;
  },

  /**
   * Навсозии профили курйер
   * @param data - Маълумот барои навсозӣ
   * @returns CourierProfile - Профили навшуда
   */
  async updateProfile(data: Partial<CourierProfile>): Promise<CourierProfile> {
    const response = await axiosInstance.put<CourierProfile>('/courier/profile', data);
    return response.data;
  },

  /**
   * Навсозии макони ҷории курйер
   * @param location - Макони ҷорӣ
   */
  async updateLocation(location: UpdateLocationRequest): Promise<void> {
    await axiosInstance.post('/courier/location', location);
  },

  /**
   * Тағйири статуси курйер (онлайн/офлайн/танаффус)
   * @param status - Статуси нав
   * @param reason - Сабаби тағйир (ихтиёрӣ)
   */
  async updateStatus(status: CourierStatus, reason?: string): Promise<{ status: CourierStatus }> {
    const data: UpdateStatusRequest = { status, reason };
    const response = await axiosInstance.post<{ status: CourierStatus }>('/courier/status', data);
    return response.data;
  },

  /**
   * Гирифтани статуси ҷории курйер
   */
  async getCurrentStatus(): Promise<{ status: CourierStatus; lastUpdated: string }> {
    const response = await axiosInstance.get('/courier/status');
    return response.data;
  },

  /**
   * Гирифтани омори курйер (рӯзона, ҳафтаина, моҳона, умумӣ)
   * @returns CourierStats - Омори муфассал
   */
  async getStats(): Promise<CourierStats> {
    const response = await axiosInstance.get<CourierStats>('/courier/stats');
    return response.data;
  },

  /**
   * Гирифтани маълумоти муфассали даромад
   * @param period - Давра: 'today', 'week', 'month', 'total'
   * @returns EarningsDetails - Ҷузъиёти даромад
   */
  async getEarnings(period: 'today' | 'week' | 'month' | 'total' = 'week'): Promise<EarningsDetails> {
    const response = await axiosInstance.get<EarningsDetails>(`/courier/earnings?period=${period}`);
    return response.data;
  },

  /**
   * Гирифтани таърихи пардохтҳо ба курйер
   * @param page - Саҳифа
   * @param limit - Шумора дар як саҳифа
   */
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<{
    payments: Array<{
      id: string;
      amount: number;
      date: string;
      type: 'delivery' | 'bonus' | 'tip' | 'adjustment';
      orderId?: string;
      description?: string;
    }>;
    total: number;
  }> {
    const response = await axiosInstance.get(`/courier/payments?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Дархости баровардани маблағ (ба корт ё ҳамён)
   * @param amount - Маблағ
   * @param method - Усули баровардан
   */
  async requestWithdrawal(amount: number, method: 'card' | 'wallet' | 'bank'): Promise<{
    requestId: string;
    status: 'pending' | 'approved' | 'completed';
    estimatedDate: string;
  }> {
    const response = await axiosInstance.post('/courier/withdraw', { amount, method });
    return response.data;
  },

  /**
   * Гирифтани рейтинги курйер
   * @returns CourierRating - Рейтинг ва шарҳҳо
   */
  async getRating(): Promise<CourierRating> {
    const response = await axiosInstance.get<CourierRating>('/courier/rating');
    return response.data;
  },

  /**
   * Гирифтани шарҳҳои охирин
   * @param limit - Шумораи шарҳҳо
   */
  async getRecentReviews(limit: number = 10): Promise<CourierRating['recentReviews']> {
    const response = await axiosInstance.get(`/courier/reviews?limit=${limit}`);
    return response.data;
  },

  /**
   * Навсозии маълумоти нақлиёт
   * @param vehicle - Маълумоти нақлиёт
   */
  async updateVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const response = await axiosInstance.put<Vehicle>('/courier/vehicle', vehicle);
    return response.data;
  },

  /**
   * Гирифтани маълумоти нақлиёт
   */
  async getVehicle(): Promise<Vehicle | null> {
    const response = await axiosInstance.get<Vehicle | null>('/courier/vehicle');
    return response.data;
  },

  /**
   * Боргузории ҳуҷҷатҳо
   * @param type - Намуди ҳуҷҷат
   * @param file - Файл
   */
  async uploadDocument(type: keyof CourierDocuments, file: File): Promise<{ url: string; verified: boolean }> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    
    const response = await axiosInstance.post('/courier/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Гирифтани статуси тасдиқи ҳуҷҷатҳо
   */
  async getDocumentsStatus(): Promise<CourierDocuments> {
    const response = await axiosInstance.get<CourierDocuments>('/courier/documents/status');
    return response.data;
  },

  /**
   * Гирифтани ҷадвали корӣ
   */
  async getWorkSchedule(): Promise<WorkSchedule[]> {
    const response = await axiosInstance.get<WorkSchedule[]>('/courier/schedule');
    return response.data;
  },

  /**
   * Навсозии ҷадвали корӣ
   * @param schedule - Ҷадвали нав
   */
  async updateWorkSchedule(schedule: WorkSchedule[]): Promise<WorkSchedule[]> {
    const response = await axiosInstance.put<WorkSchedule[]>('/courier/schedule', { schedule });
    return response.data;
  },

  /**
   * Гирифтани танзимоти курйер
   */
  async getSettings(): Promise<CourierSettings> {
    const response = await axiosInstance.get<CourierSettings>('/courier/settings');
    return response.data;
  },

  /**
   * Навсозии танзимоти курйер
   * @param settings - Танзимоти нав
   */
  async updateSettings(settings: Partial<CourierSettings>): Promise<CourierSettings> {
    const response = await axiosInstance.put<CourierSettings>('/courier/settings', settings);
    return response.data;
  },

  /**
   * Гирифтани огоҳиҳои курйер
   * @param page - Саҳифа
   * @param limit - Шумора
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
      data?: any;
    }>;
    unreadCount: number;
    total: number;
  }> {
    const response = await axiosInstance.get(`/courier/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Хонда шудани огоҳӣ
   * @param notificationId - ID-и огоҳӣ
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await axiosInstance.post(`/courier/notifications/${notificationId}/read`);
  },

  /**
   * Хонда шудани ҳамаи огоҳиҳо
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await axiosInstance.post('/courier/notifications/read-all');
  },

  /**
   * Гирифтани ҳолати фаъолияти имрӯза
   */
  async getTodayActivity(): Promise<{
    online: boolean;
    startTime?: string;
    totalHours: number;
    deliveries: number;
    earnings: number;
    distance: number;
  }> {
    const response = await axiosInstance.get('/courier/today-activity');
    return response.data;
  },

  /**
   * Оғози смена (онлайн шудан)
   */
  async startShift(): Promise<{ shiftId: string; startTime: string }> {
    const response = await axiosInstance.post('/courier/shift/start');
    return response.data;
  },

  /**
   * Анҷоми смена (офлайн шудан)
   */
  async endShift(): Promise<{ shiftId: string; endTime: string; summary: any }> {
    const response = await axiosInstance.post('/courier/shift/end');
    return response.data;
  },

  /**
   * Гирифтани таърихи сменахо
   * @param month - Моҳ (1-12)
   * @param year - Сол
   */
  async getShiftHistory(month?: number, year?: number): Promise<Array<{
    id: string;
    date: string;
    startTime: string;
    endTime?: string;
    totalHours: number;
    deliveries: number;
    earnings: number;
  }>> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await axiosInstance.get(`/courier/shifts?${params.toString()}`);
    return response.data;
  },
};

// Export кардани функсияҳои алоҳида
export const {
  getProfile,
  updateProfile,
  updateLocation,
  updateStatus,
  getCurrentStatus,
  getStats,
  getEarnings,
  getPaymentHistory,
  requestWithdrawal,
  getRating,
  getRecentReviews,
  updateVehicle,
  getVehicle,
  uploadDocument,
  getDocumentsStatus,
  getWorkSchedule,
  updateWorkSchedule,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getTodayActivity,
  startShift,
  endShift,
  getShiftHistory,
} = courierApi;

export default courierApi;
