// Tojrason/frontend/shared/services/api/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== AXIOS CONFIG ==========
export {
  default as createAxiosInstance,
  createAuthTokenManager,
} from './axios.config';
export type {
  AuthResponse,
  AxiosConfigOptions,
} from './axios.config';
export type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';

// ========== API CLIENT ==========
export {
  default as ApiClient,
  createApiClient,
} from './apiClient';
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  ApiClientConfig,
} from './apiClient';

// ========== AUTH SERVICE ==========
export {
  default as AuthService,
  createAuthService,
} from './auth.service';
export type {
  IAuthService,
  AuthServiceConfig,
} from './auth.service';

// ========== USER SERVICE ==========
export {
  default as UserService,
  createUserService,
} from './user.service';
export type {
  IUserService,
  UserServiceConfig,
} from './user.service';

// ========== ORDER SERVICE ==========
export {
  default as OrderService,
  createOrderService,
} from './order.service';
export type {
  IOrderService,
  OrderServiceConfig,
} from './order.service';

// ========== COURIER SERVICE ==========
export {
  default as CourierService,
  createCourierService,
} from './courier.service';
export type {
  ICourierService,
  CourierServiceConfig,
} from './courier.service';

// ========== PAYMENT SERVICE ==========
export {
  default as PaymentService,
  createPaymentService,
} from './payment.service';
export type {
  IPaymentService,
  PaymentServiceConfig,
} from './payment.service';
