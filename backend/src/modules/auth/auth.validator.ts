// modules/auth/auth.validator.ts - Валидатсияи маълумотҳои даромад барои auth
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export class AuthValidator {
  // Валидатсияи маълумотҳои регистратсия
  static validateRegister(data: any): RegisterDto {
    // Санҷиши email
    if (!data.email) {
      throw new Error('Email ҳатмист');
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Формати email нодуруст аст');
    }

    // Санҷиши телефон (рақамҳои тоҷикӣ: 9 рақам, оғоз бо 9)
    if (!data.phone) {
      throw new Error('Рақами телефон ҳатмист');
    }
    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(data.phone)) {
      throw new Error('Рақами телефон бояд аз 9 то 15 рақам дошта бошад');
    }

    // Санҷиши парол
    if (!data.password) {
      throw new Error('Парол ҳатмист');
    }
    if (data.password.length < 6) {
      throw new Error('Парол бояд ҳадди ақал 6 рамз дошта бошад');
    }
    if (data.password.length > 100) {
      throw new Error('Парол набояд аз 100 рамз зиёд бошад');
    }

    // Санҷиши номи пурра
    if (!data.fullName) {
      throw new Error('Номи пурра ҳатмист');
    }
    if (data.fullName.trim().length < 2) {
      throw new Error('Номи пурра бояд ҳадди ақал 2 ҳарф дошта бошад');
    }
    if (data.fullName.length > 100) {
      throw new Error('Номи пурра набояд аз 100 ҳарф зиёд бошад');
    }

    // Санҷиши нақш (агар дода шуда бошад)
    if (data.role) {
      const allowedRoles = ['CLIENT', 'COURIER', 'ADMIN', 'DISPATCHER'];
      if (!allowedRoles.includes(data.role)) {
        throw new Error('Нақши нодуруст. Нақшҳои иҷозатшуда: CLIENT, COURIER, ADMIN, DISPATCHER');
      }
    }

    return data as RegisterDto;
  }

  // Валидатсияи маълумотҳои логин
  static validateLogin(data: any): LoginDto {
    // Санҷиши email
    if (!data.email) {
      throw new Error('Email ҳатмист');
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Формати email нодуруст аст');
    }

    // Санҷиши парол
    if (!data.password) {
      throw new Error('Парол ҳатмист');
    }
    if (data.password.length < 6) {
      throw new Error('Парол бояд ҳадди ақал 6 рамз дошта бошад');
    }

    return data as LoginDto;
  }
}
