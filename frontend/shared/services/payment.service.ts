// Tojrason/frontend/shared/services/payment.service.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { ApiClient, PaginatedResponse, FilterParams } from './api/apiClient';

// Намудҳои пардохт
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
}

export type PaymentMethod = 'cash' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  cardId?: string;
  saveCard?: boolean;
  promoCode?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface AddCardRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isDefault?: boolean;
}

export interface ProcessRefundRequest {
  amount?: number;
  reason: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface PaymentFilter extends FilterParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  orderId?: string;
}

export interface PaymentStats {
  totalSpent: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
}

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

export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  discount?: number;
  discountType?: 'percent' | 'fixed';
  message?: string;
}

// Конфигуратсияи сервис
export interface PaymentServiceConfig {
  apiClient: ApiClient;
  endpoints?: {
    payments?: string;
    paymentById?: string;
    paymentByOrder?: string;
    confirm?: string;
    cancel?: string;
    refund?: string;
    methods?: string;
    cards?: string;
    cardById?: string;
    default?: string;
    history?: string;
    stats?: string;
    receipt?: string;
    cash?: string;
    wallet?: string;
    walletBalance?: string;
    walletPay?: string;
    walletAddFunds?: string;
    promoValidate?: string;
    promoApply?: string;
    exchangeRate?: string;
    convert?: string;
    totalSpent?: string;
  };
}

// Интерфейси сервис
export interface IPaymentService {
  createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  getPayments(filter?: PaymentFilter): Promise<PaginatedResponse<Payment>>;
  getPaymentById(paymentId: string): Promise<Payment>;
  getPaymentsByOrder(orderId: string): Promise<Payment[]>;
  confirmPayment(paymentId: string): Promise<Payment>;
  cancelPayment(paymentId: string, reason?: string): Promise<{ message: string }>;
  refundPayment(paymentId: string, data: ProcessRefundRequest): Promise<RefundResponse>;
  getAvailablePaymentMethods(): Promise<PaymentMethod[]>;
  addCard(data: AddCardRequest): Promise<SavedCard>;
  getSavedCards(): Promise<SavedCard[]>;
  deleteCard(cardId: string): Promise<void>;
  setDefaultCard(cardId: string): Promise<{ message: string }>;
  getPaymentHistory(): Promise<any[]>;
  getPaymentStats(): Promise<PaymentStats>;
  getPaymentReceipt(paymentId: string): Promise<PaymentReceipt>;
  downloadReceiptPDF(paymentId: string): Promise<Blob>;
  sendReceiptToEmail(paymentId: string, email: string): Promise<{ message: string }>;
  payWithSavedCard(cardId: string, amount: number, orderId: string): Promise<CreatePaymentResponse>;
  payWithCash(orderId: string, amount: number): Promise<Payment>;
  payWithWallet(orderId: string, amount: number, walletType?: string): Promise<CreatePaymentResponse>;
  checkPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus }>;
  getTotalSpent(): Promise<{ total: number; currency: string }>;
  addFundsToWallet(amount: number, paymentMethod: PaymentMethod): Promise<CreatePaymentResponse>;
  getWalletBalance(): Promise<WalletBalance>;
  payFromWallet(orderId: string, amount: number): Promise<Payment>;
  validatePromoCode(code: string): Promise<PromoCodeValidation>;
  applyPromoCode(code: string, orderId: string): Promise<{ discount: number; newTotal: number }>;
  getExchangeRate(from: string, to: string): Promise<{ rate: number; timestamp: string }>;
  convertCurrency(amount: number, from: string, to: string): Promise<{ amount: number; rate: number }>;
}

/**
 * Сервиси пардохтҳо
 */
export class PaymentService implements IPaymentService {
  private apiClient: ApiClient;
  private endpoints: Required<PaymentServiceConfig['endpoints']>;

