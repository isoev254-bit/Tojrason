// Tojrason/frontend/client/src/pages/TrackOrder/TrackOrder.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ordersApi } from '../../api';
import { useSocket } from '../../hooks/useSocket';
import { useGeolocation } from '../../hooks/useGeolocation';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

// Иконаи фармоишгар барои харита
const clientIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Иконаи курйер барои харита
const courierIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'courier-marker', // Барои услуби фарқкунанда
});

// Схемаи валидатсия барои рақами пайгирӣ
const trackingSchema = z.object({
  trackingNumber: z
    .string()
    .min(6, 'Рақами пайгирӣ на камтар аз 6 аломат бошад')
    .max(20, 'Рақами пайгирӣ зиёда аз 20 аломат набошад')
    .regex(/^[A-Z0-9-]+$/, 'Рақами пайгирӣ бояд танҳо ҳарфҳои лотинӣ, рақамҳо ва тире дошта бошад'),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

// Намуди маълумоти пайгирӣ
interface TrackingData {
  orderId: string;
  trackingNumber: string;
  status: string;
  statusLabel: string;
  estimatedDelivery: string;
  pickupAddress: string;
  deliveryAddress: string;
  courier?: {
    id: string;
    name: string;
    phoneNumber: string;
    photo?: string;
    location?: {
      lat: number;
      lng: number;
      updatedAt: string;
    };
  };
  timeline: Array<{
    status: string;
    label: string;
    timestamp: string;
    description: string;
    completed: boolean;
  }>;
  route?: Array<[number, number]>;
}

// Статусҳо ва рангҳои онҳо
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  pickup: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-purple-100 text-purple-800',
  arriving: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Дар интизорӣ',
  accepted: 'Қабулшуда',
  pickup: 'Гирифтани бор',
  in_transit: 'Дар роҳ',
  arriving: 'Наздик шуд',
  delivered: 'Расонида шуд',
  cancelled: 'Бекоршуда',
};

const TrackOrder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { coordinates: userLocation } = useGeolocation({ immediate: true });
  const { onCourierLocation, onOrderUpdate, joinOrderRoom, isConnected } = useSocket();

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.5613, 68.7840]); // Душанбе
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      trackingNumber: searchParams.get('track') || '',
    },
  });

  // Пайгирии автоматикӣ агар рақам дар URL бошад
  useEffect(() => {
    const trackFromUrl = searchParams.get('track');
    if (trackFromUrl) {
      setValue('trackingNumber', trackFromUrl);
      handleTrack({ trackingNumber: trackFromUrl });
    }
  }, [searchParams]);

  // Пайвастшавӣ ба ҳуҷраи сокети фармоиш барои навсозиҳои вақти воқеӣ
  useEffect(() => {
    if (trackingData?.orderId && isConnected) {
      joinOrderRoom(trackingData.orderId);
    }
  }, [trackingData?.orderId, isConnected, joinOrderRoom]);

  // Обшавӣ ба навсозиҳои макони курйер
  useEffect(() => {
    const unsubscribe = onCourierLocation((data) => {
      if (data.orderId === trackingData?.orderId) {
        setCourierLocation({
          lat: data.location.lat,
          lng: data.location.lng,
        });
        // Навсозии маркази харита ба макони нав
        setMapCenter([data.location.lat, data.location.lng]);
      }
    });
    return unsubscribe;
  }, [onCourierLocation, trackingData?.orderId]);

  // Обшавӣ ба навсозиҳои статуси фармоиш
  useEffect(() => {
    const unsubscribe = onOrderUpdate((data) => {
      if (data.orderId === trackingData?.orderId) {
        // Навсозии маълумоти пайгирӣ
        setTrackingData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: data.status,
            statusLabel: statusLabels[data.status] || data.status,
            timeline: prev.timeline.map(step => ({
              ...step,
              completed: step.status === data.status ? true : step.completed,
            })),
          };
        });
      }
    });
    return unsubscribe;
  }, [onOrderUpdate, trackingData?.orderId]);

  const handleTrack = async (data: TrackingFormData) => {
    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await ordersApi.trackOrder(data.trackingNumber);
      
      // Табдил додани маълумот ба формати мо
      const tracking: TrackingData = {
        orderId: response.orderId,
        trackingNumber: response.trackingNumber,
        status: response.status,
        statusLabel: statusLabels[response.status] || response.status,
        estimatedDelivery: response.estimatedDelivery,
        pickupAddress: response.pickupAddress,
        deliveryAddress: response.deliveryAddress,
        courier: response.courier ? {
          id: response.courier.id,
          name: response.courier.name,
          phoneNumber: response.courier.phoneNumber,
          photo: response.courier.photo,
          location: response.courier.location,
        } : undefined,
        timeline: response.timeline || generateTimeline(response.status),
        route: response.route,
      };

      setTrackingData(tracking);

      // Танзими макони курйер агар мавҷуд бошад
      if (response.courier?.location) {
        setCourierLocation({
          lat: response.courier.location.lat,
          lng: response.courier.location.lng,
        });
        setMapCenter([response.courier.location.lat, response.courier.location.lng]);
      }

      // Танзими масир барои харита
      if (response.route) {
        setRoutePolyline(response.route);
      }

      // Навсозии URL
      setSearchParams({ track: data.trackingNumber });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Фармоиш бо ин рақами пайгирӣ ёфт нашуд');
    } finally {
      setIsLoading(false);
    }
  };

  // Тавлиди timeline аз рӯи статус (агар аз API наомада бошад)
  const generateTimeline = (currentStatus: string) => {
    const statuses = ['pending', 'accepted', 'pickup', 'in_transit', 'arriving', 'delivered'];
    return statuses.map(status => ({
      status,
      label: statusLabels[status],
      timestamp: '',
      description: '',
      completed: statuses.indexOf(status) <= statuses.indexOf(currentStatus),
    }));
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Ҳисобкунии масофаи тахминӣ
  const calculateRemainingDistance = useCallback(() => {
    if (!courierLocation || !userLocation) return null;
    
    const R = 6371;
    const dLat = (courierLocation.lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (courierLocation.lng - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(courierLocation.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }, [courierLocation, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Пайгирии фармоиш</h1>
          <p className="text-gray-600 mb-8">Рақами пайгирии фармоиши худро ворид кунед</p>

          {/* Формаи ҷустуҷӯ */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit(handleTrack)} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Масалан: TRK123456"
                  error={errors.trackingNumber?.message}
                  {...register('trackingNumber')}
                  className="uppercase"
                  leftIcon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || isSubmitting}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" color="white" className="mr-2" />
                    Ҷустуҷӯ...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Пайгирӣ кардан
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Намоиши хатогӣ */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Намоиши маълумоти пайгирӣ */}
          <AnimatePresence>
            {trackingData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Маълумоти асосӣ */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Рақами пайгирӣ</p>
                      <p className="text-xl font-mono font-bold text-gray-900">{trackingData.trackingNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(trackingData.status)}>
                        {trackingData.statusLabel}
                      </Badge>
                      {trackingData.estimatedDelivery && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Санаи тахминии расонидан</p>
                          <p className="font-medium text-gray-900">{trackingData.estimatedDelivery}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {trackingData.timeline.map((step, index) => (
                        <div key={step.status} className="relative flex items-start pl-10">
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {step.completed ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 ml-4">
                            <p className="font-medium text-gray-900">{step.label}</p>
                            {step.timestamp && (
                              <p className="text-sm text-gray-500">{step.timestamp}</p>
                            )}
                            {step.description && (
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Харита */}
                {(courierLocation || trackingData.route) && (
                  <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Макони зинда</h3>
                      {calculateRemainingDistance() && (
                        <p className="text-sm text-gray-600">
                          Масофаи боқимонда: {calculateRemainingDistance()} км
                        </p>
                      )}
                    </div>
                    <div className="h-80">
                      <MapContainer
                        center={mapCenter}
                        zoom={12}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Маркери макони курйер */}
                        {courierLocation && (
                          <Marker position={[courierLocation.lat, courierLocation.lng]} icon={courierIcon}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">{trackingData.courier?.name || 'Курйер'}</p>
                                <p className="text-gray-600">Макони ҷорӣ</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}

                        {/* Маркери макони расонидан */}
                        {userLocation && (
                          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={clientIcon}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">Шумо</p>
                                <p className="text-gray-600">Макони шумо</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}

                        {/* Хати масир */}
                        {routePolyline.length > 0 && (
                          <Polyline
                            positions={routePolyline}
                            color="#4F46E5"
                            weight={4}
                            opacity={0.7}
                          />
                        )}
                      </MapContainer>
                    </div>
                  </Card>
                )}

                {/* Тафсилоти суроғаҳо ва курйер */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Суроғаҳо</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Аз:</p>
                        <p className="font-medium">{trackingData.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ба:</p>
                        <p className="font-medium">{trackingData.deliveryAddress}</p>
                      </div>
                    </div>
                  </Card>

                  {trackingData.courier && (
                    <Card className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Курйер</h3>
                      <div className="flex items-center">
                        {trackingData.courier.photo ? (
                          <img
                            src={trackingData.courier.photo}
                            alt={trackingData.courier.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-lg">
                              {trackingData.courier.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{trackingData.courier.name}</p>
                          <p className="text-sm text-gray-600">{trackingData.courier.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/${trackingData.orderId}`)}
                          fullWidth
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Паём ба курйер
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Тугмаҳои амал */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Чоп кардан
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/create-order')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Фармоиши нав
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ҳолати холӣ */}
          {!trackingData && !isLoading && !error && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Фармоиш пайгирӣ нашудааст</h3>
              <p className="text-gray-600">Рақами пайгирии фармоиши худро ворид кунед</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;
