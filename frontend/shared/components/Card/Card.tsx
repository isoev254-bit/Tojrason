// Tojrason/frontend/shared/components/Card/Card.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Мундариҷаи корт */
  children?: ReactNode;
  /** Намуди корт */
  variant?: CardVariant;
  /** Андозаи padding дохилӣ */
  padding?: CardPadding;
  /** Оё корт кликшаванда бошад */
  clickable?: boolean;
  /** Оё аниматсия фаъол бошад */
  animated?: boolean;
  /** Оё корт пурраи паҳно бошад */
  fullWidth?: boolean;
  /** Қуттии иловагӣ */
  className?: string;
  /** Функсия барои клик */
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  clickable = false,
  animated = true,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[`variant-${variant}`],
    styles[`padding-${padding}`],
    clickable ? styles.clickable : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  const motionProps: HTMLMotionProps<'div'> = {
    className: cardClasses,
    onClick,
    ...(clickable && animated
      ? {
          whileHover: { scale: 1.02, y: -2 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }
      : {}),
    ...(animated && !clickable
      ? {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 },
        }
      : {}),
    ...props,
  };

  return <motion.div {...motionProps}>{children}</motion.div>;
};

export default Card;
