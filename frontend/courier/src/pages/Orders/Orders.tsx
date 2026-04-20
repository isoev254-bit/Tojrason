// Tojrason/frontend/courier/src/pages/Orders/Orders.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCourierStatus } from '../../store/slices/courierSlice';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { COURIER_STATUS, ORDER_STATUS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance, formatDuration } from '../../utils/formatDistance';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

type OrderTab = 'available' | 'my' | 'completed';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const courierStatus = useSelector(selectCourierStatus);
  const {
    availableOrders,
    myOrders,
    currentOrder,
    acceptOrder,
    rejectOrder,
    isLoadingAvailable,
    refresh,
  } = useOrderUpdates();

  const [activeTab, setActiveTab] = useState<OrderTab>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAvailable, setFilteredAvailable] = useState(availableOrders);
  const [filteredMyOrders, setFilteredMyOrders] = useState(myOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isOnline = courierStatus === COURIER_STATUS.ONLINE || courierStatus === COURIER_STATUS.ON_DELIVERY;

  // Филтркунии фармоишҳо аз рӯи ҷустуҷӯ
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAvailable(availableOrders);
      setFilteredMyOrders(myOrders);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredAvailable(
      availableOrders.filter(order =>
        order.trackingNumber.toLowerCase().includes(query) ||
        order.pickupAddress.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query)
      )
    );
    setFilteredMyOrders(
      myOrders.filter(order =>
        order.trackingNumber.toLowerCase().includes(query) ||
        order.pickupAddress.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, availableOrders, myOrders]);

  // Debounced ҷустуҷӯ
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  // Навсозии дастӣ
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Қабули фармоиш
  const handleAcceptOrder = useCallback(async (orderId: string) => {
    const result = await acceptOrder(orderId);
    if (result.success) {
      navigate('/current-order');
    }
  }, [acceptOrder, navigate]);

  // Рад кардани фармоиш
  const handleRejectOrder = useCallback(async (orderId: string) => {
    await rejectOrder(orderId, 'Рад карда шуд');
  }, [rejectOrder]);

  // Гузариш ба фармоиши ҷорӣ
  const handleContinueOrder = useCallback(() => {
    if (currentOrder) {
      navigate('/current-order');
    }
  }, [currentOrder, navigate]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.PICKUP]: 'bg-indigo-100 text-indigo-800',
      [ORDER_STATUS.IN_TRANSIT]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.ARRIVING]: 'bg-orange-100 text-orange-800',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      [ORDER_STATUS.PENDING]: 'Дар интизорӣ',
      [ORDER_STATUS.ACCEPTED]: 'Қабулшуда',
      [ORDER_STATUS.PICKUP]: 'Гирифтани бор',
      [ORDER_STATUS.IN_TRANSIT]: 'Дар роҳ',
      [ORDER_STATUS.ARRIVING]: 'Наздик шуд',
      [ORDER_STATUS.DELIVERED]: 'Расонида шуд',
      [ORDER_STATUS.CANCELLED]: 'Бекоршуда',
    };

    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const renderOrderCard = (order: any, isAvailable: boolean = true) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">#{order.trackingNumber}</p>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(order.status)}
              {isAvailable && (
                <Badge className="bg-emerald-100 text-emerald-800">
                  {formatDistance(order.distance)} км
                </Badge>
              )}
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            {formatPrice(order.price)}
          </p>
        </div>

        <div className="mb-3">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-green-500 text-sm mt-0.5">📍</span>
            <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.pickupAddress}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm mt-0.5">🏁</span>
            <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.deliveryAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>📦 {order.packageType === 'document' ? 'Ҳуҷҷат' : 
                order.packageType === 'small' ? 'Хурд' : 
                order.packageType === 'medium' ? 'Миёна' : 
                order.packageType === 'large' ? 'Калон' : 'Зудшикан'}</span>
          <span>⚖️ {order.weight} кг</span>
          <span>⏱️ {formatDuration(order.estimatedTime)}</span>
        </div>

        <div className="flex gap-2">
          {isAvailable ? (
            <>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => handleAcceptOrder(order.id)}
                disabled={!isOnline}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Қабул кардан
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRejectOrder(order.id)}
              >
                Рад кардан
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Тафсилот
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Фармоишҳо</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Статуси офлайн */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Шумо офлайн ҳастед. Барои қабули фармоишҳо лутфан онлайн шавед.
          </p>
        </div>
      )}

      {/* Фармоиши фаъол */}
      {currentOrder && !['delivered', 'cancelled'].includes(currentOrder.status) && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Фармоиши фаъол</h3>
            {getStatusBadge(currentOrder.status)}
          </div>
          <p className="text-sm text-gray-700 mb-1">#{currentOrder.trackingNumber}</p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {currentOrder.pickupAddress} → {currentOrder.deliveryAddress}
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleContinueOrder}
          >
            Идома додани фармоиш
          </Button>
        </Card>
      )}

      {/* Ҷустуҷӯ */}
      <div className="mb-4">
        <Input
          placeholder="Ҷустуҷӯ бо рақами пайгирӣ ё суроға..."
          onChange={(e) => debouncedSearch(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Табҳо */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 text-center font-medium transition-colors relative ${
            activeTab === 'available' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          Дастрас
          {availableOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
              {availableOrders.length}
            </span>
          )}
          {activeTab === 'available' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 text-center font-medium transition-colors relative ${
            activeTab === 'my' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          Фармоишҳои ман
          {myOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
              {myOrders.length}
            </span>
          )}
          {activeTab === 'my' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 text-center font-medium transition-colors relative ${
            activeTab === 'completed' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          Анҷомёфта
          {activeTab === 'completed' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
            />
          )}
        </button>
      </div>

      {/* Мундариҷаи табҳо */}
      <AnimatePresence mode="wait">
        {activeTab === 'available' && (
          <motion.div
            key="available"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {isLoadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-gray-500">Фармоиши дастрас нест</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery ? 'Бо ин ҷустуҷӯ фармоиш ёфт нашуд' : 'Фармоишҳои нав ба зудӣ пайдо мешаванд'}
                </p>
              </div>
            ) : (
              filteredAvailable.map(order => renderOrderCard(order, true))
            )}
          </motion.div>
        )}

        {activeTab === 'my' && (
          <motion.div
            key="my"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {filteredMyOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📋</span>
                <p className="text-gray-500">Фармоиши фаъол нест</p>
                <p className="text-sm text-gray-400 mt-1">
                  Барои қабули фармоиш ба бахши "Дастрас" гузаред
                </p>
              </div>
            ) : (
              filteredMyOrders
                .filter(o => !['delivered', 'cancelled'].includes(o.status))
                .map(order => renderOrderCard(order, false))
            )}
          </motion.div>
        )}

        {activeTab === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {filteredMyOrders.filter(o => ['delivered'].includes(o.status)).length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">✅</span>
                <p className="text-gray-500">Фармоиши анҷомёфта нест</p>
              </div>
            ) : (
              filteredMyOrders
                .filter(o => ['delivered'].includes(o.status))
                .map(order => renderOrderCard(order, false))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
