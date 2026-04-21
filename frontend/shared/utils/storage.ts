// Tojrason/frontend/shared/utils/storage.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Намуди Storage (localStorage ё sessionStorage)
 */
type StorageType = 'local' | 'session';

/**
 * Гирифтани объекти Storage вобаста ба намуд
 */
const getStorage = (type: StorageType): Storage | null => {
  if (typeof window === 'undefined') return null;
  return type === 'local' ? window.localStorage : window.sessionStorage;
};

/**
 * Захираи маълумот дар Storage
 * @param key - Калид
 * @param value - Қимат
 * @param type - Намуди Storage (local ё session)
 */
export const setStorageItem = <T>(key: string, value: T, type: StorageType = 'local'): void => {
  const storage = getStorage(type);
  if (!storage) return;

  try {
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting ${type}Storage item "${key}":`, error);
  }
};

/**
 * Гирифтани маълумот аз Storage
 * @param key - Калид
 * @param defaultValue - Қимати пешфарз
 * @param type - Намуди Storage (local ё session)
 * @returns Қимат ё пешфарз
 */
export const getStorageItem = <T>(key: string, defaultValue?: T, type: StorageType = 'local'): T | undefined => {
  const storage = getStorage(type);
  if (!storage) return defaultValue;

  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${type}Storage item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Нест кардани маълумот аз Storage
 * @param key - Калид
 * @param type - Намуди Storage (local ё session)
 */
export const removeStorageItem = (key: string, type: StorageType = 'local'): void => {
  const storage = getStorage(type);
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${type}Storage item "${key}":`, error);
  }
};

/**
 * Тоза кардани ҳамаи маълумот аз Storage
 * @param type - Намуди Storage (local ё session)
 */
export const clearStorage = (type: StorageType = 'local'): void => {
  const storage = getStorage(type);
  if (!storage) return;

  try {
    storage.clear();
  } catch (error) {
    console.error(`Error clearing ${type}Storage:`, error);
  }
};

/**
 * Тоза кардани ҳамаи маълумот бо префикси мушаххас аз Storage
 * @param prefix - Префикс
 * @param type - Намуди Storage (local ё session)
 */
export const clearStorageByPrefix = (prefix: string, type: StorageType = 'local'): void => {
  const storage = getStorage(type);
  if (!storage) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  } catch (error) {
    console.error(`Error clearing ${type}Storage by prefix "${prefix}":`, error);
  }
};

/**
 * Санҷиши мавҷудияти калид дар Storage
 * @param key - Калид
 * @param type - Намуди Storage (local ё session)
 * @returns true агар калид мавҷуд бошад
 */
export const hasStorageItem = (key: string, type: StorageType = 'local'): boolean => {
  const storage = getStorage(type);
  if (!storage) return false;
  return storage.getItem(key) !== null;
};

/**
 * Гирифтани ҳамаи калидҳои Storage
 * @param type - Намуди Storage (local ё session)
 * @returns Массиви калидҳо
 */
export const getAllStorageKeys = (type: StorageType = 'local'): string[] => {
  const storage = getStorage(type);
  if (!storage) return [];

  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }
  return keys;
};

/**
 * Гирифтани ҳаҷми истифодашудаи Storage (бо байт)
 * @param type - Намуди Storage (local ё session)
 * @returns Ҳаҷм бо байт
 */
export const getStorageSize = (type: StorageType = 'local'): number => {
  const storage = getStorage(type);
  if (!storage) return 0;

  let size = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      size += (key.length + (value?.length || 0)) * 2; // Unicode ба 2 байт
    }
  }
  return size;
};

// ========== ФУНКСИЯҲОИ МАХСУС БАРОИ ЛОИҲА ==========

/**
 * Сохтани номи калид бо префикс
 * @param prefix - Префикс (client, courier, admin)
 * @param key - Калиди аслӣ
 * @returns Калиди пурра
 */
export const buildStorageKey = (prefix: string, key: string): string => {
  return `${prefix}_${key}`;
};

/**
 * Эҷоди объекти ёрирасон барои Storage бо префикс
 * @param prefix - Префикс барои калидҳо
 * @param type - Намуди Storage
 * @returns Объект бо функсияҳои set, get, remove, clear
 */
export const createPrefixedStorage = (prefix: string, type: StorageType = 'local') => {
  const buildKey = (key: string) => `${prefix}_${key}`;

  return {
    set: <T>(key: string, value: T) => setStorageItem(buildKey(key), value, type),
    get: <T>(key: string, defaultValue?: T) => getStorageItem<T>(buildKey(key), defaultValue, type),
    remove: (key: string) => removeStorageItem(buildKey(key), type),
    has: (key: string) => hasStorageItem(buildKey(key), type),
    clear: () => clearStorageByPrefix(prefix, type),
  };
};

// Экспорти пешфарз
const storageUtils = {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  clearStorageByPrefix,
  hasStorageItem,
  getAllStorageKeys,
  getStorageSize,
  buildStorageKey,
  createPrefixedStorage,
};

export default storageUtils;
