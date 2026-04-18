// Tojrason/frontend/client/src/hooks/index.ts

// Export кардани ҳамаи hook-ҳо
export { default as useAuth } from './useAuth';
export { default as useSocket } from './useSocket';
export { default as useGeolocation } from './useGeolocation';
export { 
  useReverseGeocoding,
  useGeocoding,
} from './useGeolocation';
export { 
  default as useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledValue,
  useOnce,
  useDebouncedWindowSize,
  useThrottledScroll,
} from './useDebounce';

// Export кардани hook-ҳои иловагӣ (оянда илова мешаванд)
// export { default as useLocalStorage } from './useLocalStorage';
// export { default as useMediaQuery } from './useMediaQuery';
// export { default as useOrderUpdates } from './useOrderUpdates';

// ============================================
// Hook-ҳои ёрирасон (Utilities)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook барои нигоҳ доштани қимати қаблӣ
 * @param value - Қимати ҷорӣ
 * @returns Қимати қаблӣ
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Hook барои санҷиши аввалин рендер
 * @returns boolean - true агар аввалин рендер бошад
 */
export const useIsFirstRender = (): boolean => {
  const isFirst = useRef(true);
  
  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }
  
  return false;
};

/**
 * Hook барои санҷиши mounted будани компонент
 * @returns Функсия барои санҷиши mounted
 */
export const useIsMounted = (): (() => boolean) => {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return useCallback(() => isMounted.current, []);
};

/**
 * Hook барои иҷрои эффект танҳо пас аз аввалин рендер
 * @param effect - Функсия барои иҷро
 * @param deps - Вобастагиҳо
 */
export const useUpdateEffect = (effect: () => void | (() => void), deps: any[] = []): void => {
  const isFirstRender = useIsFirstRender();
  
  useEffect(() => {
    if (!isFirstRender) {
      return effect();
    }
  }, deps);
};

/**
 * Hook барои toggle кардани қимати boolean
 * @param initialValue - Қимати аввала
 * @returns [value, toggle, setValue]
 */
export const useToggle = (initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  return [value, toggle, setValue];
};

/**
 * Hook барои идоракунии ҳолати кушода/баста
 * @param initialValue - Қимати аввала
 * @returns Объект бо ҳолат ва функсияҳои идоракунӣ
 */
export const useDisclosure = (initialValue: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);
  
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  };
};

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
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);
  
  return [storedValue, setValue, removeValue];
};

/**
 * Hook барои санҷиши андозаи экран (Media Query)
 * @param query - Media query string
 * @returns boolean - true агар мувофиқ бошад
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    media.addEventListener('change', listener);
    
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [matches, query]);
  
  return matches;
};

/**
 * Hook барои timeout
 * @param callback - Функсия барои иҷро
 * @param delay - Таъхир бо миллисонияҳо
 * @returns Функсияҳои reset ва clear
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const set = useCallback(() => {
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
    }
  }, [delay]);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);
  
  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);
  
  return { reset, clear };
};

/**
 * Hook барои interval
 * @param callback - Функсия барои иҷро
 * @param delay - Таъхир бо миллисонияҳо (null барои қатъ)
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => callbackRef.current(), delay);
    
    return () => clearInterval(id);
  }, [delay]);
};

// Export кардани ҳама чиз ҳамчун объекти пешфарз
const hooks = {
  useAuth,
  useSocket,
  useGeolocation,
  useReverseGeocoding,
  useGeocoding,
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledValue,
  useOnce,
  useDebouncedWindowSize,
  useThrottledScroll,
  usePrevious,
  useIsFirstRender,
  useIsMounted,
  useUpdateEffect,
  useToggle,
  useDisclosure,
  useLocalStorage,
  useMediaQuery,
  useTimeout,
  useInterval,
};

export default hooks;
