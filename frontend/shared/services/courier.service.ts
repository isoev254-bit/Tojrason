// Tojrason/frontend/shared/services/courier.service.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { ApiClient, PaginatedResponse, FilterParams } from './api/apiClient';
import { User } from './user.service';

// Намудҳои курйер
export type CourierStatus = 'offline' | 'online' | 'on_delivery' | 'break';
export type VehicleType = 'bicycle' | 'motorcycle' | 'car' | 'truck' | 'walking';

export interface Vehicle {
  type: VehicleType;
  model: string;
  plateNumber: string;
  color?: string;
  year?: number;
  maxWeight?: number;
}

export interface CourierDocuments {
  idCard?: boolean;
  driverLicense?: boolean;
  vehicleRegistration?: boolean;
  insurance?: boolean;
  backgroundCheck?: boolean;
}

export interface CourierSettings {
  maxDistance: number;
  preferredAreas: string[];
  autoAccept: boolean;
  notifications: {
    newOrder: boolean;
    orderUpdate: boolean;
    earnings: boolean;
    promotions: boolean;
    sound: boolean;
    vibration: boolean;
  };
  workSchedule: WorkSchedule[];
  language: 'tg' | 'ru' | 'en';
  darkMode: boolean;
}

export interface WorkSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CourierProfile extends User {
  status: CourierStatus;
  vehicle?: Vehicle;
  documents?: CourierDocuments;
  rating?: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  earnings?: CourierEarnings;
  currentLocation?: Location;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface CourierEarnings {
  total: number;
  today: number;
  week: number;
  month: number;
  currency: string;
}

export interface CourierStats {
  today: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  week: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  month: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  total: {
    deliveries: number;
    earnings: number;
    distance: number;
    rating: number;
  };
}

export interface EarningsDetails {
  period: 'today' | 'week' | 'month' | 'total';
  totalEarnings: number;
  baseEarnings: number;
  tips: number;
  bonuses: number;
  deductions: number;
  currency: string;
  breakdown: EarningsBreakdownItem[];
}

export interface EarningsBreakdownItem {
  date: string;
  orderId: string;
  amount: number;
  type: 'delivery' | 'tip' | 'bonus' | 'deduction';
  description?: string;
}

export interface CourierRating {
  average: number;
  totalReviews: number;
  breakdown: Record<number, number>;
  recentReviews: RecentReview[];
}

export interface RecentReview {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  customerName: string;
  createdAt: string;
}

export interface TodayActivity {
  online: boolean;
  startTime?: string;
  endTime?: string;
  totalHours: number;
  deliveries: number;
  earnings: number;
  distance: number;
}

export interface WorkShift {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalHours: number;
  deliveries: number;
  earnings: number;
  distance: number;
}

export interface CourierFilter extends FilterParams {
  status?: CourierStatus;
  isVerified?: boolean;
  vehicleType?: VehicleType;
}

// Конфигуратсияи сервис
export interface CourierServiceConfig {
  apiClient: ApiClient;
  endpoints?: {
    profile?: string;
    location?: string;
    status?: string;
    stats?: string;
    earnings?: string;
    payments?: string;
    withdraw?: string;
    rating?: string;
    reviews?: string;
    vehicle?: string;
    documents?: string;
    documentsStatus?: string;
    schedule?: string;
    settings?: string;
    notifications?: string;
    todayActivity?: string;
    shift?: string;
    shifts?: string;
    couriers?: string;
    verify?: string;
  };
}

// Интерфейси сервис
export interface ICourierService {
  // Профил ва ҳолат
  getProfile(): Promise<CourierProfile>;
  updateProfile(data: Partial<CourierProfile>): Promise<CourierProfile>;
  updateLocation(location: Location): Promise<void>;
  updateStatus(status: CourierStatus, reason?: string): Promise<{ status: CourierStatus }>;
  getCurrentStatus(): Promise<{ status: CourierStatus; lastUpdated: string }>;
  
