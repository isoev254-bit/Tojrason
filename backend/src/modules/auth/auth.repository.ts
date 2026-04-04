// backend/src/modules/auth/auth.repository.ts
// Дастрасӣ ба базаи додаҳо барои корбарон

import prisma from '../../config/db';
import { User, RegisterData } from './auth.types';
import { hashPassword } from '../../common/utils/hash';
import logger from '../../config/logger';

export class AuthRepository {
  // Ёфтани корбар бо email
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  // Ёфтани корбар бо телефон
  async findByPhone(phone: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { phone },
    });
    return user as User | null;
  }

  // Ёфтани корбар бо ID
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as User | null;
  }

  // Эҷоди корбари нав
  async createUser(data: RegisterData): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'CLIENT',
      },
    });
    logger.debug(`User created in DB: ${user.id}`);
    return user as User;
  }

  // Навсозии ҷойгиршавии курьер
  async updateUserLocation(userId: string, lat: number, lng: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { locationLat: lat, locationLng: lng },
    });
  }

  // Тағйири ҳолати дастрасии курьер
  async setAvailability(userId: string, isAvailable: boolean): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isAvailable },
    });
  }

  // Ҳамаи курьерҳои дастрас дар наздикӣ (барои dispatch)
  async findAvailableCouriersNearby(lat: number, lng: number, radiusMeters: number): Promise<User[]> {
    // Барои соддагӣ ҳамаи курьерҳои дастрасро мегирем.
    // Дар лоиҳаи воқеӣ ин ҷо бояд бо SQL ё геоиндекси махсус кор кард.
    const couriers = await prisma.user.findMany({
      where: {
        role: 'COURIER',
        isAvailable: true,
        locationLat: { not: null },
        locationLng: { not: null },
      },
    });
    return couriers as User[];
  }
}
