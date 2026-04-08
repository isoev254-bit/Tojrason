// modules/user/user.repository.ts - Дастрасӣ ба базаи додаҳо барои корбарон
import prisma from '../../config/db';
import { UserResponse, UpdateUserData } from './user.types';
import { UserRole } from '../auth/auth.types';

export class UserRepository {
  // Ёфтани корбар бо ID
  async findById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        locationLat: true,
        locationLng: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user as UserResponse | null;
  }

  // Ёфтани ҳамаи корбарон бо филтрҳо
  async findAll(filters: {
    role?: UserRole;
    isAvailable?: boolean;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<UserResponse[]> {
    const { role, isAvailable, search, skip, take } = filters;
    const where: any = {};

    if (role) where.role = role;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        locationLat: true,
        locationLng: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users as UserResponse[];
  }

  // Шумораи умумии корбарон барои саҳифабандӣ
  async count(filters: {
    role?: UserRole;
    isAvailable?: boolean;
    search?: string;
  }): Promise<number> {
    const { role, isAvailable, search } = filters;
    const where: any = {};

    if (role) where.role = role;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    return prisma.user.count({ where });
  }

  // Навсозии маълумоти корбар
  async update(id: string, data: UpdateUserData): Promise<UserResponse | null> {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.locationLat !== undefined && { locationLat: data.locationLat }),
        ...(data.locationLng !== undefined && { locationLng: data.locationLng }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        locationLat: true,
        locationLng: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updatedUser as UserResponse;
  }

  // Нест кардани корбар
  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  // Санҷиши мавҷудияти email барои дигар корбар (ҳангоми навсозӣ)
  async isEmailTakenByOther(email: string, excludeUserId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        id: { not: excludeUserId },
      },
    });
    return !!user;
  }

  // Санҷиши мавҷудияти телефон барои дигар корбар
  async isPhoneTakenByOther(phone: string, excludeUserId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: excludeUserId },
      },
    });
    return !!user;
  }

  // Навсозии ҷойгиршавии курьер (метод барои кӯмак ба модули courier)
  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
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

  // Ёфтани курьерҳои дастрас дар масофаи додашуда (барои dispatch)
  async findAvailableCouriersNearby(lat: number, lng: number, radiusMeters: number): Promise<UserResponse[]> {
    // Барои соддагӣ ҳамаи курьерҳои дастрасро мегирем.
    // Дар лоиҳаи воқеӣ ин ҷо бояд бо SQL ва ҳисобкунии масофа (Haversine) кор кунем.
    // Ин ҷо танҳо намуна.
    const couriers = await prisma.user.findMany({
      where: {
        role: 'COURIER',
        isAvailable: true,
        locationLat: { not: null },
        locationLng: { not: null },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        locationLat: true,
        locationLng: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    // Дар ин ҷо метавон масофаро ҳисоб кард ва фильтр кард
    return couriers as UserResponse[];
  }
        }
