// Tojrason/frontend/shared/components/Button/Button.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Намуди тугма */
  variant?: ButtonVariant;
  /** Андозаи тугма */
  size?: ButtonSize;
  /** Тугма пурраи паҳнои контейнер */
  fullWidth?: boolean;
  /** Ҳолати боргузорӣ */
  loading?: boolean;
  /** Матни ҳолати боргузорӣ */
  loadingText?: string;
  /** Икона дар тарафи чап */
  leftIcon?: ReactNode;
  /** Икона дар тарафи рост */
  rightIcon?: ReactNode;
  /** Оё тугма ғайрифаъол аст */
  disabled?: boolean;
  /** Кӯдакон */
  children?: ReactNode;
  /** Оё аниматсияҳо фаъол бошанд */
  animated?: boolean;
}

type MotionButtonProps = HTMLMotionProps<'button'>;
type CombinedProps = ButtonProps & Omit<MotionButtonProps, keyof ButtonProps>;

const Button: React.FC<CombinedProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  children,
  animated = true,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth ? styles.fullWidth : '',
    isDisabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <span className={styles.loadingWrapper}>
          <svg className={styles.spinner} viewBox="0 0 24 24">
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          {loadingText && <span>{loadingText}</span>}
        </span>
      ) : (
        <>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          {children && <span className={styles.content}>{children}</span>}
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </>
      )}
    </>
  );

  if (animated && !isDisabled) {
    return (
      <motion.button
        type={type}
        className={baseClasses}
        disabled={isDisabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(props as MotionButtonProps)}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
