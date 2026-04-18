// Tojrason/frontend/client/src/store/slices/authSlice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Намудҳои асосӣ (агар дар shared/types нестанд, ин ҷо муваққатан мемонанд)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'client' | 'courier' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Калидҳои localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

// Ҳолати аввала - санҷиши localStorage барои маълумоти захирашуда
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }

  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userString = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userString ? JSON.parse(userString) : null;

    return {
      user,
      accessToken,
      refreshToken,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Failed to parse auth state from localStorage:', error);
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }
};

const initialState: AuthState = getInitialState();

// Ёрдамчи барои захираи маълумот дар localStorage
const persistAuthData = (accessToken: string | null, refreshToken: string | null, user: User | null) => {
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

    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
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
      
      persistAuthData(accessToken, refreshToken, state.user);
    },

    // Навсозии маълумоти корбар
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        persistAuthData(state.accessToken, state.refreshToken, state.user);
      }
    },

    // Тоза кардани маълумоти аутентификатсия (баромад)
    clearCredentials: (state) => {
      state.user = null;
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
  updateUser,
  clearCredentials,
  clearError,
} = authSlice.actions;

// Selectorҳо
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.accessToken && !!state.auth.user;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role;

// Selector барои санҷидани нақши мушаххас
export const selectHasRole = (role: string | string[]) => (state: RootState) => {
  const userRole = state.auth.user?.role;
  if (!userRole) return false;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
};

// Reducer-и пешфарз
export default authSlice.reducer;
