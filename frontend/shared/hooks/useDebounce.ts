// Tojrason/frontend/shared/hooks/useDebounce.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook барои таъхир додани иҷрои функсия
 * @param callback - Функсия барои иҷро
 * @param delay - Таъхир бо миллисонияҳо
 * @returns Debounced функция
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
 * Hook барои таъхир додани тағйири қимат
 * @param value - Қимат барои таъхир
 * @param delay - Таъхир бо миллисонияҳо
 * @returns Қимати таъхирёфта
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
 * Hook барои throttle кардани функсия (маҳдуд кардани шумораи иҷро)
 * @param callback - Функсия барои иҷро
 * @param limit - Маҳдудият бо миллисонияҳо
 * @returns Throttled функция
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 500
): ((...args: Parameters<T>) => void) => {
  const lastRunRef = useRef<number>(0);
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

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (lastRunRef.current === 0) {
      callbackRef.current(...args);
      lastRunRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const timeSinceLastRun = Date.now() - lastRunRef.current;
        
        if (timeSinceLastRun >= limit) {
          callbackRef.current(...args);
          lastRunRef.current = Date.now();
        }
      }, Math.max(limit - (now - lastRunRef.current), 0));
    }
  }, [limit]);

  return throttledCallback;
};

/**
 * Hook барои throttle кардани қимат
 * @param value - Қимат барои throttle
 * @param limit - Маҳдудият бо миллисонияҳо
 * @returns Қимати throttle шуда
 */
export const useThrottledValue = <T>(value: T, limit: number = 500): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= limit) {
      setThrottledValue(value);
      lastUpdatedRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastUpdatedRef.current = Date.now();
      }, limit - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Hook барои иҷрои функсия танҳо як маротиба
 * @param callback - Функсия барои иҷро
 * @returns Функсияе, ки танҳо як маротиба иҷро мешавад
 */
export const useOnce = <T extends (...args: any[]) => any>(
  callback: T
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  const hasRunRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const onceCallback = useCallback((...args: Parameters<T>): ReturnType<T> | undefined => {
    if (!hasRunRef.current) {
      hasRunRef.current = true;
      return callbackRef.current(...args);
    }
    return undefined;
  }, []);

  return onceCallback;
};

/**
 * Hook барои пайгирии тағйироти андозаи экран (debounced)
 * @param delay - Таъхир бо миллисонияҳо
 * @returns Андозаҳои ҷории экран
 */
export const useDebouncedWindowSize = (delay: number = 250) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const debouncedSetSize = useDebouncedCallback((width: number, height: number) => {
    setWindowSize({ width, height });
  }, delay);

  useEffect(() => {
    const handleResize = () => {
      debouncedSetSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedSetSize]);

  return windowSize;
};

/**
 * Hook барои пайгирии скрол (throttled)
 * @param limit - Маҳдудият бо миллисонияҳо
 * @returns Мавқеи ҷории скрол
 */
export const useThrottledScroll = (limit: number = 100) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: typeof window !== 'undefined' ? window.scrollX : 0,
    y: typeof window !== 'undefined' ? window.scrollY : 0,
  });

  const throttledSetPosition = useThrottle((x: number, y: number) => {
    setScrollPosition({ x, y });
  }, limit);

  useEffect(() => {
    const handleScroll = () => {
      throttledSetPosition(window.scrollX, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttledSetPosition]);

  return scrollPosition;
};

export default useDebounce;
