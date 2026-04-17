// Tojrason/frontend/client/src/hooks/useAuth.ts

import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  updateUser,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from '../store/slices/authSlice';
import { authApi } from '../api';
import { LoginCredentials, RegisterData, User } from '../../types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { accessToken, refreshToken } = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Санҷиши валид будани токен ҳангоми боршавӣ
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedRefreshToken && storedUser) {
        try {
          dispatch(setLoading(true));
          
          // Санҷиши валид будани токен
          const isValid = await authApi.validateToken();
          
          if (isValid) {
            // Агар токен валид бошад, маълумотро ба Redux бор мекунем
            const user = JSON.parse(storedUser);
            dispatch(setCredentials({
              user,
              accessToken: storedToken,
              refreshToken: storedRefreshToken,
            }));
          } else {
            // Агар токен валид набошад, кӯшиши навсозӣ мекунем
            try {
              const response = await authApi.refreshToken(storedRefreshToken);
              dispatch(setCredentials(response));
              
              // Захира кардани токенҳои нав
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              localStorage.setItem('user', JSON.stringify(response.user));
            } catch (refreshError) {
              // Агар навсозӣ ноком шавад, маълумотро тоза мекунем
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
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
      
      // Захира кардани маълумот
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
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
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Тоза кардани Redux
      dispatch(clearCredentials());
      dispatch(setLoading(false));
      
      // Равона кардан ба саҳифаи логин
      navigate('/login');
    }
  }, [dispatch, navigate]);

  // Навсозии профил
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const updatedUser = await authApi.updateProfile(userData);
      
      // Навсозии маълумот дар localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Навсозии маълумот дар Redux
      dispatch(updateUser(updatedUser));
      
      return { success: true, data: updatedUser };
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

  // Воридшавӣ тавассути Google
  const loginWithGoogle = useCallback(async (token: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await authApi.loginWithGoogle(token);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch(setCredentials(response));
      
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ тавассути Google';
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
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
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

  // Тоза кардани хатогӣ
  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  // Текшири нақши корбар
  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

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
    loginWithGoogle,
    loginWithPhone,
    verifyPhoneLogin,
    clearError,
    hasRole,
  };
};

export default useAuth;
