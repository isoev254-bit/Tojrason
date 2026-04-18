// Tojrason/frontend/client/src/types/courier.types.ts
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
  idCard?: string;
  driverLicense?: string;
  vehicleRegistration?: string;
  insurance?: string;
  backgroundCheck?: boolean;
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
  earnings?: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  currentLocation?: Location;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt?: string;
}

/**
 * Маълумоти фармоиш барои курйер
 */
export interface CourierOrder {
  id: string;
  trackingNumber: string;
  pickupAddress: string;
  pickupLocation?: Location;
  deliveryAddress: string;
  deliveryLocation?: Location;
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  weight: number;
  price: number;
  distance: number;
  estimatedTime: number;
  status: string;
  createdAt: string;
  pickupDeadline?: string;
  deliveryDeadline?: string;
}

/**
 * Филтр барои рӯйхати фармоишҳои курйер
 */
export interface CourierOrderFilter {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Омори кори курйер
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
 * Дархости қабули фармоиш
 */
export interface AcceptOrderRequest {
  orderId: string;
}

/**
 * Дархости навсозии статуси фармоиш аз ҷониби курйер
 */
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: string;
  note?: string;
  location?: Location;
  photo?: string;
}

/**
 * Маълумоти муфассали даромади курйер
 */
export interface EarningsDetails {
  period: 'today' | 'week' | 'month' | 'total';
  totalEarnings: number;
  baseEarnings: number;
  tips: number;
  bonuses: number;
  deductions: number;
  currency: string;
  breakdown: Array<{
    date: string;
    orderId: string;
    amount: number;
    type: 'delivery' | 'tip' | 'bonus' | 'deduction';
    description?: string;
  }>;
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
  recentReviews: Array<{
    id: string;
    orderId: string;
    rating: number;
    comment?: string;
    customerName: string;
    createdAt: string;
  }>;
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
  notifications: {
    newOrder: boolean;
    orderUpdate: boolean;
    earnings: boolean;
    promotions: boolean;
  };
  workSchedule: WorkSchedule[];
}

/**
 * Ҷавоби API барои маълумоти курйер
 */
export interface CourierResponse {
  success: boolean;
  data?: CourierProfile;
  message?: string;
}
