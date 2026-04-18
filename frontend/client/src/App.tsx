// Tojrason/frontend/client/src/App.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ROUTES } from './utils/constants';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader/Loader';

// Ленивые импорты страниц для оптимизации загрузки
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const OrderHistory = lazy(() => import('./pages/OrderHistory/OrderHistory'));
const OrderDetails = lazy(() => import('./pages/OrderHistory/OrderDetails'));
const Payment = lazy(() => import('./pages/Payment/Payment'));
const PaymentSuccess = lazy(() => import('./pages/Payment/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/Payment/PaymentCancel'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile'));
const ChangePassword = lazy(() => import('./pages/Profile/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Саҳифаҳои умумӣ (бе муҳофизат) */}
            <Route path={ROUTES.HOME} element={<Layout />}>
              <Route index element={<Home />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.TRACK_ORDER} element={<TrackOrder />} />
              <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
              <Route path={ROUTES.PAYMENT_CANCEL} element={<PaymentCancel />} />
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
              <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
            </Route>

            {/* Саҳифаҳои муҳофизатшуда (танҳо барои корбарони воридшуда) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path={ROUTES.CREATE_ORDER} element={<CreateOrder />} />
                <Route path={ROUTES.ORDER_HISTORY} element={<OrderHistory />} />
                <Route path={ROUTES.ORDER_DETAILS} element={<OrderDetails />} />
                <Route path={ROUTES.PAYMENT} element={<Payment />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
                <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
                <Route path={ROUTES.CHAT} element={<div>Чат (дар оянда)</div>} />
                <Route path={ROUTES.CHAT_ROOM} element={<div>Ҳуҷраи чат (дар оянда)</div>} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </Router>

      {/* Системаи огоҳиҳои глобалӣ (Toaster) */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Provider>
  );
};

export default App;
