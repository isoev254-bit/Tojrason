// modules/order/order.controller.ts - Коркарди дархостҳои HTTP барои фармоишҳо
import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { constants } from '../../config/constants';
import logger from '../../config/logger';

const orderService = new OrderService();

export class OrderController {
  // Эҷоди фармоиши нав (танҳо CLIENT)
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Токен нест' });
        return;
      }
      
      if (userRole !== constants.ROLES.CLIENT) {
        res.status(403).json({ success: false, message: 'Танҳо клиентҳо метавонанд фармоиш эҷод кунанд' });
        return;
      }

      const data: CreateOrderDto = req.body;
      const order = await orderService.createOrder(userId, data);
      
      res.status(201).json({
        success: true,
        message: 'Фармоиш бомуваффақият эҷод шуд',
        data: order,
      });
    } catch (error: any) {
      logger.error(`Хатогии createOrder: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Гирифтани фармоиш бо ID (барои клиенти соҳиб, курьери таъиншуда ё админ)
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      const order = await orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Фармоиш ёфт нашуд' });
        return;
      }
      
      // Санҷиши дастрасӣ
      const isOwner = order.clientId === userId;
      const isAssignedCourier = order.courierId === userId;
      const isAdmin = userRole === constants.ROLES.ADMIN;
      
      if (!isOwner && !isAssignedCourier && !isAdmin) {
        res.status(403).json({ success: false, message: 'Шумо иҷозати дидани ин фармоишро надоред' });
        return;
      }
      
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error(`Хатогии getOrderById: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }

  // Гирифтани фармоишҳои клиенти ҷорӣ
  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { status, paymentStatus, page, limit } = req.query;
      
      const result = await orderService.getOrdersByClient(userId, {
        status: status as any,
        paymentStatus: paymentStatus as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`Хатогии getMyOrders: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }

  // Гирифтани фармоишҳои курьери ҷорӣ
  static async getMyCourierOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (userRole !== constants.ROLES.COURIER) {
        res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд ин маълумотро бубинанд' });
        return;
      }
      
      const { status, paymentStatus, page, limit } = req.query;
      const result = await orderService.getOrdersByCourier(userId, {
        status: status as any,
        paymentStatus: paymentStatus as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`Хатогии getMyCourierOrders: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }

  // Навсозии статуси фармоиш (барои курьер ё админ)
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!status) {
        res.status(400).json({ success: false, message: 'Статус ҳатмист' });
        return;
      }
      
      const order = await orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Фармоиш ёфт нашуд' });
        return;
      }
      
      // Санҷиши иҷозат: курьери таъиншуда ё админ
      const isAssignedCourier = order.courierId === userId;
      const isAdmin = userRole === constants.ROLES.ADMIN;
      
      if (!isAssignedCourier && !isAdmin) {
        res.status(403).json({ success: false, message: 'Шумо иҷозати навсозии статуси ин фармоишро надоред' });
        return;
      }
      
      const updated = await orderService.updateOrderStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Статуси фармоиш навсозӣ шуд',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Хатогии updateOrderStatus: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Таъин кардани курьер ба фармоиш (танҳо ADMIN ё DISPATCHER)
  static async assignCourier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { courierId } = req.body;
      const userRole = (req as any).user?.role;
      
      if (userRole !== constants.ROLES.ADMIN && userRole !== constants.ROLES.DISPATCHER) {
        res.status(403).json({ success: false, message: 'Танҳо админ ё диспетчер метавонанд курьер таъин кунанд' });
        return;
      }
      
      if (!courierId) {
        res.status(400).json({ success: false, message: 'courierId ҳатмист' });
        return;
      }
      
      const updated = await orderService.assignCourier(id, courierId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Фармоиш ёфт нашуд' });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Курьер бомуваффақият таъин карда шуд',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Хатогии assignCourier: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Бекор кардани фармоиш (танҳо соҳиби фармоиш ё админ)
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      const updated = await orderService.cancelOrder(id, userId, userRole);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Фармоиш ёфт нашуд ё бекор карда намешавад' });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Фармоиш бекор карда шуд',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Хатогии cancelOrder: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Гирифтани ҳамаи фармоишҳо (танҳо ADMIN)
  static async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== constants.ROLES.ADMIN) {
        res.status(403).json({ success: false, message: 'Танҳо админ метавонад ҳамаи фармоишҳоро бубинад' });
        return;
      }
      
      const { clientId, courierId, status, paymentStatus, fromDate, toDate, page, limit } = req.query;
      const result = await orderService.getOrdersByClient(clientId as string || '', {
        status: status as any,
        paymentStatus: paymentStatus as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      
      // Барои админ метавонем ҷустуҷӯи васеътар кунем (бо courierId ва ғайра)
      // Барои соддагӣ ҳаминро истифода мебарем
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`Хатогии getAllOrders: ${error.message}`);
      res.status(500).json({ success: false, message: 'Хатогии сервер' });
    }
  }
}
