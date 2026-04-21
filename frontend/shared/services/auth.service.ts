// Tojrason/frontend/shared/services/auth.service.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { ApiClient } from './api/apiClient';

// Намудҳои аутентификатсия
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: 'client' | 'courier';
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface PhoneLoginRequest {
  phoneNumber: string;
}

export interface VerifyPhoneRequest {
  phoneNumber: string;
  code: string;
}

// Конфигуратсияи сервис
export interface AuthServiceConfig {
  apiClient: ApiClient;
  endpoints?: {
    login?: string;
    register?: string;
    logout?: string;
    refresh?: string;
    changePassword?: string;
    forgotPassword?: string;
    resetPassword?: string;
    verifyEmail?: string;
    resendVerification?: string;
    me?: string;
    updateProfile?: string;
    validate?: string;
    phoneLogin?: string;
    verifyPhone?: string;
    checkEmail?: string;
    checkPhone?: string;
    uploadDocument?: string;
  };
}

// Интерфейси сервис
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<{ message: string }>;
  resendVerificationEmail(): Promise<{ message: string }>;
  getCurrentUser(): Promise<any>;
  updateProfile(data: Partial<any>): Promise<any>;
  validateToken(): Promise<boolean>;
  loginWithPhone(phoneNumber: string): Promise<{ message: string; codeSent: boolean }>;
  verifyPhoneLogin(phoneNumber: string, code: string): Promise<AuthResponse>;
  checkEmailExists(email: string): Promise<{ exists: boolean }>;
  checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean }>;
  uploadDocument?(type: string, file: File): Promise<{ url: string }>;
}

/**
 * Сервиси аутентификатсия
 */
export class AuthService implements IAuthService {
  private apiClient: ApiClient;
  private endpoints: Required<AuthServiceConfig['endpoints']>;

  constructor(config: AuthServiceConfig) {
    this.apiClient = config.apiClient;
    this.endpoints = {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      changePassword: '/auth/change-password',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
      resendVerification: '/auth/resend-verification',
      me: '/auth/me',
      updateProfile: '/auth/profile',
      validate: '/auth/validate',
      phoneLogin: '/auth/phone/login',
      verifyPhone: '/auth/phone/verify',
      checkEmail: '/auth/check-email',
      checkPhone: '/auth/check-phone',
      uploadDocument: '/auth/documents',
      ...config.endpoints,
    };
  }

  /**
   * Воридшавӣ
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(this.endpoints.login, credentials);
  }

  /**
   * Бақайдгирӣ
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(this.endpoints.register, data);
  }

  /**
   * Баромад
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.apiClient['getRefreshToken']?.();
      if (refreshToken) {
        await this.apiClient.post(this.endpoints.logout, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.apiClient.clearTokens();
    }
  }

  /**
   * Навсозии токен
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(this.endpoints.refresh, {
      refreshToken,
    } as RefreshTokenRequest);
  }

  /**
   * Тағйири парол
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.apiClient.post(this.endpoints.changePassword, {
      oldPassword,
      newPassword,
    } as ChangePasswordRequest);
  }

  /**
   * Фаромӯш кардани парол
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>(this.endpoints.forgotPassword, {
      email,
    } as ForgotPasswordRequest);
  }

  /**
   * Барқароркунии парол
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiClient.post(this.endpoints.resetPassword, {
      token,
      newPassword,
    } as ResetPasswordRequest);
  }

  /**
   * Тасдиқи email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>(this.endpoints.verifyEmail, {
      token,
    } as VerifyEmailRequest);
  }

  /**
   * Фиристодани дубораи паёми тасдиқ
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>(this.endpoints.resendVerification);
  }

  /**
   * Гирифтани маълумоти корбари ҷорӣ
   */
  async getCurrentUser(): Promise<any> {
    return this.apiClient.get(this.endpoints.me);
  }

  /**
   * Навсозии профил
   */
  async updateProfile(data: Partial<any>): Promise<any> {
    return this.apiClient.put(this.endpoints.updateProfile, data);
  }

  /**
   * Текшири валид будани токен
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.apiClient.get(this.endpoints.validate);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Воридшавӣ тавассути телефон
   */
  async loginWithPhone(phoneNumber: string): Promise<{ message: string; codeSent: boolean }> {
    return this.apiClient.post<{ message: string; codeSent: boolean }>(
      this.endpoints.phoneLogin,
      { phoneNumber } as PhoneLoginRequest
    );
  }

  /**
   * Тасдиқи воридшавӣ тавассути телефон
   */
  async verifyPhoneLogin(phoneNumber: string, code: string): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(this.endpoints.verifyPhone, {
      phoneNumber,
      code,
    } as VerifyPhoneRequest);
  }

  /**
   * Текшири мавҷудияти email
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    return this.apiClient.post<{ exists: boolean }>(this.endpoints.checkEmail, { email });
  }

  /**
   * Текшири мавҷудияти телефон
   */
  async checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean }> {
    return this.apiClient.post<{ exists: boolean }>(this.endpoints.checkPhone, { phoneNumber });
  }

  /**
   * Боргузории ҳуҷҷат (барои курйер)
   */
  async uploadDocument(type: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    
    return this.apiClient.postFormData<{ url: string }>(this.endpoints.uploadDocument, formData);
  }
}

/**
 * Эҷоди сервиси аутентификатсия
 */
export const createAuthService = (config: AuthServiceConfig): IAuthService => {
  return new AuthService(config);
};

export default AuthService;
