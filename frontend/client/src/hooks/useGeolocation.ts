// Tojrason/frontend/client/src/hooks/useGeolocation.ts

import { useState, useEffect, useCallback, useRef } from 'react';

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
}

export interface UseGeolocationOptions extends GeolocationOptions {
  watch?: boolean;
  immediate?: boolean;
}

export interface GeolocationState {
  loading: boolean;
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | null;
  timestamp: number | null;
  isWatching: boolean;
}

// Танзимоти пешфарз
const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
  watch: false,
  immediate: true,
};

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    loading: mergedOptions.immediate || false,
    coordinates: null,
    error: null,
    timestamp: null,
    isWatching: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Текшири дастгирии геолокатсия
  const isSupported = useCallback((): boolean => {
    return 'geolocation' in navigator;
  }, []);

  // Коркарди муваффақият
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

    setState({
      loading: false,
      coordinates: {
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        speed,
      },
      error: null,
      timestamp: position.timestamp,
      isWatching: mergedOptions.watch || false,
    });
  }, [mergedOptions.watch]);

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

  // Гирифтани макони ҷорӣ
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

  // Ҳисоб кардани масофа байни ду нуқта (бо формулаи Haversine)
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Радиуси Замин бо километр
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Масофа бо километр
    
    return distance;
  }, []);

  // Ҳисоб кардани масофа аз макони ҷорӣ то нуқтаи додашуда
  const getDistanceFromCurrent = useCallback((
    targetLat: number,
    targetLng: number
  ): number | null => {
    if (!state.coordinates) return null;
    
    return calculateDistance(
      state.coordinates.latitude,
      state.coordinates.longitude,
      targetLat,
      targetLng
    );
  }, [state.coordinates, calculateDistance]);

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

  return {
    ...state,
    isSupported: isSupported(),
    getCurrentPosition,
    startWatching,
    stopWatching,
    calculateDistance,
    getDistanceFromCurrent,
    clearError,
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
      // Истифодаи Nominatim API (OpenStreetMap)
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
