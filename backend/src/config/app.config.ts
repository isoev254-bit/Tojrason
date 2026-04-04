// config/app.config.ts - Танзимоти асосии барнома
import { env } from './env';

export const appConfig = {
  // Номи барнома
  appName: 'Tojrason Delivery System',

  // Версияи API
  apiVersion: 'v1',

  // Префикси роутҳои API
  apiPrefix: `/api/${appConfig.apiVersion}`,

  // Агар дар муҳити рушд бошем
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // URL-и пурраи сервер
  serverUrl: env.NODE_ENV === 'production' 
    ? 'https://api.tojrason.com' 
    : `http://localhost:${env.PORT}`,

  // Танзимоти саҳифабандии (pagination) пешфарз
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Файлҳо (аватарҳо ва ғ.)
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    avatarPath: 'uploads/avatars',
  },
};
