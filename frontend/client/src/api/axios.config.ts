// Tojrason/frontend/client/src/api/axios.config.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '../../types/auth.types';

// Конфигуратсияи асосии axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000; // 30 сония

// Сохтани инстанси axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Барои cookie-ҳо
});

// Тағйирдиҳанда барои нигоҳ доштани дархости навсозии токен
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Коркарди навбат пас аз навсозии токен
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request Interceptor - Илова кардани токен ба ҳар як дархост
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Илова кардани забони корбар
    const language = localStorage.getItem('language') || 'tg';
    if (config.headers) {
      config.headers['Accept-Language'] = language;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Коркарди хатогиҳо ва навсозии токен
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Агар хатогӣ 401 (Unauthorized) бошад ва дархост такрор нашуда бошад
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Агар дар ҳоли навсозии токен бошем, дар навбат мемонем
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // Агар refresh токен набошад, корбарро ба саҳифаи логин равона мекунем
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Равона кардан ба логин (агар дар муҳити браузер бошем)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
      
      try {
        // Кӯшиши навсозии токен
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Захира кардани токенҳои нав
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Навсозии header-и Authorization барои дархости аслӣ
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Коркарди навбат бо токени нав
        processQueue(null, accessToken);
        
        // Такрори дархости аслӣ
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Агар навсозии токен ноком шавад
        processQueue(refreshError as AxiosError, null);
        
        // Тоза кардани маълумоти корбар
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Равона кардан ба логин
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Коркарди дигар хатогиҳо
    if (error.response) {
      // Сервер ҷавоб дод бо статуси хатогӣ
      const status = error.response.status;
      const data = error.response.data as any;
      
      let errorMessage = 'Хатогии номаълум рух дод';
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Дархости нодуруст';
          break;
        case 403:
          errorMessage = 'Шумо ба ин бахш дастрасӣ надоред';
          break;
        case 404:
          errorMessage = 'Маълумот ёфт нашуд';
          break;
        case 409:
          errorMessage = data?.message || 'Маълумот аллакай мавҷуд аст';
          break;
        case 422:
          errorMessage = data?.message || 'Маълумоти воридшуда нодуруст аст';
          break;
        case 429:
          errorMessage = 'Дархостҳои зиёд. Лутфан каме сабр кунед';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Хатогии сервер. Лутфан баъдтар кӯшиш кунед';
          break;
        default:
          errorMessage = data?.message || `Хатогӣ: ${status}`;
      }
      
      // Метавонед ин ҷо notification ё toast нишон диҳед
      console.error('API Error:', errorMessage);
      
    } else if (error.request) {
      // Дархост фиристода шуд, вале ҷавоб нагирифт
      console.error('Network Error:', error.request);
      // Метавонед паёми "Пайвастшавӣ ба интернетро тафтиш кунед" нишон диҳед
    } else {
      // Хатогӣ ҳангоми танзими дархост
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Функсияи ёрирасон барои танзими токен
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

// Функсияи ёрирасон барои баровардани токен
export const removeAuthToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete axiosInstance.defaults.headers.common.Authorization;
};

// Функсияи ёрирасон барои гирифтани токени ҷорӣ
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Export кардани инстанси танзимшуда
export default axiosInstance;

// Export кардани намудҳои муфид
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };
