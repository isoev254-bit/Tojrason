// Tojrason/frontend/client/src/types/auth.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Нақшҳои корбар дар система
 */
export enum UserRole {
  CLIENT = 'client',
  COURIER = 'courier',
  ADMIN = 'admin',
}

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
 * Маълумоти воридшавӣ
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Маълумоти бақайдгирии корбари нав
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: UserRole;
}

/**
 * Ҷавоби сервер пас аз аутентификатсияи муваффақ
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

/**
 * Сохтори токени дастрасӣ (JWT payload)
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

/**
 * Дархости навсозии токен
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Ҷавоби навсозии токен
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Дархости тағйири парол
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Дархости барқароркунии парол
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Дархости тасдиқи барқароркунии парол
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Дархости тасдиқи email
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Ҷавоб барои санҷиши мавҷудияти email/телефон
 */
export interface ExistenceCheckResponse {
  exists: boolean;
  message?: string;
}

/**
 * Дархости воридшавӣ тавассути Google/Facebook
 */
export interface SocialLoginRequest {
  token: string;
  provider: 'google' | 'facebook';
}

/**
 * Дархости воридшавӣ тавассути телефон
 */
export interface PhoneLoginRequest {
  phoneNumber: string;
}

/**
 * Ҷавоб ба дархости воридшавӣ тавассути телефон
 */
export interface PhoneLoginResponse {
  message: string;
  codeSent: boolean;
  expiresIn?: number;
}

/**
 * Дархости тасдиқи воридшавӣ тавассути телефон
 */
export interface VerifyPhoneRequest {
  phoneNumber: string;
  code: string;
}

/**
 * Ҷавоби тасдиқи воридшавӣ тавассути телефон
 */
export interface VerifyPhoneResponse extends AuthResponse {}

/**
 * Намуди хатогии API
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Намуди ҷавоби умумии API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}
