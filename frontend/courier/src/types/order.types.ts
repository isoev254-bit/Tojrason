// Tojrason/frontend/courier/src/types/order.types.ts
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
 * Макони ҷуғрофӣ
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Маълумоти муштарӣ барои курйер
 */
export interface ClientInfo {
  id: string;
  name: string;
  phoneNumber: string;
  photo?: string;
  rating?: number;
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
 * Интерфейси асосии фармоиш (версияи умумӣ)
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
  description?: string;
  isFragile: boolean;
  requiresSignature: boolean;
  
  // Нарх ва пардохт
  price: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Санаи тахминии расонидан
  estimatedPickup?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Курйер
  courierId?: string;
  
  // Timeline барои пайгирӣ
  timeline: OrderTimelineStep[];
  
  // Масири тайшуда ё банақшагирифта
  route?: Array<[number, number]>;
}

/**
 * Фармоиши дастрас барои курйер
 */
export interface AvailableOrder {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  createdAt: string;
  pickupAddress: string;
  pickupLocation?: Location;
  deliveryAddress: string;
  deliveryLocation?: Location;
  recipientName: string;
  recipientPhone: string;
  packageType: PackageType;
  weight: number;
  price: number;
  distance: number;
  estimatedTime: number;
  estimatedPickup?: string;
  expiresAt?: string;
}

/**
 * Фармоиши қабулкардаи курйер
 */
export interface AcceptedOrder extends AvailableOrder {
  acceptedAt: string;
  client: ClientInfo;
  timeline: OrderTimelineStep[];
}

/**
 * Филтр барои гирифтани рӯйхати фармоишҳои дастрас
 */
export interface AvailableOrdersFilter {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  maxDistance?: number;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Филтр барои гирифтани рӯйхати фармоишҳои қабулкарда
 */
export interface MyOrdersFilter {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Дархости қабули фармоиш
 */
export interface AcceptOrderRequest {
  orderId: string;
}

/**
 * Дархости рад кардани фармоиш
 */
export interface RejectOrderRequest {
  orderId: string;
  reason?: string;
}

/**
 * Дархости навсозии статуси фармоиш
 */
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  note?: string;
  location?: Location;
  photo?: File;
  signature?: string;
}

/**
 * Ҷавоби қабули фармоиш
 */
export interface AcceptOrderResponse {
  success: boolean;
  order: AcceptedOrder;
  message?: string;
}

/**
 * Ҷавоби рад кардани фармоиш
 */
export interface RejectOrderResponse {
  success: boolean;
  message?: string;
}

/**
 * Ҷавоби навсозии статуси фармоиш
 */
export interface UpdateOrderStatusResponse {
  success: boolean;
  order: AcceptedOrder;
  message?: string;
}

/**
 * Омори фармоишҳои курйер
 */
export interface CourierOrderStats {
  today: {
    deliveries: number;
    earnings: number;
    distance: number;
  };
  week: {
    deliveries: number;
    earnings: number;
    distance: number;
  };
  month: {
    deliveries: number;
    earnings: number;
    distance: number;
  };
  total: {
    deliveries: number;
    earnings: number;
    distance: number;
  };
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
    location?: Location;
  };
  timeline: OrderTimelineStep[];
  route?: Array<[number, number]>;
}

/**
 * Дархости гузориши мушкилот
 */
export interface ReportIssueRequest {
  orderId: string;
  issueType: 'delay' | 'address' | 'client_unavailable' | 'damage' | 'other';
  description: string;
  photo?: File;
}

/**
 * Ҷавоби гузориши мушкилот
 */
export interface ReportIssueResponse {
  success: boolean;
  ticketId: string;
  message?: string;
}
