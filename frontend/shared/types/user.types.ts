// Tojrason/frontend/shared/types/user.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { UserRole } from './auth.types';

/**
 * Интерфейси асосии корбар
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

/**
 * Филтр барои рӯйхати корбарон
 */
export interface UserFilter {
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Дархости навсозии корбар
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Дархости эҷоди корбар
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

/**
 * Омори корбарон
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: {
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  };
}

/**
 * Танзимоти корбар
 */
export interface UserSettings {
  language: 'tg' | 'ru' | 'en';
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  privacy: {
    showProfile: boolean;
    showPhone: boolean;
  };
}

/**
 * Маълумоти муфассали корбар (барои админ)
 */
export interface UserDetails extends User {
  settings?: UserSettings;
  stats?: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    averageRating?: number;
  };
  devices?: UserDevice[];
  activityLog?: ActivityLog[];
}

/**
 * Дастгоҳи корбар
 */
export interface UserDevice {
  id: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceName: string;
  os: string;
  browser: string;
  lastActive: string;
  ipAddress?: string;
  isCurrent: boolean;
}

/**
 * Таърихи фаъолият
 */
export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Дархости фаъол/ғайрифаъол кардани корбар
 */
export interface ToggleUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

/**
 * Дархости тасдиқи корбар
 */
export interface VerifyUserRequest {
  userId: string;
  verifyType: 'email' | 'phone';
}

/**
 * Ҷавоби амалиёти оммавӣ бо корбарон
 */
export interface BulkUserOperationResponse {
  success: boolean;
  totalProcessed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    userId: string;
    error: string;
  }>;
}
