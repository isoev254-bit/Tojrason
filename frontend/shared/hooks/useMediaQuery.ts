// Tojrason/frontend/shared/hooks/useMediaQuery.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook барои санҷиши media query
 * @param query - Media query string (масалан: "(min-width: 768px)")
 * @returns boolean - true агар мувофиқ бошад
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Навсозии ҳолат дар сурати тағйирёбии мувофиқат
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Навсозии аввала
    setMatches(mediaQuery.matches);

    // Илова кардани listener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * Breakpoints-и стандартӣ (мувофиқ бо Tailwind CSS)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Hook барои санҷиши андозаи экран
 * @returns Объект бо ҳолати ҳар як breakpoint
 */
export const useBreakpoints = () => {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    // Баръакс (то андоза)
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
  };
};

/**
 * Hook барои санҷиши ҳолати торик/равшан
 * @returns boolean - true агар реҷаи торик бошад
 */
export const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isDark;
};

/**
 * Hook барои санҷиши андозаи мушаххаси экран
 * @param size - Андозаи экран (sm, md, lg, xl, 2xl) ё рақам
 * @param direction - "up" (>=) ё "down" (<=)
 * @returns boolean
 */
export const useScreenSize = (
  size: number | keyof typeof BREAKPOINTS,
  direction: 'up' | 'down' = 'up'
): boolean => {
  const sizeValue = typeof size === 'string' ? BREAKPOINTS[size] : size;
  const query = direction === 'up' 
    ? `(min-width: ${sizeValue}px)`
    : `(max-width: ${sizeValue - 1}px)`;
  
  return useMediaQuery(query);
};

/**
 * Hook барои санҷиши дастгоҳи мобилӣ (ламсӣ)
 * @returns boolean - true агар дастгоҳ ламсӣ бошад
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
};

/**
 * Hook барои санҷиши самти экран (портретӣ ё ландшафтӣ)
 * @returns "portrait" ё "landscape"
 */
export const useOrientation = (): 'portrait' | 'landscape' => {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
};

/**
 * Hook барои санҷиши паҳнои экран дар вақти воқеӣ
 * @returns Паҳнои ҷории экран
 */
export const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

/**
 * Hook барои санҷиши баландии экран дар вақти воқеӣ
 * @returns Баландии ҷории экран
 */
export const useWindowHeight = (): number => {
  const [height, setHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return height;
};

/**
 * Hook барои санҷиши андозаи экран бо debounce
 * @param delay - Таъхир бо миллисонияҳо
 * @returns Объект бо паҳно ва баландии экран
 */
export const useWindowSize = (delay: number = 250) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    
    // Навсозии аввала
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return windowSize;
};

/**
 * Hook барои санҷиши чоп шудани саҳифа
 * @returns boolean - true агар дар ҳолати чоп бошад
 */
export const useIsPrinting = (): boolean => {
  return useMediaQuery('print');
};

/**
 * Hook барои санҷиши кам кардани ҳаракат (accessibility)
 * @returns boolean - true агар корбар ҳаракати камро дархост карда бошад
 */
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Hook барои санҷиши контрасти баланд (accessibility)
 * @returns boolean - true агар корбар контрасти баландро дархост карда бошад
 */
export const usePrefersContrast = (): boolean => {
  return useMediaQuery('(prefers-contrast: more)');
};

export default useMediaQuery;
