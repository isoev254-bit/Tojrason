// Tojrason/frontend/courier/src/pages/Orders/MyOrders.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectOrders } from '../../store/slices/orderSlice';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { ORDER_STATUS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled';

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const orders = useSelector(selectOrders);
  const { currentOrder, refresh } = useOrderUpdates();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Филтр ва ҷобаҷогузории фармоишҳо
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Филтр аз рӯи статус
    if (filterStatus === 'active') {
      filtered = filtered.filter(order => 
        ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status as any)
      );
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(order => order.status === ORDER_STATUS.DELIVERED);
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter(order => order.status === ORDER_STATUS.CANCELLED);
    }

    // Филтр аз рӯи ҷустуҷӯ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.trackingNumber.toLowerCase().includes(query) ||
        order.pickupAddress.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query) ||
        order.recipientName?.toLowerCase().includes(query)
      );
    }

    // Ҷобаҷогузорӣ аз рӯи сана (навтарин аввал)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filtered;
  }, [orders, filterStatus, searchQuery]);

  // Debounced ҷустуҷӯ
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  // Навсозии дастӣ
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  // Гузариш ба фармоиши ҷорӣ
  const handleContinueOrder = (orderId: string) => {
    navigate('/current-order');
  };

  // Кушода/пӯшидани тафсилоти фармоиш
  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

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

  // Ҳисобкунии омор
  const stats = useMemo(() => {
    const active = orders.filter(o => 
      ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(o.status as any)
    ).length;
    const completed = orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length;
    const cancelled = orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length;
    const totalEarnings = orders
      .filter(o => o.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + (o.price || 0), 0);

    return { active, completed, cancelled, totalEarnings };
  }, [orders]);

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Фармоишҳои ман</h1>
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

      {/* Омори зуд */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{stats.active}</p>
          <p className="text-xs text-gray-500">Фаъол</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500">Анҷом</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-500">Бекор</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{formatPrice(stats.totalEarnings)}</p>
          <p className="text-xs text-gray-500">Даромад</p>
        </Card>
      </div>

      {/* Фармоиши фаъол */}
      {currentOrder && !['delivered', 'cancelled'].includes(currentOrder.status) && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">📦 Фармоиши фаъол</h3>
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
            onClick={() => handleContinueOrder(currentOrder.id)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Идома додани фармоиш →
          </Button>
        </Card>
      )}

      {/* Ҷустуҷӯ */}
      <div className="mb-4">
        <Input
          placeholder="Ҷустуҷӯ бо рақами пайгирӣ, суроға ё номи гиранда..."
          onChange={(e) => debouncedSearch(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Филтрҳои статус */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' && 'Ҳама'}
            {status === 'active' && 'Фаъол'}
            {status === 'completed' && 'Анҷомёфта'}
            {status === 'cancelled' && 'Бекоршуда'}
          </button>
        ))}
      </div>

      {/* Рӯйхати фармоишҳо */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-500">Фармоиш ёфт нашуд</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery 
              ? 'Бо ин ҷустуҷӯ фармоиш ёфт нашуд' 
              : filterStatus !== 'all' 
                ? `Шумо фармоиши ${filterStatus === 'active' ? 'фаъол' : filterStatus === 'completed' ? 'анҷомёфта' : 'бекоршуда'} надоред`
                : 'Шумо ҳанӯз ягон фармоиш қабул накардаед'}
          </p>
          {(searchQuery || filterStatus !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              Тоза кардани филтрҳо
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-4">
                  {/* Сарлавҳаи фармоиш */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">#{order.trackingNumber}</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <span className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-emerald-600">
                          {formatPrice(order.price)}
                        </p>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-green-500 text-sm mt-0.5">📍</span>
                        <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.pickupAddress}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 text-sm mt-0.5">🏁</span>
                        <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </button>

                  {/* Тафсилоти васеъ */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                          {/* Маълумоти гиранда */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Гиранда</p>
                              <p className="font-medium">{order.recipientName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Телефон</p>
                              <p className="font-medium">{order.recipientPhone || '—'}</p>
                            </div>
                          </div>

                          {/* Тавсифи бор */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Намуди бор</p>
                              <p className="font-medium">
                                {order.packageType === 'document' ? 'Ҳуҷҷат' : 
                                 order.packageType === 'small' ? 'Хурд' : 
                                 order.packageType === 'medium' ? 'Миёна' : 
                                 order.packageType === 'large' ? 'Калон' : 'Зудшикан'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Вазн</p>
                              <p className="font-medium">{order.weight} кг</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Усули пардохт</p>
                              <p className="font-medium">
                                {order.paymentMethod === 'cash' ? 'Нақд' : 
                                 order.paymentMethod === 'card' ? 'Корт' : 'Ҳамён'}
                              </p>
                            </div>
                          </div>

                          {/* Timeline */}
                          {order.timeline && order.timeline.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Таърихи фармоиш</p>
                              <div className="space-y-2">
                                {order.timeline.slice(0, 3).map((step, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700">{step.label}</p>
                                      <p className="text-xs text-gray-400">{formatDate(step.timestamp)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Тугмаҳои амал */}
                          <div className="flex gap-2 pt-2">
                            {![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status as any) && (
                              <Button
                                variant="primary"
                                size="sm"
                                fullWidth
                                onClick={() => handleContinueOrder(order.id)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Идома додан
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              Тафсилоти пурра
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
