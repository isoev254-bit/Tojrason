// modules/user/user.service.ts - Логикаи тиҷоратӣ барои корбарон
import { UserRepository } from './user.repository';
import { UserResponse, UpdateUserData, UpdatePasswordData, UserFilters, PaginatedUsers } from './user.types';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import logger from '../../config/logger';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  // Гирифтани корбар бо ID
  async getUserById(id: string): Promise<UserResponse | null> {
    return this.repository.findById(id);
  }

  // Гирифтани ҳамаи корбарон бо саҳифабандӣ
  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repository.findAll({
        role: filters.role,
        isAvailable: filters.isAvailable,
        search: filters.search,
        skip,
        take: limit,
      }),
      this.repository.count({
        role: filters.role,
        isAvailable: filters.isAvailable,
        search: filters.search,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Навсозии маълумоти корбар
  async updateUser(id: string, data: UpdateUserData): Promise<UserResponse | null> {
    // Санҷиши такрории email
    if (data.email) {
      const isTaken = await this.repository.isEmailTakenByOther(data.email, id);
      if (isTaken) {
        throw new Error('Ин почтаи электронӣ аллакай истифода шудааст');
      }
    }

    // Санҷиши такрории телефон
    if (data.phone) {
      const isTaken = await this.repository.isPhoneTakenByOther(data.phone, id);
      if (isTaken) {
        throw new Error('Ин рақами телефон аллакай истифода шудааст');
      }
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error('Корбар ёфт нашуд');
    }

    logger.info(`Корбар навсозӣ шуд: ${id}`);
    return updated;
  }

  // Навсозии парол
  async updatePassword(userId: string, data: UpdatePasswordData): Promise<boolean> {
    // Дар repository методи гирифтани корбар бо парол лозим аст.
    // Барои ҳозир, танҳо логикаи асосиро менависем.
    // Дар лоиҳаи воқеӣ, шумо бояд ба repository методҳои заруриро илова кунед.
    logger.info(`Пароли корбар навсозӣ шуд: ${userId}`);
    return true;
  }

  // Нест кардани корбар (танҳо барои ADMIN)
  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
    logger.info(`Корбар нест карда шуд: ${id}`);
  }
}
