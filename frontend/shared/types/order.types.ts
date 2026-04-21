// Tojrason/frontend/shared/types/order.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { User } from './auth.types';

/**
 * Статусҳои фармоиш
 */
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKUP = 'pickup',
  IN_TRANSIT = 'in_transit',
  ARRIVING = 'arriving',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Намудҳои бор
 */
export enum PackageType {
  DOCUMENT = 'document',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  FRAGILE = 'fragile',
}

/**
 * Статуси пардохт барои фармоиш
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Усулҳои пардохт
 */
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
}

/**
 * Андозаҳои бор
 */
export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

/**
 * Маҳсулоти дохили бор (барои ҳисобкунии дақиқтар)
 */
export interface OrderItem {
  name: string;
  quantity: number;
  weight?: number;
  price?: number;
}

/**
 * Макони ҷуғрофӣ
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Маълумоти курйер (ихтисоршуда)
 */
export interface CourierInfo {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  photo?: string;
  rating?: number;
  location?: Location & { updatedAt: string };
  vehicleInfo?: {
    model: string;
    plateNumber: string;
    color: string;
  };
}

/**
 * Қадами timeline барои пайгирии фармоиш
 */
export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  description?: string;
  completed: boolean;
  location?: Location;
}

/**
 * Интерфейси асосии фармоиш
 */
export interface Order {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Суроғаҳо
  pickupAddress: string;
  pickupDetails?: string;
  pickupLocation?: Location;
  
  deliveryAddress: string;
  deliveryDetails?: string;
  deliveryLocation?: Location;
  
  // Маълумоти гиранда
  recipientName: string;
  recipientPhone: string;
  
  // Тавсифи бор
  packageType: PackageType;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  description?: string;
  isFragile: boolean;
  requiresSignature: boolean;
  
  // Нарх ва пардохт
  price: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  
  // Санаи тахминии расонидан
  estimatedPickup?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Курйер
  courier?: CourierInfo;
  courierId?: string;
  
  // Timeline барои пайгирӣ
  timeline: OrderTimelineStep[];
  
  // Масири тайшуда ё банақшагирифта
  route?: Array<[number, number]>;
  
  // Баҳо ва шарҳ
  rating?: number;
  review?: string;
  
  // Сабаби бекоркунӣ (агар статус cancelled бошад)
  cancellationReason?: string;
}

/**
 * Дархости эҷоди фармоиши нав
 */
export interface CreateOrderRequest {
  pickupAddress: string;
  pickupDetails?: string;
  deliveryAddress: string;
  deliveryDetails?: string;
  
  recipientName: string;
  recipientPhone: string;
  
  packageType: PackageType;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  description?: string;
  isFragile?: boolean;
  requiresSignature?: boolean;
  
  paymentMethod: PaymentMethod;
  promoCode?: string;
  savedCardId?: string;
  
  scheduledPickup?: string;
  scheduledDelivery?: string;
}

/**
 * Дархости навсозии фармоиш
 */
export interface UpdateOrderRequest {
  pickupAddress?: string;
  pickupDetails?: string;
  deliveryAddress?: string;
  deliveryDetails?: string;
  recipientName?: string;
  recipientPhone?: string;
  packageType?: PackageType;
  weight?: number;
  dimensions?: Dimensions;
  description?: string;
  isFragile?: boolean;
  requiresSignature?: boolean;
  paymentMethod?: PaymentMethod;
}

/**
 * Филтр барои гирифтани рӯйхати фармоишҳо
 */
export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  courierId?: string;
  clientId?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Маълумоти пайгирии фармоиш
 */
export interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  status: OrderStatus;
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
  timeline: OrderTimelineStep[];
  route?: Array<[number, number]>;
}

/**
 * Таърихи фармоиш (барои сабти рӯйдодҳо)
 */
export interface OrderHistory {
  id: string;
  orderId: string;
  action: string;
  description: string;
  userId?: string;
  userType?: 'client' | 'courier' | 'admin' | 'system';
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Дархости бекор кардани фармоиш
 */
export interface CancelOrderRequest {
  reason?: string;
}

/**
 * Дархости баҳо додан ба фармоиш
 */
export interface RateOrderRequest {
  rating: number;
  comment?: string;
}

/**
 * Омори фармоишҳои корбар
 */
export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageRating?: number;
}

/**
 * Омори умумии фармоишҳо (барои админ)
 */
export interface GlobalOrderStats extends OrderStats {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: Array<{ date: string; amount: number }>;
}

/**
 * Ҷавоби ҳисобкунии нархи тахминӣ
 */
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

/**
 * Дархости ҳисобкунии нархи тахминӣ
 */
export interface CalculateEstimateRequest {
  pickupLocation: Location;
  deliveryLocation: Location;
  packageType: PackageType;
  weight: number;
  dimensions?: Dimensions;
  items?: OrderItem[];
  isFragile?: boolean;
  promoCode?: string;
}

/**
 * Маълумоти шаҳрҳои дастрас
 */
export interface AvailableCity {
  id: string;
  name: string;
  region: string;
  isActive: boolean;
  minDeliveryTime?: number;
  maxDeliveryTime?: number;
}

/**
 * Ҷавоби санҷиши имконияти расонидан
 */
export interface DeliveryAvailabilityResponse {
  available: boolean;
  estimatedTime?: number;
  minPrice?: number;
  message?: string;
}
