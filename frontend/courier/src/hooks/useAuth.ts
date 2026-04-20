// Tojrason/frontend/courier/src/hooks/useAuth.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  updateCourier,
  selectAuth,
  selectCourier,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from '../store/slices/authSlice';
import { authApi } from '../api';
import { LoginCredentials, RegisterData } from '../../types/auth.types';
import { CourierProfile } from '../../types/courier.types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { accessToken, refreshToken } = useSelector(selectAuth);
  const courier = useSelector(selectCourier);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Санҷиши валид будани токен ҳангоми боршавӣ
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('courier_accessToken');
      const storedRefreshToken = localStorage.getItem('courier_refreshToken');
      const storedCourier = localStorage.getItem('courier_user');

      if (storedToken && storedRefreshToken && storedCourier) {
        try {
          dispatch(setLoading(true));
          
          // Санҷиши валид будани токен
          const isValid = await authApi.validateToken();
          
          if (isValid) {
            // Агар токен валид бошад, маълумотро ба Redux бор мекунем
            const courier = JSON.parse(storedCourier);
            dispatch(setCredentials({
              user: courier,
              accessToken: storedToken,
              refreshToken: storedRefreshToken,
            }));
          } else {
            // Агар токен валид набошад, кӯшиши навсозӣ мекунем
            try {
              const response = await authApi.refreshToken(storedRefreshToken);
              dispatch(setCredentials(response));
              
              // Захира кардани токенҳои нав
              localStorage.setItem('courier_accessToken', response.accessToken);
              localStorage.setItem('courier_refreshToken', response.refreshToken);
              localStorage.setItem('courier_user', JSON.stringify(response.user));
            } catch (refreshError) {
              // Агар навсозӣ ноком шавад, маълумотро тоза мекунем
              localStorage.removeItem('courier_accessToken');
              localStorage.removeItem('courier_refreshToken');
              localStorage.removeItem('courier_user');
              dispatch(clearCredentials());
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          dispatch(clearCredentials());
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  // Воридшавӣ
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.login(credentials);
      
      // Захира кардани маълумот бо префикси courier_
      localStorage.setItem('courier_accessToken', response.accessToken);
      localStorage.setItem('courier_refreshToken', response.refreshToken);
      localStorage.setItem('courier_user', JSON.stringify(response.user));
      
      // Гузоштан дар Redux
      dispatch(setCredentials(response));
      
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Бақайдгирӣ
  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.register(data);
      
      // Захира кардани маълумот
      localStorage.setItem('courier_accessToken', response.accessToken);
      localStorage.setItem('courier_refreshToken', response.refreshToken);
      localStorage.setItem('courier_user', JSON.stringify(response.user));
      
      // Гузоштан дар Redux
      dispatch(setCredentials(response));
      
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми бақайдгирӣ';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Баромад
  const logout = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      
      // Кӯшиши баромад аз сервер
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Тоза кардани маълумоти локалӣ новобаста аз натиҷаи дархост
      localStorage.removeItem('courier_accessToken');
      localStorage.removeItem('courier_refreshToken');
      localStorage.removeItem('courier_user');
      
      // Тоза кардани Redux
      dispatch(clearCredentials());
      dispatch(setLoading(false));
      
      // Равона кардан ба саҳифаи логин
      navigate('/login');
    }
  }, [dispatch, navigate]);

  // Навсозии профили курйер
  const updateProfile = useCallback(async (profileData: Partial<CourierProfile>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const updatedCourier = await authApi.updateProfile(profileData);
      
      // Навсозии маълумот дар localStorage
      localStorage.setItem('courier_user', JSON.stringify(updatedCourier));
      
      // Навсозии маълумот дар Redux
      dispatch(updateCourier(updatedCourier));
      
      return { success: true, data: updatedCourier };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми навсозии профил';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Тағйири парол
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      await authApi.changePassword(oldPassword, newPassword);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми тағйири парол';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Фаромӯш кардани парол
  const forgotPassword = useCallback(async (email: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.forgotPassword(email);
      
      return { success: true, message: response.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми дархости барқароркунии парол';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Барқароркунии парол
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      await authApi.resetPassword(token, newPassword);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми барқароркунии парол';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Воридшавӣ тавассути телефон
  const loginWithPhone = useCallback(async (phoneNumber: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.loginWithPhone(phoneNumber);
      
      return { success: true, message: response.message, codeSent: response.codeSent };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ тавассути телефон';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Тасдиқи воридшавӣ тавассути телефон
  const verifyPhoneLogin = useCallback(async (phoneNumber: string, code: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.verifyPhoneLogin(phoneNumber, code);
      
      localStorage.setItem('courier_accessToken', response.accessToken);
      localStorage.setItem('courier_refreshToken', response.refreshToken);
      localStorage.setItem('courier_user', JSON.stringify(response.user));
      
      dispatch(setCredentials(response));
      
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Коди тасдиқ нодуруст аст';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Боргузории ҳуҷҷат
  const uploadDocument = useCallback(async (documentType: string, file: File) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.uploadDocument(documentType, file);
      
      return { success: true, url: response.url };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми боргузории ҳуҷҷат';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Тоза кардани хатогӣ
  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  // Маълумоти муфид барои истифода
  const authData = useMemo(() => ({
    courier,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  }), [courier, accessToken, refreshToken, isAuthenticated, isLoading, error]);

  return {
    // Ҳолат
    ...authData,
    
    // Функсияҳо
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    loginWithPhone,
    verifyPhoneLogin,
    uploadDocument,
    clearError,
  };
};

export default useAuth;
