// config/security.config.ts - Танзимоти амният (helmet, cors, rate-limit)
import { env } from './env';

export const securityConfig = {
  // Helmet - ҳифзи HTTP headerҳо
  helmet: {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false,
  },

  // CORS
  cors: {
    origin: env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Rate limiting (пешгирии ҳамлаҳои brute-force)
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // ҳатто дархостҳои муваффақ ҳисоб мешаванд
    keyGenerator: (req: any) => {
      // IP ё агар логин карда бошад, userId
      return req.user?.id || req.ip || 'anonymous';
    },
  },

  // Танзимоти парол
  password: {
    minLength: 6,
    maxLength: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
  },

  // Танзимоти JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: '30d',
  },
};
