// Tojrason/frontend/shared/services/user.service.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { ApiClient, PaginatedResponse, FilterParams } from './api/apiClient';

// Намудҳои корбар
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'client' | 'courier' | 'admin';
  isActive: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserFilter extends FilterParams {
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'client' | 'courier' | 'admin';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

// Конфигуратсияи сервис
export interface UserServiceConfig {
  apiClient: ApiClient;
  endpoints?: {
    users?: string;
    userById?: string;
    profile?: string;
    changePassword?: string;
    avatar?: string;
    stats?: string;
    activate?: string;
    deactivate?: string;
    verifyEmail?: string;
    verifyPhone?: string;
  };
}

// Интерфейси сервис
export interface IUserService {
  // Амалиёти CRUD
  getUsers(filter?: UserFilter): Promise<PaginatedResponse<User>>;
  getUserById(userId: string): Promise<User>;
  createUser(data: CreateUserRequest): Promise<User>;
  updateUser(userId: string, data: UpdateUserRequest): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Профили корбари ҷорӣ
  getProfile(): Promise<User>;
  updateProfile(data: UpdateUserRequest): Promise<User>;
  changePassword(data: ChangePasswordRequest): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;
  deleteAvatar(): Promise<void>;
  
  // Идоракунии корбарон (барои админ)
  activateUser(userId: string): Promise<User>;
  deactivateUser(userId: string): Promise<User>;
  verifyUserEmail(userId: string): Promise<User>;
  verifyUserPhone(userId: string): Promise<User>;
  
  // Омор
  getUserStats(): Promise<UserStats>;
  
  // Санҷиши мавҷудият
  checkEmailExists(email: string): Promise<{ exists: boolean }>;
  checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean }>;
}

/**
 * Сервиси корбарон
 */
export class UserService implements IUserService {
  private apiClient: ApiClient;
  private endpoints: Required<UserServiceConfig['endpoints']>;

  constructor(config: UserServiceConfig) {
    this.apiClient = config.apiClient;
    this.endpoints = {
      users: '/users',
      userById: '/users',
      profile: '/users/profile',
      changePassword: '/users/change-password',
      avatar: '/users/avatar',
      stats: '/users/stats',
      activate: '/activate',
      deactivate: '/deactivate',
      verifyEmail: '/verify-email',
      verifyPhone: '/verify-phone',
      ...config.endpoints,
    };
  }

  /**
   * Гирифтани рӯйхати корбарон
   */
  async getUsers(filter?: UserFilter): Promise<PaginatedResponse<User>> {
    return this.apiClient.getPaginated<User>(this.endpoints.users, filter);
  }

  /**
   * Гирифтани корбар бо ID
   */
  async getUserById(userId: string): Promise<User> {
    return this.apiClient.get<User>(`${this.endpoints.userById}/${userId}`);
  }

  /**
   * Эҷоди корбари нав
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    return this.apiClient.post<User>(this.endpoints.users, data);
  }

  /**
   * Навсозии корбар
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return this.apiClient.put<User>(`${this.endpoints.userById}/${userId}`, data);
  }

  /**
   * Нест кардани корбар
   */
  async deleteUser(userId: string): Promise<void> {
    await this.apiClient.delete(`${this.endpoints.userById}/${userId}`);
  }

  /**
   * Гирифтани профили корбари ҷорӣ
   */
  async getProfile(): Promise<User> {
    return this.apiClient.get<User>(this.endpoints.profile);
  }

  /**
   * Навсозии профили корбари ҷорӣ
   */
  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return this.apiClient.put<User>(this.endpoints.profile, data);
  }

  /**
   * Тағйири пароли корбари ҷорӣ
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.apiClient.post(this.endpoints.changePassword, data);
  }

  /**
   * Боргузории аватар
   */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.apiClient.postFormData<{ url: string }>(this.endpoints.avatar, formData);
  }

  /**
   * Нест кардани аватар
   */
  async deleteAvatar(): Promise<void> {
    await this.apiClient.delete(this.endpoints.avatar);
  }

  /**
   * Фаъол кардани корбар
   */
  async activateUser(userId: string): Promise<User> {
    return this.apiClient.post<User>(`${this.endpoints.userById}/${userId}${this.endpoints.activate}`);
  }

  /**
   * Ғайрифаъол кардани корбар
   */
  async deactivateUser(userId: string): Promise<User> {
    return this.apiClient.post<User>(`${this.endpoints.userById}/${userId}${this.endpoints.deactivate}`);
  }

  /**
   * Тасдиқи email-и корбар
   */
  async verifyUserEmail(userId: string): Promise<User> {
    return this.apiClient.post<User>(`${this.endpoints.userById}/${userId}${this.endpoints.verifyEmail}`);
  }

  /**
   * Тасдиқи телефони корбар
   */
  async verifyUserPhone(userId: string): Promise<User> {
    return this.apiClient.post<User>(`${this.endpoints.userById}/${userId}${this.endpoints.verifyPhone}`);
  }

  /**
   * Гирифтани омори корбарон
   */
  async getUserStats(): Promise<UserStats> {
    return this.apiClient.get<UserStats>(this.endpoints.stats);
  }

  /**
   * Текшири мавҷудияти email
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    return this.apiClient.post<{ exists: boolean }>('/users/check-email', { email });
  }

  /**
   * Текшири мавҷудияти телефон
   */
  async checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean }> {
    return this.apiClient.post<{ exists: boolean }>('/users/check-phone', { phoneNumber });
  }
}

/**
 * Эҷоди сервиси корбарон
 */
export const createUserService = (config: UserServiceConfig): IUserService => {
  return new UserService(config);
};

export default UserService;
