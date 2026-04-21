// Tojrason/frontend/shared/components/Toast/Toast.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React from 'react';
import toast, { Toast as HotToast, Toaster, ToastOptions } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps {
  /** Намуди огоҳӣ */
  type?: ToastType;
  /** Матни огоҳӣ */
  message: string;
  /** Давомнокӣ бо миллисония */
  duration?: number;
  /** Мавқеи огоҳӣ */
  position?: ToastPosition;
  /** Иконаи фармоишӣ */
  icon?: React.ReactNode;
  /** ID-и огоҳӣ барои навсозӣ */
  id?: string;
}

// Иконаҳои пешфарз
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  loading: (
    <svg className={`${styles.icon} ${styles.spinner}`} fill="none" viewBox="0 0 24 24">
      <circle className={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <circle className={styles.spinnerHead} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * Намоиши огоҳии муваффақият
 */
export const toastSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...options,
    className: `${styles.toast} ${styles.success} ${options?.className || ''}`,
  });
};

/**
 * Намоиши огоҳии хатогӣ
 */
export const toastError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...options,
    className: `${styles.toast} ${styles.error} ${options?.className || ''}`,
  });
};

/**
 * Намоиши огоҳии огоҳкунанда
 */
export const toastWarning = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...options,
    icon: icons.warning,
    className: `${styles.toast} ${styles.warning} ${options?.className || ''}`,
  });
};

/**
 * Намоиши огоҳии иттилоотӣ
 */
export const toastInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...options,
    icon: icons.info,
    className: `${styles.toast} ${styles.info} ${options?.className || ''}`,
  });
};

/**
 * Намоиши огоҳии боркунӣ
 */
export const toastLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...options,
    className: `${styles.toast} ${styles.loading} ${options?.className || ''}`,
  });
};

/**
 * Пинҳон кардани огоҳӣ
 */
export const dismissToast = (toastId?: string) => {
  toast.dismiss(toastId);
};

/**
 * Навсозии огоҳии мавҷуда
 */
export const updateToast = (
  toastId: string,
  type: ToastType,
  message: string,
  options?: ToastOptions
) => {
  const icon = icons[type];
  toast(message, {
    ...options,
    id: toastId,
    icon,
    className: `${styles.toast} ${styles[type]} ${options?.className || ''}`,
  });
};

/**
 * Компоненти Toaster барои гузоштан дар решаи барнома
 */
export const ToastProvider: React.FC<{ position?: ToastPosition }> = ({ 
  position = 'top-right' 
}) => {
  return (
    <Toaster
      position={position}
      reverseOrder={false}
      gutter={8}
      containerClassName={styles.toaster}
      toastOptions={{
        duration: 4000,
        className: styles.toast,
        success: {
          duration: 3000,
          icon: icons.success,
          className: `${styles.toast} ${styles.success}`,
        },
        error: {
          duration: 4000,
          icon: icons.error,
          className: `${styles.toast} ${styles.error}`,
        },
        loading: {
          icon: icons.loading,
          className: `${styles.toast} ${styles.loading}`,
        },
      }}
    >
      {(t: HotToast) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {t.icon && <span className={styles.iconWrapper}>{t.icon}</span>}
              <span className={styles.message}>{t.message as string}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Toaster>
  );
};

// Объекти toast барои дастрасии осон
export const toastUtils = {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  dismiss: dismissToast,
  update: updateToast,
};

export default toastUtils;
