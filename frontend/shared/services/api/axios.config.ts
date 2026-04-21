// Tojrason/frontend/shared/services/api/axios.config.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import axios, { 
  AxiosError, 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig 
} from 'axios';

// Намуди ҷавоби аутентификатсия
export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// Конфигуратсияи axios
export interface AxiosConfigOptions {
  baseURL?: string;
  timeout?: number;
  storagePrefix: string; // 'client', 'courier', 'admin'
  refreshTokenEndpoint?: string;
  onUnauthorized?: () => void;
  onRefreshFailed?: () => void;
}

// Тағйирдиҳандаҳои глобалӣ барои идоракунии навсозии токен
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

/**
 * Эҷоди инстанси Axios бо конфигуратсияи додашуда
 */
export const createAxiosInstance = (options: AxiosConfigOptions): AxiosInstance => {
  const {
    baseURL = 'http://localhost:5000/api',
    timeout = 30000,
    storagePrefix,
    refreshTokenEndpoint = '/auth/refresh',
    onUnauthorized,
    onRefreshFailed,
  } = options;

  // Калидҳои localStorage
  const STORAGE_KEYS = {
    ACCESS_TOKEN: `${storagePrefix}_accessToken`,
    REFRESH_TOKEN: `${storagePrefix}_refreshToken`,
    USER: `${storagePrefix}_user`,
  };

  // Сохтани инстанси axios
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  });

  // Request Interceptor - Илова кардани токен ба ҳар як дархост
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Илова кардани забони корбар
      const language = localStorage.getItem(`${storagePrefix}_language`) || 'tg';
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
  instance.interceptors.response.use(
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
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          // Агар refresh токен набошад, корбарро ба саҳифаи логин равона мекунем
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          
          onUnauthorized?.();
          
          return Promise.reject(error);
        }
        
        try {
          // Кӯшиши навсозии токен
          const response = await axios.post<AuthResponse>(
            `${baseURL}${refreshTokenEndpoint}`,
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
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          
          // Навсозии header-и Authorization барои дархости аслӣ
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          // Коркарди навбат бо токени нав
          processQueue(null, accessToken);
          
          // Такрори дархости аслӣ
          return instance(originalRequest);
          
        } catch (refreshError) {
          // Агар навсозии токен ноком шавад
          processQueue(refreshError as AxiosError, null);
          
          // Тоза кардани маълумоти корбар
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          
          onRefreshFailed?.();
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      // Коркарди дигар хатогиҳо
      if (error.response) {
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
        
        console.error('API Error:', errorMessage);
        
      } else if (error.request) {
        console.error('Network Error:', error.request);
      } else {
        console.error('Request Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Функсияи ёрирасон барои танзими токен
 */
export const createAuthTokenManager = (storagePrefix: string) => {
  const ACCESS_TOKEN_KEY = `${storagePrefix}_accessToken`;
  
  return {
    setAuthToken: (token: string | null) => {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
    
    removeAuthToken: () => {
      localStorage.removeItem(`${storagePrefix}_accessToken`);
      localStorage.removeItem(`${storagePrefix}_refreshToken`);
      localStorage.removeItem(`${storagePrefix}_user`);
    },
    
    getAuthToken: (): string | null => {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
  };
};

// Export кардани намудҳои муфид
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };
export default createAxiosInstance;
