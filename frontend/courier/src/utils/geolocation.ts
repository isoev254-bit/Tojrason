// Tojrason/frontend/courier/src/utils/geolocation.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { MAP_CONFIG, TRACKING_CONFIG } from './constants';

// Намуди координатаҳо
export interface Coordinates {
  lat: number;
  lng: number;
}

// Намуди макони ҷуғрофӣ бо суроға
export interface Location extends Coordinates {
  address?: string;
  name?: string;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

// Намуди хатогии геолокатсия
export interface GeolocationError {
  code: number;
  message: string;
}

// Доимиҳо барои кодҳои хатогӣ
export const GEOLOCATION_ERROR_CODES = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

/**
 * Санҷиши дастгирии геолокатсия дар браузер
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Гирифтани мавқеи ҷории корбар
 * @param options - Имконоти геолокатсия
 * @returns Promise бо координатаҳо ё хатогӣ
 */
export const getCurrentPosition = (
  options: PositionOptions = {
    enableHighAccuracy: TRACKING_CONFIG.LOCATION_ACCURACY.ENABLE_HIGH_ACCURACY,
    timeout: TRACKING_CONFIG.LOCATION_ACCURACY.TIMEOUT,
    maximumAge: TRACKING_CONFIG.LOCATION_ACCURACY.MAXIMUM_AGE,
  }
): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: 'Геолокатсия дар браузери шумо дастгирӣ намешавад',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

/**
 * Пайгирии доимии мавқеи корбар
 * @param successCallback - Функсияи бозгашт барои муваффақият
 * @param errorCallback - Функсияи бозгашт барои хатогӣ
 * @param options - Имконоти геолокатсия
 * @returns ID-и пайгирӣ барои қатъ кардан
 */
export const watchPosition = (
  successCallback: (position: GeolocationPosition) => void,
  errorCallback?: (error: GeolocationPositionError) => void,
  options: PositionOptions = {
    enableHighAccuracy: TRACKING_CONFIG.LOCATION_ACCURACY.ENABLE_HIGH_ACCURACY,
    timeout: TRACKING_CONFIG.LOCATION_ACCURACY.TIMEOUT,
    maximumAge: TRACKING_CONFIG.LOCATION_ACCURACY.MAXIMUM_AGE,
  }
): number | null => {
  if (!isGeolocationSupported()) {
    errorCallback?.({
      code: 0,
      message: 'Геолокатсия дар браузери шумо дастгирӣ намешавад',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);
    return null;
  }

  return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
};

/**
 * Қатъ кардани пайгирии мавқеъ
 * @param watchId - ID-и пайгирӣ
 */
export const clearWatch = (watchId: number): void => {
  if (isGeolocationSupported() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Ҳисобкунии масофа байни ду нуқта бо формулаи Haversine
 * @param lat1 - Арзи нуқтаи аввал
 * @param lon1 - Тули нуқтаи аввал
 * @param lat2 - Арзи нуқтаи дуюм
 * @param lon2 - Тули нуқтаи дуюм
 * @returns Масофа бо километр
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Радиуси Замин бо километр
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Табдили дараҷа ба радиан
 * @param degrees - Кунҷ бо дараҷа
 * @returns Кунҷ бо радиан
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Табдили радиан ба дараҷа
 * @param radians - Кунҷ бо радиан
 * @returns Кунҷ бо дараҷа
 */
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Ҳисобкунии масофаи тайшуда аз рӯи координатаҳои пайдарпай
 * @param points - Массиви нуқтаҳо
 * @returns Масофаи умумӣ бо километр
 */
export const calculateTotalDistance = (points: Coordinates[]): number => {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return total;
};

/**
 * Форматкунии координатаҳо ба сатри хондашаванда
 * @param lat - Арз
 * @param lng - Тул
 * @param decimals - Шумораи рақамҳои даҳӣ
 * @returns Сатри форматшуда
 */
export const formatCoordinates = (
  lat: number,
  lng: number,
  decimals: number = 4
): string => {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(decimals)}° ${latDirection}, ${Math.abs(lng).toFixed(decimals)}° ${lngDirection}`;
};

/**
 * Санҷиши валид будани координатаҳо
 * @param lat - Арз
 * @param lng - Тул
 * @returns true агар координатаҳо валид бошанд
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Эҷоди URL барои кушодани харита дар Google Maps
 * @param lat - Арз
 * @param lng - Тул
 * @param label - Нишон (ихтиёрӣ)
 * @returns URL-и Google Maps
 */
export const getGoogleMapsUrl = (lat: number, lng: number, label?: string): string => {
  const base = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return label ? `${base}&query_place_id=${encodeURIComponent(label)}` : base;
};

/**
 * Эҷоди URL барои кушодани харита дар Яндекс Карты
 * @param lat - Арз
 * @param lng - Тул
 * @returns URL-и Яндекс Карты
 */
export const getYandexMapsUrl = (lat: number, lng: number): string => {
  return `https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=15`;
};

/**
 * Эҷоди URL барои кушодани харита дар 2GIS
 * @param lat - Арз
 * @param lng - Тул
 * @returns URL-и 2GIS
 */
export const get2GisUrl = (lat: number, lng: number): string => {
  return `https://2gis.ru/geo/${lng},${lat}`;
};

/**
 * Гирифтани маркази харита аз рӯи массивҳои координатаҳо
 * @param points - Массиви нуқтаҳо
 * @returns Маркази ҳисобшуда
 */
export const calculateCenter = (points: Coordinates[]): Coordinates | null => {
  if (points.length === 0) return null;
  
  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
};

/**
 * Гирифтани ҳудуди харита аз рӯи координатаҳо (bounding box)
 * @param points - Массиви нуқтаҳо
 * @returns Объекти ҳудуд ё null
 */
export const calculateBounds = (points: Coordinates[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null => {
  if (points.length === 0) return null;
  
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  
  for (const point of points) {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  }
  
  return { minLat, maxLat, minLng, maxLng };
};

/**
 * Тахмини вақти расидан ба нуқтаи мақсад
 * @param distance - Масофа бо километр
 * @param averageSpeed - Суръати миёна (км/соат)
 * @returns Вақти тахминӣ бо дақиқа
 */
export const estimateTravelTime = (distance: number, averageSpeed: number = 40): number => {
  return Math.ceil((distance / averageSpeed) * 60);
};

/**
 * Паёми хатогии геолокатсия ба забони тоҷикӣ
 * @param error - Хатогии геолокатсия
 * @returns Паёми хатогӣ
 */
export const getGeolocationErrorMessage = (error: GeolocationPositionError | GeolocationError): string => {
  switch (error.code) {
    case GEOLOCATION_ERROR_CODES.PERMISSION_DENIED:
      return 'Дастрасӣ ба макон рад карда шуд. Лутфан дастрасии маконро дар танзимоти браузер фаъол кунед.';
    case GEOLOCATION_ERROR_CODES.POSITION_UNAVAILABLE:
      return 'Маълумоти макон дастрас нест. Лутфан дубора кӯшиш кунед.';
    case GEOLOCATION_ERROR_CODES.TIMEOUT:
      return 'Муҳлати дархости макон ба охир расид. Лутфан пайвасти интернети худро тафтиш кунед.';
    default:
      return 'Хатогии номаълум ҳангоми гирифтани макон.';
  }
};

/**
 * Санҷиши наздик будани курйер ба нуқтаи мақсад
 * @param current - Макони ҷорӣ
 * @param target - Макони мақсад
 * @param threshold - Ҳадди наздикӣ бо километр (пешфарз: 0.1 км = 100 метр)
 * @returns true агар масофа камтар аз ҳадди наздикӣ бошад
 */
export const isNearby = (
  current: Coordinates,
  target: Coordinates,
  threshold: number = 0.1
): boolean => {
  const distance = calculateDistance(current.lat, current.lng, target.lat, target.lng);
  return distance <= threshold;
};

/**
 * Ҳисобкунии самти ҳаракат (heading) аз рӯи ду нуқта
 * @param from - Нуқтаи аввал
 * @param to - Нуқтаи дуюм
 * @returns Самт бо дараҷа (0-360)
 */
export const calculateHeading = (from: Coordinates, to: Coordinates): number => {
  const dLon = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let heading = toDegrees(Math.atan2(y, x));
  heading = (heading + 360) % 360;
  
  return heading;
};

/**
 * Гирифтани матни самт (шимол, ҷануб, шарқ, ғарб)
 * @param heading - Самт бо дараҷа
 * @returns Матни самт ба тоҷикӣ
 */
export const getHeadingText = (heading: number): string => {
  const directions = ['Шимол', 'Шимолу Шарқ', 'Шарқ', 'Ҷанубу Шарқ', 'Ҷануб', 'Ҷанубу Ғарб', 'Ғарб', 'Шимолу Ғарб'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

// Экспорти пешфарз
const geolocationUtils = {
  isGeolocationSupported,
  getCurrentPosition,
  watchPosition,
  clearWatch,
  calculateDistance,
  calculateTotalDistance,
  formatCoordinates,
  isValidCoordinates,
  getGoogleMapsUrl,
  getYandexMapsUrl,
  get2GisUrl,
  calculateCenter,
  calculateBounds,
  estimateTravelTime,
  getGeolocationErrorMessage,
  isNearby,
  calculateHeading,
  getHeadingText,
  toRadians,
  toDegrees,
};

export default geolocationUtils;
