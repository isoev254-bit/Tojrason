// Tojrason/frontend/courier/src/pages/Login/Login.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

// Схемаи валидатсия барои формаи логин
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email ворид карда шавад')
    .email('Email нодуруст аст'),
  password: z
    .string()
    .min(1, 'Парол ворид карда шавад')
    .min(6, 'Парол на камтар аз 6 аломат бошад'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Маълумоти саҳифаи қаблӣ барои равона кардан
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Агар курйер аллакай ворид шуда бошад, ба dashboard равона кунем
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Тоза кардани хатогӣ ҳангоми тағйири форма
  useEffect(() => {
    clearError();
    setLoginError(null);
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    
    // Захираи email агар rememberMe фаъол бошад
    if (data.rememberMe) {
      localStorage.setItem('courier_rememberedEmail', data.email);
    } else {
      localStorage.removeItem('courier_rememberedEmail');
    }

    const result = await login({
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLoginError(result.error || 'Хатогӣ ҳангоми воридшавӣ');
    }
  };

  // Боркунии email-и захирашуда
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('courier_rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo ва унвон */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🛵</span>
                <h1 className="text-3xl font-bold text-emerald-600">Тоҷрасон Курйер</h1>
              </div>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Хуш омадед!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Барои воридшавӣ маълумоти курйерии худро ворид кунед
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            {/* Намоиши хатогиҳо */}
            {(loginError || authError) && (
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
                    {loginError || authError}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Формаи логин */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div>
                <Input
                  label="Парол"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              </div>

              {/* Remember Me ва Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setValue('rememberMe', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Маро дар хотир нигоҳ дор</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Паролро фаромӯш кардед?
                </Link>
              </div>

              {/* Тугмаи логин */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading || isSubmitting}
                className="relative bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              >
                {(isLoading || isSubmitting) ? (
                  <>
                    <Loader size="sm" color="white" className="mr-2" />
                    Воридшавӣ...
                  </>
                ) : (
                  'Ворид шудан'
                )}
              </Button>
            </form>

            {/* Истинод ба саҳифаи регистратсия */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Ҳисоби курйерӣ надоред?{' '}
              <Link
                to="/register"
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Бақайдгирӣ кунед
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

          {/* Маълумот барои курйерҳои нав */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-medium text-emerald-800 mb-2">Ба Тоҷрасон ҳамроҳ шавед!</h3>
            <p className="text-sm text-emerald-700 mb-3">
              Ҳамчун курйер даромади хубе ба даст оред ва ба мардум кӯмак расонед.
            </p>
            <ul className="text-sm text-emerald-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ҷадвали кории чандир
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Пардохти ҳарҳафтаина
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Бонусҳо ва мукофотҳо
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
