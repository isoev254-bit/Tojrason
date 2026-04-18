// Tojrason/frontend/client/src/store/slices/paymentSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Намудҳои марбут ба пардохт
export type PaymentMethod = 'cash' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

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

export interface SavedCard {
  id: string;
  last4: string;
  brand: string; // visa, mastercard, etc.
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentFilter {
  status?: PaymentStatus | '';
  method?: PaymentMethod | '';
  fromDate?: string;
  toDate?: string;
  orderId?: string;
  page: number;
  limit: number;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface PaymentStats {
  totalSpent: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
}

export interface PromoCodeInfo {
  code: string;
  valid: boolean;
  discount?: number;
  discountType?: 'percent' | 'fixed';
  message?: string;
}

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  savedCards: SavedCard[];
  walletBalance: WalletBalance | null;
  paymentStats: PaymentStats | null;
  promoCode: PromoCodeInfo | null;
  filters: PaymentFilter;
  totalPayments: number;
  totalPages: number;
  isLoading: boolean;
  isProcessing: boolean;
  isCreating: boolean;
  error: string | null;
}

// Ҳолати аввала
const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  savedCards: [],
  walletBalance: null,
  paymentStats: null,
  promoCode: null,
  filters: {
    status: '',
    method: '',
    fromDate: '',
    toDate: '',
    orderId: '',
    page: 1,
    limit: 10,
  },
  totalPayments: 0,
  totalPages: 1,
  isLoading: false,
  isProcessing: false,
  isCreating: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // ========== Танзими ҳолати боргузорӣ ==========
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    setCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isProcessing = false;
      state.isCreating = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // ========== Идоракунии рӯйхати пардохтҳо ==========
    setPayments: (state, action: PayloadAction<{ payments: Payment[]; total: number; totalPages: number }>) => {
      state.payments = action.payload.payments;
      state.totalPayments = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.isLoading = false;
      state.error = null;
    },

    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
      state.totalPayments += 1;
    },

    updatePaymentInList: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },

    clearPayments: (state) => {
      state.payments = [];
      state.totalPayments = 0;
      state.totalPages = 1;
    },

    // ========== Филтрҳо ==========
    setFilter: (state, action: PayloadAction<Partial<PaymentFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = {
        status: '',
        method: '',
        fromDate: '',
        toDate: '',
        orderId: '',
        page: 1,
        limit: 10,
      };
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },

    // ========== Пардохти ҷорӣ ==========
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateCurrentPayment: (state, action: PayloadAction<Partial<Payment>>) => {
      if (state.currentPayment) {
        state.currentPayment = { ...state.currentPayment, ...action.payload };
        
        // Ҳамзамон навсозӣ дар рӯйхат
        const index = state.payments.findIndex(p => p.id === state.currentPayment?.id);
        if (index !== -1) {
          state.payments[index] = state.currentPayment;
        }
      }
    },

    updatePaymentStatus: (state, action: PayloadAction<{ paymentId: string; status: PaymentStatus }>) => {
      const { paymentId, status } = action.payload;
      
      if (state.currentPayment?.id === paymentId) {
        state.currentPayment.status = status;
        state.currentPayment.updatedAt = new Date().toISOString();
      }
      
      const index = state.payments.findIndex(p => p.id === paymentId);
      if (index !== -1) {
        state.payments[index].status = status;
        state.payments[index].updatedAt = new Date().toISOString();
      }
    },

    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },

    // ========== Пардохти муваффақ ==========
    paymentSuccess: (state, action: PayloadAction<Payment>) => {
      state.currentPayment = action.payload;
      state.isProcessing = false;
      state.isCreating = false;
      state.error = null;
    },

    // ========== Пардохти ноком ==========
    paymentFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.isCreating = false;
    },

    // ========== Корти захирашуда ==========
    setSavedCards: (state, action: PayloadAction<SavedCard[]>) => {
      state.savedCards = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    addSavedCard: (state, action: PayloadAction<SavedCard>) => {
      state.savedCards.push(action.payload);
    },

    removeSavedCard: (state, action: PayloadAction<string>) => {
      state.savedCards = state.savedCards.filter(card => card.id !== action.payload);
    },

    setDefaultCard: (state, action: PayloadAction<string>) => {
      state.savedCards.forEach(card => {
        card.isDefault = card.id === action.payload;
      });
    },

    // ========== Бақияи ҳамён ==========
    setWalletBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.walletBalance = action.payload;
    },

    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.walletBalance) {
        state.walletBalance.balance = action.payload;
        state.walletBalance.lastUpdated = new Date().toISOString();
      }
    },

    // ========== Омори пардохтҳо ==========
    setPaymentStats: (state, action: PayloadAction<PaymentStats>) => {
      state.paymentStats = action.payload;
    },

    // ========== Коди промо ==========
    setPromoCode: (state, action: PayloadAction<PromoCodeInfo | null>) => {
      state.promoCode = action.payload;
    },

    clearPromoCode: (state) => {
      state.promoCode = null;
    },

    // ========== Баргардонидани пардохт (Refund) ==========
    refundSuccess: (state, action: PayloadAction<{ paymentId: string; refundedAt: string }>) => {
      const { paymentId, refundedAt } = action.payload;
      
      const refundPayment = (payment: Payment | null) => {
        if (payment?.id === paymentId) {
          payment.status = 'refunded';
          payment.refundedAt = refundedAt;
          payment.updatedAt = new Date().toISOString();
        }
      };
      
      refundPayment(state.currentPayment);
      
      const index = state.payments.findIndex(p => p.id === paymentId);
      if (index !== -1) {
        state.payments[index].status = 'refunded';
        state.payments[index].refundedAt = refundedAt;
        state.payments[index].updatedAt = new Date().toISOString();
      }
    },
  },
});

