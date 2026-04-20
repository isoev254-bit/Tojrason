// Tojrason/frontend/courier/src/store/index.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// Export кардани Store
export { default as store } from './store';
export { default } from './store';

// Export кардани hook-ҳои фармоишӣ барои истифодаи осон
export { useAppDispatch, useAppSelector } from './store';

// Export кардани намудҳои TypeScript
export type { RootState, AppDispatch } from './store';

// Export кардани ҳамаи амалҳо ва selector-ҳо аз slices
export * from './slices';
