// Tojrason/frontend/courier/src/store/store.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import courierReducer from './slices/courierSlice';

// Якҷоя кардани ҳамаи reducer-ҳо
const rootReducer = combineReducers({
  auth: authReducer,
  orders: orderReducer,
  courier: courierReducer,
});

// Конфигуратсияи Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Барои баъзе майдонҳои мураккаб (масалан, Date, File) санҷиши сериализатсияро хомӯш мекунем
        ignoredActions: ['courier/uploadDocument'],
        ignoredPaths: ['courier.vehicle', 'auth.courier.createdAt', 'auth.courier.updatedAt'],
      },
    }),
  devTools: import.meta.env.DEV, // Фаъол кардани Redux DevTools танҳо дар муҳити таҳиявӣ
});

// Намудҳои TypeScript барои Store
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Hook-ҳои фармоишӣ барои истифодаи осони dispatch ва selector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
