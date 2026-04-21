// Tojrason/frontend/shared/services/api/apiClient.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createAxiosInstance, AxiosConfigOptions } from './axios.config';

// Намуди ҷавоби умумии API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
  statusCode?: number;
}

// Намуди хатогии API
export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, any>;
  path?: string;
  timestamp?: string;
}

// Параметрҳои пагинатсия
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Ҷавоби пагинатсияшуда
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Параметрҳои филтркунӣ
export interface FilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// Конфигуратсияи API Client
export interface ApiClientConfig extends AxiosConfigOptions {
  baseURL: string;
  storagePrefix: string;
}

/**
 * Синфи умумии API Client
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private storagePrefix: string;

  constructor(config: ApiClientConfig) {
    this.axiosInstance = createAxiosInstance(config);
    this.storagePrefix = config.storagePrefix;
  }

  /**
   * Дархости GET
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, {
      params,
      ...config,
    });
    return response.data;
  }

  /**
   * Дархости GET бо пагинатсия
   */
  async getPaginated<T = any>(
    url: string,
    params?: PaginationParams & FilterParams,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(url, params, config);
  }

  /**
   * Дархости POST
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Дархости POST бо FormData (барои боргузории файл)
   */
  async postFormData<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  /**
   * Дархости PUT
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Дархости PATCH
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Дархости DELETE
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Боргузории файл
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    return this.postFormData<T>(url, formData);
  }

  /**
   * Боргузории якчанд файл
   */
  async uploadMultipleFiles<T = any>(
    url: string,
    files: File[],
    fieldName: string = 'files',
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append(fieldName, file);
    });
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    return this.postFormData<T>(url, formData);
  }

  /**
   * Сохтани URL бо параметрҳои query
   */
  buildUrl(url: string, params?: Record<string, any>): string {
    if (!params) return url;
    
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Гирифтани инстанси Axios (барои истифодаи мустақим)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Танзими токени дастрасӣ
   */
  setAccessToken(token: string | null): void {
    const key = `${this.storagePrefix}_accessToken`;
    if (token) {
      localStorage.setItem(key, token);
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Гирифтани токени дастрасӣ
   */
  getAccessToken(): string | null {
    return localStorage.getItem(`${this.storagePrefix}_accessToken`);
  }

  /**
   * Тоза кардани ҳамаи токенҳо
   */
  clearTokens(): void {
    localStorage.removeItem(`${this.storagePrefix}_accessToken`);
    localStorage.removeItem(`${this.storagePrefix}_refreshToken`);
    localStorage.removeItem(`${this.storagePrefix}_user`);
  }
}

/**
 * Эҷоди API Client бо конфигуратсияи додашуда
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};

export default ApiClient;
