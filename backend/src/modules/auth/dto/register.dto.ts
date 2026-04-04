// modules/auth/dto/register.dto.ts - DTO барои сабти ном
import { UserRole } from '../auth.types';

export class RegisterDto {
  /** Почтаи электронӣ (унӣкал) */
  email!: string;

  /** Рақами телефон (унӣкал) */
  phone!: string;

  /** Парол (ҳадди ақал 6 рамз) */
  password!: string;

  /** Номи пурра */
  fullName!: string;

  /** Нақши корбар (ихтиёрӣ, пешфарз CLIENT) */
  role?: UserRole;
}
