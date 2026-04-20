// Tojrason/frontend/courier/src/utils/validators.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Натиҷаи валидатсия
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Валидатсияи email
 * @param email - Email барои валидатсия
 * @returns Натиҷаи валидатсия
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email ворид карда шавад' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Email нодуруст аст' };
  }

  return { valid: true };
};

/**
 * Санҷиши дуруст будани формати email (бе паём)
 * @param email - Email барои санҷиш
 * @returns true агар email дуруст бошад
 */
export const isValidEmail = (email: string): boolean => {
  return validateEmail(email).valid;
};

/**
 * Валидатсияи рақами телефони тоҷикӣ (+992XXXXXXXXX)
 * @param phone - Рақами телефон барои валидатсия
 * @returns Натиҷаи валидатсия
 */
export const validateTajikPhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Рақами телефон ворид карда шавад' };
  }

  const phoneRegex = /^(\+992|992|0)?[0-9]{9}$/;
  const cleanedPhone = phone.replace(/\s+/g, '');

  if (!phoneRegex.test(cleanedPhone)) {
    return { valid: false, error: 'Рақами телефон бояд 9 рақам дошта бошад (бо +992 ё бе он)' };
  }

  const digits = cleanedPhone.replace(/\D/g, '');
  const mainNumber = digits.slice(-9);
  const operatorCode = mainNumber.slice(0, 2);

  const validCodes = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '50', '55', '88'];
  if (!validCodes.includes(operatorCode)) {
    return { valid: false, error: 'Рамзи оператори телефон нодуруст аст' };
  }

  return { valid: true };
};

/**
 * Санҷиши дуруст будани рақами телефони тоҷикӣ (бе паём)
 * @param phone - Рақами телефон барои санҷиш
 * @returns true агар телефон дуруст бошад
 */
export const isValidTajikPhone = (phone: string): boolean => {
  return validateTajikPhone(phone).valid;
};

/**
 * Форматкунии рақами телефон ба формати ягона (+992XXXXXXXXX)
 * @param phone - Рақами телефон барои форматкунӣ
 * @returns Рақами форматшуда ё null
 */
export const formatPhoneNumber = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 9) {
    return `+992${digits}`;
  }
  
  if (digits.length === 12 && digits.startsWith('992')) {
    return `+${digits}`;
  }
  
  if (digits.length === 13 && digits.startsWith('992')) {
    return `+${digits}`;
  }
  
  return null;
};

/**
 * Валидатсияи парол
 * @param password - Парол барои валидатсия
 * @param options - Имконоти иловагӣ
 * @returns Натиҷаи валидатсия
 */
export const validatePassword = (
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): ValidationResult => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  if (!password) {
    return { valid: false, error: 'Парол ворид карда шавад' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Парол на камтар аз ${minLength} аломат бошад` };
  }

  if (requireUppercase && !/[A-ZА-ЯЁ]/.test(password)) {
    return { valid: false, error: 'Парол бояд ҳадди ақал як ҳарфи калон дошта бошад' };
  }

  if (requireLowercase && !/[a-zа-яё]/.test(password)) {
    return { valid: false, error: 'Парол бояд ҳадди ақал як ҳарфи хурд дошта бошад' };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: 'Парол бояд ҳадди ақал як рақам дошта бошад' };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Парол бояд ҳадди ақал як аломати махсус дошта бошад' };
  }

  return { valid: true };
};

/**
 * Санҷиши дуруст будани парол (бе паём)
 * @param password - Парол барои санҷиш
 * @returns true агар парол дуруст бошад
 */
export const isValidPassword = (password: string): boolean => {
  return validatePassword(password).valid;
};

/**
 * Ҳисобкунии қувваи парол (0-5)
 * @param password - Парол барои арзёбӣ
 * @returns Қувваи парол аз 0 то 5
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-zа-яё]/.test(password)) strength++;
  if (/[A-ZА-ЯЁ]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9а-яА-ЯёЁ]/.test(password)) strength++;

  return Math.min(5, strength);
};

/**
 * Гирифтани паёми қувваи парол
 * @param strength - Қувваи парол (0-5)
 * @returns Паёми қувваи парол ба тоҷикӣ
 */
export const getPasswordStrengthMessage = (strength: number): string => {
  const messages = [
    'Хеле суст',
    'Суст',
    'Миёна',
    'Қавӣ',
    'Хеле қавӣ',
    'Аъло',
  ];
  return messages[Math.min(strength, 5)] || 'Номаълум';
};

/**
 * Валидатсияи ном (танҳо ҳарфҳо, тире ва фосила)
 * @param name - Ном барои валидатсия
 * @param fieldName - Номи майдон барои паёми хатогӣ
 * @returns Натиҷаи валидатсия
 */
export const validateName = (name: string, fieldName: string = 'Ном'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { valid: false, error: `${fieldName} ворид карда шавад` };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} на камтар аз 2 аломат бошад` };
  }

  if (name.trim().length > 50) {
    return { valid: false, error: `${fieldName} зиёда аз 50 аломат набошад` };
  }

  const nameRegex = /^[a-zA-Zа-яА-ЯёЁӣӯқҳҷғ\-\s]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, error: `${fieldName} танҳо ҳарфҳо, тире ва фосила дошта бошад` };
  }

  return { valid: true };
};

