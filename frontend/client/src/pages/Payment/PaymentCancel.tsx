// Tojrason/frontend/client/src/pages/Payment/PaymentCancel.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { ordersApi } from '../../api';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

interface OrderInfo {
  id: string;
  trackingNumber: string;
  price: number;
  status: string;
}

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getOrderById(orderId);
        setOrder({
          id: data.id,
          trackingNumber: data.trackingNumber,
          price: data.price,
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message || 'Хатогӣ ҳангоми боргирии маълумоти фармоиш');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, navigate, orderId]);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} сомонӣ`;
  };

  const handleRetryPayment = () => {
    if (order) {
      navigate(`/payment/${order.id}`);
    } else {
      navigate('/order-history');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Card className="p-8 text-center">
            {/* Иконаи бекоршавӣ */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Пардохт бекор карда шуд</h1>
            <p className="text-gray-600 mb-8">
              Пардохти фармоиш бекор карда шуд. Шумо метавонед дубора кӯшиш кунед ё усули дигари пардохтро интихоб намоед.
            </p>

            {/* Маълумоти фармоиш (агар мавҷуд бошад) */}
            {order && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Рақами фармоиш:</span>
                    <span className="font-mono font-medium text-gray-900">#{order.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Маблағи пардохт:</span>
                    <span className="font-bold text-indigo-600">{formatPrice(order.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статуси фармоиш:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Интизори пардохт
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Тугмаҳои амал */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleRetryPayment}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Такрори пардохт
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/order-history')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Фармоишҳои ман
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <Link to="/" className="text-indigo-600 hover:text-indigo-700 text-sm">
                ← Бозгашт ба саҳифаи асосӣ
              </Link>
            </div>
          </Card>

          {/* Маълумоти тамос */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Мушкилот доред? <Link to="/contact" className="text-indigo-600 hover:underline">Бо дастгирӣ тамос гиред</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCancel;
