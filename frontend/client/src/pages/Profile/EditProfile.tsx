// Tojrason/frontend/client/src/pages/Profile/EditProfile.tsx
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
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
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
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { updateProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '+992',
    },
  });

  // Санҷиши аутентификатсия
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Навсозии қиматҳои форма ҳангоми тағйири корбар
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await updateProfile(data);
    
    if (result.success) {
      navigate('/profile', { state: { message: 'Профил бо муваффақият навсозӣ шуд' } });
    } else {
      setError(result.error || 'Хатогӣ ҳангоми навсозии профил');
    }
    
    setIsLoading(false);
  };

  if (!user) {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Сарлавҳа */}
          <div className="mb-6">
            <Link to="/profile" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Бозгашт ба профил
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Таҳрири профил</h1>
            <p className="text-gray-600 mt-1">Маълумоти шахсии худро навсозӣ кунед</p>
          </div>

          {/* Намоиши хатогӣ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Формаи таҳрир */}
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

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

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || !isDirty}
                  className="flex-1"
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
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Бекор кардан
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
