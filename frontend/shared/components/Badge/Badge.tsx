// Tojrason/frontend/shared/components/Badge/Badge.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeType = 'filled' | 'outline' | 'dot';

export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  /** Мундариҷаи баҷ */
  children?: ReactNode;
  /** Намуди ранг */
  variant?: BadgeVariant;
  /** Андоза */
  size?: BadgeSize;
  /** Намуди баҷ (пур, контурӣ, нуқта) */
  type?: BadgeType;
  /** Оё баҷ кликшаванда бошад */
  clickable?: boolean;
  /** Оё аниматсия фаъол бошад */
  animated?: boolean;
  /** Қуттии иловагӣ */
  className?: string;
  /** Функсия барои клик */
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  type = 'filled',
  clickable = false,
  animated = true,
  className = '',
  onClick,
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    styles[`type-${type}`],
    clickable ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  const motionProps: HTMLMotionProps<'span'> = {
    className: badgeClasses,
    onClick,
    ...(clickable && animated
      ? {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }
      : {}),
    ...(animated && !clickable && type !== 'dot'
      ? {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.2 },
        }
      : {}),
    ...props,
  };

  // Агар type="dot" бошад, мундариҷаро нишон намедиҳем
  const content = type === 'dot' ? null : children;

  return <motion.span {...motionProps}>{content}</motion.span>;
};

export default Badge;
