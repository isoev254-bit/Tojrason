// Tojrason/frontend/client/src/pages/Register/Register.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

// Схемаи валидатсия барои формаи регистратсия
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ном ворид карда шавад')
    .min(2, 'Ном на камтар аз 2 аломат бошад')
    .max(50, 'Ном зиёда аз 50 аломат набошад'),
  lastName: z
    .string()
    .min(1, 'Насаб ворид карда шавад')
    .min(2, 'Насаб на камтар аз 2 аломат бошад')
    .max(50, 'Насаб зиёда аз 50 аломат набошад'),
  email: z
    .string()
    .min(1, 'Email ворид карда шавад')
    .email('Email нодуруст аст'),
  phoneNumber: z
    .string()
    .min(1, 'Рақами телефон ворид карда шавад')
    .regex(/^\+992\d{9}$/, 'Рақами телефон бояд бо +992 оғоз шуда, 12 рақам дошта бошад'),
  password: z
    .string()
    .min(1, 'Парол ворид карда шавад')
    .min(8, 'Парол на камтар аз 8 аломат бошад')
    .regex(/[A-Z]/, 'Парол бояд ҳадди ақал як ҳарфи калон дошта бошад')
    .regex(/[a-z]/, 'Парол бояд ҳадди ақал як ҳарфи хурд дошта бошад')
    .regex(/[0-9]/, 'Парол бояд ҳадди ақал як рақам дошта бошад'),
  confirmPassword: z
    .string()
    .min(1, 'Тасдиқи парол ворид карда шавад'),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'Шумо бояд бо шартҳо розӣ шавед'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролҳо мувофиқат намекунанд',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Агар корбар аллакай ворид шуда бошад, ба саҳифаи асосӣ равона кунем
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Тоза кардани хатогӣ ҳангоми тағйири форма
  useEffect(() => {
    clearError();
    setRegisterError(null);
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '+992',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  // Ҳисобкунии қувваи парол
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-400';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Хеле суст';
    if (passwordStrength <= 2) return 'Суст';
    if (passwordStrength <= 3) return 'Миёна';
    if (passwordStrength <= 4) return 'Қавӣ';
    return 'Хеле қавӣ';
  };

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    
    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
    });

    if (result.success) {
      // Ба саҳифаи тасдиқи email ё саҳифаи асосӣ равона кунем
      navigate('/verify-email-notice');
    } else {
      setRegisterError(result.error || 'Хатогӣ ҳангоми бақайдгирӣ');
    }
  };

  // Форматкунии рақами телефон
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Агар холӣ бошад, +992 гузоред
    if (!value) {
      value = '+992';
    }
    
    // Агар бо +992 оғоз нашавад, илова кунед
    if (!value.startsWith('+992')) {
      value = '+992' + value.replace(/[^\d]/g, '');
    }
    
    // Танҳо рақамҳоро пас аз +992 нигоҳ доред
    const numbers = value.slice(4).replace(/[^\d]/g, '');
    
    // Маҳдуд кардан ба 9 рақами иловагӣ
    if (numbers.length > 9) {
      value = '+992' + numbers.slice(0, 9);
    } else {
      value = '+992' + numbers;
    }
    
    setValue('phoneNumber', value, { shouldValidate: true });
  };

  // Воридшавӣ тавассути Google
  const handleGoogleRegister = async () => {
    console.log('Google register clicked');
    // Логикаи регистратсия тавассути Google
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo ва унвон */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-indigo-600">Тоҷрасон</h1>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Ҳисоби нав эҷод кунед
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Барои бақайдгирӣ маълумоти худро ворид кунед
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            {/* Намоиши хатогиҳо */}
            {(registerError || authError) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-sm text-red-700">
                    {registerError || authError}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Формаи регистратсия */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ном"
                  type="text"
                  placeholder="Ном"
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Насаб"
                  type="text"
                  placeholder="Насаб"
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="nmunavi@mail.com"
                autoComplete="email"
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
                type="tel"
                placeholder="+992XXXXXXXXX"
                autoComplete="tel"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
                onChange={handlePhoneChange}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

              <div>
                <Input
                  label="Парол"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                  leftIcon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  }
                />
                
                {/* Индикатори қувваи парол */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                          className={`h-full ${getPasswordStrengthColor()}`}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
                      <li className={password.length >= 8 ? 'text-green-600' : ''}>
                        ✓ Ҳадди ақал 8 аломат
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Як ҳарфи калон
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Як ҳарфи хурд
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Як рақам
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Input
                label="Тасдиқи парол"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                }
              />

              {/* Розигӣ бо шартҳо */}
              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ман бо{' '}
                    <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                      Шартҳои истифода
                    </Link>
                    {' '}ва{' '}
                    <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                      Сиёсати махфият
                    </Link>
                    {' '}розӣ ҳастам
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Тугмаи регистратсия */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading || isSubmitting}
                className="relative"
              >
                {(isLoading || isSubmitting) ? (
                  <>
                    <Loader size="sm" color="white" className="mr-2" />
                    Бақайдгирӣ...
                  </>
                ) : (
                  'Бақайдгирӣ'
                )}
              </Button>
            </form>

            {/* Регистратсия тавассути шабакаҳои иҷтимоӣ */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ё бақайдгирӣ тавассути</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleRegister}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </div>

            {/* Истинод ба саҳифаи логин */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Аллакай ҳисоб доред?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Ворид шавед
              </Link>
            </p>
          </Card>

          {/* Истинод ба саҳифаи асосӣ */}
          <p className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Ба саҳифаи асосӣ
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
