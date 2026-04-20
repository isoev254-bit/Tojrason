// Tojrason/frontend/courier/src/pages/Profile/EditProfile.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { selectCourier } from '../../store/slices/courierSlice';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

// Схемаи валидатсия барои таҳрири профил
const editProfileSchema = z.object({
  firstName: z.string().min(2, 'Ном на камтар аз 2 аломат бошад'),
  lastName: z.string().min(2, 'Насаб на камтар аз 2 аломат бошад'),
  email: z.string().email('Email нодуруст аст'),
  phoneNumber: z.string().regex(/^\+992\d{9}$/, 'Рақами телефон бояд бо +992 оғоз шуда, 12 рақам дошта бошад'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const courier = useSelector(selectCourier);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: courier?.firstName || '',
      lastName: courier?.lastName || '',
      email: courier?.email || '',
      phoneNumber: courier?.phoneNumber || '+992',
    },
  });

  // Навсозии қиматҳои форма ҳангоми тағйири корбар
  useEffect(() => {
    if (courier) {
      reset({
        firstName: courier.firstName,
        lastName: courier.lastName,
        email: courier.email,
        phoneNumber: courier.phoneNumber,
      });
    }
  }, [courier, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateProfile(data);
    
    if (result.success) {
      setSuccessMessage('Профил бо муваффақият навсозӣ шуд');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } else {
      setError(result.error || 'Хатогӣ ҳангоми навсозии профил');
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="mb-6">
        <Link to="/profile" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Бозгашт ба профил
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Таҳрири профил</h1>
        <p className="text-gray-600 mt-1">Маълумоти шахсии худро навсозӣ кунед</p>
      </div>

      {/* Намоиши паёмҳо */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-3 text-sm text-green-700">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Аватар */}
      <Card className="p-6 mb-4 text-center">
        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
          <span className="text-3xl font-semibold text-emerald-600">
            {courier?.firstName?.charAt(0)}{courier?.lastName?.charAt(0)}
          </span>
        </div>
        <h3 className="font-medium text-gray-900">
          {courier?.firstName} {courier?.lastName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Аксро тағйир додан мумкин нест</p>
      </Card>

      {/* Формаи таҳрир */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Ном"
            placeholder="Номи худро ворид кунед"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          
          <Input
            label="Насаб"
            placeholder="Насаби худро ворид кунед"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="nmunavi@mail.com"
            error={errors.email?.message}
            {...register('email')}
            leftIcon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Input
            label="Рақами телефон"
            placeholder="+992XXXXXXXXX"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
            leftIcon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          {/* Эзоҳ */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 flex items-start">
              <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Рақами телефон барои тамос бо шумо ва муштариён истифода мешавад.</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading || !isDirty}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader size="sm" color="white" className="mr-2" />
                  Захира...
                </>
              ) : (
                'Захира кардани тағйирот'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleCancel}
              disabled={isLoading}
            >
              Бекор кардан
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
