// Tojrason/frontend/shared/components/Loader/Loader.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Loader.module.css';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'progress';
export type LoaderColor = 'primary' | 'secondary' | 'white' | 'gray';

export interface LoaderProps {
  /** Андозаи лоудер */
  size?: LoaderSize;
  /** Намуди лоудер */
  variant?: LoaderVariant;
  /** Ранги лоудер */
  color?: LoaderColor;
  /** Матни иловагӣ */
  text?: string;
  /** Мавқеи матн */
  textPosition?: 'bottom' | 'right';
  /** Пурраи паҳно (танҳо барои variant="progress") */
  fullWidth?: boolean;
  /** Фоизи пешрафт (танҳо барои variant="progress") */
  progress?: number;
  /** Қуттии иловагӣ */
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  textPosition = 'bottom',
  fullWidth = false,
  progress = 0,
  className = '',
}) => {
  const containerClasses = [
    styles.container,
    styles[`text-${textPosition}`],
    fullWidth ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={`${styles.spinner} ${styles[`size-${size}`]} ${styles[`color-${color}`]}`}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                className={styles.spinnerTrack}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
              />
              <motion.circle
                className={styles.spinnerHead}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0.25 }}
                animate={{ pathLength: 0.75 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{
                  strokeDasharray: '60 40',
                }}
              />
            </svg>
          </motion.div>
        );

      case 'dots':
        return (
          <div className={`${styles.dots} ${styles[`size-${size}`]} ${styles[`color-${color}`]}`}>
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className={styles.dot}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${styles.pulse} ${styles[`size-${size}`]} ${styles[`color-${color}`]}`}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        );

      case 'progress':
        return (
          <div className={`${styles.progressContainer} ${fullWidth ? styles.fullWidth : ''}`}>
            <div className={`${styles.progressTrack} ${styles[`size-${size}`]}`}>
              <motion.div
                className={`${styles.progressBar} ${styles[`color-${color}`]}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {progress > 0 && (
              <span className={styles.progressText}>{Math.round(progress)}%</span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default Loader;
