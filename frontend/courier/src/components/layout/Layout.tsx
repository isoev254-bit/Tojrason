// Tojrason/frontend/courier/src/components/layout/Layout.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header/Header';
import BottomNav from './BottomNav/BottomNav';
import { selectCourierStatus } from '../../store/slices/courierSlice';
import { COURIER_STATUS } from '../../utils/constants';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const courierStatus = useSelector(selectCourierStatus);
  const [isOnline, setIsOnline] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  // Саҳифаҳое, ки Header ва BottomNav надоранд
  const hideNavigation = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ].some(path => location.pathname.startsWith(path));

  // Санҷиши статуси онлайни курйер
  useEffect(() => {
    setIsOnline(courierStatus === COURIER_STATUS.ONLINE || courierStatus === COURIER_STATUS.ON_DELIVERY);
  }, [courierStatus]);

  // Огоҳӣ дар бораи офлайн будан ҳангоми кӯшиши дастрасӣ ба саҳифаҳои муҳим
  useEffect(() => {
    const protectedPaths = ['/orders', '/current-order', '/map'];
    const isProtectedPath = protectedPaths.some(path => location.pathname.startsWith(path));
    
    if (isProtectedPath && !isOnline && courierStatus !== COURIER_STATUS.OFFLINE) {
      setShowOfflineWarning(true);
      const timer = setTimeout(() => setShowOfflineWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isOnline, courierStatus]);

  // Агар саҳифаи логин ё register бошад, танҳо outlet-ро нишон медиҳем
  if (hideNavigation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Огоҳии офлайн */}
      <AnimatePresence>
        {showOfflineWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 left-0 right-0 z-40 mx-4"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-yellow-700">
                  Шумо офлайн ҳастед. Барои қабули фармоишҳо лутфан онлайн шавед.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ml-auto text-sm font-medium text-yellow-700 hover:text-yellow-800"
                >
                  Онлайн шудан
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20">
        <div className="container mx-auto px-4 py-4">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Floating Action Button барои зуд онлайн/офлайн шудан */}
      <FloatingStatusButton isOnline={isOnline} />
    </div>
  );
};

// Компоненти тугмаи шинокунанда барои тағйири зудди статус
const FloatingStatusButton: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Дар саҳифаи dashboard ин тугмаро нишон надиҳем
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onClick={() => navigate('/dashboard')}
      className={`fixed bottom-24 right-4 z-50 p-4 rounded-full shadow-lg flex items-center justify-center ${
        isOnline 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-400 hover:bg-gray-500'
      }`}
    >
      <div className="relative">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOnline ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          )}
        </svg>
        {isOnline && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-200 rounded-full animate-pulse" />
        )}
      </div>
    </motion.button>
  );
};

export default Layout;
