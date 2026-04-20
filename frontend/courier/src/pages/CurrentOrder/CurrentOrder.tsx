// Tojrason/frontend/courier/src/pages/CurrentOrder/CurrentOrder.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { selectCurrentOrder } from '../../store/slices/orderSlice';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import { ordersApi } from '../../api';
import { ORDER_STATUS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance, formatDuration } from '../../utils/formatDistance';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';

// Иконаҳои харита
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

// Қадамҳои расонидан
const DELIVERY_STEPS = [
  { status: ORDER_STATUS.ACCEPTED, label: 'Қабули фармоиш', icon: '✅' },
  { status: ORDER_STATUS.PICKUP, label: 'Гирифтани бор', icon: '📦' },
  { status: ORDER_STATUS.IN_TRANSIT, label: 'Дар роҳ', icon: '🛵' },
  { status: ORDER_STATUS.ARRIVING, label: 'Наздик шудан', icon: '🔔' },
  { status: ORDER_STATUS.DELIVERED, label: 'Расонида шуд', icon: '🎉' },
];

const CurrentOrder: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();
  const currentOrderFromStore = useSelector(selectCurrentOrder);
  const { confirmPickup, confirmDelivery, reportIssue, updateOrderStatus } = useOrderUpdates();
  const { coordinates: myLocation } = useGeolocation({ watch: true });
  const { sendChatMessage } = useSocket();

  const [order, setOrder] = useState(currentOrderFromStore);
  const [isLoading, setIsLoading] = useState(!order);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'pickup' | 'delivery' | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.5613, 68.7840]);
  const [route, setRoute] = useState<[number, number][]>([]);

  // Боргирии фармоиш агар дар URL параметр бошад
  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId && !order) {
        try {
          const data = await ordersApi.getOrderById(orderId);
          setOrder(data as any);
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, order]);

  // Навсозии маркази харита
  useEffect(() => {
    if (myLocation) {
      setMapCenter([myLocation.latitude, myLocation.longitude]);
    }
  }, [myLocation]);

  // Боргирии масир
  useEffect(() => {
    const fetchRoute = async () => {
      if (order?.id) {
        try {
          const routeData = await ordersApi.getSuggestedRoute(order.id);
          setRoute(routeData);
        } catch (error) {
          console.error('Failed to fetch route:', error);
        }
      }
    };
    fetchRoute();
  }, [order?.id]);

  // Муайян кардани қадами фаъол
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const statusOrder = [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKUP, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.ARRIVING, ORDER_STATUS.DELIVERED];
    return statusOrder.indexOf(order.status as any);
  };

  // Тафтиши имконияти амал
  const canConfirmPickup = order?.status === ORDER_STATUS.ACCEPTED;
  const canStartTransit = order?.status === ORDER_STATUS.PICKUP;
  const canMarkArriving = order?.status === ORDER_STATUS.IN_TRANSIT;
  const canConfirmDelivery = order?.status === ORDER_STATUS.ARRIVING || order?.status === ORDER_STATUS.IN_TRANSIT;

  // Тасдиқи гирифтани бор
  const handleConfirmPickup = useCallback(async () => {
    if (!order) return;
    setIsProcessing(true);
    const result = await confirmPickup(order.id);
    if (result.success) {
      setOrder(result.order as any);
      setShowConfirmModal(null);
    }
    setIsProcessing(false);
  }, [order, confirmPickup]);

  // Оғози сафар
  const handleStartTransit = useCallback(async () => {
    if (!order) return;
    setIsProcessing(true);
    const result = await updateOrderStatus(order.id, ORDER_STATUS.IN_TRANSIT);
    if (result.success) {
      setOrder(result.order as any);
    }
    setIsProcessing(false);
  }, [order, updateOrderStatus]);

  // Наздик шудан
  const handleMarkArriving = useCallback(async () => {
    if (!order) return;
    setIsProcessing(true);
    const result = await updateOrderStatus(order.id, ORDER_STATUS.ARRIVING);
    if (result.success) {
      setOrder(result.order as any);
    }
    setIsProcessing(false);
  }, [order, updateOrderStatus]);

  // Тасдиқи расонидан
  const handleConfirmDelivery = useCallback(async () => {
    if (!order) return;
    setIsProcessing(true);
    const result = await confirmDelivery(order.id);
    if (result.success) {
      setOrder(result.order as any);
      setShowConfirmModal(null);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setIsProcessing(false);
  }, [order, confirmDelivery, navigate]);

  // Гузориши мушкилот
  const handleReportIssue = useCallback(async () => {
    if (!order || !issueDescription) return;
    setIsProcessing(true);
    const result = await reportIssue(order.id, 'other', issueDescription);
    if (result.success) {
      setShowIssueModal(false);
      setIssueDescription('');
    }
    setIsProcessing(false);
  }, [order, issueDescription, reportIssue]);

  // Тамос бо муштарӣ
  const handleContactClient = useCallback(() => {
    if (order?.recipientPhone) {
      window.location.href = `tel:${order.recipientPhone}`;
    }
  }, [order?.recipientPhone]);

  // Ирсоли паём ба муштарӣ
  const handleMessageClient = useCallback(() => {
    if (order?.id) {
      navigate(`/chat/${order.id}`);
    }
  }, [order?.id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-3 block">📭</span>
        <p className="text-gray-500">Фармоиши фаъол нест</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/dashboard')}>
          Ба саҳифаи асосӣ
        </Button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Фармоиши фаъол</h1>
        <div className="w-6" />
      </div>

      {/* Рақами пайгирӣ ва нарх */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">#{order.trackingNumber}</p>
          <Badge className="bg-blue-100 text-blue-800">
            {order.status === ORDER_STATUS.ACCEPTED && 'Қабулшуда'}
            {order.status === ORDER_STATUS.PICKUP && 'Гирифтани бор'}
            {order.status === ORDER_STATUS.IN_TRANSIT && 'Дар роҳ'}
            {order.status === ORDER_STATUS.ARRIVING && 'Наздик шуд'}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-emerald-600">{formatPrice(order.price)}</p>
      </Card>

      {/* Қадамҳои расонидан */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Қадамҳои расонидан</h3>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {DELIVERY_STEPS.map((step, index) => (
              <div key={step.status} className="relative flex items-start pl-10">
                <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  {index <= currentStepIndex ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-400">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1 ml-3">
                  <p className={`font-medium ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Харита */}
      <Card className="p-0 mb-4 overflow-hidden">
        <div className="h-48">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {myLocation && (
              <Marker position={[myLocation.latitude, myLocation.longitude]} icon={courierIcon}>
                <Popup>Макони шумо</Popup>
              </Marker>
            )}
            {order.pickupLocation && (
              <Marker position={[order.pickupLocation.lat, order.pickupLocation.lng]} icon={pickupIcon}>
                <Popup>Гирифтани бор</Popup>
              </Marker>
            )}
            {order.deliveryLocation && (
              <Marker position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} icon={deliveryIcon}>
                <Popup>Расонидан</Popup>
              </Marker>
            )}
            {route.length > 0 && (
              <Polyline positions={route} color="#10B981" weight={4} opacity={0.7} />
            )}
          </MapContainer>
        </div>
      </Card>

      {/* Суроғаҳо */}
      <Card className="p-4 mb-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1 flex items-center">
            <span className="text-green-500 mr-2">📍</span> Суроғаи гирифтан
          </p>
          <p className="text-gray-900">{order.pickupAddress}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1 flex items-center">
            <span className="text-red-500 mr-2">🏁</span> Суроғаи расонидан
          </p>
          <p className="text-gray-900">{order.deliveryAddress}</p>
        </div>
      </Card>

      {/* Маълумоти муштарӣ */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Муштарӣ</h3>
        <p className="text-gray-900 mb-1">{order.recipientName}</p>
        <p className="text-gray-600 mb-3">{order.recipientPhone}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" fullWidth onClick={handleContactClient}>
            📞 Тамос
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={handleMessageClient}>
            💬 Паём
          </Button>
        </div>
      </Card>

      {/* Тавсифи бор */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Тавсифи бор</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-500">Намуд</p>
            <p className="font-medium">
              {order.packageType === 'document' ? 'Ҳуҷҷат' : 
               order.packageType === 'small' ? 'Хурд' : 
               order.packageType === 'medium' ? 'Миёна' : 
               order.packageType === 'large' ? 'Калон' : 'Зудшикан'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Вазн</p>
            <p className="font-medium">{order.weight} кг</p>
          </div>
        </div>
        {order.description && (
          <div className="mt-3">
            <p className="text-sm text-gray-500">Эзоҳ</p>
            <p className="text-gray-700">{order.description}</p>
          </div>
        )}
      </Card>

      {/* Тугмаҳои амал */}
      <div className="space-y-3">
        {canConfirmPickup && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowConfirmModal('pickup')}>
            📦 Тасдиқи гирифтани бор
          </Button>
        )}
        {canStartTransit && (
          <Button variant="primary" size="lg" fullWidth onClick={handleStartTransit}>
            🛵 Оғози сафар
          </Button>
        )}
        {canMarkArriving && (
          <Button variant="primary" size="lg" fullWidth onClick={handleMarkArriving}>
            🔔 Наздик шудам
          </Button>
        )}
        {canConfirmDelivery && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowConfirmModal('delivery')}>
            ✅ Тасдиқи расонидан
          </Button>
        )}
        <Button variant="outline" size="lg" fullWidth onClick={() => setShowIssueModal(true)}>
          ⚠️ Гузориши мушкилот
        </Button>
      </div>

      {/* Модали тасдиқи гирифтан/расондан */}
      <Modal
        isOpen={!!showConfirmModal}
        onClose={() => setShowConfirmModal(null)}
        title={showConfirmModal === 'pickup' ? 'Тасдиқи гирифтани бор' : 'Тасдиқи расонидан'}
      >
        <p className="text-gray-600 mb-6">
          {showConfirmModal === 'pickup' 
            ? 'Оё шумо мутмаин ҳастед, ки борро гирифтед?'
            : 'Оё шумо мутмаин ҳастед, ки бор ба муштарӣ расонида шуд?'
          }
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmModal(null)}>
            Бекор
          </Button>
          <Button 
            variant="primary" 
            onClick={showConfirmModal === 'pickup' ? handleConfirmPickup : handleConfirmDelivery}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader size="sm" color="white" /> : 'Тасдиқ'}
          </Button>
        </div>
      </Modal>

      {/* Модали гузориши мушкилот */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Гузориши мушкилот"
      >
        <div className="space-y-4">
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Мушкилотро тавсиф кунед..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowIssueModal(false)}>
              Бекор
            </Button>
            <Button variant="primary" onClick={handleReportIssue} disabled={!issueDescription || isProcessing}>
              {isProcessing ? <Loader size="sm" color="white" /> : 'Фиристодан'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CurrentOrder;
