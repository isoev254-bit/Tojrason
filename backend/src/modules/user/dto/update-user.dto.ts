// modules/user/dto/update-user.dto.ts - DTO барои навсозии маълумоти корбар
export class UpdateUserDto {
  /** Номи пурра (ихтиёрӣ) */
  fullName?: string;

  /** Рақами телефон (ихтиёрӣ, унӣкал) */
  phone?: string;

  /** Почтаи электронӣ (ихтиёрӣ, унӣкал) */
  email?: string;

  /** Арзиши паҳноӣ (latitude) барои курьер (ихтиёрӣ) */
  locationLat?: number | null;

  /** Арзиши дарозӣ (longitude) барои курьер (ихтиёрӣ) */
  locationLng?: number | null;

  /** Ҳолати дастрасӣ барои курьер (ихтиёрӣ) */
  isAvailable?: boolean;
}
