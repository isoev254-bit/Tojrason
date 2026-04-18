// Tojrason/frontend/client/src/utils/index.ts
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
 * Захираи маълумот дар localStorage
 * @param key - Калид
 * @param value - Қимат
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
  }
};

/**
 * Гирифтани маълумот аз localStorage
 * @param key - Калид
 * @param defaultValue - Қимати пешфарз
 * @returns Қимат ё пешфарз
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Нест кардани маълумот аз localStorage
 * @param key - Калид
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item "${key}":`, error);
  }
};

/**
 * Тоза кардани ҳамаи localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
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

// ========== Экспорти пешфарз ==========
const utils = {
  // Storage
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  // General
  sleep,
  generateUniqueId,
  copyToClipboard,
  truncateText,
  capitalize,
  getInitials,
};

export default utils;
