// Tojrason/frontend/courier/src/api/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// Export кардани конфигуратсияи axios
export { default as axiosInstance } from './axios.config';
export { 
  setAuthToken, 
  removeAuthToken, 
  getAuthToken 
} from './axios.config';

// Export кардани ҳамаи API-ҳо
export { default as authApi } from './auth.api';
export { default as ordersApi } from './orders.api';
export { default as courierApi } from './courier.api';

// Export кардани функсияҳои алоҳидаи auth
export {
  login,
  register,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getCurrentCourier,
  updateProfile,
  validateToken,
  loginWithPhone,
  verifyPhoneLogin,
  checkEmailExists,
  checkPhoneExists,
  uploadDocument,
  getDocumentVerificationStatus,
} from './auth.api';

// Export кардани функсияҳои алоҳидаи orders
export {
  getAvailableOrders,
  getMyOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  confirmPickup,
  confirmDelivery,
  reportIssue,
  cancelOrder,
  updateLocation,
  getClientInfo,
  sendMessageToClient,
  getOrderHistory,
  trackOrder,
  getSuggestedRoute,
  calculateDistance,
} from './orders.api';

// Export кардани функсияҳои алоҳидаи courier
export {
  getProfile,
  updateProfile as updateCourierProfile,
  updateLocation as updateCourierLocation,
  updateStatus,
  getCurrentStatus,
  getStats,
  getEarnings,
  getPaymentHistory,
  requestWithdrawal,
  getRating,
  getRecentReviews,
  updateVehicle,
  getVehicle,
  uploadDocument as uploadCourierDocument,
  getDocumentsStatus,
  getWorkSchedule,
  updateWorkSchedule,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getTodayActivity,
  startShift,
  endShift,
  getShiftHistory,
} from './courier.api';

// Export кардани объектҳои API барои истифодаи дастаҷамъӣ
export const api = {
  auth: {
    login,
    register,
    logout,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    getCurrentCourier,
    updateProfile,
    validateToken,
    loginWithPhone,
    verifyPhoneLogin,
    checkEmailExists,
    checkPhoneExists,
    uploadDocument,
    getDocumentVerificationStatus,
  },
  orders: {
    getAvailableOrders,
    getMyOrders,
    getOrderById,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    confirmPickup,
    confirmDelivery,
    reportIssue,
    cancelOrder,
    updateLocation,
    getClientInfo,
    sendMessageToClient,
    getOrderHistory,
    trackOrder,
    getSuggestedRoute,
    calculateDistance,
  },
  courier: {
    getProfile,
    updateProfile: updateCourierProfile,
    updateLocation: updateCourierLocation,
    updateStatus,
    getCurrentStatus,
    getStats,
    getEarnings,
    getPaymentHistory,
    requestWithdrawal,
    getRating,
    getRecentReviews,
    updateVehicle,
    getVehicle,
    uploadDocument: uploadCourierDocument,
    getDocumentsStatus,
    getWorkSchedule,
    updateWorkSchedule,
    getSettings,
    updateSettings,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getTodayActivity,
    startShift,
    endShift,
    getShiftHistory,
  },
};

// Export кардани намудҳо аз axios.config
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from './axios.config';

// Export кардани ҳама чиз ҳамчун объекти пешфарз
export default api;
