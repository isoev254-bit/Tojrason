// Tojrason/frontend/client/src/api/index.ts

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
export { default as paymentsApi } from './payments.api';

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
  getCurrentUser,
  updateProfile,
  validateToken,
  loginWithGoogle,
  loginWithFacebook,
  loginWithPhone,
  verifyPhoneLogin,
  checkEmailExists,
  checkPhoneExists,
} from './auth.api';

// Export кардани функсияҳои алоҳидаи orders
export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  trackOrder,
  getOrderLocation,
  getOrderHistory,
  rateOrder,
  getOrderStats,
  calculateEstimate,
  getActiveOrders,
  getCompletedOrders,
  getCancelledOrders,
  confirmDelivery,
  reportIssue,
  getCourierInfo,
  sendMessageToCourier,
  repeatOrder,
  saveOrderDraft,
  getOrderDraft,
  deleteOrderDraft,
  getAvailableCities,
  checkDeliveryAvailability,
} from './orders.api';

// Export кардани функсияҳои алоҳидаи payments
export {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByOrder,
  confirmPayment,
  cancelPayment,
  refundPayment,
  getAvailablePaymentMethods,
  addCard,
  getSavedCards,
  deleteCard,
  setDefaultCard,
  getPaymentHistory,
  getPaymentStats,
  getPaymentReceipt,
  downloadReceiptPDF,
  sendReceiptToEmail,
  payWithSavedCard,
  payWithCash,
  payWithWallet,
  checkPaymentStatus,
  getTotalSpent,
  addFundsToWallet,
  getWalletBalance,
  payFromWallet,
  validatePromoCode,
  applyPromoCode,
  getExchangeRate,
  convertCurrency,
} from './payments.api';

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
    getCurrentUser,
    updateProfile,
    validateToken,
    loginWithGoogle,
    loginWithFacebook,
    loginWithPhone,
    verifyPhoneLogin,
    checkEmailExists,
    checkPhoneExists,
  },
  orders: {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    cancelOrder,
    trackOrder,
    getOrderLocation,
    getOrderHistory,
    rateOrder,
    getOrderStats,
    calculateEstimate,
    getActiveOrders,
    getCompletedOrders,
    getCancelledOrders,
    confirmDelivery,
    reportIssue,
    getCourierInfo,
    sendMessageToCourier,
    repeatOrder,
    saveOrderDraft,
    getOrderDraft,
    deleteOrderDraft,
    getAvailableCities,
    checkDeliveryAvailability,
  },
  payments: {
    createPayment,
    getPayments,
    getPaymentById,
    getPaymentsByOrder,
    confirmPayment,
    cancelPayment,
    refundPayment,
    getAvailablePaymentMethods,
    addCard,
    getSavedCards,
    deleteCard,
    setDefaultCard,
    getPaymentHistory,
    getPaymentStats,
    getPaymentReceipt,
    downloadReceiptPDF,
    sendReceiptToEmail,
    payWithSavedCard,
    payWithCash,
    payWithWallet,
    checkPaymentStatus,
    getTotalSpent,
    addFundsToWallet,
    getWalletBalance,
    payFromWallet,
    validatePromoCode,
    applyPromoCode,
    getExchangeRate,
    convertCurrency,
  },
};

// Export кардани намудҳо аз axios.config
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from './axios.config';

// Export кардани ҳама чиз ҳамчун объекти пешфарз
export default api;
