// Tojrason/frontend/shared/types/payment.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Намуди усули пардохт
 */
export type PaymentMethod = 'cash' | 'card' | 'wallet';

/**
 * Статуси пардохт
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Интерфейси асосии пардохт
 */
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  receiptUrl?: string;
  refundReason?: string;
  refundedAt?: string;
  refundedAmount?: number;
}

/**
 * Корти захирашуда
 */
export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Дархости эҷоди пардохт
 */
export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  cardId?: string;
  saveCard?: boolean;
  promoCode?: string;
}

/**
 * Ҷавоби эҷоди пардохт
 */
export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

/**
 * Дархости илова кардани корт
 */
export interface AddCardRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isDefault?: boolean;
}

/**
 * Дархости баргардонидани пардохт
 */
export interface ProcessRefundRequest {
  amount?: number;
  reason: string;
}

/**
 * Ҷавоби баргардонидани пардохт
 */
export interface RefundResponse {
  refundId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

/**
 * Филтр барои рӯйхати пардохтҳо
 */
export interface PaymentFilter {
  status?: PaymentStatus;
  method?: PaymentMethod;
  orderId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Омори пардохтҳо
 */
export interface PaymentStats {
  totalSpent: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
}

/**
 * Квитансияи пардохт
 */
export interface PaymentReceipt {
  paymentId: string;
  orderId: string;
  trackingNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

/**
 * Таърихи пардохт
 */
export interface PaymentHistory {
  id: string;
  paymentId: string;
  action: string;
  description: string;
  userId?: string;
  timestamp: string;
}

/**
 * Бақияи ҳамёни дохилӣ
 */
export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

/**
 * Тасдиқи коди промо
 */
export interface PromoCodeValidation {
  valid: boolean;
  discount?: number;
  discountType?: 'percent' | 'fixed';
  message?: string;
}

/**
 * Истифодаи коди промо
 */
export interface PromoCodeApplication {
  discount: number;
  newTotal: number;
}

/**
 * Қурби асъор
 */
export interface ExchangeRate {
  rate: number;
  timestamp: string;
}

/**
 * Табдили асъор
 */
export interface CurrencyConversion {
  amount: number;
  rate: number;
}

/**
 * Дархости пардохт бо пули нақд
 */
export interface CashPaymentRequest {
  orderId: string;
  amount: number;
}

/**
 * Дархости пардохт бо ҳамёни электронӣ
 */
export interface WalletPaymentRequest {
  orderId: string;
  amount: number;
  walletType?: 'alif' | 'somoni' | 'internal';
}

/**
 * Дархости илова кардани маблағ ба ҳамён
 */
export interface AddFundsRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  cardId?: string;
}

/**
 * Танзимоти пардохтҳо (барои админ)
 */
export interface PaymentSettings {
  minOrderAmount: number;
  maxOrderAmount: number;
  cashEnabled: boolean;
  cardEnabled: boolean;
  walletEnabled: boolean;
  currency: string;
  taxRate: number;
  commissionRate: number;
}

/**
 * Омори умумии пардохтҳо (барои админ)
 */
export interface GlobalPaymentStats extends PaymentStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  revenueByMethod: Record<PaymentMethod, number>;
  revenueByDay: Array<{ date: string; amount: number }>;
  pendingWithdrawals: number;
  totalWithdrawals: number;
}

/**
 * Дархости баровардани маблағ (барои курйер)
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
 * Таърихи баровардани маблағ
 */
export interface WithdrawalHistory {
  id: string;
  amount: number;
  method: string;
  status: string;
  requestDate: string;
  completionDate?: string;
  rejectionReason?: string;
}
