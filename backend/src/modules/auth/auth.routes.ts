// modules/auth/auth.routes.ts - Роутҳои марбут ба аутентификатсия
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

// Роути регистратсия (ҳама метавонанд дастрас кунанд)
router.post('/register', AuthController.register);

// Роути логин (ҳама метавонанд дастрас кунанд)
router.post('/login', AuthController.login);

// Роути гирифтани маълумоти корбари ҷорӣ (танҳо бо токен)
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