  // Омор ва даромад
  getStats(): Promise<CourierStats>;
  getEarnings(period?: 'today' | 'week' | 'month' | 'total'): Promise<EarningsDetails>;
  getPaymentHistory(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  requestWithdrawal(amount: number, method: 'card' | 'wallet' | 'bank'): Promise<{ requestId: string; status: string; estimatedDate: string }>;
  
  // Рейтинг
  getRating(): Promise<CourierRating>;
  getRecentReviews(limit?: number): Promise<RecentReview[]>;
  
  // Нақлиёт
  updateVehicle(vehicle: Vehicle): Promise<Vehicle>;
  getVehicle(): Promise<Vehicle | null>;
  
  // Ҳуҷҷатҳо
  uploadDocument(type: keyof CourierDocuments, file: File): Promise<{ url: string; verified: boolean }>;
  getDocumentsStatus(): Promise<CourierDocuments>;
  
  // Ҷадвал ва танзимот
  getWorkSchedule(): Promise<WorkSchedule[]>;
  updateWorkSchedule(schedule: WorkSchedule[]): Promise<WorkSchedule[]>;
  getSettings(): Promise<CourierSettings>;
  updateSettings(settings: Partial<CourierSettings>): Promise<CourierSettings>;
  
  // Огоҳиҳо
  getNotifications(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  
  // Сменахо
  getTodayActivity(): Promise<TodayActivity>;
  startShift(): Promise<{ shiftId: string; startTime: string }>;
  endShift(): Promise<{ shiftId: string; endTime: string; summary: any }>;
  getShiftHistory(month?: number, year?: number): Promise<WorkShift[]>;
  
  // Админ функсияҳо
  getCouriers(filter?: CourierFilter): Promise<PaginatedResponse<CourierProfile>>;
  getCourierById(courierId: string): Promise<CourierProfile>;
  verifyCourier(courierId: string): Promise<CourierProfile>;
  updateCourierStatus(courierId: string, status: CourierStatus): Promise<CourierProfile>;
}

/**
 * Сервиси курйерҳо
 */
export class CourierService implements ICourierService {
  private apiClient: ApiClient;
  private endpoints: Required<CourierServiceConfig['endpoints']>;

  constructor(config: CourierServiceConfig) {
    this.apiClient = config.apiClient;
    this.endpoints = {
      profile: '/courier/profile',
      location: '/courier/location',
      status: '/courier/status',
      stats: '/courier/stats',
      earnings: '/courier/earnings',
      payments: '/courier/payments',
      withdraw: '/courier/withdraw',
      rating: '/courier/rating',
      reviews: '/courier/reviews',
      vehicle: '/courier/vehicle',
      documents: '/courier/documents',
      documentsStatus: '/courier/documents/status',
      schedule: '/courier/schedule',
      settings: '/courier/settings',
      notifications: '/courier/notifications',
      todayActivity: '/courier/today-activity',
      shift: '/courier/shift',
      shifts: '/courier/shifts',
      couriers: '/admin/couriers',
      verify: '/verify',
      ...config.endpoints,
    };
  }

  /**
   * Гирифтани профили курйер
   */
  async getProfile(): Promise<CourierProfile> {
    return this.apiClient.get<CourierProfile>(this.endpoints.profile);
  }

  /**
   * Навсозии профили курйер
   */
  async updateProfile(data: Partial<CourierProfile>): Promise<CourierProfile> {
    return this.apiClient.put<CourierProfile>(this.endpoints.profile, data);
  }

  /**
   * Навсозии макони курйер
   */
  async updateLocation(location: Location): Promise<void> {
    await this.apiClient.post(this.endpoints.location, location);
  }

  /**
   * Тағйири статуси курйер
   */
  async updateStatus(status: CourierStatus, reason?: string): Promise<{ status: CourierStatus }> {
    return this.apiClient.post(this.endpoints.status, { status, reason });
  }

  /**
   * Гирифтани статуси ҷорӣ
   */
  async getCurrentStatus(): Promise<{ status: CourierStatus; lastUpdated: string }> {
    return this.apiClient.get(this.endpoints.status);
  }

  /**
   * Гирифтани омори курйер
   */
  async getStats(): Promise<CourierStats> {
    return this.apiClient.get<CourierStats>(this.endpoints.stats);
  }

  /**
   * Гирифтани даромад
   */
  async getEarnings(period: 'today' | 'week' | 'month' | 'total' = 'week'): Promise<EarningsDetails> {
    return this.apiClient.get<EarningsDetails>(`${this.endpoints.earnings}?period=${period}`);
  }

  /**
   * Гирифтани таърихи пардохтҳо
   */
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> {
    return this.apiClient.getPaginated(this.endpoints.payments, { page, limit });
  }

  /**
   * Дархости баровардани маблағ
   */
  async requestWithdrawal(amount: number, method: 'card' | 'wallet' | 'bank'): Promise<{ requestId: string; status: string; estimatedDate: string }> {
    return this.apiClient.post(this.endpoints.withdraw, { amount, method });
  }

  /**
   * Гирифтани рейтинги курйер
   */
  async getRating(): Promise<CourierRating> {
    return this.apiClient.get<CourierRating>(this.endpoints.rating);
  }

  /**
   * Гирифтани шарҳҳои охирин
   */
  async getRecentReviews(limit: number = 10): Promise<RecentReview[]> {
    return this.apiClient.get<RecentReview[]>(`${this.endpoints.reviews}?limit=${limit}`);
  }

  /**
   * Навсозии маълумоти нақлиёт
   */
  async updateVehicle(vehicle: Vehicle): Promise<Vehicle> {
    return this.apiClient.put<Vehicle>(this.endpoints.vehicle, vehicle);
  }

  /**
   * Гирифтани маълумоти нақлиёт
   */
  async getVehicle(): Promise<Vehicle | null> {
    return this.apiClient.get<Vehicle | null>(this.endpoints.vehicle);
  }

  /**
   * Боргузории ҳуҷҷат
   */
  async uploadDocument(type: keyof CourierDocuments, file: File): Promise<{ url: string; verified: boolean }> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return this.apiClient.postFormData(this.endpoints.documents, formData);
  }

  /**
   * Гирифтани статуси ҳуҷҷатҳо
   */
  async getDocumentsStatus(): Promise<CourierDocuments> {
    return this.apiClient.get<CourierDocuments>(this.endpoints.documentsStatus);
  }

  /**
   * Гирифтани ҷадвали корӣ
   */
  async getWorkSchedule(): Promise<WorkSchedule[]> {
    return this.apiClient.get<WorkSchedule[]>(this.endpoints.schedule);
  }

  /**
   * Навсозии ҷадвали корӣ
   */
  async updateWorkSchedule(schedule: WorkSchedule[]): Promise<WorkSchedule[]> {
    return this.apiClient.put<WorkSchedule[]>(this.endpoints.schedule, { schedule });
  }

  /**
   * Гирифтани танзимот
   */
  async getSettings(): Promise<CourierSettings> {
    return this.apiClient.get<CourierSettings>(this.endpoints.settings);
  }

  /**
   * Навсозии танзимот
   */
  async updateSettings(settings: Partial<CourierSettings>): Promise<CourierSettings> {
    return this.apiClient.put<CourierSettings>(this.endpoints.settings, settings);
  }

  /**
   * Гирифтани огоҳиҳо
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> {
    return this.apiClient.getPaginated(this.endpoints.notifications, { page, limit });
  }

  /**
   * Хонда шудани огоҳӣ
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.apiClient.post(`${this.endpoints.notifications}/${notificationId}/read`);
  }

  /**
   * Хонда шудани ҳамаи огоҳиҳо
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await this.apiClient.post(`${this.endpoints.notifications}/read-all`);
  }

  /**
   * Гирифтани фаъолияти имрӯза
   */
  async getTodayActivity(): Promise<TodayActivity> {
    return this.apiClient.get<TodayActivity>(this.endpoints.todayActivity);
  }

  /**
   * Оғози смена
   */
  async startShift(): Promise<{ shiftId: string; startTime: string }> {
    return this.apiClient.post(`${this.endpoints.shift}/start`);
  }

  /**
   * Анҷоми смена
   */
  async endShift(): Promise<{ shiftId: string; endTime: string; summary: any }> {
    return this.apiClient.post(`${this.endpoints.shift}/end`);
  }

  /**
   * Гирифтани таърихи сменахо
   */
  async getShiftHistory(month?: number, year?: number): Promise<WorkShift[]> {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.apiClient.get(this.endpoints.shifts, params);
  }

  /**
   * Гирифтани рӯйхати курйерҳо (админ)
   */
  async getCouriers(filter?: CourierFilter): Promise<PaginatedResponse<CourierProfile>> {
    return this.apiClient.getPaginated<CourierProfile>(this.endpoints.couriers, filter);
  }

  /**
   * Гирифтани курйер бо ID (админ)
   */
  async getCourierById(courierId: string): Promise<CourierProfile> {
    return this.apiClient.get<CourierProfile>(`${this.endpoints.couriers}/${courierId}`);
  }

  /**
   * Тасдиқи курйер (админ)
   */
  async verifyCourier(courierId: string): Promise<CourierProfile> {
    return this.apiClient.post<CourierProfile>(`${this.endpoints.couriers}/${courierId}${this.endpoints.verify}`);
  }

  /**
   * Навсозии статуси курйер (админ)
   */
  async updateCourierStatus(courierId: string, status: CourierStatus): Promise<CourierProfile> {
    return this.apiClient.put<CourierProfile>(`${this.endpoints.couriers}/${courierId}/status`, { status });
  }
}

/**
 * Эҷоди сервиси курйерҳо
 */
export const createCourierService = (config: CourierServiceConfig): ICourierService => {
  return new CourierService(config);
};

export default CourierService;