// Export кардани амалҳо
export const {
  setLoading,
  setProcessing,
  setCreating,
  setError,
  clearError,
  setPayments,
  addPayment,
  updatePaymentInList,
  clearPayments,
  setFilter,
  resetFilters,
  setPage,
  setCurrentPayment,
  updateCurrentPayment,
  updatePaymentStatus,
  clearCurrentPayment,
  paymentSuccess,
  paymentFailure,
  setSavedCards,
  addSavedCard,
  removeSavedCard,
  setDefaultCard,
  setWalletBalance,
  updateWalletBalance,
  setPaymentStats,
  setPromoCode,
  clearPromoCode,
  refundSuccess,
} = paymentSlice.actions;

// ========== Selectorҳо ==========
export const selectPaymentState = (state: RootState) => state.payments;

export const selectPayments = (state: RootState) => state.payments.payments;
export const selectTotalPayments = (state: RootState) => state.payments.totalPayments;
export const selectTotalPages = (state: RootState) => state.payments.totalPages;

export const selectCurrentPayment = (state: RootState) => state.payments.currentPayment;

export const selectPaymentFilters = (state: RootState) => state.payments.filters;

export const selectSavedCards = (state: RootState) => state.payments.savedCards;
export const selectDefaultCard = (state: RootState) => 
  state.payments.savedCards.find(card => card.isDefault);

export const selectWalletBalance = (state: RootState) => state.payments.walletBalance;
export const selectPaymentStats = (state: RootState) => state.payments.paymentStats;
export const selectPromoCode = (state: RootState) => state.payments.promoCode;

export const selectIsLoading = (state: RootState) => state.payments.isLoading;
export const selectIsProcessing = (state: RootState) => state.payments.isProcessing;
export const selectIsCreating = (state: RootState) => state.payments.isCreating;
export const selectPaymentError = (state: RootState) => state.payments.error;

// Selector барои гирифтани пардохт бо ID
export const selectPaymentById = (paymentId: string) => (state: RootState) =>
  state.payments.payments.find(payment => payment.id === paymentId) ||
  (state.payments.currentPayment?.id === paymentId ? state.payments.currentPayment : null);

// Selector барои пардохтҳои фармоиши мушаххас
export const selectPaymentsByOrderId = (orderId: string) => (state: RootState) =>
  state.payments.payments.filter(payment => payment.orderId === orderId);

// Selector барои пардохтҳои муваффақ
export const selectSuccessfulPayments = (state: RootState) =>
  state.payments.payments.filter(payment => payment.status === 'completed');

// Selector барои ҳисоб кардани маблағи умумии пардохтшуда
export const selectTotalSpent = (state: RootState) =>
  state.payments.payments
    .filter(p => p.status === 'completed')
    .reduce((total, p) => total + p.amount, 0);

export default paymentSlice.reducer;
