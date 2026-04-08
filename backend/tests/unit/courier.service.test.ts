<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.service.test.ts</title>
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
// tests/unit/courier.service.test.ts - Тестҳои воҳид барои CourierService
import { CourierService } from '../../../src/modules/courier/courier.service';
import { CourierRepository } from '../../../src/modules/courier/courier.repository';
import { UserRepository } from '../../../src/modules/user/user.repository';
import { LocationService } from '../../../src/modules/courier/location.service';
import { OrderService } from '../../../src/modules/order/order.service';
import { constants } from '../../../src/config/constants';

// Мок кардани модулҳо
jest.mock('../../../src/modules/courier/courier.repository');
jest.mock('../../../src/modules/user/user.repository');
jest.mock('../../../src/modules/courier/location.service');
jest.mock('../../../src/modules/order/order.service');
jest.mock('../../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
}));

describe('CourierService', () => {
    let courierService: CourierService;
    let mockCourierRepo: jest.Mocked&lt;CourierRepository&gt;;
    let mockUserRepo: jest.Mocked&lt;UserRepository&gt;;
    let mockLocationService: jest.Mocked&lt;LocationService&gt;;
    let mockOrderService: jest.Mocked&lt;OrderService&gt;;

    beforeEach(() => {
        mockCourierRepo = new CourierRepository() as jest.Mocked&lt;CourierRepository&gt;;
        mockUserRepo = new UserRepository() as jest.Mocked&lt;UserRepository&gt;;
        mockLocationService = new LocationService() as jest.Mocked&lt;LocationService&gt;;
        mockOrderService = new OrderService() as jest.Mocked&lt;OrderService&gt;;
        
        courierService = new CourierService();
        (courierService as any).courierRepo = mockCourierRepo;
        (courierService as any).userRepo = mockUserRepo;
        (courierService as any).locationService = mockLocationService;
        (courierService as any).orderService = mockOrderService;
        
        jest.clearAllMocks();
    });

    describe('updateLocation', () => {
        const dto = { lat: 38.5597, lng: 68.7878, isAvailable: true };
        const courierId = 'courier-123';

        it('бояд ҷойгиршавии курьерро навсозӣ кунад', async () => {
            mockUserRepo.updateLocation.mockResolvedValue();
            mockUserRepo.setAvailability.mockResolvedValue();
            mockLocationService.setCourierLocation.mockResolvedValue();

            await courierService.updateLocation(courierId, dto);

            expect(mockUserRepo.updateLocation).toHaveBeenCalledWith(courierId, dto.lat, dto.lng);
            expect(mockLocationService.setCourierLocation).toHaveBeenCalledWith(courierId, dto.lat, dto.lng);
        });

        it('бояд ҳолати дастрасиро навсозӣ кунад агар isAvailable фиристода шавад', async () => {
            mockUserRepo.updateLocation.mockResolvedValue();
            mockUserRepo.setAvailability.mockResolvedValue();
            mockLocationService.setCourierLocation.mockResolvedValue();

            await courierService.updateLocation(courierId, { lat: 38.5597, lng: 68.7878, isAvailable: false });

            expect(mockUserRepo.setAvailability).toHaveBeenCalledWith(courierId, false);
        });

        it('бояд ҳолати дастрасиро навсозӣ накунад агар isAvailable набошад', async () => {
            mockUserRepo.updateLocation.mockResolvedValue();
            mockLocationService.setCourierLocation.mockResolvedValue();

            await courierService.updateLocation(courierId, { lat: 38.5597, lng: 68.7878 });

            expect(mockUserRepo.setAvailability).not.toHaveBeenCalled();
        });
    });

    describe('getCourierProfile', () => {
        const courierId = 'courier-123';

        it('бояд профили курьерро баргардонад', async () => {
            const mockUser = {
                id: courierId,
                email: 'courier@example.com',
                role: constants.ROLES.COURIER,
                fullName: 'Test Courier',
                phone: '+992901234567',
                isAvailable: true,
                locationLat: 38.5597,
                locationLng: 68.7878,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUserRepo.findById.mockResolvedValue(mockUser);

            const result = await courierService.getCourierProfile(courierId);
            expect(result).toEqual(mockUser);
        });

        it('бояд хатогӣ диҳад агар корбар ёфт нашуд', async () => {
            mockUserRepo.findById.mockResolvedValue(null);

            await expect(courierService.getCourierProfile(courierId)).rejects.toThrow('Курьер ёфт нашуд');
        });

        it('бояд хатогӣ диҳад агар корбар курьер набошад', async () => {
            const mockUser = {
                id: courierId,
                role: constants.ROLES.CLIENT,
            } as any;

            mockUserRepo.findById.mockResolvedValue(mockUser);

            await expect(courierService.getCourierProfile(courierId)).rejects.toThrow('Курьер ёфт нашуд');
        });
    });

    describe('getCourierStats', () => {
        const courierId = 'courier-123';

        it('бояд омори курьерро баргардонад', async () => {
            const mockOrders = {
                total: 10,
                data: [
                    { deliveryFee: 15000 },
                    { deliveryFee: 15000 },
                    { deliveryFee: 20000 },
                ],
            };

            const mockActiveOrders = { total: 2 };
            const mockInProgressOrders = { total: 1 };

            mockOrderService.getOrdersByCourier = jest.fn()
                .mockResolvedValueOnce(mockOrders)
                .mockResolvedValueOnce(mockActiveOrders)
                .mockResolvedValueOnce(mockInProgressOrders);

            const result = await courierService.getCourierStats(courierId);

            expect(result).toEqual({
                courierId,
                totalDelivered: 10,
                totalEarnings: 50000,
                activeOrdersCount: 3,
                rating: 5.0,
            });
        });

        it('бояд бо фармоишҳои холӣ кор кунад', async () => {
            mockOrderService.getOrdersByCourier = jest.fn()
                .mockResolvedValueOnce({ total: 0, data: [] })
                .mockResolvedValueOnce({ total: 0 })
                .mockResolvedValueOnce({ total: 0 });

            const result = await courierService.getCourierStats(courierId);

            expect(result.totalEarnings).toBe(0);
            expect(result.activeOrdersCount).toBe(0);
        });
    });

    describe('acceptOrder', () => {
        const courierId = 'courier-123';
        const orderId = 'order-456';

        it('бояд фармоишро қабул кунад', async () => {
            const mockOrder = {
                id: orderId,
                courierId: courierId,
                status: constants.ORDER_STATUS.ASSIGNED,
            };

            mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);
            mockOrderService.updateOrderStatus = jest.fn().mockResolvedValue({ ...mockOrder, status: constants.ORDER_STATUS.PICKED_UP });

            await courierService.acceptOrder(courierId, orderId);

            expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(orderId, constants.ORDER_STATUS.PICKED_UP);
        });

        it('бояд хатогӣ диҳад агар фармоиш ёфт нашуд', async () => {
            mockOrderService.getOrderById = jest.fn().mockResolvedValue(null);

            await expect(courierService.acceptOrder(courierId, orderId)).rejects.toThrow('Фармоиш ёфт нашуд');
        });

        it('бояд хатогӣ диҳад агар фармоиш ба курьер таъин нашуда бошад', async () => {
            const mockOrder = {
                id: orderId,
                courierId: 'other-courier',
                status: constants.ORDER_STATUS.ASSIGNED,
            };

            mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);

            await expect(courierService.acceptOrder(courierId, orderId)).rejects.toThrow('Ин фармоиш ба шумо таъин нашудааст');
        });

        it('бояд хатогӣ диҳад агар фармоиш дар ҳолати қабул набошад', async () => {
            const mockOrder = {
                id: orderId,
                courierId: courierId,
                status: constants.ORDER_STATUS.PENDING,
            };

            mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);

            await expect(courierService.acceptOrder(courierId, orderId)).rejects.toThrow('Фармоиш дар ҳолати қабул нест');
        });
    });

    describe('completeOrder', () => {
        const courierId = 'courier-123';
        const orderId = 'order-456';

        it('бояд фармоишро ҳамчун расонидашуда тамом кунад', async () => {
            const mockOrder = {
                id: orderId,
                courierId: courierId,
                status: constants.ORDER_STATUS.PICKED_UP,
            };

            mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);
            mockOrderService.updateOrderStatus = jest.fn().mockResolvedValue({ ...mockOrder, status: constants.ORDER_STATUS.DELIVERED });

            await courierService.completeOrder(courierId, orderId);

            expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(orderId, constants.ORDER_STATUS.DELIVERED);
        });

        it('бояд хатогӣ диҳад агар фармоиш ёфт нашуд', async () => {
            mockOrderService.getOrderById = jest.fn().mockResolvedValue(null);

            await expect(courierService.completeOrder(courierId, orderId)).rejects.toThrow('Фармоиш ёфт нашуд');
        });

        it('бояд хатогӣ диҳад агар фармоиш ба курьер таъин нашуда бошад', async () => {
            const mockOrder = {
                id: orderId,
                courierId: 'other-courier',
                status: constants.ORDER_STATUS.PICKED_UP,
            };

            mockOrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);

            await expect(courierService.completeOrder(courierId, orderId)).rejects.toThrow('Шумо иҷозати идоракунии ин фармоишро надоред');
        });
    });

    describe('getAvailableOrders', () => {
        const courierId = 'courier-123';

        it('бояд фармоишҳои дастраси наздикро баргардонад', async () => {
            const mockCourier = {
                id: courierId,
                locationLat: 38.5597,
                locationLng: 68.7878,
            };

            const mockOrders = [
                { id: 'order-1', pickupLat: 38.5600, pickupLng: 68.7880, deliveryFee: 15000 },
                { id: 'order-2', pickupLat: 38.5610, pickupLng: 68.7890, deliveryFee: 15000 },
            ];

            mockUserRepo.findById.mockResolvedValue(mockCourier as any);
            mockCourierRepo.findPendingOrdersNearby.mockResolvedValue(mockOrders as any);

            const result = await courierService.getAvailableOrders(courierId);

            expect(result).toEqual(mockOrders);
        });

        it('бояд хатогӣ диҳад агар ҷойгиршавии курьер муайян нашуда бошад', async () => {
            const mockCourier = {
                id: courierId,
                locationLat: null,
                locationLng: null,
            };

            mockUserRepo.findById.mockResolvedValue(mockCourier as any);

            await expect(courierService.getAvailableOrders(courierId)).rejects.toThrow('Ҷойгиршавии курьер муайян карда нашудааст');
        });
    });
});
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
