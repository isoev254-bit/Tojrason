// Tojrason/frontend/client/src/store/slices/orderSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Намудҳои марбут ба фармоиш
export type OrderStatus = 
  | 'pending' 
  | 'accepted' 
  | 'pickup' 
  | 'in_transit' 
  | 'arriving' 
  | 'delivered' 
  | 'cancelled';

export interface OrderTimeline {
  status: OrderStatus;
  label: string;
  timestamp: string;
  description?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
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
  dimensions?: { length: number; width: number; height: number };
  description?: string;
  isFragile: boolean;
  requiresSignature: boolean;
  price: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  estimatedDelivery?: string;
  courier?: {
    id: string;
    name: string;
    phoneNumber: string;
    photo?: string;
    rating?: number;
    location?: { lat: number; lng: number; updatedAt: string };
  };
  timeline: OrderTimeline[];
  route?: Array<[number, number]>;
}

export interface OrderFilter {
  status?: OrderStatus | '';
  fromDate?: string;
  toDate?: string;
  search?: string;
  page: number;
  limit: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  trackedOrder: Order | null;
  filters: OrderFilter;
  totalOrders: number;
  totalPages: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Ҳолати аввала
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  trackedOrder: null,
  filters: {
    status: '',
    fromDate: '',
    toDate: '',
    search: '',
    page: 1,
    limit: 10,
  },
  totalOrders: 0,
  totalPages: 1,
  isLoading: false,
  isCreating: false,
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

    setCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },

    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isCreating = false;
      state.isUpdating = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // ========== Идоракунии рӯйхати фармоишҳо ==========
    setOrders: (state, action: PayloadAction<{ orders: Order[]; total: number; totalPages: number }>) => {
      state.orders = action.payload.orders;
      state.totalOrders = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.isLoading = false;
      state.error = null;
    },

    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      state.totalOrders += 1;
    },

    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },

    removeOrderFromList: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(o => o.id !== action.payload);
      state.totalOrders -= 1;
    },

    clearOrders: (state) => {
      state.orders = [];
      state.totalOrders = 0;
      state.totalPages = 1;
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
      };
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },

    // ========== Фармоиши ҷорӣ ==========
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateCurrentOrder: (state, action: PayloadAction<Partial<Order>>) => {
      if (state.currentOrder) {
        state.currentOrder = { ...state.currentOrder, ...action.payload };
        
        // Ҳамзамон навсозӣ дар рӯйхат
        const index = state.orders.findIndex(o => o.id === state.currentOrder?.id);
        if (index !== -1) {
          state.orders[index] = state.currentOrder;
        }
      }
    },

    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const { orderId, status } = action.payload;
      
      // Навсозӣ дар currentOrder
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.updatedAt = new Date().toISOString();
      }
      
      // Навсозӣ дар trackedOrder
      if (state.trackedOrder?.id === orderId) {
        state.trackedOrder.status = status;
        state.trackedOrder.updatedAt = new Date().toISOString();
      }
      
      // Навсозӣ дар рӯйхат
      const index = state.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        state.orders[index].status = status;
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },

    updateCourierLocation: (state, action: PayloadAction<{ orderId: string; location: { lat: number; lng: number } }>) => {
      const { orderId, location } = action.payload;
      
      const updateOrderCourier = (order: Order | null) => {
        if (order?.id === orderId && order.courier) {
          order.courier.location = { ...location, updatedAt: new Date().toISOString() };
        }
      };
      
      updateOrderCourier(state.currentOrder);
      updateOrderCourier(state.trackedOrder);
      
      const index = state.orders.findIndex(o => o.id === orderId);
      if (index !== -1 && state.orders[index].courier) {
        state.orders[index].courier!.location = { ...location, updatedAt: new Date().toISOString() };
      }
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // ========== Фармоиши пайгиришаванда ==========
    setTrackedOrder: (state, action: PayloadAction<Order | null>) => {
      state.trackedOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateTrackedOrder: (state, action: PayloadAction<Partial<Order>>) => {
      if (state.trackedOrder) {
        state.trackedOrder = { ...state.trackedOrder, ...action.payload };
      }
    },

    clearTrackedOrder: (state) => {
      state.trackedOrder = null;
    },

    // ========== Timeline ==========
    addTimelineEvent: (state, action: PayloadAction<{ orderId: string; event: OrderTimeline }>) => {
      const { orderId, event } = action.payload;
      
      const addEvent = (order: Order | null) => {
        if (order?.id === orderId) {
          if (!order.timeline) order.timeline = [];
          const existingIndex = order.timeline.findIndex(t => t.status === event.status);
          if (existingIndex !== -1) {
            order.timeline[existingIndex] = event;
          } else {
            order.timeline.push(event);
          }
        }
      };
      
      addEvent(state.currentOrder);
      addEvent(state.trackedOrder);
      
      const index = state.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        const order = state.orders[index];
        if (!order.timeline) order.timeline = [];
        const existingIndex = order.timeline.findIndex(t => t.status === event.status);
        if (existingIndex !== -1) {
          order.timeline[existingIndex] = event;
        } else {
          order.timeline.push(event);
        }
      }
    },

    // ========== Бекоркунӣ ==========
    cancelOrderSuccess: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      
      const cancelOrder = (order: Order | null) => {
        if (order?.id === orderId) {
          order.status = 'cancelled';
          order.updatedAt = new Date().toISOString();
        }
      };
      
      cancelOrder(state.currentOrder);
      cancelOrder(state.trackedOrder);
      
      const index = state.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        state.orders[index].status = 'cancelled';
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },
  },
});

