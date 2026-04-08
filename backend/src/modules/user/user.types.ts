// modules/user/user.types.ts - Type'ҳои асосии модули user
import { UserRole } from '../auth/auth.types';

// Маълумоти корбар барои ҷавобҳо (бе парол)
export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  locationLat?: number | null;
  locationLng?: number | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Маълумот барои навсозии корбар
export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  email?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  isAvailable?: boolean;
}

// Маълумот барои навсозии парол
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Филтр барои ҷустуҷӯи корбарон
export interface UserFilters {
  role?: UserRole;
  isAvailable?: boolean;
  search?: string; // ҷустуҷӯ дар fullName ё email
  page?: number;
  limit?: number;
}

// Натиҷаи саҳифабандӣ
export interface PaginatedUsers {
  data: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
