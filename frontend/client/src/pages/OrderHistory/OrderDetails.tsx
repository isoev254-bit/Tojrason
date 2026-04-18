// Tojrason/frontend/client/src/pages/OrderHistory/OrderDetails.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { ordersApi } from '../../api';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

// Иконаи маркерҳои харита
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const courierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Статусҳо ва рангҳо
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

// Намуди маълумоти фармоиш
interface OrderDetailsData {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pickupAddress: string;
  pickupLocation?: { lat: number; lng: number };
  deliveryAddress: string;
  deliveryLocation?: { lat: number; lng: number };
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  description?: string;
  isFragile: boolean;
  requiresSignature: boolean;
  price: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  courier?: {
    id: string;
    name: string;
    phoneNumber: string;
    photo?: string;
    rating?: number;
    location?: { lat: number; lng: number; updatedAt: string };
  };
  timeline: Array<{
    status: string;
    label: string;
    timestamp: string;
    description?: string;
    completed: boolean;
  }>;
  route?: Array<[number, number]>;
}

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { onCourierLocation, onOrderUpdate, joinOrderRoom, isConnected } = useSocket();

  const [order, setOrder] = useState<OrderDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.5613, 68.7840]); // Душанбе

  // Санҷиши аутентификатсия
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/order/${orderId}` } } });
    }
  }, [isAuthenticated, navigate, orderId]);

  // Боргирии маълумоти фармоиш
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await ordersApi.getOrderById(orderId);
        
        // Табдил ба формати дохилӣ
        const orderData: OrderDetailsData = {
          id: data.id,
          trackingNumber: data.trackingNumber,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          pickupAddress: data.pickupAddress,
          pickupLocation: data.pickupLocation,
          deliveryAddress: data.deliveryAddress,
          deliveryLocation: data.deliveryLocation,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          packageType: data.packageType,
          weight: data.weight,
          dimensions: data.dimensions,
          description: data.description,
          isFragile: data.isFragile,
          requiresSignature: data.requiresSignature,
          price: data.price,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          estimatedDelivery: data.estimatedDelivery,
          courier: data.courier,
          timeline: data.timeline || generateTimeline(data.status),
          route: data.route,
        };
        
        setOrder(orderData);
        
        // Танзими маркази харита
        if (orderData.courier?.location) {
          setCourierLocation(orderData.courier.location);
          setMapCenter([orderData.courier.location.lat, orderData.courier.location.lng]);
        } else if (orderData.pickupLocation) {
          setMapCenter([orderData.pickupLocation.lat, orderData.pickupLocation.lng]);
        }
        
        // Пайвастшавӣ ба ҳуҷраи сокети фармоиш
        if (isConnected) {
          joinOrderRoom(orderId);
        }
      } catch (err: any) {
        setError(err.message || 'Хатогӣ ҳангоми боргирии маълумоти фармоиш');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isConnected, joinOrderRoom]);

  // Обшавӣ ба навсозиҳои макони курйер
  useEffect(() => {
    const unsubscribe = onCourierLocation((data) => {
      if (data.orderId === orderId) {
        setCourierLocation({
          lat: data.location.lat,
          lng: data.location.lng,
        });
        setMapCenter([data.location.lat, data.location.lng]);
      }
    });
    return unsubscribe;
  }, [onCourierLocation, orderId]);

  // Обшавӣ ба навсозиҳои статуси фармоиш
  useEffect(() => {
    const unsubscribe = onOrderUpdate((data) => {
      if (data.orderId === orderId) {
        setOrder(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: data.status,
            updatedAt: new Date().toISOString(),
            timeline: prev.timeline.map(step => ({
              ...step,
              completed: step.status === data.status ? true : step.completed,
            })),
          };
        });
      }
    });
    return unsubscribe;
  }, [onOrderUpdate, orderId]);

  // Тавлиди timeline пешфарз
  const generateTimeline = (currentStatus: string) => {
    const statuses = ['pending', 'accepted', 'pickup', 'in_transit', 'arriving', 'delivered'];
    return statuses.map(status => ({
      status,
      label: statusLabels[status] || status,
      timestamp: '',
      description: '',
      completed: statuses.indexOf(status) <= statuses.indexOf(currentStatus),
    }));
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('tg-TJ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} сомонӣ`;
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Оё шумо мутмаин ҳастед, ки мехоҳед ин фармоишро бекор кунед?')) return;
    
    try {
      await ordersApi.cancelOrder(order.id, 'Бекоркунӣ аз ҷониби муштарӣ');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (err: any) {
      alert(err.message || 'Хатогӣ ҳангоми бекоркунии фармоиш');
    }
  };

  const handleContactCourier = () => {
    if (order?.courier?.phoneNumber) {
      window.location.href = `tel:${order.courier.phoneNumber}`;
    }
  };

  const handleTrackOrder = () => {
    if (order?.trackingNumber) {
      navigate(`/track-order?track=${order.trackingNumber}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error || 'Фармоиш ёфт нашуд'}</p>
            <Button variant="primary" onClick={() => navigate('/order-history')}>
              Бозгашт ба таърихи фармоишҳо
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Сарлавҳа */}
        <div className="mb-6">
          <Link to="/order-history" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Бозгашт ба рӯйхат
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Фармоиш #{order.trackingNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Эҷод шуд: {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-3">
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button variant="outline" onClick={handleCancelOrder}>
                  Бекор кардани фармоиш
                </Button>
              )}
              <Button variant="primary" onClick={handleTrackOrder}>
                Пайгирии зинда
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Сутуни чап - Маълумоти асосӣ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Статус ва Timeline */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Статуси фармоиш</h2>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {order.timeline.map((step) => (
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
                          <p className="text-sm text-gray-500">{formatDate(step.timestamp)}</p>
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
            {(order.pickupLocation || order.deliveryLocation || courierLocation) && (
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Харитаи масир</h3>
                </div>
                <div className="h-80">
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Маркери гирифтан */}
                    {order.pickupLocation && (
                      <Marker position={[order.pickupLocation.lat, order.pickupLocation.lng]} icon={pickupIcon}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">Гирифтан</p>
                            <p className="text-gray-600">{order.pickupAddress}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Маркери расонидан */}
                    {order.deliveryLocation && (
                      <Marker position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} icon={deliveryIcon}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">Расонидан</p>
                            <p className="text-gray-600">{order.deliveryAddress}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Маркери курйер */}
                    {courierLocation && (
                      <Marker position={[courierLocation.lat, courierLocation.lng]} icon={courierIcon}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">{order.courier?.name || 'Курйер'}</p>
                            <p className="text-gray-600">Макони ҷорӣ</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Хати масир */}
                    {order.route && order.route.length > 0 && (
                      <Polyline
                        positions={order.route}
                        color="#4F46E5"
                        weight={4}
                        opacity={0.7}
                      />
                    )}
                  </MapContainer>
                </div>
              </Card>
            )}

            {/* Тавсифи бор */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Тавсифи бор</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Намуди бор</p>
                  <p className="font-medium">{{ 
                    document: 'Ҳуҷҷат', 
                    small: 'Хурд', 
                    medium: 'Миёна', 
                    large: 'Калон', 
                    fragile: 'Зудшикан' 
                  }[order.packageType] || order.packageType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Вазн</p>
                  <p className="font-medium">{order.weight} кг</p>
                </div>
                {order.dimensions && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Андоза (Д x Б x Б)</p>
                      <p className="font-medium">
                        {order.dimensions.length} x {order.dimensions.width} x {order.dimensions.height} см
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-500">Зудшикан</p>
                  <p className="font-medium">{order.isFragile ? 'Бале' : 'Не'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Имзо лозим</p>
                  <p className="font-medium">{order.requiresSignature ? 'Бале' : 'Не'}</p>
                </div>
              </div>
              {order.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Тавсифи иловагӣ</p>
                  <p className="text-gray-700">{order.description}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Сутуни рост - Тафсилот ва курйер */}
          <div className="space-y-6">
            {/* Суроғаҳо */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Суроғаҳо</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Аз (гирифтан):</p>
                  <p className="font-medium">{order.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ба (расондан):</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Гиранда:</p>
                  <p className="font-medium">{order.recipientName}</p>
                  <p className="text-sm text-indigo-600">{order.recipientPhone}</p>
                </div>
              </div>
            </Card>

            {/* Курйер */}
            {order.courier ? (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Курйер</h3>
                <div className="flex items-center mb-4">
                  {order.courier.photo ? (
                    <img
                      src={order.courier.photo}
                      alt={order.courier.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {order.courier.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{order.courier.name}</p>
                    <p className="text-sm text-gray-600">{order.courier.phoneNumber}</p>
                    {order.courier.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm">{order.courier.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleContactCourier} fullWidth>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Тамос бо курйер
                </Button>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-gray-500 text-center">Курйер ҳанӯз таъин нашудааст</p>
              </Card>
            )}

            {/* Пардохт */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Пардохт</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Нархи фармоиш:</span>
                  <span className="font-medium">{formatPrice(order.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Усули пардохт:</span>
                  <span className="font-medium">
                    {{ cash: 'Пули нақд', card: 'Корт', wallet: 'Ҳамён' }[order.paymentMethod] || order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статуси пардохт:</span>
                  <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {order.paymentStatus === 'paid' ? 'Пардохт шуд' : 'Интизори пардохт'}
                  </Badge>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between pt-2 mt-2 border-t">
                    <span className="text-gray-600">Расонидани тахминӣ:</span>
                    <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Амалҳои иловагӣ */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Амалҳо</h3>
              <div className="space-y-3">
                <Button variant="outline" onClick={() => window.print()} fullWidth>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Чоп кардани квитансия
                </Button>
                {order.status === 'delivered' && (
                  <Button variant="primary" onClick={() => navigate(`/rate/${order.id}`)} fullWidth>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Баҳо додан
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
