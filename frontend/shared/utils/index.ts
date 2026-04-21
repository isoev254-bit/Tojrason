// Tojrason/frontend/shared/utils/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== FORMAT DATE ==========
export * from './formatDate';
export { default as formatDateUtils } from './formatDate';

// ========== FORMAT PRICE ==========
export * from './formatPrice';
export { default as formatPriceUtils } from './formatPrice';

// ========== VALIDATORS ==========
export * from './validators';
export { default as validators } from './validators';

// ========== CONSTANTS ==========
export * from './constants';
export { default as constants } from './constants';

// ========== SOCKET ==========
export * from './socket';
export { default as socketManager } from './socket';

// ========== GEOLOCATION ==========
export * from './geolocation';
export { default as geolocationUtils } from './geolocation';

// ========== STORAGE ==========
export * from './storage';
export { default as storageUtils } from './storage';

// ========== ЁРИРАСОНИ УМУМӢ ==========

/**
 * Таъхир додани иҷрои функсия (sleep)
 * @param ms - Миллисонияҳо
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Эҷоди идентификатори беназир
 * @param prefix - Префикс (ихтиёрӣ)
 * @returns ID-и беназир
 */
export const generateUniqueId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Копи кардани матн ба клипборд
 * @param text - Матн барои копи
 * @returns Promise<boolean> - true агар муваффақ бошад
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Тасвири кӯтоҳи матн
 * @param text - Матни аслӣ
 * @param maxLength - Дарозии максималӣ
 * @returns Матни кӯтоҳшуда
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Табдили сатри аввал ба ҳарфи калон
 * @param str - Сатр
 * @returns Сатри форматшуда
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Табдили ном ба инитсиалҳо
 * @param firstName - Ном
 * @param lastName - Насаб
 * @returns Инитсиалҳо (масалан: "А.М.")
 */
export const getInitials = (firstName: string, lastName?: string): string => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  if (firstInitial && lastInitial) {
    return `${firstInitial}.${lastInitial}.`;
  }
  return firstInitial || lastInitial || '';
};

/**
 * Форматкунии рақами телефон барои намоиш
 * @param phone - Рақами телефон
 * @returns Рақами форматшуда (масалан: +992 90 000 00 00)
 */
export const formatPhoneDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('992')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  
  if (digits.length === 9) {
    return `+992 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }
  
  return phone;
};

/**
 * Санҷиши онлай будани дастгоҳ
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Экспорти пешфарз
const utils = {
  sleep,
  generateUniqueId,
  copyToClipboard,
  truncateText,
  capitalize,
  getInitials,
  formatPhoneDisplay,
  isOnline,
};

export default utils;
