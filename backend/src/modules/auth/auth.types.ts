// modules/auth/auth.types.ts - Type'ҳои асосии модули auth
export type UserRole = 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';

// Маълумоте, ки дар JWT нигоҳ дошта мешавад
export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

// Маълумоти пурраи корбар (аз базаи додаҳо)
export interface User extends UserPayload {
  phone: string;
  passwordHash: string;
  locationLat?: number | null;
  locationLng?: number | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Маълумот барои сабти ном
export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

// Маълумот барои воридшавӣ
export interface LoginData {
  email: string;
  password: string;
}

// Ҷавоби муваффақият
export interface AuthResponse {
  user: UserPayload;
  token: string;
}
