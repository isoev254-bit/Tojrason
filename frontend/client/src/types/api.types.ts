// Tojrason/frontend/client/src/types/api.types.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Намуди умумии ҷавоби API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
  statusCode?: number;
}

/**
 * Намуди хатогии API
 */
export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, any>;
  path?: string;
  timestamp?: string;
}

/**
 * Параметрҳои пагинатсия
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Ҷавоби пагинатсияшуда
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Параметрҳои филтркунӣ
 */
export interface FilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Намуди параметрҳои URL
 */
export interface QueryParams extends PaginationParams, FilterParams {
  [key: string]: any;
}

/**
 * Статуси дархост
 */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Ҳолати дархости асинхронӣ
 */
export interface AsyncState<T = any> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Намуди файл барои боргузорӣ
 */
export interface UploadFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

/**
 * Ҷавоби боргузории файл
 */
export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

/**
 * Намуд барои конфигуратсияи сокет
 */
export interface SocketConfig {
  url: string;
  options?: {
    path?: string;
    transports?: string[];
    auth?: Record<string, any>;
    query?: Record<string, any>;
  };
}

/**
 * Рӯйдоди сокет
 */
export interface SocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
}

/**
 * Намуди амалиёти CRUD
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

/**
 * Параметрҳои амалиёти оммавӣ
 */
export interface BulkOperationParams<T = any> {
  operation: CrudOperation;
  items: T[];
  options?: Record<string, any>;
}

/**
 * Ҷавоби амалиёти оммавӣ
 */
export interface BulkOperationResponse {
  success: boolean;
  totalProcessed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Намуди мета-маълумот барои SEO
 */
export interface MetaData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/**
 * Параметрҳои эҷоди миёнабур
 */
export interface ShortcutParams {
  url: string;
  expiresIn?: number;
  customCode?: string;
}

/**
 * Ҷавоби эҷоди миёнабур
 */
export interface ShortcutResponse {
  shortUrl: string;
  originalUrl: string;
  code: string;
  expiresAt?: string;
}
