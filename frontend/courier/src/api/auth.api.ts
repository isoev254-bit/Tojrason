// Tojrason/frontend/courier/src/api/auth.api.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import axiosInstance from './axios.config';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  RefreshTokenRequest 
} from '../../types/auth.types';
import { CourierProfile } from '../../types/courier.types';

// Функсияҳои аутентификатсия барои курйер
export const authApi = {
  /**
   * Воридшавии курйер
   * @param credentials - Маълумоти воридшавӣ (email ва парол)
   * @returns AuthResponse бо токен ва маълумоти курйер
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/courier/login', credentials);
    return response.data;
  },

  /**
   * Бақайдгирии курйери нав
   * @param data - Маълумоти бақайдгирӣ
   * @returns AuthResponse бо токен ва маълумоти курйер
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/courier/register', data);
    return response.data;
  },

  /**
   * Баромад аз система
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('courier_refreshToken');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Тоза кардани маълумоти локалӣ новобаста аз натиҷаи дархост
      localStorage.removeItem('courier_accessToken');
      localStorage.removeItem('courier_refreshToken');
      localStorage.removeItem('courier_user');
    }
  },

  /**
   * Навсозии токен
   * @param refreshToken - Токени навсозӣ
   * @returns AuthResponse бо токенҳои нав
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    } as RefreshTokenRequest);
    return response.data;
  },

  /**
   * Тағйир додани парол
   * @param oldPassword - Пароли кӯҳна
   * @param newPassword - Пароли нав
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  /**
   * Дархости барқароркунии парол
   * @param email - Email-и курйер
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/courier/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Барқароркунии парол бо токен
   * @param token - Токени барқароркунӣ
   * @param newPassword - Пароли нав
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  /**
   * Тасдиқи email
   * @param token - Токени тасдиқ
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/verify-email', {
      token,
    });
    return response.data;
  },

  /**
   * Фиристодани дубораи паёми тасдиқи email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },

  /**
   * Гирифтани маълумоти курйери ҷорӣ
   * @returns CourierProfile - Маълумоти пурраи курйер
   */
  async getCurrentCourier(): Promise<CourierProfile> {
    const response = await axiosInstance.get<CourierProfile>('/auth/courier/me');
    return response.data;
  },

  /**
   * Навсозии маълумоти профили курйер
   * @param data - Маълумоти нав барои навсозӣ
   */
  async updateProfile(data: Partial<CourierProfile>): Promise<CourierProfile> {
    const response = await axiosInstance.put<CourierProfile>('/auth/courier/profile', data);
    return response.data;
  },

  /**
   * Текшири валид будани токен
   * @returns boolean - Агар токен валид бошад true
   */
  async validateToken(): Promise<boolean> {
    try {
      await axiosInstance.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Воридшавӣ тавассути рақами телефон (барои курйер)
   * @param phoneNumber - Рақами телефон
   */
  async loginWithPhone(phoneNumber: string): Promise<{ message: string; codeSent: boolean }> {
    const response = await axiosInstance.post<{ message: string; codeSent: boolean }>('/auth/courier/phone/login', {
      phoneNumber,
    });
    return response.data;
  },

  /**
   * Тасдиқи воридшавӣ тавассути телефон
   * @param phoneNumber - Рақами телефон
   * @param code - Коди тасдиқ
   */
  async verifyPhoneLogin(phoneNumber: string, code: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/courier/phone/verify', {
      phoneNumber,
      code,
    });
    return response.data;
  },

  /**
   * Текшири мавҷудияти email
   * @param email - Email барои текшир
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const response = await axiosInstance.post<{ exists: boolean }>('/auth/check-email', {
      email,
    });
    return response.data;
  },

  /**
   * Текшири мавҷудияти рақами телефон
   * @param phoneNumber - Рақами телефон барои текшир
   */
  async checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean }> {
    const response = await axiosInstance.post<{ exists: boolean }>('/auth/check-phone', {
      phoneNumber,
    });
    return response.data;
  },

  /**
   * Тасдиқи ҳуҷҷатҳои курйер
   * @param documentType - Намуди ҳуҷҷат
   * @param file - Файли ҳуҷҷат
   */
  async uploadDocument(documentType: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    
    const response = await axiosInstance.post<{ url: string }>('/auth/courier/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Гирифтани статуси тасдиқи ҳуҷҷатҳо
   */
  async getDocumentVerificationStatus(): Promise<{
    idCard: boolean;
    driverLicense: boolean;
    vehicleRegistration: boolean;
    insurance: boolean;
    backgroundCheck: boolean;
  }> {
    const response = await axiosInstance.get('/auth/courier/documents/status');
    return response.data;
  },
};

// Export кардани функсияҳои алоҳида барои истифодаи осон
export const {
  login,
  register,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getCurrentCourier,
  updateProfile,
  validateToken,
  loginWithPhone,
  verifyPhoneLogin,
  checkEmailExists,
  checkPhoneExists,
  uploadDocument,
  getDocumentVerificationStatus,
} = authApi;

export default authApi;