  constructor(config: PaymentServiceConfig) {
    this.apiClient = config.apiClient;
    this.endpoints = {
      payments: '/payments',
      paymentById: '/payments',
      paymentByOrder: '/payments/order',
      confirm: '/confirm',
      cancel: '/cancel',
      refund: '/refund',
      methods: '/payments/methods',
      cards: '/payments/cards',
      cardById: '/payments/cards',
      default: '/default',
      history: '/payments/history',
      stats: '/payments/stats',
      receipt: '/receipt',
      cash: '/payments/cash',
      wallet: '/payments/wallet',
      walletBalance: '/payments/wallet/balance',
      walletPay: '/payments/wallet/pay',
      walletAddFunds: '/payments/wallet/add-funds',
      promoValidate: '/payments/promo/validate',
      promoApply: '/payments/promo/apply',
      exchangeRate: '/payments/exchange-rate',
      convert: '/payments/convert',
      totalSpent: '/payments/total-spent',
      ...config.endpoints,
    };
  }

  /**
   * Эҷоди пардохти нав
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return this.apiClient.post<CreatePaymentResponse>(this.endpoints.payments, data);
  }

  /**
   * Гирифтани рӯйхати пардохтҳо
   */
  async getPayments(filter?: PaymentFilter): Promise<PaginatedResponse<Payment>> {
    return this.apiClient.getPaginated<Payment>(this.endpoints.payments, filter);
  }

