// Tojrason/frontend/client/src/pages/CreateOrder/CreateOrder.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { useGeolocation, useReverseGeocoding, useGeocoding } from '../../hooks/useGeolocation';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { ordersApi } from '../../api';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Modal from '../../components/common/Modal/Modal';

// Схемаи валидатсия барои қадами 1: Суроғаҳо
const addressesSchema = z.object({
  pickupAddress: z.string().min(5, 'Суроғаи гирифтан на камтар аз 5 аломат бошад'),
  pickupDetails: z.string().optional(),
  deliveryAddress: z.string().min(5, 'Суроғаи расонидан на камтар аз 5 аломат бошад'),
  deliveryDetails: z.string().optional(),
  recipientName: z.string().min(2, 'Номи гиранда на камтар аз 2 аломат бошад'),
  recipientPhone: z.string().regex(/^\+992\d{9}$/, 'Рақами телефон бояд бо +992 оғоз шуда, 12 рақам дошта бошад'),
});

// Схемаи валидатсия барои қадами 2: Тавсифи бор
const packageSchema = z.object({
  packageType: z.enum(['document', 'small', 'medium', 'large', 'fragile']),
  weight: z.number().min(0.1, 'Вазн на камтар аз 0.1 кг бошад').max(500, 'Вазн зиёда аз 500 кг набошад'),
  dimensions: z.object({
    length: z.number().min(1, 'Дарозӣ на камтар аз 1 см бошад'),
    width: z.number().min(1, 'Бар на камтар аз 1 см бошад'),
    height: z.number().min(1, 'Баландӣ на камтар аз 1 см бошад'),
  }).optional(),
  description: z.string().max(500, 'Тавсиф зиёда аз 500 аломат набошад').optional(),
  isFragile: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
});

// Схемаи валидатсия барои қадами 3: Пардохт
const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'wallet']),
  useSavedCard: z.boolean().optional(),
  savedCardId: z.string().optional(),
  promoCode: z.string().optional(),
});

