// Tojrason/frontend/client/src/pages/Payment/PaymentSuccess.tsx
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
import Badge from '../../components/common/Badge/Badge';

interface OrderSummary {
  id: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  price: number;
  paymentMethod: string;
  createdAt: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError('Маълумоти фармоиш ёфт нашуд');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getOrderById(orderId);
        setOrder({
          id: data.id,
          trackingNumber: data.trackingNumber,
          status: data.status,
          estimatedDelivery: data.estimatedDelivery,
          price: data.price,
          paymentMethod: data.paymentMethod,
          createdAt: data.createdAt,
        });
      } catch (err: any) {
        setError(err.message || 'Хатогӣ ҳангоми боргирии маълумоти фармоиш');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, navigate, orderId]);

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
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Хатогӣ рух дод</h2>
            <p className="text-gray-600 mb-6">{error || 'Фармоиш ёфт нашуд'}</p>
            <Button variant="primary" onClick={() => navigate('/orders')}>
              Ба фармоишҳои ман
            </Button>
          </div>
        </div>
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
            {/* Иконаи муваффақият */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Пардохт бо муваффақият анҷом ёфт!</h1>
            <p className="text-gray-600 mb-8">
              Ташаккур барои фармоишатон. Фармоиши шумо қабул карда шуд ва ба зудӣ расонида мешавад.
            </p>

            {/* Маълумоти фармоиш */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Рақами фармоиш:</span>
                  <span className="font-mono font-medium text-gray-900">#{order.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Санаи фармоиш:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Усули пардохт:</span>
                  <span className="font-medium">
                    {{ cash: 'Пули нақд', card: 'Корти бонкӣ', wallet: 'Ҳамёни Тоҷрасон' }[order.paymentMethod] || order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Маблағи пардохтшуда:</span>
                  <span className="font-bold text-indigo-600">{formatPrice(order.price)}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Расонидани тахминӣ:</span>
                    <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600">Статуси фармоиш:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {order.status === 'pending' ? 'Дар интизории курйер' : 'Қабулшуда'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Идентификатори пардохт (агар мавҷуд бошад) */}
            {paymentId && (
              <p className="text-xs text-gray-400 mb-6">
                ID пардохт: {paymentId}
              </p>
            )}

            {/* Тугмаҳои амал */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/track-order?track=${order.trackingNumber}`)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Пайгирии фармоиш
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

            <div className="mt-6">
              <Link to="/" className="text-indigo-600 hover:text-indigo-700 text-sm">
                ← Бозгашт ба саҳифаи асосӣ
              </Link>
            </div>
          </Card>

          {/* Тавсияҳо ё маълумоти иловагӣ */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Рақами пайгирии фармоиш ба рақами телефони шумо тавассути SMS фиристода шуд.</p>
            <p className="mt-2">Савол доред? <Link to="/contact" className="text-indigo-600 hover:underline">Бо мо дар тамос шавед</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
