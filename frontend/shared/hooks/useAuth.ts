// Tojrason/frontend/shared/hooks/useAuth.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  RefreshTokenRequest 
} from '../types/auth.types';

// Намуди умумии ҳолати auth
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Намуди slice-и auth (бояд аз ҷониби ҳар як барнома таъмин шавад)
export interface AuthSlice {
  setCredentials: (payload: { user: User; accessToken: string; refreshToken: string }) => any;
  clearCredentials: () => any;
  setLoading: (loading: boolean) => any;
  setError: (error: string | null) => any;
  updateUser: (user: Partial<User>) => any;
  updateTokens: (tokens: { accessToken: string; refreshToken: string }) => any;
}

// Намуди API-и auth (бояд аз ҷониби ҳар як барнома таъмин шавад)
export interface AuthApi {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<AuthResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendVerificationEmail: () => Promise<{ message: string }>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  validateToken: () => Promise<boolean>;
  loginWithPhone?: (phoneNumber: string) => Promise<{ message: string; codeSent: boolean }>;
  verifyPhoneLogin?: (phoneNumber: string, code: string) => Promise<AuthResponse>;
}

// Намуди селекторҳо (бояд аз ҷониби ҳар як барнома таъмин шавад)
export interface AuthSelectors {
  selectAuth: (state: any) => AuthState;
  selectUser: (state: any) => User | null;
  selectIsAuthenticated: (state: any) => boolean;
  selectIsLoading: (state: any) => boolean;
  selectAuthError: (state: any) => string | null;
  selectAccessToken: (state: any) => string | null;
  selectRefreshToken: (state: any) => string | null;
}

// Параметрҳои конфигуратсияи useAuth
export interface UseAuthConfig {
  storagePrefix: string; // 'client', 'courier', 'admin'
  authSlice: AuthSlice;
  authApi: AuthApi;
  authSelectors: AuthSelectors;
  loginRedirectPath?: string;
  logoutRedirectPath?: string;
}

/**
 * Hook-и умумии аутентификатсия
 * @param config - Конфигуратсияи hook
 */
export const createUseAuth = (config: UseAuthConfig) => {
  const {
    storagePrefix,
    authSlice,
    authApi,
    authSelectors,
    loginRedirectPath = '/',
    logoutRedirectPath = '/login',
  } = config;

  // Калидҳои localStorage бо префикс
  const STORAGE_KEYS = {
    ACCESS_TOKEN: `${storagePrefix}_accessToken`,
    REFRESH_TOKEN: `${storagePrefix}_refreshToken`,
    USER: `${storagePrefix}_user`,
  };

  return () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const authState = useSelector(authSelectors.selectAuth);
    const user = useSelector(authSelectors.selectUser);
    const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
    const isLoading = useSelector(authSelectors.selectIsLoading);
    const error = useSelector(authSelectors.selectAuthError);
    const accessToken = useSelector(authSelectors.selectAccessToken);
    const refreshToken = useSelector(authSelectors.selectRefreshToken);

    // Санҷиши валид будани токен ҳангоми боршавӣ
    useEffect(() => {
      const checkAuth = async () => {
        const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedRefreshToken && storedUser) {
          try {
            dispatch(authSlice.setLoading(true));
            
            const isValid = await authApi.validateToken();
            
            if (isValid) {
              const user = JSON.parse(storedUser);
              dispatch(authSlice.setCredentials({
                user,
                accessToken: storedToken,
                refreshToken: storedRefreshToken,
              }));
            } else {
              try {
                const response = await authApi.refreshToken(storedRefreshToken);
                dispatch(authSlice.setCredentials(response));
                
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
              } catch (refreshError) {
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                dispatch(authSlice.clearCredentials());
              }
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            dispatch(authSlice.clearCredentials());
          } finally {
            dispatch(authSlice.setLoading(false));
          }
        }
      };

      checkAuth();
    }, [dispatch]);

    // Воридшавӣ
    const login = useCallback(async (credentials: LoginCredentials) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const response = await authApi.login(credentials);
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        
        dispatch(authSlice.setCredentials(response));
        
        return { success: true, data: response };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Бақайдгирӣ
    const register = useCallback(async (data: RegisterData) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const response = await authApi.register(data);
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        
        dispatch(authSlice.setCredentials(response));
        
        return { success: true, data: response };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми бақайдгирӣ';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Баромад
    const logout = useCallback(async () => {
      try {
        dispatch(authSlice.setLoading(true));
        await authApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        dispatch(authSlice.clearCredentials());
        dispatch(authSlice.setLoading(false));
        
        navigate(logoutRedirectPath);
      }
    }, [dispatch, navigate]);

    // Навсозии профил
    const updateProfile = useCallback(async (userData: Partial<User>) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const updatedUser = await authApi.updateProfile(userData);
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        dispatch(authSlice.updateUser(updatedUser));
        
        return { success: true, data: updatedUser };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми навсозии профил';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Тағйири парол
    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        await authApi.changePassword(oldPassword, newPassword);
        
        return { success: true };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми тағйири парол';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Фаромӯш кардани парол
    const forgotPassword = useCallback(async (email: string) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const response = await authApi.forgotPassword(email);
        
        return { success: true, message: response.message };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми дархости барқароркунии парол';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Барқароркунии парол
    const resetPassword = useCallback(async (token: string, newPassword: string) => {
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        await authApi.resetPassword(token, newPassword);
        
        return { success: true };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми барқароркунии парол';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Воридшавӣ тавассути телефон
    const loginWithPhone = useCallback(async (phoneNumber: string) => {
      if (!authApi.loginWithPhone) {
        return { success: false, error: 'Воридшавӣ тавассути телефон дастгирӣ намешавад' };
      }
      
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const response = await authApi.loginWithPhone(phoneNumber);
        
        return { success: true, message: response.message, codeSent: response.codeSent };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ тавассути телефон';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Тасдиқи воридшавӣ тавассути телефон
    const verifyPhoneLogin = useCallback(async (phoneNumber: string, code: string) => {
      if (!authApi.verifyPhoneLogin) {
        return { success: false, error: 'Тасдиқи телефон дастгирӣ намешавад' };
      }
      
      try {
        dispatch(authSlice.setLoading(true));
        dispatch(authSlice.setError(null));
        
        const response = await authApi.verifyPhoneLogin(phoneNumber, code);
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        
        dispatch(authSlice.setCredentials(response));
        
        return { success: true, data: response };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Коди тасдиқ нодуруст аст';
        dispatch(authSlice.setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(authSlice.setLoading(false));
      }
    }, [dispatch]);

    // Тоза кардани хатогӣ
    const clearError = useCallback(() => {
      dispatch(authSlice.setError(null));
    }, [dispatch]);

    // Маълумоти муфид барои истифода
    const authData = useMemo(() => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      error,
    }), [user, accessToken, refreshToken, isAuthenticated, isLoading, error]);

    return {
      ...authData,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
      loginWithPhone,
      verifyPhoneLogin,
      clearError,
    };
  };
};

// Экспорти пешфарз
export default createUseAuth;