// Якҷоя кардани ҳамаи схемаҳо
const createOrderSchema = z.object({
  ...addressesSchema.shape,
  ...packageSchema.shape,
  ...paymentSchema.shape,
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

const STEPS = ['Суроғаҳо', 'Тавсифи бор', 'Пардохт'];

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { coordinates: currentLocation, getCurrentPosition } = useGeolocation({ immediate: true });
  const { getAddressFromCoordinates } = useReverseGeocoding();
  const { getCoordinatesFromAddress } = useGeocoding();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState<'pickup' | 'delivery' | null>(null);

  const methods = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      pickupAddress: '',
      pickupDetails: '',
      deliveryAddress: '',
      deliveryDetails: '',
      recipientName: '',
      recipientPhone: '+992',
      packageType: 'small',
      weight: 1,
      isFragile: false,
      requiresSignature: false,
      paymentMethod: 'cash',
      useSavedCard: false,
      promoCode: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, formState: { errors, isValid }, setValue, watch, trigger } = methods;

  const formData = watch();

  // Санҷиши аутентификатсия
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/create-order' } } });
    }
  }, [isAuthenticated, navigate]);

  // Гирифтани кортҳои захирашуда
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const cards = await ordersApi.getAvailableCities(); // API-и кортҳо дар payments.api.ts
        // setSavedCards(cards);
      } catch (err) {
        console.error('Failed to fetch saved cards:', err);
      }
    };
    fetchSavedCards();
  }, []);

  // Истифодаи макони ҷорӣ барои суроғаи гирифтан
  const useCurrentLocation = useCallback(async () => {
    const coords = await getCurrentPosition();
    if (coords) {
      const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      if (address) {
        setValue('pickupAddress', address, { shouldValidate: true });
      }
    }
  }, [getCurrentPosition, getAddressFromCoordinates, setValue]);

  // Ҳисобкунии нархи тахминӣ
  const calculatePrice = useDebouncedCallback(async () => {
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.weight) return;

    try {
      setIsLoading(true);
      
      // Табдили суроғаҳо ба координатаҳо
      const pickupCoords = await getCoordinatesFromAddress(formData.pickupAddress);
      const deliveryCoords = await getCoordinatesFromAddress(formData.deliveryAddress);

      if (pickupCoords && deliveryCoords) {
        const estimate = await ordersApi.calculateEstimate(
          { ...pickupCoords, address: formData.pickupAddress },
          { ...deliveryCoords, address: formData.deliveryAddress },
          [{ 
            weight: formData.weight, 
            type: formData.packageType,
            dimensions: formData.dimensions 
          } as any]
        );
        
        setEstimatedPrice(estimate.price);
        setEstimatedDistance(estimate.distance);
      }
    } catch (err: any) {
      console.error('Failed to calculate price:', err);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  useEffect(() => {
    if (currentStep === 1 && formData.pickupAddress && formData.deliveryAddress) {
      calculatePrice();
    }
  }, [currentStep, formData.pickupAddress, formData.deliveryAddress, formData.weight, calculatePrice]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateOrderFormData)[] = [];
    
    if (currentStep === 0) {
      fieldsToValidate = ['pickupAddress', 'deliveryAddress', 'recipientName', 'recipientPhone'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['packageType', 'weight'];
    }
    
    const isValidStep = await trigger(fieldsToValidate as any);
    
    if (isValidStep) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        pickupAddress: data.pickupAddress,
        pickupDetails: data.pickupDetails,
        deliveryAddress: data.deliveryAddress,
        deliveryDetails: data.deliveryDetails,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        packageType: data.packageType,
        weight: data.weight,
        dimensions: data.dimensions,
        description: data.description,
        isFragile: data.isFragile,
        requiresSignature: data.requiresSignature,
        paymentMethod: data.paymentMethod,
        promoCode: data.promoCode,
      };

      const order = await ordersApi.createOrder(orderData as any);

      // Агар пардохт онлайн бошад, ба саҳифаи пардохт равона кунем
      if (data.paymentMethod === 'card') {
        const payment = await ordersApi.createPayment({
          orderId: order.id,
          amount: estimatedPrice || 0,
          method: 'card',
        } as any);
        // Равона кардан ба URL-и пардохт
        window.location.href = payment.paymentUrl;
      } else {
        navigate(`/order-success/${order.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Хатогӣ ҳангоми эҷоди фармоиш');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-indigo-600 text-white' : 
                  'bg-gray-200 text-gray-500'}
              `}>
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">{step}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-24 md:w-32 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Фармоиши нав</h1>
          <p className="text-gray-600 mb-8">Маълумоти фармоишро ворид кунед</p>

          {renderStepIndicator()}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="p-6 md:p-8">
                {/* Қадами 1: Суроғаҳо */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Суроғаи гирифтан</h2>
                    
                    <div className="relative">
                      <Input
                        label="Суроғаи гирифтан"
                        placeholder="Вилоят, шаҳр, кӯча, хона"
                        error={errors.pickupAddress?.message}
                        {...methods.register('pickupAddress')}
                      />
                      <button
                        type="button"
                        onClick={useCurrentLocation}
                        className="absolute right-3 top-9 text-indigo-600 hover:text-indigo-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    <Input
                      label="Тафсилоти иловагӣ (ихтиёрӣ)"
                      placeholder="Масалан: даромадгоҳи 2, ошёнаи 3"
                      error={errors.pickupDetails?.message}
                      {...methods.register('pickupDetails')}
                    />

                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pt-4">Суроғаи расонидан</h2>
                    
                    <Input
                      label="Суроғаи расонидан"
                      placeholder="Вилоят, шаҳр, кӯча, хона"
                      error={errors.deliveryAddress?.message}
                      {...methods.register('deliveryAddress')}
                    />
                    
                    <Input
                      label="Тафсилоти иловагӣ (ихтиёрӣ)"
                      placeholder="Масалан: даромадгоҳи 2, ошёнаи 3"
                      error={errors.deliveryDetails?.message}
                      {...methods.register('deliveryDetails')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Номи гиранда"
                        placeholder="Ном ва насаб"
                        error={errors.recipientName?.message}
                        {...methods.register('recipientName')}
                      />
                      <Input
                        label="Рақами телефон"
                        placeholder="+992XXXXXXXXX"
                        error={errors.recipientPhone?.message}
                        {...methods.register('recipientPhone')}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Қадами 2: Тавсифи бор */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Тавсифи бор</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Намуди бор
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { value: 'document', label: 'Ҳуҷҷат', icon: '📄' },
                          { value: 'small', label: 'Хурд', icon: '📦' },
                          { value: 'medium', label: 'Миёна', icon: '📦' },
                          { value: 'large', label: 'Калон', icon: '📦' },
                          { value: 'fragile', label: 'Зудшикан', icon: '⚠️' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue('packageType', type.value as any)}
                            className={`p-3 border rounded-lg text-center transition-all ${
                              formData.packageType === type.value
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-sm font-medium">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Вазн (кг)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="500"
                        {...methods.register('weight', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.weight && (
                        <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Дарозӣ (см)
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...methods.register('dimensions.length', { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Бар (см)
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...methods.register('dimensions.width', { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Баландӣ (см)
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...methods.register('dimensions.height', { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <Input
                      label="Тавсифи иловагӣ (ихтиёрӣ)"
                      placeholder="Масалан: бор боэҳтиёт муносибат кунед"
                      {...methods.register('description')}
                    />

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...methods.register('isFragile')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Бор зудшикан аст</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...methods.register('requiresSignature')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Имзо ҳангоми расонидан лозим аст</span>
                      </label>
                    </div>

                    {/* Нархи тахминӣ */}
                    {estimatedPrice !== null && (
                      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 mb-2">Нархи тахминӣ</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Масофа:</span>
                          <span className="font-medium">{estimatedDistance?.toFixed(1)} км</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-700">Нарх:</span>
                          <span className="text-2xl font-bold text-indigo-600">{estimatedPrice} сомонӣ</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Қадами 3: Пардохт */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Усули пардохт</h2>
                    
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="cash"
                          {...methods.register('paymentMethod')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 font-medium">Пули нақд ҳангоми расонидан</span>
                      </label>
                      
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="card"
                          {...methods.register('paymentMethod')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 font-medium">Корти бонкӣ</span>
                      </label>

                      {formData.paymentMethod === 'card' && savedCards.length > 0 && (
                        <div className="mt-4 pl-8">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...methods.register('useSavedCard')}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm">Истифода аз корти захирашуда</span>
                          </label>
                        </div>
                      )}

                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="wallet"
                          {...methods.register('paymentMethod')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 font-medium">Ҳамёни Тоҷрасон</span>
                      </label>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Коди промо (ихтиёрӣ)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Коди проморо ворид кунед"
                          {...methods.register('promoCode')}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline">
                          Тасдиқ
                        </Button>
                      </div>
                    </div>

                    {/* Хулосаи фармоиш */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Хулосаи фармоиш</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Аз:</span>
                          <span className="font-medium truncate max-w-[200px]">{formData.pickupAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ба:</span>
                          <span className="font-medium truncate max-w-[200px]">{formData.deliveryAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Намуди бор:</span>
                          <span className="font-medium">
                            {{ document: 'Ҳуҷҷат', small: 'Хурд', medium: 'Миёна', large: 'Калон', fragile: 'Зудшикан' }[formData.packageType]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Вазн:</span>
                          <span className="font-medium">{formData.weight} кг</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Ҳамагӣ:</span>
                            <span className="text-indigo-600">{estimatedPrice || '—'} сомонӣ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Намоиши хатогӣ */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Тугмаҳои навигатсия */}
                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0 || isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Қадами қаблӣ
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                      disabled={isLoading}
                    >
                      Қадами навбатӣ
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || !isValid}
                    >
                      {isLoading ? (
                        <>
                          <Loader size="sm" color="white" className="mr-2" />
                          Эҷоди фармоиш...
                        </>
                      ) : (
                        'Эҷоди фармоиш'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </form>
          </FormProvider>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateOrder;
