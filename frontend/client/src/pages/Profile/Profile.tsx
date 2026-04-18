// Tojrason/frontend/client/src/pages/Profile/Profile.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { ordersApi } from '../../api';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Modal from '../../components/common/Modal/Modal';

// Схемаи валидатсия барои таҳрири профил
const profileSchema = z.object({
  firstName: z.string().min(2, 'Ном на камтар аз 2 аломат бошад'),
  lastName: z.string().min(2, 'Насаб на камтар аз 2 аломат бошад'),
  email: z.string().email('Email нодуруст аст'),
  phoneNumber: z.string().regex(/^\+992\d{9}$/, 'Рақами телефон бояд бо +992 оғоз шуда, 12 рақам дошта бошад'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Схемаи тағйири парол
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Пароли ҷорӣ ворид карда шавад'),
  newPassword: z.string()
    .min(8, 'Пароли нав на камтар аз 8 аломат бошад')
    .regex(/[A-Z]/, 'Парол бояд ҳадди ақал як ҳарфи калон дошта бошад')
    .regex(/[a-z]/, 'Парол бояд ҳадди ақал як ҳарфи хурд дошта бошад')
    .regex(/[0-9]/, 'Парол бояд ҳадди ақал як рақам дошта бошад'),
  confirmPassword: z.string().min(1, 'Тасдиқи парол ворид карда шавад'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Паролҳо мувофиқат намекунанд',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { updateProfile, changePassword, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState<{ total: number; active: number; completed: number } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Формаи таҳрири профил
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '+992',
    },
  });

  // Формаи тағйири парол
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, resetProfile]);

  // Боргирии омори фармоишҳо
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await ordersApi.getOrderStats();
        setOrderStats({
          total: stats.totalOrders || 0,
          active: stats.activeOrders || 0,
          completed: stats.completedOrders || 0,
        });
      } catch (err) {
        console.error('Failed to fetch order stats:', err);
      }
    };
    fetchStats();
  }, []);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateProfile(data);
    
    if (result.success) {
      setSuccessMessage('Профил бо муваффақият навсозӣ шуд');
      setIsEditing(false);
    } else {
      setError(result.error || 'Хатогӣ ҳангоми навсозии профил');
    }
    
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await changePassword(data.currentPassword, data.newPassword);
    
    if (result.success) {
      setSuccessMessage('Парол бо муваффақият тағйир дода шуд');
      setIsChangingPassword(false);
      resetPassword();
    } else {
      setError(result.error || 'Хатогӣ ҳангоми тағйири парол');
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCancelEdit = () => {
    resetProfile();
    setIsEditing(false);
    setError(null);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Профили ман</h1>
          <p className="text-gray-600 mb-8">Идоракунии маълумоти шахсӣ ва танзимот</p>

          {/* Омори фармоишҳо */}
          {orderStats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{orderStats.total}</p>
                <p className="text-sm text-gray-600">Ҳамаи фармоишҳо</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{orderStats.active}</p>
                <p className="text-sm text-gray-600">Фармоишҳои фаъол</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                <p className="text-sm text-gray-600">Анҷомёфта</p>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Сутуни чап - Аватар ва маълумоти асосӣ */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-semibold text-indigo-600">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/order-history')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Таърихи фармоишҳо
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Баромад
                  </Button>
                </div>
              </Card>
            </div>

            {/* Сутуни рост - Таҳрири профил ва тағйири парол */}
            <div className="lg:col-span-2 space-y-6">
              {/* Намоиши паёмҳо */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {/* Корти маълумоти шахсӣ */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Маълумоти шахсӣ</h3>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Таҳрир
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ном"
                        error={profileErrors.firstName?.message}
                        {...registerProfile('firstName')}
                      />
                      <Input
                        label="Насаб"
                        error={profileErrors.lastName?.message}
                        {...registerProfile('lastName')}
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      error={profileErrors.email?.message}
                      {...registerProfile('email')}
                    />
                    <Input
                      label="Рақами телефон"
                      error={profileErrors.phoneNumber?.message}
                      {...registerProfile('phoneNumber')}
                    />
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !isProfileDirty}
                      >
                        {isLoading ? <Loader size="sm" color="white" className="mr-2" /> : null}
                        Захира
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Бекор
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ном</p>
                        <p className="font-medium">{user.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Насаб</p>
                        <p className="font-medium">{user.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Рақами телефон</p>
                      <p className="font-medium">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Корти тағйири парол */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Парол</h3>
                  {!isChangingPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Тағйир додан
                    </Button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <Input
                      label="Пароли ҷорӣ"
                      type="password"
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword')}
                    />
                    <Input
                      label="Пароли нав"
                      type="password"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />
                    <Input
                      label="Тасдиқи пароли нав"
                      type="password"
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword')}
                    />
                    <div className="flex gap-3">
                      <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <Loader size="sm" color="white" className="mr-2" /> : null}
                        Захира
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          resetPassword();
                        }}
                        disabled={isLoading}
                      >
                        Бекор
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500">Парол</p>
                    <p className="font-medium">••••••••</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Модали тасдиқи баромад */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Баромад аз система"
      >
        <p className="text-gray-600 mb-6">
          Оё шумо мутмаин ҳастед, ки мехоҳед аз система бароед?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
            Бекор
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Бароед
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
