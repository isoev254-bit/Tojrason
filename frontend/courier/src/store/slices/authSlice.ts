// Tojrason/frontend/courier/src/store/slices/authSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CourierProfile } from '../../types/courier.types';

interface AuthState {
  courier: CourierProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Калидҳои localStorage барои курйер
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'courier_accessToken',
  REFRESH_TOKEN: 'courier_refreshToken',
  USER: 'courier_user',
};

// Ҳолати аввала - санҷиши localStorage барои маълумоти захирашуда
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      courier: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }

  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const courierString = localStorage.getItem(STORAGE_KEYS.USER);
    const courier = courierString ? JSON.parse(courierString) : null;

    return {
      courier,
      accessToken,
      refreshToken,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Failed to parse auth state from localStorage:', error);
    return {
      courier: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }
};

const initialState: AuthState = getInitialState();

// Ёрдамчи барои захираи маълумот дар localStorage
const persistAuthData = (
  accessToken: string | null,
  refreshToken: string | null,
  courier: CourierProfile | null
) => {
  if (typeof window === 'undefined') return;

  try {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    if (courier) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(courier));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Failed to persist auth data:', error);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Оғози амалиёт (барои loading)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Гузоштани хатогӣ
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Гузоштани маълумоти аутентификатсия (пас аз логин/регистр)
    setCredentials: (
      state,
      action: PayloadAction<{
        user: CourierProfile;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.courier = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoading = false;
      state.error = null;
      
      persistAuthData(accessToken, refreshToken, user);
    },

    // Навсозии токен
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      
      persistAuthData(accessToken, refreshToken, state.courier);
    },

    // Навсозии маълумоти курйер
    updateCourier: (state, action: PayloadAction<Partial<CourierProfile>>) => {
      if (state.courier) {
        state.courier = { ...state.courier, ...action.payload };
        persistAuthData(state.accessToken, state.refreshToken, state.courier);
      }
    },

    // Тоза кардани маълумоти аутентификатсия (баромад)
    clearCredentials: (state) => {
      state.courier = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
      
      persistAuthData(null, null, null);
    },

    // Тоза кардани хатогӣ
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export кардани амалҳо
export const {
  setLoading,
  setError,
  setCredentials,
  updateTokens,
  updateCourier,
  clearCredentials,
  clearError,
} = authSlice.actions;

// Selectorҳо
export const selectAuth = (state: RootState) => state.auth;
export const selectCourier = (state: RootState) => state.auth.courier;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.accessToken && !!state.auth.courier;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Selector барои санҷидани онлай будани курйер
export const selectIsCourierOnline = (state: RootState) => {
  const courier = state.auth.courier;
  if (!courier) return false;
  return courier.status === 'online' || courier.status === 'on_delivery';
};

// Selector барои санҷидани тасдиқ шудани ҳуҷҷатҳо
export const selectDocumentsVerified = (state: RootState) => {
  const courier = state.auth.courier;
  if (!courier) return false;
  return courier.isVerified;
};

// Reducer-и пешфарз
export default authSlice.reducer;
