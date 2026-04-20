// Tojrason/frontend/courier/src/hooks/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// Export кардани ҳамаи hook-ҳо
export { default as useAuth } from './useAuth';
export { default as useSocket } from './useSocket';
export { default as useGeolocation } from './useGeolocation';
export { 
  useReverseGeocoding,
  useGeocoding,
} from './useGeolocation';
export { default as useOrderUpdates } from './useOrderUpdates';

// ============================================
// Hook-ҳои ёрирасон (Utilities)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook барои нигоҳ доштани қимати қаблӣ
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
 * Hook барои toggle кардани қимати boolean
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
 * Hook барои таъхир додани иҷрои функсия (debounce)
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  return debouncedCallback;
};

/**
 * Hook барои таъхир додани тағйири қимат (debounce value)
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook барои захираи қимат дар localStorage
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
 * Hook барои timeout
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

/**
 * Hook барои санҷиши онлай/офлайн будани дастгоҳ
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook барои идоракунии огоҳиҳои фармоиши нав
 */
export const useNewOrderAlert = () => {
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [newOrderData, setNewOrderData] = useState<any>(null);

  const showNewOrderAlert = useCallback((order: any) => {
    setHasNewOrder(true);
    setNewOrderData(order);
    
    // Навохтани садо (ихтиёрӣ)
    // const audio = new Audio('/notification.mp3');
    // audio.play().catch(console.error);
  }, []);

  const dismissAlert = useCallback(() => {
    setHasNewOrder(false);
    setNewOrderData(null);
  }, []);

  return {
    hasNewOrder,
    newOrderData,
    showNewOrderAlert,
    dismissAlert,
  };
};

// Export кардани ҳама чиз ҳамчун объекти пешфарз
const hooks = {
  useAuth,
  useSocket,
  useGeolocation,
  useReverseGeocoding,
  useGeocoding,
  useOrderUpdates,
  usePrevious,
  useIsFirstRender,
  useIsMounted,
  useToggle,
  useDisclosure,
  useDebouncedCallback,
  useDebounce,
  useLocalStorage,
  useTimeout,
  useInterval,
  useNetworkStatus,
  useNewOrderAlert,
};

export default hooks;
