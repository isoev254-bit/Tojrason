// Tojrason/frontend/courier/src/store/slices/orderSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ORDER_STATUS } from '../../utils/constants';

// Намудҳои марбут ба фармоиш барои курйер
export interface CourierOrder {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pickupAddress: string;
  pickupLocation?: { lat: number; lng: number };
  deliveryAddress: string;
  deliveryLocation?: { lat: number; lng: number };
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  weight: number;
  price: number;
  distance: number;
  estimatedTime: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  timeline?: Array<{
    status: string;
    label: string;
    timestamp: string;
    completed: boolean;
  }>;
}

export interface OrderFilter {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: 'distance' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface OrderState {
  availableOrders: CourierOrder[];
  myOrders: CourierOrder[];
  currentOrder: CourierOrder | null;
  filters: OrderFilter;
  totalAvailable: number;
  totalMyOrders: number;
  isLoading: boolean;
  isAccepting: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Ҳолати аввала
const initialState: OrderState = {
  availableOrders: [],
  myOrders: [],
  currentOrder: null,
  filters: {
    status: '',
    fromDate: '',
    toDate: '',
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'distance',
    sortOrder: 'asc',
  },
  totalAvailable: 0,
  totalMyOrders: 0,
  isLoading: false,
  isAccepting: false,
  isUpdating: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // ========== Танзими ҳолати боргузорӣ ==========
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAccepting: (state, action: PayloadAction<boolean>) => {
      state.isAccepting = action.payload;
    },

    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isAccepting = false;
      state.isUpdating = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // ========== Фармоишҳои дастрас ==========
    setAvailableOrders: (state, action: PayloadAction<{ orders: CourierOrder[]; total: number }>) => {
      state.availableOrders = action.payload.orders;
      state.totalAvailable = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },

    addAvailableOrder: (state, action: PayloadAction<CourierOrder>) => {
      state.availableOrders.unshift(action.payload);
      state.totalAvailable += 1;
    },

    removeAvailableOrder: (state, action: PayloadAction<string>) => {
      state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload);
      state.totalAvailable -= 1;
    },

    clearAvailableOrders: (state) => {
      state.availableOrders = [];
      state.totalAvailable = 0;
    },

    // ========== Фармоишҳои ман ==========
    setMyOrders: (state, action: PayloadAction<{ orders: CourierOrder[]; total: number }>) => {
      state.myOrders = action.payload.orders;
      state.totalMyOrders = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },

    addMyOrder: (state, action: PayloadAction<CourierOrder>) => {
      state.myOrders.unshift(action.payload);
      state.totalMyOrders += 1;
    },

    updateMyOrder: (state, action: PayloadAction<CourierOrder>) => {
      const index = state.myOrders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.myOrders[index] = action.payload;
      }
    },

    removeMyOrder: (state, action: PayloadAction<string>) => {
      state.myOrders = state.myOrders.filter(o => o.id !== action.payload);
      state.totalMyOrders -= 1;
    },

    // ========== Филтрҳо ==========
    setFilter: (state, action: PayloadAction<Partial<OrderFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = {
        status: '',
        fromDate: '',
        toDate: '',
        search: '',
        page: 1,
        limit: 10,
        sortBy: 'distance',
        sortOrder: 'asc',
      };
    },

    // ========== Фармоиши ҷорӣ ==========
    setCurrentOrder: (state, action: PayloadAction<CourierOrder | null>) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateCurrentOrder: (state, action: PayloadAction<Partial<CourierOrder>>) => {
      if (state.currentOrder) {
        state.currentOrder = { ...state.currentOrder, ...action.payload };
        
        // Ҳамзамон навсозӣ дар рӯйхати фармоишҳои ман
        const index = state.myOrders.findIndex(o => o.id === state.currentOrder?.id);
        if (index !== -1) {
          state.myOrders[index] = state.currentOrder;
        }
      }
    },

    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
      const { orderId, status } = action.payload;
      