// Export кардани амалҳо
export const {
  setLoading,
  setCreating,
  setUpdating,
  setError,
  clearError,
  setOrders,
  addOrder,
  updateOrderInList,
  removeOrderFromList,
  clearOrders,
  setFilter,
  resetFilters,
  setPage,
  setCurrentOrder,
  updateCurrentOrder,
  updateOrderStatus,
  updateCourierLocation,
  clearCurrentOrder,
  setTrackedOrder,
  updateTrackedOrder,
  clearTrackedOrder,
  addTimelineEvent,
  cancelOrderSuccess,
} = orderSlice.actions;

// ========== Selectorҳо ==========
export const selectOrderState = (state: RootState) => state.orders;

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectTotalOrders = (state: RootState) => state.orders.totalOrders;
export const selectTotalPages = (state: RootState) => state.orders.totalPages;

export const selectCurrentOrder = (state: RootState) => state.orders.currentOrder;
export const selectTrackedOrder = (state: RootState) => state.orders.trackedOrder;

export const selectOrderFilters = (state: RootState) => state.orders.filters;

export const selectIsLoading = (state: RootState) => state.orders.isLoading;
export const selectIsCreating = (state: RootState) => state.orders.isCreating;
export const selectIsUpdating = (state: RootState) => state.orders.isUpdating;
export const selectOrderError = (state: RootState) => state.orders.error;

// Selector барои гирифтани фармоиш бо ID
export const selectOrderById = (orderId: string) => (state: RootState) => 
  state.orders.orders.find(order => order.id === orderId) || 
  (state.orders.currentOrder?.id === orderId ? state.orders.currentOrder : null) ||
  (state.orders.trackedOrder?.id === orderId ? state.orders.trackedOrder : null);

// Selector барои фармоишҳои фаъол
export const selectActiveOrders = (state: RootState) => 
  state.orders.orders.filter(order => !['delivered', 'cancelled'].includes(order.status));

// Selector барои фармоишҳои анҷомёфта
export const selectCompletedOrders = (state: RootState) => 
  state.orders.orders.filter(order => order.status === 'delivered');

// Selector барои фармоишҳои бекоршуда
export const selectCancelledOrders = (state: RootState) => 
  state.orders.orders.filter(order => order.status === 'cancelled');

// Selector барои омори фармоишҳо
export const selectOrderStats = (state: RootState) => ({
  total: state.orders.totalOrders,
  active: state.orders.orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
  completed: state.orders.orders.filter(o => o.status === 'delivered').length,
  cancelled: state.orders.orders.filter(o => o.status === 'cancelled').length,
});

export default orderSlice.reducer;
