// Tojrason/frontend/client/src/api/payments.api.ts

import axiosInstance from './axios.config';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentHistory,
  PaymentStats,
  CardInfo,
  SavedCard,
  AddCardRequest,
  ProcessRefundRequest,
  RefundResponse,
  PaymentFilter,
  PaymentReceipt,
} from '../../types/payment.types';

export const paymentsApi = {
  /**
   * Эҷоди пардохти нав
   * @param data - Маълумоти пардохт
   * @returns CreatePaymentResponse - Ҷавоб бо URL барои пардохт
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await axiosInstance.post<CreatePaymentResponse>('/payments', data);
    return response.data;
  },

  /**
   * Гирифтани рӯйхати пардохтҳои корбар
   * @param filter - Филтр барои пардохтҳо
   * @returns Payment[] - Рӯйхати пардохтҳо
   */
  async getPayments(filter?: PaymentFilter): Promise<Payment[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.paymentMethod) params.append('paymentMethod', filter.paymentMethod);
      if (filter.fromDate) params.append('fromDate', filter.fromDate.toISOString());
      if (filter.toDate) params.append('toDate', filter.toDate.toISOString());
      if (filter.orderId) params.append('orderId', filter.orderId);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
    }
    
    const response = await axiosInstance.get<Payment[]>(`/payments?${params.toString()}`);
    return response.data;
  },

  /**
   * Гирифтани пардохт бо ID
   * @param paymentId - ID-и пардохт
   * @returns Payment - Маълумоти пардохт
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await axiosInstance.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Гирифтани пардохтҳои фармоиш
   * @param orderId - ID-и фармоиш
   * @returns Payment[] - Пардохтҳои фармоиш
   */
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    const response = await axiosInstance.get<Payment[]>(`/payments/order/${orderId}`);
    return response.data;
  },

  /**
   * Тасдиқи пардохт (Webhook аз тарафи сервер иҷро мешавад)
   * @param paymentId - ID-и пардохт
   * @returns Payment - Пардохти тасдиқшуда
   */
  async confirmPayment(paymentId: string): Promise<Payment> {
    const response = await axiosInstance.post<Payment>(`/payments/${paymentId}/confirm`);
    return response.data;
  },

  /**
   * Бекор кардани пардохт
   * @param paymentId - ID-и пардохт
   * @param reason - Сабаби бекоркунӣ
   */
  async cancelPayment(paymentId: string, reason?: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/payments/${paymentId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Баргардонидани пардохт (Refund)
   * @param paymentId - ID-и пардохт
   * @param data - Маълумоти баргардонӣ
   * @returns RefundResponse - Натиҷаи баргардонӣ
   */
  async refundPayment(paymentId: string, data: ProcessRefundRequest): Promise<RefundResponse> {
    const response = await axiosInstance.post<RefundResponse>(`/payments/${paymentId}/refund`, data);
    return response.data;
  },

  /**
   * Гирифтани усулҳои пардохти дастрас
   * @returns PaymentMethod[] - Рӯйхати усулҳои пардохт
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axiosInstance.get<PaymentMethod[]>('/payments/methods');
    return response.data;
  },

  /**
   * Илова кардани корти нав
   * @param data - Маълумоти корт
   * @returns SavedCard - Корти захирашуда
   */
  async addCard(data: AddCardRequest): Promise<SavedCard> {
    const response = await axiosInstance.post<SavedCard>('/payments/cards', data);
    return response.data;
  },

  /**
   * Гирифтани рӯйхати кортҳои захирашуда
   * @returns SavedCard[] - Рӯйхати кортҳо
   */
  async getSavedCards(): Promise<SavedCard[]> {
    const response = await axiosInstance.get<SavedCard[]>('/payments/cards');
    return response.data;
  },

  /**
   * Нест кардани корти захирашуда
   * @param cardId - ID-и корт
   */
  async deleteCard(cardId: string): Promise<void> {
    await axiosInstance.delete(`/payments/cards/${cardId}`);
  },

  /**
   * Танзими корт ҳамчун корти асосӣ
   * @param cardId - ID-и корт
   */
  async setDefaultCard(cardId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/payments/cards/${cardId}/default`);
    return response.data;
  },

  /**
   * Гирифтани таърихи пардохтҳо
   * @returns PaymentHistory[] - Таърихи пардохтҳо
   */
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    const response = await axiosInstance.get<PaymentHistory[]>('/payments/history');
    return response.data;
  },

  /**
   * Гирифтани омори пардохтҳо
   * @returns PaymentStats - Омори пардохтҳо
   */
  async getPaymentStats(): Promise<PaymentStats> {
    const response = await axiosInstance.get<PaymentStats>('/payments/stats');
    return response.data;
  },

  /**
   * Гирифтани квитансияи пардохт
   * @param paymentId - ID-и пардохт
   * @returns PaymentReceipt - Квитансия
   */
  async getPaymentReceipt(paymentId: string): Promise<PaymentReceipt> {
    const response = await axiosInstance.get<PaymentReceipt>(`/payments/${paymentId}/receipt`);
    return response.data;
  },

  /**
   * Боргирии квитансия дар формати PDF
   * @param paymentId - ID-и пардохт
   * @returns Blob - Файли PDF
   */
  async downloadReceiptPDF(paymentId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/payments/${paymentId}/receipt/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Фиристодани квитансия ба email
   * @param paymentId - ID-и пардохт
   * @param email - Email барои фиристодан
   */
  async sendReceiptToEmail(paymentId: string, email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/payments/${paymentId}/receipt/send`, { email });
    return response.data;
  },

  /**
   * Пардохт тавассути корти захирашуда
   * @param cardId - ID-и корти захирашуда
   * @param amount - Маблағ
   * @param orderId - ID-и фармоиш
   * @returns CreatePaymentResponse - Ҷавоб
   */
  async payWithSavedCard(
    cardId: string,
    amount: number,
    orderId: string
  ): Promise<CreatePaymentResponse> {
    const response = await axiosInstance.post<CreatePaymentResponse>('/payments/card', {
      cardId,
      amount,
      orderId,
    });
    return response.data;
  },

  /**
   * Пардохт тавассути пули нақд ҳангоми расонидан
   * @param orderId - ID-и фармоиш
   * @param amount - Маблағ
   */
  async payWithCash(orderId: string, amount: number): Promise<Payment> {
    const response = await axiosInstance.post<Payment>('/payments/cash', {
      orderId,
      amount,
    });
    return response.data;
  },

  /**
   * Пардохт тавассути ҳамёни электронӣ
   * @param orderId - ID-и фармоиш
   * @param amount - Маблағ
   * @param walletType - Намуди ҳамён (e.g., 'alif', 'somoni')
   */
  async payWithWallet(
    orderId: string,
    amount: number,
    walletType: string
  ): Promise<CreatePaymentResponse> {
    const response = await axiosInstance.post<CreatePaymentResponse>('/payments/wallet', {
      orderId,
      amount,
      walletType,
    });
    return response.data;
  },

  /**
   * Текшири статуси пардохт
   * @param paymentId - ID-и пардохт
   * @returns PaymentStatus - Статуси пардохт
   */
  async checkPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus }> {
    const response = await axiosInstance.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  /**
   * Гирифтани маблағи умумии пардохтшуда
   * @returns Маблағи умумӣ
   */
  async getTotalSpent(): Promise<{ total: number; currency: string }> {
    const response = await axiosInstance.get('/payments/total-spent');
    return response.data;
  },

  /**
   * Илова кардани маблағ ба ҳамёни дохилӣ
   * @param amount - Маблағ
   * @param paymentMethod - Усули пардохт
   */
  async addFundsToWallet(
    amount: number,
    paymentMethod: PaymentMethod
  ): Promise<CreatePaymentResponse> {
    const response = await axiosInstance.post<CreatePaymentResponse>('/payments/wallet/add-funds', {
      amount,
      paymentMethod,
    });
    return response.data;
  },

  /**
   * Гирифтани бақияи ҳамёни дохилӣ
   */
  async getWalletBalance(): Promise<{ balance: number; currency: string }> {
    const response = await axiosInstance.get('/payments/wallet/balance');
    return response.data;
  },

  /**
   * Пардохт аз ҳамёни дохилӣ
   * @param orderId - ID-и фармоиш
   * @param amount - Маблағ
   */
  async payFromWallet(orderId: string, amount: number): Promise<Payment> {
    const response = await axiosInstance.post<Payment>('/payments/wallet/pay', {
      orderId,
      amount,
    });
    return response.data;
  },

  /**
   * Текшири коди промо
   * @param code - Коди промо
   */
  async validatePromoCode(code: string): Promise<{
    valid: boolean;
    discount?: number;
    discountType?: 'percent' | 'fixed';
    message?: string;
  }> {
    const response = await axiosInstance.post('/payments/promo/validate', { code });
    return response.data;
  },

  /**
   * Истифодаи коди промо
   * @param code - Коди промо
   * @param orderId - ID-и фармоиш
   */
  async applyPromoCode(code: string, orderId: string): Promise<{
    discount: number;
    newTotal: number;
  }> {
    const response = await axiosInstance.post('/payments/promo/apply', {
      code,
      orderId,
    });
    return response.data;
  },

  /**
   * Гирифтани қурби асъор
   * @param from - Асъори аслӣ
   * @param to - Асъори мақсад
   */
  async getExchangeRate(from: string, to: string): Promise<{
    rate: number;
    timestamp: string;
  }> {
    const response = await axiosInstance.get(`/payments/exchange-rate?from=${from}&to=${to}`);
    return response.data;
  },

  /**
   * Табдил додани маблағ
   * @param amount - Маблағ
   * @param from - Асъори аслӣ
   * @param to - Асъори мақсад
   */
  async convertCurrency(amount: number, from: string, to: string): Promise<{
    amount: number;
    rate: number;
  }> {
    const response = await axiosInstance.post('/payments/convert', {
      amount,
      from,
      to,
    });
    return response.data;
  },
};

// Export кардани функсияҳои алоҳида
export const {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByOrder,
  confirmPayment,
  cancelPayment,
  refundPayment,
  getAvailablePaymentMethods,
  addCard,
  getSavedCards,
  deleteCard,
  setDefaultCard,
  getPaymentHistory,
  getPaymentStats,
  getPaymentReceipt,
  downloadReceiptPDF,
  sendReceiptToEmail,
  payWithSavedCard,
  payWithCash,
  payWithWallet,
  checkPaymentStatus,
  getTotalSpent,
  addFundsToWallet,
  getWalletBalance,
  payFromWallet,
  validatePromoCode,
  applyPromoCode,
  getExchangeRate,
  convertCurrency,
} = paymentsApi;

export default paymentsApi;