  /**
   * Гирифтани пардохт бо ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    return this.apiClient.get<Payment>(`${this.endpoints.paymentById}/${paymentId}`);
  }

  /**
   * Гирифтани пардохтҳои фармоиш
   */
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.apiClient.get<Payment[]>(`${this.endpoints.paymentByOrder}/${orderId}`);
  }

  /**
   * Тасдиқи пардохт
   */
  async confirmPayment(paymentId: string): Promise<Payment> {
    return this.apiClient.post<Payment>(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.confirm}`);
  }

  /**
   * Бекор кардани пардохт
   */
  async cancelPayment(paymentId: string, reason?: string): Promise<{ message: string }> {
    return this.apiClient.post(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.cancel}`, { reason });
  }

  /**
   * Баргардонидани пардохт
   */
  async refundPayment(paymentId: string, data: ProcessRefundRequest): Promise<RefundResponse> {
    return this.apiClient.post<RefundResponse>(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.refund}`, data);
  }

  /**
   * Гирифтани усулҳои пардохти дастрас
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    return this.apiClient.get<PaymentMethod[]>(this.endpoints.methods);
  }

  /**
   * Илова кардани корти нав
   */
  async addCard(data: AddCardRequest): Promise<SavedCard> {
    return this.apiClient.post<SavedCard>(this.endpoints.cards, data);
  }

  /**
   * Гирифтани рӯйхати кортҳои захирашуда
   */
  async getSavedCards(): Promise<SavedCard[]> {
    return this.apiClient.get<SavedCard[]>(this.endpoints.cards);
  }

  /**
   * Нест кардани корти захирашуда
   */
  async deleteCard(cardId: string): Promise<void> {
    await this.apiClient.delete(`${this.endpoints.cardById}/${cardId}`);
  }

  /**
   * Танзими корт ҳамчун корти асосӣ
   */
  async setDefaultCard(cardId: string): Promise<{ message: string }> {
    return this.apiClient.post(`${this.endpoints.cardById}/${cardId}${this.endpoints.default}`);
  }

  /**
   * Гирифтани таърихи пардохтҳо
   */
  async getPaymentHistory(): Promise<any[]> {
    return this.apiClient.get<any[]>(this.endpoints.history);
  }

  /**
   * Гирифтани омори пардохтҳо
   */
  async getPaymentStats(): Promise<PaymentStats> {
    return this.apiClient.get<PaymentStats>(this.endpoints.stats);
  }

  /**
   * Гирифтани квитансияи пардохт
   */
  async getPaymentReceipt(paymentId: string): Promise<PaymentReceipt> {
    return this.apiClient.get<PaymentReceipt>(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.receipt}`);
  }

  /**
   * Боргирии квитансия дар формати PDF
   */
  async downloadReceiptPDF(paymentId: string): Promise<Blob> {
    return this.apiClient.getAxiosInstance().get(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.receipt}/pdf`, {
      responseType: 'blob',
    }).then(response => response.data);
  }

  /**
   * Фиристодани квитансия ба email
   */
  async sendReceiptToEmail(paymentId: string, email: string): Promise<{ message: string }> {
    return this.apiClient.post(`${this.endpoints.paymentById}/${paymentId}${this.endpoints.receipt}/send`, { email });
  }

  /**
   * Пардохт тавассути корти захирашуда
   */
  async payWithSavedCard(cardId: string, amount: number, orderId: string): Promise<CreatePaymentResponse> {
    return this.apiClient.post<CreatePaymentResponse>(this.endpoints.cards, { cardId, amount, orderId });
  }

  /**
   * Пардохт бо пули нақд
   */
  async payWithCash(orderId: string, amount: number): Promise<Payment> {
    return this.apiClient.post<Payment>(this.endpoints.cash, { orderId, amount });
  }

  /**
   * Пардохт тавассути ҳамёни электронӣ
   */
  async payWithWallet(orderId: string, amount: number, walletType?: string): Promise<CreatePaymentResponse> {
    return this.apiClient.post<CreatePaymentResponse>(this.endpoints.wallet, { orderId, amount, walletType });
  }

  /**
   * Текшири статуси пардохт
   */
  async checkPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus }> {
    return this.apiClient.get(`${this.endpoints.paymentById}/${paymentId}/status`);
  }

  /**
   * Гирифтани маблағи умумии пардохтшуда
   */
  async getTotalSpent(): Promise<{ total: number; currency: string }> {
    return this.apiClient.get(this.endpoints.totalSpent);
  }

  /**
   * Илова кардани маблағ ба ҳамёни дохилӣ
   */
  async addFundsToWallet(amount: number, paymentMethod: PaymentMethod): Promise<CreatePaymentResponse> {
    return this.apiClient.post<CreatePaymentResponse>(this.endpoints.walletAddFunds, { amount, paymentMethod });
  }

  /**
   * Гирифтани бақияи ҳамёни дохилӣ
   */
  async getWalletBalance(): Promise<WalletBalance> {
    return this.apiClient.get<WalletBalance>(this.endpoints.walletBalance);
  }

  /**
   * Пардохт аз ҳамёни дохилӣ
   */
  async payFromWallet(orderId: string, amount: number): Promise<Payment> {
    return this.apiClient.post<Payment>(this.endpoints.walletPay, { orderId, amount });
  }

  /**
   * Текшири коди промо
   */
  async validatePromoCode(code: string): Promise<PromoCodeValidation> {
    return this.apiClient.post<PromoCodeValidation>(this.endpoints.promoValidate, { code });
  }

  /**
   * Истифодаи коди промо
   */
  async applyPromoCode(code: string, orderId: string): Promise<{ discount: number; newTotal: number }> {
    return this.apiClient.post(this.endpoints.promoApply, { code, orderId });
  }

  /**
   * Гирифтани қурби асъор
   */
  async getExchangeRate(from: string, to: string): Promise<{ rate: number; timestamp: string }> {
    return this.apiClient.get(`${this.endpoints.exchangeRate}?from=${from}&to=${to}`);
  }

  /**
   * Табдил додани маблағ
   */
  async convertCurrency(amount: number, from: string, to: string): Promise<{ amount: number; rate: number }> {
    return this.apiClient.post(this.endpoints.convert, { amount, from, to });
  }
}

/**
 * Эҷоди сервиси пардохтҳо
 */
export const createPaymentService = (config: PaymentServiceConfig): IPaymentService => {
  return new PaymentService(config);
};

export default PaymentService;