      // Навсозӣ дар currentOrder
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.updatedAt = new Date().toISOString();
      }
      
      // Навсозӣ дар myOrders
      const myIndex = state.myOrders.findIndex(o => o.id === orderId);
      if (myIndex !== -1) {
        state.myOrders[myIndex].status = status;
        state.myOrders[myIndex].updatedAt = new Date().toISOString();
      }
      
      // Агар фармоиш расонида ё бекор шуда бошад, аз currentOrder тоза мекунем
      if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.CANCELLED) {
        if (state.currentOrder?.id === orderId) {
          state.currentOrder = null;
        }
      }
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // ========== Қабули фармоиш ==========
    acceptOrderSuccess: (state, action: PayloadAction<CourierOrder>) => {
      // Илова ба myOrders
      state.myOrders.unshift(action.payload);
      state.totalMyOrders += 1;
      
      // Нест кардан аз availableOrders
      state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload.id);
      state.totalAvailable -= 1;
      
      // Гузоштан ҳамчун currentOrder
      state.currentOrder = action.payload;
      
      state.isAccepting = false;
      state.error = null;
    },

    // ========== Рад кардани фармоиш ==========
    rejectOrderSuccess: (state, action: PayloadAction<string>) => {
      state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload);
      state.totalAvailable -= 1;
    },

    // ========== Тасдиқи гирифтани бор ==========
    confirmPickupSuccess: (state, action: PayloadAction<CourierOrder>) => {
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
      
      const myIndex = state.myOrders.findIndex(o => o.id === action.payload.id);
      if (myIndex !== -1) {
        state.myOrders[myIndex] = action.payload;
      }
      
      state.isUpdating = false;
    },

    // ========== Тасдиқи расонидан ==========
    confirmDeliverySuccess: (state, action: PayloadAction<string>) => {
      // Тоза кардани фармоиши ҷорӣ
      if (state.currentOrder?.id === action.payload) {
        state.currentOrder = null;
      }
      
      // Навсозии статус дар myOrders
      const myIndex = state.myOrders.findIndex(o => o.id === action.payload);
      if (myIndex !== -1) {
        state.myOrders[myIndex].status = ORDER_STATUS.DELIVERED;
        state.myOrders[myIndex].updatedAt = new Date().toISOString();
      }
      
      state.isUpdating = false;
    },
  },
});

// Export кардани амалҳо
export const {
  setLoading,
  setAccepting,
  setUpdating,
  setError,
  clearError,
  setAvailableOrders,
  addAvailableOrder,
  removeAvailableOrder,
  clearAvailableOrders,
  setMyOrders,
  addMyOrder,
  updateMyOrder,
  removeMyOrder,
  setFilter,
  resetFilters,
  setCurrentOrder,
  updateCurrentOrder,
  updateOrderStatus,
  clearCurrentOrder,
  acceptOrderSuccess,
  rejectOrderSuccess,
  confirmPickupSuccess,
  confirmDeliverySuccess,
} = orderSlice.actions;

// ========== Selectorҳо ==========
export const selectOrderState = (state: RootState) => state.orders;

export const selectAvailableOrders = (state: RootState) => state.orders.availableOrders;
export const selectTotalAvailable = (state: RootState) => state.orders.totalAvailable;

export const selectMyOrders = (state: RootState) => state.orders.myOrders;
export const selectTotalMyOrders = (state: RootState) => state.orders.totalMyOrders;

export const selectCurrentOrder = (state: RootState) => state.orders.currentOrder;

export const selectOrderFilters = (state: RootState) => state.orders.filters;

export const selectIsLoading = (state: RootState) => state.orders.isLoading;
export const selectIsAccepting = (state: RootState) => state.orders.isAccepting;
export const selectIsUpdating = (state: RootState) => state.orders.isUpdating;
export const selectOrderError = (state: RootState) => state.orders.error;

// Selector барои фармоишҳои фаъол (ғайри расонида ва бекор)
export const selectActiveMyOrders = (state: RootState) => 
  state.orders.myOrders.filter(order => 
    ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)
  );

// Selector барои фармоишҳои анҷомёфта
export const selectCompletedOrders = (state: RootState) => 
  state.orders.myOrders.filter(order => order.status === ORDER_STATUS.DELIVERED);

// Selector барои омори фармоишҳо
export const selectOrderStats = (state: RootState) => ({
  available: state.orders.totalAvailable,
  active: state.orders.myOrders.filter(o => 
    ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(o.status)
  ).length,
  completed: state.orders.myOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
  total: state.orders.totalMyOrders,
});

export default orderSlice.reducer;
