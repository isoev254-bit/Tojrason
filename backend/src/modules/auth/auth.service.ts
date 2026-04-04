// modules/auth/auth.service.ts - Логикаи тиҷоратии аутентификатсия
import { AuthRepository } from './auth.repository';
import { RegisterData, LoginData, UserPayload, AuthResponse } from './auth.types';
import { comparePassword } from '../../common/utils/hash';
import { generateToken } from '../../common/utils/token';
import logger from '../../config/logger';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  // Сабти номи корбари нав
  async register(data: RegisterData): Promise<AuthResponse> {
    // Санҷиши такрории email
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Ин почтаи электронӣ аллакай истифода шудааст');
    }

    // Санҷиши такрории телефон
    const existingPhone = await this.repository.findByPhone(data.phone);
    if (existingPhone) {
      throw new Error('Ин рақами телефон аллакай истифода шудааст');
    }

    // Эҷоди корбар
    const user = await this.repository.createUser(data);

    // Тайёр кардани payload барои JWT
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    // Генератсияи токен
    const token = generateToken(payload);

    logger.info(`Корбари нав сабт шуд: ${user.email} (${user.role})`);

    return { user: payload, token };
  }

  // Воридшавии корбар
  async login(credentials: LoginData): Promise<AuthResponse> {
    // Ёфтани корбар бо email
    const user = await this.repository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Email ё парол нодуруст аст');
    }

    // Санҷиши парол
    const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Email ё парол нодуруст аст');
    }

    // Тайёр кардани payload
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    // Генератсияи токен
    const token = generateToken(payload);

    logger.info(`Корбар ворид шуд: ${user.email}`);

    return { user: payload, token };
  }

  // Гирифтани маълумоти корбар аз рӯи ID (барои /me)
  async getUserById(userId: string): Promise<UserPayload | null> {
    const user = await this.repository.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
  }
}
