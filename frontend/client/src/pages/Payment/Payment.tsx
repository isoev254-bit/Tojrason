// Tojrason/frontend/client/src/pages/Payment/Payment.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { ordersApi, paymentsApi } from '../../api';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

// Схемаи валидатсия барои корти нав
const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, 'Рақами корт бояд 16 рақам бошад')
    .max(19, 'Рақами корт нодуруст аст')
    .regex(/^[\d\s]+$/, 'Танҳо рақамҳо иҷозат дода мешаванд'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Формати нодуруст (MM/YY)'),
  cvv: z
    .string()
    .min(3, 'CVV бояд 3 рақам бошад')
    .max(4, 'CVV бояд 3 ё 4 рақам бошад')
    .regex(/^\d+$/, 'Танҳо рақамҳо'),
  cardholderName: z
    .string()
    .min(3, 'Номи дорандаи кортро ворид кунед'),
  saveCard: z.boolean().optional(),
});

type CardFormData = z.infer<typeof cardSchema>;

// Намуди фармоиш барои пардохт
interface OrderPaymentInfo {
  id: string;
  trackingNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  description: string;
}

const Payment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [order, setOrder] = useState<OrderPaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('card');
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Формаи корти нав
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      saveCard: false,
    },
  });

  // Санҷиши аутентификатсия
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/payment/${orderId}` } } });
    }
  }, [isAuthenticated, navigate, orderId]);

  // Боргирии маълумоти фармоиш
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const data = await ordersApi.getOrderById(orderId);
        setOrder({
          id: data.id,
          trackingNumber: data.trackingNumber,
          amount: data.price,
          currency: 'сомонӣ',
          status: data.status,
          paymentStatus: data.paymentStatus,
          description: `Фармоиш #${data.trackingNumber}`,
        });
      } catch (err: any) {
        setError(err.message || 'Хатогӣ ҳангоми боргирии маълумоти фармоиш');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Боргирии кортҳои захирашуда
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const cards = await paymentsApi.getSavedCards();
        setSavedCards(cards);
      } catch (err) {
        console.error('Failed to fetch saved cards:', err);
      }
    };
    fetchSavedCards();
  }, []);

  // Боргирии бақияи ҳамён
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const balance = await paymentsApi.getWalletBalance();
        setWalletBalance(balance.balance);
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }
    };
    fetchWalletBalance();
  }, []);

  // Тасдиқи коди промо (debounced)
  const validatePromoCodeDebounced = useDebouncedCallback(async (code: string) => {
    if (!code.trim()) {
      setPromoDiscount(null);
      setPromoError(null);
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);
    
    try {
      const result = await paymentsApi.validatePromoCode(code);
      if (result.valid) {
        setPromoDiscount(result.discount || 0);
        setPromoError(null);
      } else {
        setPromoDiscount(null);
        setPromoError(result.message || 'Коди промо нодуруст аст');
      }
    } catch (err: any) {
      setPromoDiscount(null);
      setPromoError(err.message || 'Хатогӣ ҳангоми тасдиқи код');
    } finally {
      setIsValidatingPromo(false);
    }
  }, 500);

  const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setPromoCode(code);
    validatePromoCodeDebounced(code);
  };

  // Ҳисобкунии маблағи ниҳоӣ
  const calculateTotal = (): number => {
    if (!order) return 0;
    let total = order.amount;
    if (promoDiscount) {
      total = Math.max(0, total - promoDiscount);
    }
    return total;
  };

  // Форматкунии рақами корт (xxxx xxxx xxxx xxxx)
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  // Форматкунии санаи анҷо (MM/YY)
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.substr(0, 2) + '/' + digits.substr(2, 2);
    }
    return digits;
  };

  // Анҷом додани пардохт
  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'cash') {
        // Пардохт бо пули нақд
        const payment = await paymentsApi.payWithCash(order.id, calculateTotal());
        navigate(`/payment-success?orderId=${order.id}&paymentId=${payment.id}`);
      } else if (paymentMethod === 'wallet') {
        // Пардохт аз ҳамёни дохилӣ
        if (walletBalance !== null && walletBalance < calculateTotal()) {
          setError('Маблағи ҳамёни шумо нокифоя аст');
          setIsProcessing(false);
          return;
        }
        const payment = await paymentsApi.payFromWallet(order.id, calculateTotal());
        navigate(`/payment-success?orderId=${order.id}&paymentId=${payment.id}`);
      } else if (paymentMethod === 'card') {
        if (selectedSavedCard && !showNewCardForm) {
          // Пардохт бо корти захирашуда
          const response = await paymentsApi.payWithSavedCard(selectedSavedCard, calculateTotal(), order.id);
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl;
          } else {
            navigate(`/payment-success?orderId=${order.id}`);
          }
        } else {
          // Пардохт бо корти нав
          await handleSubmit(async (cardData: CardFormData) => {
            // Дар ин ҷо корти нав бояд ба сервери пардохтӣ фиристода шавад
            // Ин одатан тавассути API-и провайдери пардохт анҷом дода мешавад
            const paymentData = {
              orderId: order.id,
              amount: calculateTotal(),
              method: 'card',
              card: {
                number: cardData.cardNumber.replace(/\s/g, ''),
                expiry: cardData.expiryDate,
                cvv: cardData.cvv,
                holderName: cardData.cardholderName,
              },
              saveCard: cardData.saveCard,
              promoCode: promoCode || undefined,
            };
            
            const response = await paymentsApi.createPayment(paymentData);
            if (response.paymentUrl) {
              window.location.href = response.paymentUrl;
            } else {
              navigate(`/payment-success?orderId=${order.id}`);
            }
          })();
          return; // handleSubmit callback идора мекунад
        }
      }
    } catch (err: any) {
      setError(err.message || 'Хатогӣ ҳангоми пардохт');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <Button variant="primary" onClick={() => navigate('/orders')}>
              Бозгашт ба фармоишҳо
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const total = calculateTotal();
  const discount = promoDiscount ? order.amount - total : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Пардохт</h1>
          <p className="text-gray-600 mb-8">Усули пардохтро интихоб кунед ва пардохтро анҷом диҳед</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Сутуни чап - Интихоби усули пардохт ва маълумоти корт */}
            <div className="lg:col-span-2 space-y-6">
              {/* Интихоби усули пардохт */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Усули пардохт</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cash' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex items-center">
                      <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium">Пули нақд ҳангоми расонидан</p>
                        <p className="text-sm text-gray-500">Пардохт ҳангоми гирифтани фармоиш</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex items-center">
                      <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <p className="font-medium">Корти бонкӣ</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, Корти Миллӣ</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'wallet' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex items-center">
                      <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div>
                        <p className="font-medium">Ҳамёни Тоҷрасон</p>
                        <p className="text-sm text-gray-500">
                          Бақия: {walletBalance !== null ? `${walletBalance.toFixed(2)} сомонӣ` : '—'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Маълумоти корт (агар корт интихоб шуда бошад) */}
              {paymentMethod === 'card' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Маълумоти корт</h2>
                  
                  {/* Корти захирашуда */}
                  {savedCards.length > 0 && !showNewCardForm && (
                    <div className="space-y-3 mb-6">
                      {savedCards.map((card) => (
                        <label
                          key={card.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                            selectedSavedCard === card.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedCard"
                            value={card.id}
                            checked={selectedSavedCard === card.id}
                            onChange={() => setSelectedSavedCard(card.id)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <div className="ml-3">
                            <p className="font-medium">**** **** **** {card.last4}</p>
                            <p className="text-sm text-gray-500">{card.brand} - {card.expiryMonth}/{card.expiryYear}</p>
                          </div>
                        </label>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCardForm(true)}
                        fullWidth
                      >
                        + Истифодаи корти нав
                      </Button>
                    </div>
                  )}

                  {/* Формаи корти нав */}
                  {(savedCards.length === 0 || showNewCardForm) && (
                    <form className="space-y-4">
                      <Input
                        label="Рақами корт"
                        placeholder="1234 5678 9012 3456"
                        error={errors.cardNumber?.message}
                        {...register('cardNumber')}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setValue('cardNumber', formatted, { shouldValidate: true });
                        }}
                        maxLength={19}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Санаи анҷо"
                          placeholder="MM/YY"
                          error={errors.expiryDate?.message}
                          {...register('expiryDate')}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setValue('expiryDate', formatted, { shouldValidate: true });
                          }}
                          maxLength={5}
                        />
                        <Input
                          label="CVV"
                          type="password"
                          placeholder="123"
                          error={errors.cvv?.message}
                          {...register('cvv')}
                          maxLength={4}
                        />
                      </div>
                      <Input
                        label="Номи дорандаи корт"
                        placeholder="NOMI DORANDA"
                        error={errors.cardholderName?.message}
                        {...register('cardholderName')}
                        onChange={(e) => {
                          setValue('cardholderName', e.target.value.toUpperCase(), { shouldValidate: true });
                        }}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('saveCard')}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Кортро барои пардохтҳои оянда захира кунед
                        </span>
                      </label>
                      
                      {savedCards.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewCardForm(false)}
                        >
                          Бозгашт ба кортҳои захирашуда
                        </Button>
                      )}
                    </form>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-4 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Маълумоти шумо рамзгузорӣ ва бехатар нигоҳ дошта мешавад
                  </p>
                </Card>
              )}
            </div>

            {/* Сутуни рост - Хулосаи фармоиш ва тугмаи пардохт */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Хулосаи фармоиш</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Фармоиш:</span>
                    <span className="font-medium">#{order.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Нархи фармоиш:</span>
                    <span className="font-medium">{order.amount.toFixed(2)} сомонӣ</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Тахфиф:</span>
                      <span>-{discount.toFixed(2)} сомонӣ</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Ҳамагӣ:</span>
                      <span className="text-indigo-600">{total.toFixed(2)} сомонӣ</span>
                    </div>
                  </div>
                </div>

                {/* Коди промо */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Коди промо
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Коди проморо ворид кунед"
                        value={promoCode}
                        onChange={handlePromoChange}
                        className="uppercase"
                      />
                      {isValidatingPromo && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                  {promoDiscount && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Коди промо тасдиқ шуд ({promoDiscount.toFixed(2)} сомонӣ тахфиф)
                    </p>
                  )}
                  {promoError && (
                    <p className="text-sm text-red-600 mt-1">{promoError}</p>
                  )}
                </div>
              </Card>

              {/* Намоиши хатогӣ */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Тугмаи пардохт */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'card' && !selectedSavedCard && !showNewCardForm && savedCards.length > 0)}
                className="relative"
              >
                {isProcessing ? (
                  <>
                    <Loader size="sm" color="white" className="mr-2" />
                    Пардохт...
                  </>
                ) : (
                  `Пардохт ${total.toFixed(2)} сомонӣ`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Бо пахш кардани тугмаи "Пардохт", шумо бо{' '}
                <a href="/terms" className="text-indigo-600 hover:underline">Шартҳои хизматрасонӣ</a>
                {' '}ва{' '}
                <a href="/privacy" className="text-indigo-600 hover:underline">Сиёсати махфият</a>
                {' '}розӣ мешавед.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
