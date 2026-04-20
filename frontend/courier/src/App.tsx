// Tojrason/frontend/courier/src/App.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch } from './store';
import { ROUTES } from './utils/constants';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader/Loader';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';

// Ленивые импорты страниц для оптимизации загрузки
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AvailableOrders = lazy(() => import('./pages/Orders/AvailableOrders'));
const MyOrders = lazy(() => import('./pages/Orders/MyOrders'));
const CurrentOrder = lazy(() => import('./pages/CurrentOrder'));
const Map = lazy(() => import('./pages/Map'));
const Stats = lazy(() => import('./pages/Stats'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile'));
const ChangePassword = lazy(() => import('./pages/Profile/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Компонент барои идоракунии пайвасти сокет
const SocketManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuth();
  const { connect, disconnect, isConnected } = useSocket();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }
  }, [isAuthenticated, accessToken, connect, disconnect]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <SocketManager>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader size="lg" />
              </div>
            }
          >
            <Routes>
              {/* Саҳифаҳои умумӣ (бе муҳофизат) */}
              <Route path={ROUTES.HOME} element={<Layout />}>
                <Route index element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<div>Барқароркунии парол</div>} />
                <Route path={ROUTES.RESET_PASSWORD} element={<div>Тасдиқи парол</div>} />
                <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
              </Route>

              {/* Саҳифаҳои муҳофизатшуда (танҳо барои курйерҳои воридшуда) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* Dashboard */}
                  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                  
                  {/* Orders */}
                  <Route path={ROUTES.ORDERS} element={<Orders />} />
                  <Route path={ROUTES.AVAILABLE_ORDERS} element={<AvailableOrders />} />
                  <Route path={ROUTES.MY_ORDERS} element={<MyOrders />} />
                  <Route path={ROUTES.CURRENT_ORDER} element={<CurrentOrder />} />
                  <Route path={ROUTES.ORDER_DETAILS} element={<CurrentOrder />} />
                  
                  {/* Map */}
                  <Route path={ROUTES.MAP} element={<Map />} />
                  
                  {/* Stats */}
                  <Route path={ROUTES.STATS} element={<Stats />} />
                  <Route path={ROUTES.EARNINGS} element={<Stats />} />
                  
                  {/* Profile */}
                  <Route path={ROUTES.PROFILE} element={<Profile />} />
                  <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
                  <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
                  <Route path={ROUTES.DOCUMENTS} element={<div>Ҳуҷҷатҳо</div>} />
                  <Route path={ROUTES.VEHICLE} element={<div>Нақлиёт</div>} />
                  
                  {/* Settings */}
                  <Route path={ROUTES.WORK_SCHEDULE} element={<div>Ҷадвали корӣ</div>} />
                  <Route path={ROUTES.SETTINGS} element={<div>Танзимот</div>} />
                  
                  {/* Chat */}
                  <Route path={ROUTES.CHAT} element={<div>Чат</div>} />
                  <Route path={ROUTES.CHAT_ROOM} element={<div>Ҳуҷраи чат</div>} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </SocketManager>
      </Router>

      {/* Системаи огоҳиҳои глобалӣ (Toaster) */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            borderRadius: '0.75rem',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />
    </Provider>
  );
};

export default App;
