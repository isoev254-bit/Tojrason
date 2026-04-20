// Tojrason/frontend/courier/src/store/slices/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// Import reducer-ҳо
import authReducer from './authSlice';
import orderReducer from './orderSlice';
import courierReducer from './courierSlice';

// Export reducer-ҳои алоҳида
export { default as authReducer } from './authSlice';
export { default as orderReducer } from './orderSlice';
export { default as courierReducer } from './courierSlice';

// ========== Auth Slice ==========
export {
  setLoading as setAuthLoading,
  setError as setAuthError,
  setCredentials,
  updateTokens,
  updateCourier,
  clearCredentials,
  clearError as clearAuthError,
} from './authSlice';

export {
  selectAuth,
  selectCourier,
  selectAccessToken,
  selectRefreshToken,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
  selectAuthError,
  selectIsCourierOnline,
  selectDocumentsVerified,
} from './authSlice';

// ========== Order Slice ==========
export {
  setLoading as setOrderLoading,
  setAccepting,
  setUpdating,
  setError as setOrderError,
  clearError as clearOrderError,
  setAvailableOrders,
  addAvailableOrder,
  removeAvailableOrder,
  clearAvailableOrders,
  setMyOrders,
  addMyOrder,
  updateMyOrder,
  removeMyOrder,
  setFilter,
  resetFilters,
  setCurrentOrder,
  updateCurrentOrder,
  updateOrderStatus,
  clearCurrentOrder,
  acceptOrderSuccess,
  rejectOrderSuccess,
  confirmPickupSuccess,
  confirmDeliverySuccess,
} from './orderSlice';

export {
  selectOrderState,
  selectAvailableOrders,
  selectTotalAvailable,
  selectMyOrders,
  selectTotalMyOrders,
  selectCurrentOrder,
  selectOrderFilters,
  selectIsLoading as selectOrderIsLoading,
  selectIsAccepting,
  selectIsUpdating,
  selectOrderError,
  selectActiveMyOrders,
  selectCompletedOrders,
  selectOrderStats,
} from './orderSlice';

// ========== Courier Slice ==========
export {
  setLoading as setCourierLoading,
  setUpdating as setCourierUpdating,
  setError as setCourierError,
  clearError as clearCourierError,
  setProfile,
  updateProfile,
  setCourierStatus,
  setStats,
  updateStats,
  setEarnings,
  setVehicle,
  updateVehicle,
  setSettings,
  updateSettings,
  setTodayActivity,
  updateTodayActivity,
  startShiftSuccess,
  endShiftSuccess,
  clearCourierState,
} from './courierSlice';

export {
  selectCourierState,
  selectCourierProfile,
  selectCourierStatus,
  selectCourierStats,
  selectCourierEarnings,
  selectCourierVehicle,
  selectCourierSettings,
  selectTodayActivity,
  selectIsLoading as selectCourierIsLoading,
  selectIsUpdating as selectCourierIsUpdating,
  selectCourierError,
  selectIsOnline,
  selectIsOnDelivery,
  selectTodayStats,
  selectWeekStats,
  selectMonthStats,
  selectTotalStats,
  selectCourierRating,
  selectDocumentsStatus,
  selectIsProfileVerified,
} from './courierSlice';

// Объекти reducer-ҳо барои store
const reducers = {
  auth: authReducer,
  orders: orderReducer,
  courier: courierReducer,
};

export default reducers;
