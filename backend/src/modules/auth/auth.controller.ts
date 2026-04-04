// modules/auth/auth.controller.ts - Коркарди дархостҳои HTTP барои аутентификатсия
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthValidator } from './auth.validator';
import logger from '../../config/logger';

const authService = new AuthService();

export class AuthController {
  // Регистратсияи корбари нав
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = AuthValidator.validateRegister(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({
        success: true,
        message: 'Корбар бомуваффақият сабт шуд',
        data: result,
      });
    } catch (error: any) {
      logger.error(`Хатогии регистратсия: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Воридшавӣ ба система
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = AuthValidator.validateLogin(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json({
        success: true,
        message: 'Ворид шудан муваффақият буд',
        data: result,
      });
    } catch (error: any) {
      logger.error(`Хатогии логин: ${error.message}`);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Гирифтани маълумоти корбари ҷорӣ (бо токен)
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Токен нест ё нодуруст аст',
        });
        return;
      }

      const userData = await authService.getUserById(user.id);
      if (!userData) {
        res.status(404).json({
          success: false,
          message: 'Корбар ёфт нашуд',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error: any) {
      logger.error(`Хатогии getMe: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Хатогии сервер',
      });
    }
  }
}
