// modules/user/user.controller.ts - Коркарди дархостҳои HTTP барои корбарон
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import logger from '../../config/logger';

const userService = new UserService();

export class UserController {
  // Гирифтани маълумоти корбари ҷорӣ
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Токен нест' });
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Корбар ёфт нашуд' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error(`Хатогии getProfile: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }

  // Навсозии маълумоти корбари ҷорӣ
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Токен нест' });
        return;
      }

      const updateData: UpdateUserDto = req.body;
      const updatedUser = await userService.updateUser(userId, updateData);
      res.status(200).json({
        success: true,
        message: 'Профил бомуваффақият навсозӣ шуд',
        data: updatedUser,
      });
    } catch (error: any) {
      logger.error(`Хатогии updateProfile: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Гирифтани ҳамаи корбарон (танҳо барои ADMIN)
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, isAvailable, search, page, limit } = req.query;
      const result = await userService.getUsers({
        role: role as any,
        isAvailable: isAvailable === 'true',
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`Хатогии getAllUsers: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }

  // Нест кардани корбар (танҳо ADMIN)
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(200).json({ success: true, message: 'Корбар нест карда шуд' });
    } catch (error: any) {
      logger.error(`Хатогии deleteUser: ${error.message}`);
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
