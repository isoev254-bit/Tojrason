// Tojrason/frontend/shared/components/Input/Input.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';
import styles from './Input.module.css';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';
export type LabelPosition = 'top' | 'left';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Намуди вуруд */
  variant?: InputVariant;
  /** Андозаи вуруд */
  size?: InputSize;
  /** Нишона */
  label?: string;
  /** Мавқеи нишона */
  labelPosition?: LabelPosition;
  /** Паёми хатогӣ */
  error?: string;
  /** Икона дар тарафи чап */
  leftIcon?: ReactNode;
  /** Икона дар тарафи рост */
  rightIcon?: ReactNode;
  /** Пурраи паҳно */
  fullWidth?: boolean;
  /** Ҳолати ғайрифаъол */
  disabled?: boolean;
  /** Ҳатмӣ */
  required?: boolean;
  /** Қуттии вуруд */
  containerClassName?: string;
  /** Қуттии нишона */
  labelClassName?: string;
  /** Қуттии вуруд */
  inputClassName?: string;
  /** Қуттии хатогӣ */
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  label,
  labelPosition = 'top',
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  required = false,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  id,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    containerClassName,
  ].filter(Boolean).join(' ');

  const labelWrapperClasses = [
    styles.labelWrapper,
    labelPosition === 'left' ? styles.labelWrapperLeft : styles.labelWrapperTop,
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.label,
    disabled ? styles.labelDisabled : '',
    required ? styles.required : '',
    labelClassName,
  ].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    isFocused ? styles.focused : '',
    error ? styles.error : '',
    disabled ? styles.disabled : '',
    inputClassName,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    leftIcon ? styles.hasLeftIcon : '',
    rightIcon ? styles.hasRightIcon : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <div className={labelWrapperClasses}>
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && <span className={styles.requiredStar}>*</span>}
          </label>
        </div>
      )}
      <div className={styles.inputOuterWrapper}>
        <div className={inputWrapperClasses}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error && <p className={`${styles.errorMessage} ${errorClassName}`}>{error}</p>}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
