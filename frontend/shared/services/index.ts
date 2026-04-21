// Tojrason/frontend/shared/services/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== API ==========
export * from './api';

// ========== AUTH SERVICE ==========
export {
  default as AuthService,
  createAuthService,
} from './auth.service';
export type {
  IAuthService,
  AuthServiceConfig,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  PhoneLoginRequest,
  VerifyPhoneRequest,
} from './auth.service';

// ========== USER SERVICE ==========
export {
  default as UserService,
  createUserService,
} from './user.service';
export type {
  IUserService,
  UserServiceConfig,
  User,
  UserFilter,
  UpdateUserRequest,
  CreateUserRequest,
  UserStats,
} from './user.service';

// ========== ORDER SERVICE ==========
export {
  default as OrderService,
  createOrderService,
} from './order.service';
export type {
  IOrderService,
  OrderServiceConfig,
  Order,
  Location,
  Dimensions,
  OrderItem,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilter,
  OrderTracking,
  OrderStats,
  OrderEstimateRequest,
  OrderEstimateResponse,
} from './order.service';

// ========== COURIER SERVICE ==========
export {
  default as CourierService,
  createCourierService,
} from './courier.service';
export type {
  ICourierService,
  CourierServiceConfig,
  CourierStatus,
  VehicleType,
  Vehicle,
  CourierDocuments,
  CourierSettings,
  WorkSchedule,
  CourierProfile,
  CourierEarnings,
  CourierStats,
  EarningsDetails,
  EarningsBreakdownItem,
  CourierRating,
  RecentReview,
  TodayActivity,
  WorkShift,
  CourierFilter,
} from './courier.service';

// ========== PAYMENT SERVICE ==========
export {
  default as PaymentService,
  createPaymentService,
} from './payment.service';
export type {
  IPaymentService,
  PaymentServiceConfig,
  Payment,
  PaymentMethod,
  PaymentStatus,
  SavedCard,
  CreatePaymentRequest,
  CreatePaymentResponse,
  AddCardRequest,
  ProcessRefundRequest,
  RefundResponse,
  PaymentFilter,
  PaymentStats,
  PaymentReceipt,
  WalletBalance,
  PromoCodeValidation,
} from './payment.service';
