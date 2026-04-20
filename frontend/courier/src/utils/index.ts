// Tojrason/frontend/courier/src/utils/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== Format Date ==========
export * from './formatDate';
export { default as formatDateUtils } from './formatDate';

// ========== Format Price ==========
export * from './formatPrice';
export { default as formatPriceUtils } from './formatPrice';

// ========== Format Distance ==========
export * from './formatDistance';
export { default as formatDistanceUtils } from './formatDistance';

// ========== Validators ==========
export * from './validators';
export { default as validators } from './validators';

// ========== Constants ==========
export * from './constants';
export { default as constants } from './constants';

// ========== Socket ==========
export * from './socket';
export { default as socketManager } from './socket';

// ========== Geolocation ==========
export * from './geolocation';
export { default as geolocationUtils } from './geolocation';

// ========== Storage (LocalStorage ва SessionStorage ёрирасон) ==========
/**
 * Захираи маълумот дар localStorage бо префикси courier_
 * @param key - Калид
 * @param value - Қимат
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`courier_${key}`, serialized);
  } catch (error) {
    console.error(`Error setting localStorage item "courier_${key}":`, error);
  }
};

/**
 * Гирифтани маълумот аз localStorage бо префикси courier_
 * @param key - Калид
 * @param defaultValue - Қимати пешфарз
 * @returns Қимат ё пешфарз
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const item = localStorage.getItem(`courier_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item "courier_${key}":`, error);
    return defaultValue;
  }
};

/**
 * Нест кардани маълумот аз localStorage бо префикси courier_
 * @param key - Калид
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(`courier_${key}`);
  } catch (error) {
    console.error(`Error removing localStorage item "courier_${key}":`, error);
  }
};

/**
 * Тоза кардани ҳамаи маълумоти курйер аз localStorage
 */
export const clearCourierStorage = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('courier_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing courier localStorage:', error);
  }
};

// ========== Ёрирасони умумӣ ==========
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

// ========== Экспорти пешфарз ==========
const utils = {
  // Storage
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearCourierStorage,
  // General
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