/**
 * Санҷиши дуруст будани ном (бе паём)
 * @param name - Ном барои санҷиш
 * @returns true агар ном дуруст бошад
 */
export const isValidName = (name: string): boolean => {
  return validateName(name).valid;
};

/**
 * Валидатсияи мувофиқати ду парол
 * @param password - Парол
 * @param confirmPassword - Тасдиқи парол
 * @returns Натиҷаи валидатсия
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { valid: false, error: 'Тасдиқи парол ворид карда шавад' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Паролҳо мувофиқат намекунанд' };
  }

  return { valid: true };
};

/**
 * Валидатсияи рақами давлатии нақлиёт
 * @param plateNumber - Рақами давлатӣ барои валидатсия
 * @returns Натиҷаи валидатсия
 */
export const validatePlateNumber = (plateNumber: string): ValidationResult => {
  if (!plateNumber || plateNumber.trim() === '') {
    return { valid: false, error: 'Рақами давлатӣ ворид карда шавад' };
  }

  const cleaned = plateNumber.trim().toUpperCase().replace(/\s+/g, '');
  
  // Форматҳои қобили қабул: 0000AA00, 0000AA, A000AA
  const plateRegex = /^(\d{4}[A-Z]{2}\d{2}|\d{4}[A-Z]{2}|[A-Z]\d{3}[A-Z]{2})$/;
  
  if (!plateRegex.test(cleaned)) {
    return { valid: false, error: 'Формати рақами давлатӣ нодуруст аст' };
  }

  return { valid: true };
};

/**
 * Валидатсияи рақами пайгирӣ
 * @param trackingNumber - Рақами пайгирӣ барои валидатсия
 * @returns Натиҷаи валидатсия
 */
export const validateTrackingNumber = (trackingNumber: string): ValidationResult => {
  if (!trackingNumber || trackingNumber.trim() === '') {
    return { valid: false, error: 'Рақами пайгирӣ ворид карда шавад' };
  }

  const cleaned = trackingNumber.trim().toUpperCase();
  
  if (cleaned.length < 6) {
    return { valid: false, error: 'Рақами пайгирӣ на камтар аз 6 аломат бошад' };
  }

  if (cleaned.length > 20) {
    return { valid: false, error: 'Рақами пайгирӣ зиёда аз 20 аломат набошад' };
  }

  const trackingRegex = /^[A-Z0-9\-]+$/;
  if (!trackingRegex.test(cleaned)) {
    return { valid: false, error: 'Рақами пайгирӣ танҳо ҳарфҳои лотинӣ, рақамҳо ва тире дошта бошад' };
  }

  return { valid: true };
};

/**
 * Валидатсияи суроға
 * @param address - Суроға барои валидатсия
 * @returns Натиҷаи валидатсия
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return { valid: false, error: 'Суроға ворид карда шавад' };
  }

  if (address.trim().length < 5) {
    return { valid: false, error: 'Суроға на камтар аз 5 аломат бошад' };
  }

  if (address.trim().length > 200) {
    return { valid: false, error: 'Суроға зиёда аз 200 аломат набошад' };
  }

  return { valid: true };
};

/**
 * Объекти ҳамаи валидаторҳо барои истифодаи осон
 */
export const validators = {
  email: validateEmail,
  tajikPhone: validateTajikPhone,
  password: validatePassword,
  name: validateName,
  passwordMatch: validatePasswordMatch,
  plateNumber: validatePlateNumber,
  trackingNumber: validateTrackingNumber,
  address: validateAddress,
};

export default validators;
