// Tojrason/frontend/shared/hooks/useLocalStorage.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook барои захираи қимат дар localStorage
 * @param key - Калид барои захира
 * @param initialValue - Қимати аввала
 * @returns [value, setValue, removeValue]
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // Функсия барои хондани қимат аз localStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Функсия барои гузоштани қимат
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Функсия барои нест кардани қимат
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // Навсозии қимат ҳангоми тағйири калид
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);
  
  // Гӯш кардани тағйироти localStorage аз дигар табҳо
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
};

/**
 * Hook барои захираи қимат дар sessionStorage
 * @param key - Калид барои захира
 * @param initialValue - Қимати аввала
 * @returns [value, setValue, removeValue]
 */
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);
  
  return [storedValue, setValue, removeValue];
};

/**
 * Hook барои захираи объект дар localStorage бо имкони навсозии қисман
 * @param key - Калид барои захира
 * @param initialValue - Қимати аввала
 * @returns [value, setValue, updateValue, removeValue]
 */
export const useLocalStorageObject = <T extends Record<string, any>>(
  key: string,
  initialValue: T
): [
  T,
  (value: T | ((val: T) => T)) => void,
  (updates: Partial<T> | ((val: T) => Partial<T>)) => void,
  () => void
] => {
  const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue);
  
  const updateValue = useCallback((updates: Partial<T> | ((val: T) => Partial<T>)) => {
    setValue((prev) => {
      const updateObj = updates instanceof Function ? updates(prev) : updates;
      return { ...prev, ...updateObj };
    });
  }, [setValue]);
  
  return [value, setValue, updateValue, removeValue];
};

/**
 * Hook барои захираи массив дар localStorage бо имкони илова/нест кардан
 * @param key - Калид барои захира
 * @param initialValue - Қимати аввала
 * @returns [value, setValue, addItem, removeItem, updateItem, clear]
 */
export const useLocalStorageArray = <T>(
  key: string,
  initialValue: T[] = []
): [
  T[],
  (value: T[] | ((val: T[]) => T[])) => void,
  (item: T) => void,
  (predicate: (item: T) => boolean) => void,
  (predicate: (item: T) => boolean, newItem: T) => void,
  () => void
] => {
  const [value, setValue, removeValue] = useLocalStorage<T[]>(key, initialValue);
  
  const addItem = useCallback((item: T) => {
    setValue((prev) => [...prev, item]);
  }, [setValue]);
  
  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setValue((prev) => prev.filter((item) => !predicate(item)));
  }, [setValue]);
  
  const updateItem = useCallback((predicate: (item: T) => boolean, newItem: T) => {
    setValue((prev) => prev.map((item) => (predicate(item) ? newItem : item)));
  }, [setValue]);
  
  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);
  
  return [value, setValue, addItem, removeItem, updateItem, clear];
};

export default useLocalStorage;
