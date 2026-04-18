// Tojrason/frontend/client/src/pages/OrderHistory/OrderHistory.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { ordersApi } from '../../api';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';

// Намуди фармоиш
interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  pickupAddress: string;
  deliveryAddress: string;
  price: number;
  recipientName: string;
  packageType: string;
  estimatedDelivery?: string;
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

// Намуди филтр
interface FilterState {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  page: number;
  limit: number;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filter, setFilter] = useState<FilterState>({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    page: 1,
    limit: 10,
  });

  // Санҷиши аутентификатсия
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/order-history' } } });
    }
  }, [isAuthenticated, navigate]);

  // Боргирии фармоишҳо
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.getOrders({
        status: filter.status || undefined,
        fromDate: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
        toDate: filter.dateTo ? new Date(filter.dateTo) : undefined,
        page: filter.page,
        limit: filter.limit,
      });
      
      // Фильтркунии ҷустуҷӯ дар тарафи клиент (агар API дастгирӣ накунад)
      let filteredOrders = response;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredOrders = response.filter(order => 
          order.trackingNumber.toLowerCase().includes(searchLower) ||
          order.pickupAddress.toLowerCase().includes(searchLower) ||
          order.deliveryAddress.toLowerCase().includes(searchLower) ||
          order.recipientName.toLowerCase().includes(searchLower)
        );
      }
      
      setOrders(filteredOrders);
      // Фарз мекунем, ки API маълумоти пагинатсияро бармегардонад
      // Агар не, дар асоси дарозии массив ҳисоб мекунем
      setTotalOrders(filteredOrders.length);
      setTotalPages(Math.ceil(filteredOrders.length / filter.limit));
    } catch (err: any) {
      setError(err.message || 'Хатогӣ ҳангоми боргирии фармоишҳо');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  // Debounced ҷустуҷӯ
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilter(prev => ({ ...prev, search: value, page: 1 }));
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilter(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilter(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      page: 1,
      limit: 10,
    });
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const trackOrder = (trackingNumber: string) => {
    navigate(`/track-order?track=${trackingNumber}`);
  };

  const repeatOrder = async (orderId: string) => {
    try {
      const newOrder = await ordersApi.repeatOrder(orderId);
      navigate(`/create-order?from=${orderId}`);
    } catch (err) {
      console.error('Failed to repeat order:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Таърихи фармоишҳо</h1>
              <p className="text-gray-600 mt-1">Ҳамаи фармоишҳои шумо дар як ҷо</p>
            </div>
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

          {/* Панели филтрҳо */}
          <Card className="p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ҷустуҷӯ
                </label>
                <Input
                  placeholder="Рақами пайгирӣ, суроға..."
                  onChange={handleSearchChange}
                  leftIcon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Ҳама</option>
                  <option value="pending">Дар интизорӣ</option>
                  <option value="accepted">Қабулшуда</option>
                  <option value="pickup">Гирифтани бор</option>
                  <option value="in_transit">Дар роҳ</option>
                  <option value="arriving">Наздик шуд</option>
                  <option value="delivered">Расонида шуд</option>
                  <option value="cancelled">Бекоршуда</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аз сана
                </label>
                <Input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  То сана
                </label>
                <Input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            {(filter.status || filter.dateFrom || filter.dateTo || filter.search) && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Тоза кардани филтрҳо
                </Button>
              </div>
            )}
          </Card>

          {/* Рӯйхати фармоишҳо */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Фармоиш ёфт нашуд</h3>
              <p className="text-gray-600 mb-6">
                {filter.status || filter.dateFrom || filter.dateTo || filter.search
                  ? 'Бо филтрҳои ҷорӣ фармоиш ёфт нашуд'
                  : 'Шумо ҳанӯз ягон фармоиш надодаед'}
              </p>
              <Button variant="primary" onClick={() => navigate('/create-order')}>
                Фармоиш додан
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="font-mono text-sm text-gray-500">
                                #{order.trackingNumber}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Аз: </span>
                                <span className="text-gray-900">{order.pickupAddress}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Ба: </span>
                                <span className="text-gray-900">{order.deliveryAddress}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Гиранда: </span>
                                <span className="text-gray-900">{order.recipientName}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Сана: </span>
                                <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1">
                            <span className="text-xl font-bold text-indigo-600">
                              {formatPrice(order.price)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewOrderDetails(order)}
                              >
                                Тафсилот
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => trackOrder(order.trackingNumber)}
                              >
                                Пайгирӣ
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Пагинатсия */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filter.page === 1}
                      onClick={() => handlePageChange(filter.page - 1)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (filter.page <= 3) {
                        pageNum = i + 1;
                      } else if (filter.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = filter.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={filter.page === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filter.page === totalPages}
                      onClick={() => handlePageChange(filter.page + 1)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </nav>
                </div>
              )}
              
              <div className="mt-4 text-center text-sm text-gray-500">
                Ҳамагӣ: {totalOrders} фармоиш
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Модали тафсилоти фармоиш */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Фармоиш #${selectedOrder?.trackingNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Статус</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Санаи фармоиш</p>
                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Суроғаи гирифтан</p>
                <p className="font-medium">{selectedOrder.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Суроғаи расонидан</p>
                <p className="font-medium">{selectedOrder.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Гиранда</p>
                <p className="font-medium">{selectedOrder.recipientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Намуди бор</p>
                <p className="font-medium">{selectedOrder.packageType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Нарх</p>
                <p className="font-medium text-indigo-600">{formatPrice(selectedOrder.price)}</p>
              </div>
              {selectedOrder.estimatedDelivery && (
                <div>
                  <p className="text-sm text-gray-500">Санаи тахминии расонидан</p>
                  <p className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  trackOrder(selectedOrder.trackingNumber);
                }}
              >
                Пайгирии фармоиш
              </Button>
              {selectedOrder.status === 'delivered' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    repeatOrder(selectedOrder.id);
                  }}
                >
                  Такрори фармоиш
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;
