// Tojrason/frontend/courier/src/hooks/useGeolocation.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCourierStatus } from '../store/slices/courierSlice';
import { useSocket } from './useSocket';
import { courierApi } from '../api';
import { COURIER_STATUS } from '../utils/constants';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number; // Масофаи ҳадди ақал барои навсозӣ (метр)
  updateInterval?: number; // Фосилаи навсозӣ (миллисония)
}

export interface UseGeolocationOptions extends GeolocationOptions {
  watch?: boolean;
  immediate?: boolean;
  autoSync?: boolean; // Навсозии худкор дар сервер
}

export interface GeolocationState {
  loading: boolean;
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | null;
  timestamp: number | null;
  isWatching: boolean;
}

// Танзимоти пешфарз барои курйер
const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
  distanceFilter: 10, // 10 метр
  updateInterval: 5000, // 5 сония
  watch: true,
  immediate: true,
  autoSync: true,
};

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const courierStatus = useSelector(selectCourierStatus);
  const { updateLocation, isConnected } = useSocket();
  
  const [state, setState] = useState<GeolocationState>({
    loading: mergedOptions.immediate || false,
    coordinates: null,
    error: null,
    timestamp: null,
    isWatching: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastSentLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const isMountedRef = useRef(true);
  const currentOrderIdRef = useRef<string | null>(null);

  // Текшири дастгирии геолокатсия
  const isSupported = useCallback((): boolean => {
    return 'geolocation' in navigator;
  }, []);

  // Ҳисобкунии масофа байни ду нуқта (бо метр)
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Радиуси Замин бо метр
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Санҷиши зарурати навсозӣ дар сервер
  const shouldUpdateServer = useCallback((newCoords: GeolocationCoordinates): boolean => {
    if (!lastSentLocationRef.current) return true;
    
    const distance = calculateDistance(
      lastSentLocationRef.current.lat,
      lastSentLocationRef.current.lng,
      newCoords.latitude,
      newCoords.longitude
    );
    
    const timeDiff = Date.now() - lastSentLocationRef.current.time;
    
    // Навсозӣ агар масофа аз distanceFilter зиёд бошад ё вақт аз updateInterval гузашта бошад
    return distance >= (mergedOptions.distanceFilter || 10) || 
           timeDiff >= (mergedOptions.updateInterval || 5000);
  }, [calculateDistance, mergedOptions.distanceFilter, mergedOptions.updateInterval]);

  // Навсозии макон дар сервер
  const syncLocationWithServer = useCallback(async (coords: GeolocationCoordinates) => {
    if (!mergedOptions.autoSync) return;
    
    // Танҳо агар курйер онлайн ё дар расонидан бошад
    const isActive = courierStatus === COURIER_STATUS.ONLINE || 
                     courierStatus === COURIER_STATUS.ON_DELIVERY;
    
    if (!isActive) return;

    try {
      // Навсозӣ тавассути API
      await courierApi.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || undefined,
        speed: coords.speed || undefined,
        accuracy: coords.accuracy,
      });

      // Навсозӣ тавассути WebSocket (агар пайваст бошад)
      if (isConnected) {
        updateLocation(
          coords.latitude, 
          coords.longitude, 
          currentOrderIdRef.current || undefined
        );
      }

      lastSentLocationRef.current = {
        lat: coords.latitude,
        lng: coords.longitude,
        time: Date.now(),
      };
    } catch (error) {
      console.error('Failed to sync location with server:', error);
    }
  }, [mergedOptions.autoSync, courierStatus, isConnected, updateLocation]);

  // Коркарди муваффақият
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
    
    const newCoords: GeolocationCoordinates = {
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
    };

    setState({
      loading: false,
      coordinates: newCoords,
      error: null,
      timestamp: position.timestamp,
      isWatching: mergedOptions.watch || false,
    });

    // Навсозӣ дар сервер агар лозим бошад
    if (shouldUpdateServer(newCoords)) {
      syncLocationWithServer(newCoords);
    }
  }, [mergedOptions.watch, shouldUpdateServer, syncLocationWithServer]);

  // Коркарди хатогӣ
  const handleError = useCallback((error: GeolocationPositionError) => {
    if (!isMountedRef.current) return;

    let errorMessage = 'Хатогии номаълум дар геолокатсия';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Дастрасӣ ба макон рад карда шуд. Лутфан дастрасии маконро фаъол кунед.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Маълумоти макон дастрас нест.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Муҳлати дархости макон ба охир расид.';
        break;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: {
        code: error.code,
        message: errorMessage,
        PERMISSION_DENIED: error.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
        TIMEOUT: error.TIMEOUT,
      },
    }));
  }, []);

  // Гирифтани макони ҷорӣ (якдафъаина)
  const getCurrentPosition = useCallback(async (): Promise<GeolocationCoordinates | null> => {
    if (!isSupported()) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Геолокатсия дар браузери шумо дастгирӣ намешавад.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          });
        },
        (error) => {
          handleError(error);
          resolve(null);
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        }
      );
    });
  }, [isSupported, handleSuccess, handleError, mergedOptions]);

  // Оғози пайгирии доимӣ
  const startWatching = useCallback(() => {
    if (!isSupported() || watchIdRef.current !== null) return;

    setState(prev => ({ ...prev, loading: true, error: null, isWatching: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );
  }, [isSupported, handleSuccess, handleError, mergedOptions]);

  // Қатъ кардани пайгирии доимӣ
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState(prev => ({ ...prev, isWatching: false }));
    }
  }, []);

  // Танзими ID-и фармоиши ҷорӣ барои пайгирӣ
  const setCurrentOrderId = useCallback((orderId: string | null) => {
    currentOrderIdRef.current = orderId;
  }, []);

  // Навсозии фаврии макон дар сервер
  const forceSyncLocation = useCallback(async () => {
    if (state.coordinates) {
      await syncLocationWithServer(state.coordinates);
    }
  }, [state.coordinates, syncLocationWithServer]);

  // Тоза кардани хатогӣ
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Иҷрои дархости аввала
  useEffect(() => {
    isMountedRef.current = true;

    if (mergedOptions.immediate && isSupported()) {
      if (mergedOptions.watch) {
        startWatching();
      } else {
        getCurrentPosition();
      }
    }

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSupported, mergedOptions.immediate, mergedOptions.watch, startWatching, getCurrentPosition]);

  // Идоракунии пайгирӣ дар асоси статуси курйер
  useEffect(() => {
    const isActive = courierStatus === COURIER_STATUS.ONLINE || 
                     courierStatus === COURIER_STATUS.ON_DELIVERY;
    
    if (isActive && !state.isWatching) {
      startWatching();
    } else if (!isActive && state.isWatching) {
      stopWatching();
    }
  }, [courierStatus, state.isWatching, startWatching, stopWatching]);

  return {
    ...state,
    isSupported: isSupported(),
    getCurrentPosition,
    startWatching,
    stopWatching,
    setCurrentOrderId,
    forceSyncLocation,
    clearError,
    calculateDistance,
  };
};

