// Tojrason/frontend/shared/types/courier.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { User } from './auth.types';
import { Location } from './order.types';

/**
 * Статуси курйер
 */
export enum CourierStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  ON_DELIVERY = 'on_delivery',
  BREAK = 'break',
}

/**
 * Намуди нақлиёт
 */
export enum VehicleType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  TRUCK = 'truck',
  WALKING = 'walking',
}

/**
 * Маълумоти нақлиёти курйер
 */
export interface Vehicle {
  type: VehicleType;
  model: string;
  plateNumber: string;
  color?: string;
  year?: number;
  maxWeight?: number;
}

/**
 * Ҳуҷҷатҳои курйер
 */
export interface CourierDocuments {
  idCard?: boolean;
  driverLicense?: boolean;
  vehicleRegistration?: boolean;
  insurance?: boolean;
  backgroundCheck?: boolean;
}

/**
 * Танзимоти огоҳиҳои курйер
 */
export interface CourierNotificationSettings {
  newOrder: boolean;
  orderUpdate: boolean;
  earnings: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

/**
 * Ҷадвали кории курйер
 */
export interface WorkSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

/**
 * Танзимоти курйер
 */
export interface CourierSettings {
  maxDistance: number;
  preferredAreas: string[];
  autoAccept: boolean;
  notifications: CourierNotificationSettings;
  workSchedule: WorkSchedule[];
  language: 'tg' | 'ru' | 'en';
  darkMode: boolean;
}

/**
 * Даромади курйер
 */
export interface CourierEarnings {
  total: number;
  today: number;
  week: number;
  month: number;
  currency: string;
}

/**
 * Профили курйер
 */
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

/**
 * Омори курйер
 */
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

/**
 * Ҷузъиёти муфассали даромад
 */
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

/**
 * Ҷузъи даромад
 */
export interface EarningsBreakdownItem {
  date: string;
  orderId: string;
  amount: number;
  type: 'delivery' | 'tip' | 'bonus' | 'deduction';
  description?: string;
}

/**
 * Рейтинги курйер
 */
export interface CourierRating {
  average: number;
  totalReviews: number;
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: RecentReview[];
}

/**
 * Шарҳи охирин
 */
export interface RecentReview {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  customerName: string;
  createdAt: string;
}

/**
 * Фаъолияти имрӯза
 */
export interface TodayActivity {
  online: boolean;
  startTime?: string;
  endTime?: string;
  totalHours: number;
  deliveries: number;
  earnings: number;
  distance: number;
}

/**
 * Сменаи корӣ
 */
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

/**
 * Филтр барои рӯйхати курйерҳо
 */
export interface CourierFilter {
  status?: CourierStatus;
  isVerified?: boolean;
  vehicleType?: VehicleType;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'totalDeliveries';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Дархости навсозии макони курйер
 */
export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

/**
 * Дархости тағйири статуси курйер
 */
export interface UpdateStatusRequest {
  status: CourierStatus;
  reason?: string;
}

/**
 * Ҷавоби тағйири статус
 */
export interface UpdateStatusResponse {
  status: CourierStatus;
  lastUpdated: string;
}

/**
 * Дархости оғози смена
 */
export interface StartShiftRequest {
  vehicleId?: string;
}

/**
 * Ҷавоби оғози смена
 */
export interface StartShiftResponse {
  shiftId: string;
  startTime: string;
}

/**
 * Ҷавоби анҷоми смена
 */
export interface EndShiftResponse {
  shiftId: string;
  endTime: string;
  summary: {
    totalHours: number;
    deliveries: number;
    earnings: number;
    distance: number;
  };
}

/**
 * Дархости баровардани маблағ
 */
export interface WithdrawalRequest {
  amount: number;
  method: 'card' | 'wallet' | 'bank';
  cardId?: string;
  bankAccount?: string;
}

/**
 * Ҷавоби дархости баровардани маблағ
 */
export interface WithdrawalResponse {
  requestId: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  estimatedDate: string;
}

/**
 * Огоҳии курйер
 */
export interface CourierNotification {
  id: string;
  type: 'new_order' | 'order_update' | 'earnings' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

/**
 * Ҷавоби рӯйхати огоҳиҳо
 */
export interface NotificationsResponse {
  notifications: CourierNotification[];
  unreadCount: number;
  total: number;
}

/**
 * Танзимоти харита
 */
export interface MapSettings {
  autoCenter: boolean;
  showTraffic: boolean;
  mapType: 'standard' | 'satellite' | 'hybrid';
}

/**
 * Ҳолати умумии курйер дар барнома
 */
export interface CourierAppState {
  isOnline: boolean;
  isOnDelivery: boolean;
  currentShift: WorkShift | null;
  todayStats: TodayActivity | null;
  unreadNotifications: number;
  }
