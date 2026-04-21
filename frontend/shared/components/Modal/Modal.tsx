// Tojrason/frontend/shared/components/Modal/Modal.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';
import styles from './Modal.module.css';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom';

export interface ModalProps {
  /** Оё модал кушода аст */
  isOpen: boolean;
  /** Функсия барои пӯшидани модал */
  onClose: () => void;
  /** Унвони модал */
  title?: string;
  /** Тавсифи модал (ихтиёрӣ) */
  description?: string;
  /** Мундариҷаи модал */
  children?: ReactNode;
  /** Андозаи модал */
  size?: ModalSize;
  /** Мавқеи модал */
  position?: ModalPosition;
  /** Оё модал бо клик дар берун пӯшида шавад */
  closeOnOverlayClick?: boolean;
  /** Оё модал бо тугмаи Escape пӯшида шавад */
  closeOnEscape?: boolean;
  /** Оё тугмаи пӯшидан нишон дода шавад */
  showCloseButton?: boolean;
  /** Оё модал дар поён тугмаҳои амал дошта бошад */
  actions?: ReactNode;
  /** Матни тугмаи тасдиқ */
  confirmText?: string;
  /** Матни тугмаи бекоркунӣ */
  cancelText?: string;
  /** Функсия барои тасдиқ */
  onConfirm?: () => void;
  /** Ҳолати боргузории тугмаи тасдиқ */
  isConfirmLoading?: boolean;
  /** Оё тугмаи тасдиқ ғайрифаъол бошад */
  isConfirmDisabled?: boolean;
  /** Намуди тугмаи тасдиқ */
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  /** Оё аниматсия фаъол бошад */
  animated?: boolean;
  /** Қуттии иловагӣ барои мундариҷа */
  contentClassName?: string;
  /** Қуттии иловагӣ барои контейнер */
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'center',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  actions,
  confirmText = 'Тасдиқ',
  cancelText = 'Бекор',
  onConfirm,
  isConfirmLoading = false,
  isConfirmDisabled = false,
  confirmVariant = 'primary',
  animated = true,
  contentClassName = '',
  containerClassName = '',
}) => {
  // Коркарди тугмаи Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Қулф кардани скроли body ҳангоми кушода будани модал
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={`${styles.modalWrapper} ${containerClassName}`}>
          {/* Оверлей */}
          <motion.div
            className={styles.overlay}
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            exit={animated ? { opacity: 0 } : false}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />

          {/* Контейнери модал */}
          <motion.div
            className={`${styles.modalContainer} ${styles[`position-${position}`]}`}
            initial={animated ? getInitialAnimation(position) : false}
            animate={animated ? { opacity: 1, scale: 1, y: 0, x: '-50%' } : false}
            exit={animated ? getExitAnimation(position) : false}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={handleOverlayClick}
          >
            <div
              className={`${styles.modal} ${styles[`size-${size}`]} ${contentClassName}`}
              onClick={handleContentClick}
            >
              {/* Сарлавҳа */}
              {(title || showCloseButton) && (
                <div className={styles.header}>
                  <div className={styles.titleWrapper}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {description && <p className={styles.description}>{description}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      className={styles.closeButton}
                      onClick={onClose}
                      aria-label="Пӯшидан"
                    >
                      <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Мундариҷа */}
              <div className={styles.body}>
                {children}
              </div>

              {/* Тугмаҳои амал */}
              {(actions || onConfirm) && (
                <div className={styles.footer}>
                  {actions ? (
                    actions
                  ) : (
                    <>
                      <Button variant="outline" onClick={onClose}>
                        {cancelText}
                      </Button>
                      <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        loading={isConfirmLoading}
                        disabled={isConfirmDisabled}
                      >
                        {confirmText}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Портал ба body
  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  if (!portalRoot) return null;

  return createPortal(modalContent, portalRoot);
};

// Функсияҳои ёрирасон барои аниматсия
function getInitialAnimation(position: ModalPosition) {
  switch (position) {
    case 'top':
      return { opacity: 0, y: -50, x: '-50%' };
    case 'bottom':
      return { opacity: 0, y: 50, x: '-50%' };
    case 'center':
    default:
      return { opacity: 0, scale: 0.9, y: 0, x: '-50%' };
  }
}

function getExitAnimation(position: ModalPosition) {
  switch (position) {
    case 'top':
      return { opacity: 0, y: -50, x: '-50%' };
    case 'bottom':
      return { opacity: 0, y: 50, x: '-50%' };
    case 'center':
    default:
      return { opacity: 0, scale: 0.9, x: '-50%' };
  }
}

export default Modal;