// Hook барои табдил додани координатаҳо ба суроға (Reverse Geocoding)
export const useReverseGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressDetails, setAddressDetails] = useState<any>(null);

  const getAddressFromCoordinates = useCallback(async (
    latitude: number,
    longitude: number
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=tg`
      );
      
      if (!response.ok) {
        throw new Error('Хатогӣ ҳангоми гирифтани суроға');
      }

      const data = await response.json();
      const displayName = data.display_name;
      
      setAddress(displayName);
      setAddressDetails(data.address);
      
      return displayName;
    } catch (err: any) {
      const errorMessage = err.message || 'Хатогӣ дар табдили координатаҳо ба суроға';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAddress = useCallback(() => {
    setAddress(null);
    setAddressDetails(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    address,
    addressDetails,
    getAddressFromCoordinates,
    clearAddress,
  };
};

// Hook барои табдил додани суроға ба координатаҳо (Geocoding)
export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const getCoordinatesFromAddress = useCallback(async (
    address: string
  ): Promise<{ lat: number; lng: number } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=tg`
      );
      
      if (!response.ok) {
        throw new Error('Хатогӣ ҳангоми ҷустуҷӯи суроға');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Суроға ёфт нашуд');
      }

      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      
      setCoordinates(coords);
      return coords;
    } catch (err: any) {
      const errorMessage = err.message || 'Хатогӣ дар табдили суроға ба координатаҳо';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCoordinates = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    coordinates,
    getCoordinatesFromAddress,
    clearCoordinates,
  };
};

export default useGeolocation;
