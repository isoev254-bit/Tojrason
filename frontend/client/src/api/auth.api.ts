// Tojrason/frontend/client/src/api/auth.api.ts

import axiosInstance from './axios.config';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  RefreshTokenRequest 
} from '../../types/auth.types';

// Функсияҳои аутентификатсия
export const authApi = {
  /**
   * Воридшавии корбар
   * @param credentials - Маълумоти воридшавӣ (email ва парол)
   * @returns AuthResponse бо токен ва маълумоти корбар
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Бақайдгирии корбари нав
   * @param data - Маълумоти бақайдгирӣ
   * @returns AuthResponse бо токен ва маълумоти корбар
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Баромад аз система
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Тоза кардани маълумоти локалӣ новобаста аз натиҷаи дархост
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
   * @param email - Email-и корбар
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', {
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
   * Гирифтани маълумоти корбари ҷорӣ
   * @returns User - Маълумоти корбар
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Навсозии маълумоти профили корбар
   * @param data - Маълумоти нав барои навсозӣ
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.put<User>('/auth/profile', data);
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
   * Воридшавӣ тавассути Google
   * @param token - Токени Google
   */
  async loginWithGoogle(token: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/google', {
      token,
    });
    return response.data;
  },

  /**
   * Воридшавӣ тавассути Facebook
   * @param token - Токени Facebook
   */
  async loginWithFacebook(token: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/facebook', {
      token,
    });
    return response.data;
  },

  /**
   * Воридшавӣ тавассути рақами телефон
   * @param phoneNumber - Рақами телефон
   */
  async loginWithPhone(phoneNumber: string): Promise<{ message: string; codeSent: boolean }> {
    const response = await axiosInstance.post<{ message: string; codeSent: boolean }>('/auth/phone/login', {
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
    const response = await axiosInstance.post<AuthResponse>('/auth/phone/verify', {
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
  getCurrentUser,
  updateProfile,
  validateToken,
  loginWithGoogle,
  loginWithFacebook,
  loginWithPhone,
  verifyPhoneLogin,
  checkEmailExists,
  checkPhoneExists,
} = authApi;

export default authApi;
