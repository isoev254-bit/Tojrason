// Tojrason/frontend/courier/src/pages/Dashboard/Dashboard.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCourier, selectCourierStatus, setCourierStatus } from '../../store/slices/courierSlice';
import { selectCurrentOrder } from '../../store/slices/orderSlice';
import { useAuth } from '../../hooks/useAuth';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useGeolocation } from '../../hooks/useGeolocation';
import { courierApi } from '../../api';
import { COURIER_STATUS, ORDER_STATUS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance, formatDuration } from '../../utils/formatDistance';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';

// Компоненти корти омор
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isUp: boolean };
}> = ({ title, value, icon, color, trend }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}% нисбат ба ҳафтаи гузашта
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courier } = useAuth();
  const courierData = useSelector(selectCourier);
  const courierStatus = useSelector(selectCourierStatus);
  const currentOrder = useSelector(selectCurrentOrder);
  
  const { 
    availableOrders, 
    newOrderNotification, 
    acceptOrder, 
    dismissNewOrderNotification,
    refresh,
  } = useOrderUpdates();
  
  const { coordinates, isWatching, error: locationError } = useGeolocation({
    autoSync: true,
    watch: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayDeliveries: 0,
    todayDistance: 0,
    todayHours: 0,
    weekEarnings: 0,
    weekDeliveries: 0,
    rating: 0,
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  // Боргирии омори курйер
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const courierStats = await courierApi.getStats();
        const todayActivity = await courierApi.getTodayActivity();
        
        setStats({
          todayEarnings: courierStats.today.earnings,
          todayDeliveries: courierStats.today.deliveries,
          todayDistance: courierStats.today.distance,
          todayHours: todayActivity.totalHours,
          weekEarnings: courierStats.week.earnings,
          weekDeliveries: courierStats.week.deliveries,
          rating: courierData?.rating || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [courierData]);

  // Тағйири статуси онлайн/офлайн
  const handleToggleStatus = useCallback(async () => {
    if (!courierData) return;

    const newStatus = courierStatus === COURIER_STATUS.ONLINE 
      ? COURIER_STATUS.OFFLINE 
      : COURIER_STATUS.ONLINE;

    setStatusChanging(true);
    try {
      await courierApi.updateStatus(newStatus);
      dispatch(setCourierStatus(newStatus));
      
      if (newStatus === COURIER_STATUS.ONLINE) {
        await courierApi.startShift();
      } else {
        await courierApi.endShift();
      }
      
      refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusChanging(false);
      setShowStatusModal(false);
    }
  }, [courierStatus, courierData, dispatch, refresh]);

  // Кушодани модали тағйири статус
  const openStatusModal = () => {
    setShowStatusModal(true);
  };

  // Қабули фармоиши нав
  const handleAcceptNewOrder = useCallback(async () => {
    if (newOrderNotification) {
      const result = await acceptOrder(newOrderNotification.order.id);
      if (result.success) {
        dismissNewOrderNotification();
        navigate(`/current-order`);
      }
    }
  }, [newOrderNotification, acceptOrder, dismissNewOrderNotification, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const isOnline = courierStatus === COURIER_STATUS.ONLINE || courierStatus === COURIER_STATUS.ON_DELIVERY;
  const hasActiveOrder = currentOrder && !['delivered', 'cancelled'].includes(currentOrder.status);

  return (
    <div className="pb-4">
      {/* Сарлавҳа бо профил ва статус */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-emerald-600">
              {courier?.firstName?.charAt(0) || 'К'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Салом, {courier?.firstName || 'Курйер'}!
            </h1>
            <p className="text-sm text-gray-500">
              {courier?.phoneNumber || ''}
            </p>
          </div>
        </div>
        
        {/* Тугмаи онлайн/офлайн */}
        <button
          onClick={openStatusModal}
          className={`relative px-4 py-2 rounded-full font-medium text-sm transition-all ${
            isOnline 
              ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {isOnline ? 'Онлайн' : 'Офлайн'}
          </span>
        </button>
      </div>

      {/* Статуси локатсия */}
      {!coordinates && isWatching && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 flex items-center">
            <Loader size="sm" className="mr-2" />
            Ҷустуҷӯи макони шумо...
          </p>
        </div>
      )}

      {locationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{locationError.message}</p>
        </div>
      )}

      {/* Огоҳии фармоиши нав */}
      <AnimatePresence>
        {newOrderNotification && isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-4"
          >
            <Card className="p-4 bg-emerald-50 border-2 border-emerald-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔔</span>
                    <h3 className="font-bold text-emerald-800">Фармоиши нав!</h3>
                    <Badge className="bg-emerald-200 text-emerald-800 text-xs">
                      {formatDistance(newOrderNotification.order.distance)} км
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {newOrderNotification.order.pickupAddress}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    → {newOrderNotification.order.deliveryAddress}
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatPrice(newOrderNotification.order.price)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAcceptNewOrder}
                    className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                  >
                    Қабул кардан
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissNewOrderNotification}
                    className="whitespace-nowrap"
                  >
                    Рад кардан
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                То {new Date(newOrderNotification.expiresAt).toLocaleTimeString('tg-TJ', { minute: '2-digit', second: '2-digit' })} дақиқа вақт доред
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Фармоиши фаъол */}
      {hasActiveOrder && currentOrder && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Фармоиши фаъол</h3>
            <Badge className="bg-blue-200 text-blue-800">
              {currentOrder.status === 'pending' && 'Дар интизорӣ'}
              {currentOrder.status === 'accepted' && 'Қабулшуда'}
              {currentOrder.status === 'pickup' && 'Гирифтани бор'}
              {currentOrder.status === 'in_transit' && 'Дар роҳ'}
              {currentOrder.status === 'arriving' && 'Наздик шуд'}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-1">#{currentOrder.trackingNumber}</p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {currentOrder.pickupAddress} → {currentOrder.deliveryAddress}
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/current-order')}
          >
            Идома додани фармоиш
          </Button>
        </Card>
      )}

      {/* Омори имрӯза */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="Даромади имрӯз"
          value={formatPrice(stats.todayEarnings)}
          icon={<span className="text-white text-lg">💰</span>}
          color="bg-emerald-500"
        />
        <StatCard
          title="Фармоишҳои имрӯз"
          value={stats.todayDeliveries}
          icon={<span className="text-white text-lg">📦</span>}
          color="bg-blue-500"
        />
        <StatCard
          title="Масофаи имрӯз"
          value={formatDistance(stats.todayDistance)}
          icon={<span className="text-white text-lg">🛵</span>}
          color="bg-purple-500"
        />
        <StatCard
          title="Соати корӣ"
          value={formatDuration(stats.todayHours)}
          icon={<span className="text-white text-lg">⏱️</span>}
          color="bg-orange-500"
        />
      </div>

      {/* Омори ҳафтаина ва рейтинг */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Даромади ҳафта</p>
          <p className="text-xl font-bold text-gray-900">{formatPrice(stats.weekEarnings)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.weekDeliveries} фармоиш</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Рейтинг</p>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-gray-900">{stats.rating.toFixed(1)}</span>
            <span className="text-yellow-500 text-lg">★</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">аз 5.0</p>
        </Card>
      </div>

      {/* Фармоишҳои дастрас */}
      {isOnline && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Фармоишҳои наздик</h2>
            <button
              onClick={refresh}
              className="text-emerald-600 text-sm hover:underline"
            >
              Навсозӣ
            </button>
          </div>
          
          {availableOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <span className="text-3xl mb-2 block">📭</span>
              <p className="text-gray-500">Ҳоло фармоиши дастрас нест</p>
              <p className="text-sm text-gray-400 mt-1">Фармоишҳои нав ба зудӣ пайдо мешаванд</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableOrders.slice(0, 3).map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        {formatDistance(order.distance)} км • {formatDuration(order.estimatedTime)}
                      </p>
                      <p className="text-sm text-gray-700 mb-1 line-clamp-2">
                        {order.pickupAddress} → {order.deliveryAddress}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 ml-2">
                      {formatPrice(order.price)}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => acceptOrder(order.id)}
                  >
                    Қабул кардан
                  </Button>
                </Card>
              ))}
            </div>
          )}
          
          {availableOrders.length > 3 && (
            <Button
              variant="outline"
              fullWidth
              className="mt-3"
              onClick={() => navigate('/orders/available')}
            >
              Ҳамаи фармоишҳо ({availableOrders.length})
            </Button>
          )}
        </div>
      )}

      {/* Дастрасии зуд */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => navigate('/orders/available')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-1">📋</span>
          <span className="text-xs text-gray-600">Фармоишҳо</span>
        </button>
        <button
          onClick={() => navigate('/stats')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-1">📊</span>
          <span className="text-xs text-gray-600">Омор</span>
        </button>
        <button
          onClick={() => navigate('/map')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-1">🗺️</span>
          <span className="text-xs text-gray-600">Харита</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-1">👤</span>
          <span className="text-xs text-gray-600">Профил</span>
        </button>
      </div>

      {/* Модали тасдиқи тағйири статус */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={isOnline ? 'Офлайн шудан' : 'Онлайн шудан'}
      >
        <p className="text-gray-600 mb-6">
          {isOnline 
            ? 'Оё шумо мутмаин ҳастед, ки мехоҳед офлайн шавед? Шумо фармоишҳои нав қабул карда наметавонед.'
            : 'Оё шумо мутмаин ҳастед, ки мехоҳед онлайн шавед? Шумо метавонед фармоишҳои нав қабул кунед.'
          }
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowStatusModal(false)}>
            Бекор
          </Button>
          <Button 
            variant={isOnline ? 'secondary' : 'primary'} 
            onClick={handleToggleStatus}
            disabled={statusChanging}
            className={isOnline ? 'bg-gray-500 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {statusChanging ? <Loader size="sm" color="white" /> : (isOnline ? 'Офлайн шудан' : 'Онлайн шудан')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
