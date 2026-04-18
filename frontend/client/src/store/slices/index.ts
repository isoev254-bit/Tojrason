// Tojrason/frontend/client/src/store/slices/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// Import reducer-ҳо
import authReducer from './authSlice';
import orderReducer from './orderSlice';
import paymentReducer from './paymentSlice';

// Export reducer-ҳои алоҳида
export { default as authReducer } from './authSlice';
export { default as orderReducer } from './orderSlice';
export { default as paymentReducer } from './paymentSlice';

// Export амалҳои auth
export {
  setLoading as setAuthLoading,
  setError as setAuthError,
  setCredentials,
  updateTokens,
  updateUser,
  clearCredentials,
  clearError as clearAuthError,
} from './authSlice';

// Export selector-ҳои auth
export {
  selectAuth,
  selectUser,
  selectAccessToken,
  selectRefreshToken,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
  selectAuthError,
  selectUserRole,
  selectHasRole,
} from './authSlice';

// Export амалҳои order
export {
  setLoading as setOrderLoading,
  setCreating,
  setUpdating,
  setError as setOrderError,
  clearError as clearOrderError,
  setOrders,
  addOrder,
  updateOrderInList,
  removeOrderFromList,
  clearOrders,
  setFilter as setOrderFilter,
  resetFilters as resetOrderFilters,
  setPage as setOrderPage,
  setCurrentOrder,
  updateCurrentOrder,
  updateOrderStatus,
  updateCourierLocation,
  clearCurrentOrder,
  setTrackedOrder,
  updateTrackedOrder,
  clearTrackedOrder,
  addTimelineEvent,
  cancelOrderSuccess,
} from './orderSlice';

// Export selector-ҳои order
export {
  selectOrderState,
  selectOrders,
  selectTotalOrders,
  selectTotalPages,
  selectCurrentOrder,
  selectTrackedOrder,
  selectOrderFilters,
  selectIsLoading as selectOrderIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectOrderError,
  selectOrderById,
  selectActiveOrders,
  selectCompletedOrders,
  selectCancelledOrders,
  selectOrderStats,
} from './orderSlice';

// Export амалҳои payment
export {
  setLoading as setPaymentLoading,
  setProcessing,
  setCreating as setPaymentCreating,
  setError as setPaymentError,
  clearError as clearPaymentError,
  setPayments,
  addPayment,
  updatePaymentInList,
  clearPayments,
  setFilter as setPaymentFilter,
  resetFilters as resetPaymentFilters,
  setPage as setPaymentPage,
  setCurrentPayment,
  updateCurrentPayment,
  updatePaymentStatus,
  clearCurrentPayment,
  paymentSuccess,
  paymentFailure,
  setSavedCards,
  addSavedCard,
  removeSavedCard,
  setDefaultCard,
  setWalletBalance,
  updateWalletBalance,
  setPaymentStats,
  setPromoCode,
  clearPromoCode,
  refundSuccess,
} from './paymentSlice';

// Export selector-ҳои payment
export {
  selectPaymentState,
  selectPayments,
  selectTotalPayments,
  selectTotalPages as selectPaymentTotalPages,
  selectCurrentPayment,
  selectPaymentFilters,
  selectSavedCards,
  selectDefaultCard,
  selectWalletBalance,
  selectPaymentStats,
  selectPromoCode,
  selectIsLoading as selectPaymentIsLoading,
  selectIsProcessing,
  selectIsCreating as selectPaymentIsCreating,
  selectPaymentError,
  selectPaymentById,
  selectPaymentsByOrderId,
  selectSuccessfulPayments,
  selectTotalSpent,
} from './paymentSlice';

// Объекти reducer-ҳо барои store
const reducers = {
  auth: authReducer,
  orders: orderReducer,
  payments: paymentReducer,
};

export default reducers;
