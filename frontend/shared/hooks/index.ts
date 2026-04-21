// Tojrason/frontend/shared/hooks/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== useAuth ==========
export { 
  default as createUseAuth,
  default as useAuth 
} from './useAuth';
export type { 
  AuthState, 
  AuthSlice, 
  AuthApi, 
  AuthSelectors, 
  UseAuthConfig 
} from './useAuth';

// ========== useSocket ==========
export { default as useSocket } from './useSocket';
export type { 
  OrderUpdateEvent,
  CourierLocationEvent,
  NotificationEvent,
  ChatMessageEvent,
  EventCallback,
  SocketConfig,
  UseSocketReturn
} from './useSocket';

// ========== useDebounce ==========
export {
  useDebouncedCallback,
  useDebounce,
  useThrottle,
  useThrottledValue,
  useOnce,
  useDebouncedWindowSize,
  useThrottledScroll,
  default as useDebounce
} from './useDebounce';

// ========== useLocalStorage ==========
export {
  useLocalStorage,
  useSessionStorage,
  useLocalStorageObject,
  useLocalStorageArray,
  default as useLocalStorage
} from './useLocalStorage';

// ========== useMediaQuery ==========
export {
  useMediaQuery,
  useBreakpoints,
  useDarkMode,
  useScreenSize,
  useIsTouchDevice,
  useOrientation,
  useWindowWidth,
  useWindowHeight,
  useWindowSize,
  useIsPrinting,
  usePrefersReducedMotion,
  usePrefersContrast,
  BREAKPOINTS,
  default as useMediaQuery
} from './useMediaQuery';

// ========== Hook-ҳои ёрирасони иловагӣ ==========

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
 * Hook барои иҷрои эффект танҳо пас аз аввалин рендер
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

// Объекти ҳамаи hook-ҳо
const hooks = {
  useAuth: createUseAuth,
  useSocket,
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useLocalStorage,
  useSessionStorage,
  useMediaQuery,
  useBreakpoints,
  useDarkMode,
  usePrevious,
  useIsFirstRender,
  useIsMounted,
  useUpdateEffect,
  useToggle,
  useDisclosure,
  useTimeout,
  useInterval,
  useNetworkStatus,
};

export default hooks;
