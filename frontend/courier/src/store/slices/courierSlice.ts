// Tojrason/frontend/courier/src/store/slices/courierSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { COURIER_STATUS } from '../../utils/constants';
import { CourierProfile, CourierStats, EarningsDetails, Vehicle, CourierSettings } from '../../types/courier.types';

interface CourierState {
  profile: CourierProfile | null;
  status: string;
  stats: CourierStats | null;
  earnings: EarningsDetails | null;
  vehicle: Vehicle | null;
  settings: CourierSettings | null;
  todayActivity: {
    online: boolean;
    startTime?: string;
    totalHours: number;
    deliveries: number;
    earnings: number;
    distance: number;
  } | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Ҳолати аввала
const initialState: CourierState = {
  profile: null,
  status: COURIER_STATUS.OFFLINE,
  stats: null,
  earnings: null,
  vehicle: null,
  settings: null,
  todayActivity: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const courierSlice = createSlice({
  name: 'courier',
  initialState,
  reducers: {
    // ========== Танзими ҳолати боргузорӣ ==========
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isUpdating = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // ========== Профили курйер ==========
    setProfile: (state, action: PayloadAction<CourierProfile>) => {
      state.profile = action.payload;
      state.status = action.payload.status;
      state.isLoading = false;
      state.error = null;
    },

    updateProfile: (state, action: PayloadAction<Partial<CourierProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // ========== Статуси курйер ==========
    setCourierStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
      if (state.profile) {
        state.profile.status = action.payload as any;
      }
    },

    // ========== Омор ==========
    setStats: (state, action: PayloadAction<CourierStats>) => {
      state.stats = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateStats: (state, action: PayloadAction<Partial<CourierStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },

    // ========== Даромад ==========
    setEarnings: (state, action: PayloadAction<EarningsDetails>) => {
      state.earnings = action.payload;
      state.isLoading = false;
    },

    // ========== Нақлиёт ==========
    setVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.vehicle = action.payload;
    },

    updateVehicle: (state, action: PayloadAction<Partial<Vehicle>>) => {
      if (state.vehicle) {
        state.vehicle = { ...state.vehicle, ...action.payload };
      }
    },

    // ========== Танзимот ==========
    setSettings: (state, action: PayloadAction<CourierSettings>) => {
      state.settings = action.payload;
    },

    updateSettings: (state, action: PayloadAction<Partial<CourierSettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },

    // ========== Фаъолияти имрӯза ==========
    setTodayActivity: (state, action: PayloadAction<CourierState['todayActivity']>) => {
      state.todayActivity = action.payload;
    },

    updateTodayActivity: (state, action: PayloadAction<Partial<NonNullable<CourierState['todayActivity']>>>) => {
      if (state.todayActivity) {
        state.todayActivity = { ...state.todayActivity, ...action.payload };
      }
    },

    // ========== Оғози смена ==========
    startShiftSuccess: (state, action: PayloadAction<{ shiftId: string; startTime: string }>) => {
      state.status = COURIER_STATUS.ONLINE;
      if (state.profile) {
        state.profile.status = COURIER_STATUS.ONLINE as any;
      }
      if (state.todayActivity) {
        state.todayActivity.online = true;
        state.todayActivity.startTime = action.payload.startTime;
      }
      state.isUpdating = false;
    },

    // ========== Анҷоми смена ==========
    endShiftSuccess: (state) => {
      state.status = COURIER_STATUS.OFFLINE;
      if (state.profile) {
        state.profile.status = COURIER_STATUS.OFFLINE as any;
      }
      if (state.todayActivity) {
        state.todayActivity.online = false;
      }
      state.isUpdating = false;
    },

    // ========== Тоза кардани ҳолат ==========
    clearCourierState: (state) => {
      state.profile = null;
      state.status = COURIER_STATUS.OFFLINE;
      state.stats = null;
      state.earnings = null;
      state.vehicle = null;
      state.settings = null;
      state.todayActivity = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.error = null;
    },
  },
});

// Export кардани амалҳо
export const {
  setLoading,
  setUpdating,
  setError,
  clearError,
  setProfile,
  updateProfile,
  setCourierStatus,
  setStats,
  updateStats,
  setEarnings,
  setVehicle,
  updateVehicle,
  setSettings,
  updateSettings,
  setTodayActivity,
  updateTodayActivity,
  startShiftSuccess,
  endShiftSuccess,
  clearCourierState,
} = courierSlice.actions;

// ========== Selectorҳо ==========
export const selectCourierState = (state: RootState) => state.courier;

export const selectCourierProfile = (state: RootState) => state.courier.profile;
export const selectCourierStatus = (state: RootState) => state.courier.status;

export const selectCourierStats = (state: RootState) => state.courier.stats;
export const selectCourierEarnings = (state: RootState) => state.courier.earnings;
export const selectCourierVehicle = (state: RootState) => state.courier.vehicle;
export const selectCourierSettings = (state: RootState) => state.courier.settings;
export const selectTodayActivity = (state: RootState) => state.courier.todayActivity;

export const selectIsLoading = (state: RootState) => state.courier.isLoading;
export const selectIsUpdating = (state: RootState) => state.courier.isUpdating;
export const selectCourierError = (state: RootState) => state.courier.error;

// Selector барои санҷидани онлайн будан
export const selectIsOnline = (state: RootState) => 
  state.courier.status === COURIER_STATUS.ONLINE || 
  state.courier.status === COURIER_STATUS.ON_DELIVERY;

// Selector барои санҷидани дар расонидан будан
export const selectIsOnDelivery = (state: RootState) => 
  state.courier.status === COURIER_STATUS.ON_DELIVERY;

// Selector барои омори имрӯза
export const selectTodayStats = (state: RootState) => state.courier.stats?.today;

// Selector барои омори ҳафтаина
export const selectWeekStats = (state: RootState) => state.courier.stats?.week;

// Selector барои омори моҳона
export const selectMonthStats = (state: RootState) => state.courier.stats?.month;

// Selector барои омори умумӣ
export const selectTotalStats = (state: RootState) => state.courier.stats?.total;

// Selector барои рейтинг
export const selectCourierRating = (state: RootState) => state.courier.profile?.rating || 0;

// Selector барои тасдиқи ҳуҷҷатҳо
export const selectDocumentsStatus = (state: RootState) => state.courier.profile?.documents;

// Selector барои санҷидани пурра тасдиқ шудани профил
export const selectIsProfileVerified = (state: RootState) => 
  state.courier.profile?.isVerified || false;

export default courierSlice.reducer;
