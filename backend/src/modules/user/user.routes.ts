// modules/user/user.routes.ts - Роутҳои марбут ба корбарон
import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { RolesGuard } from '../../common/guards/roles.guard';
import { constants } from '../../config/constants';

const router = Router();

// Ҳамаи роутҳои user ба аутентификатсия ниёз доранд
router.use(authMiddleware);

// Профили шахсӣ (барои ҳамаи нақшҳо)
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Роутҳои маъмурӣ (танҳо ADMIN)
router.get(
  '/',
  RolesGuard([constants.ROLES.ADMIN]),
  UserController.getAllUsers
);

router.delete(
  '/:id',
  RolesGuard([constants.ROLES.ADMIN]),
  UserController.deleteUser
);

export default router;
