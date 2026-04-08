<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.controller.ts</title>
    <style>
        .code-container {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            position: relative;
            margin: 20px 0;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #007acc;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background-color: #005a9e;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
<div class="code-container">
    <button class="copy-btn" onclick="copyCode()">Копия кардан</button>
    <pre id="codeBlock">
// modules/courier/courier.controller.ts - Коркарди дархостҳои HTTP барои курьерҳо
import { Request, Response } from 'express';
import { CourierService } from './courier.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { constants } from '../../config/constants';
import logger from '../../config/logger';

const courierService = new CourierService();

export class CourierController {
    // Навсозии ҷойгиршавӣ ва ҳолати дастрасии курьер
    static async updateLocation(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд ҷойгиршавии худро навсозӣ кунанд' });
                return;
            }
            
            const dto: UpdateLocationDto = req.body;
            if (dto.lat === undefined || dto.lng === undefined) {
                res.status(400).json({ success: false, message: 'lat ва lng ҳатмианд' });
                return;
            }
            
            await courierService.updateLocation(userId, dto);
            res.status(200).json({
                success: true,
                message: 'Ҷойгиршавӣ бомуваффақият навсозӣ шуд',
            });
        } catch (error: any) {
            logger.error(`Хатогии updateLocation: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }
    
    // Гирифтани профили курьер
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Дастрасӣ манъ аст' });
                return;
            }
            
            const profile = await courierService.getCourierProfile(userId);
            res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            logger.error(`Хатогии getProfile: ${error.message}`);
            res.status(404).json({ success: false, message: error.message });
        }
    }
    
    // Гирифтани омори курьер
    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд омори худро бубинанд' });
                return;
            }
            
            const stats = await courierService.getCourierStats(userId);
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            logger.error(`Хатогии getStats: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    // Қабули фармоиш
    static async acceptOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const { orderId } = req.params;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд фармоиш қабул кунанд' });
                return;
            }
            
            await courierService.acceptOrder(userId, orderId);
            res.status(200).json({
                success: true,
                message: 'Фармоиш қабул карда шуд',
            });
        } catch (error: any) {
            logger.error(`Хатогии acceptOrder: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }
    
    // Тамом кардани фармоиш (расонида шуд)
    static async completeOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const { orderId } = req.params;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд фармоишро тамом кунанд' });
                return;
            }
            
            await courierService.completeOrder(userId, orderId);
            res.status(200).json({
                success: true,
                message: 'Фармоиш бомуваффақият расонида шуд',
            });
        } catch (error: any) {
            logger.error(`Хатогии completeOrder: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }
    
    // Гирифтани фармоишҳои дастраси наздик
    static async getAvailableOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
            
            if (!userId) {
                res.status(401).json({ success: false, message: 'Токен нест' });
                return;
            }
            
            if (userRole !== constants.ROLES.COURIER) {
                res.status(403).json({ success: false, message: 'Танҳо курьерҳо метавонанд фармоишҳои дастрасро бубинанд' });
                return;
            }
            
            const orders = await courierService.getAvailableOrders(userId, radius);
            res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            logger.error(`Хатогии getAvailableOrders: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код копия карда шуд!');
    }).catch(() => {
        alert('Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
