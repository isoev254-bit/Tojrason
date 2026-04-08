<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.service.test.ts</title>
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
// tests/unit/order.service.test.ts - Тестҳои воҳид барои OrderService
import { OrderService } from '../../src/modules/order/order.service';
import { OrderRepository } from '../../src/modules/order/order.repository';
import { constants } from '../../src/config/constants';

jest.mock('../../src/modules/order/order.repository');
jest.mock('../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

describe('OrderService', () => {
    let orderService: OrderService;
    let mockRepository: jest.Mocked&lt;OrderRepository&gt;;

    beforeEach(() => {
        mockRepository = new OrderRepository() as jest.Mocked&lt;OrderRepository&gt;;
        orderService = new OrderService();
        (orderService as any).repository = mockRepository;
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const createData = {
            pickupAddress: 'Хиёбони Рӯдакӣ 10',
            pickupLat: 38.5597,
            pickupLng: 68.7878,
            deliveryAddress: 'Хиёбони Сомонӣ 25',
            deliveryLat: 38.5605,
            deliveryLng: 68.7890,
            amount: 50000,
            clientNote: 'Тест',
        };
        const clientId = 'client-123';

        it('бояд фармоиши нав эҷод кунад', async () => {
            const mockOrder = {
                id: 'order-123',
                clientId,
                ...createData,
                deliveryFee: 15000,
                totalAmount: 65000,
                status: constants.ORDER_STATUS.PENDING,
                paymentStatus: constants.PAYMENT_STATUS.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockRepository.create.mockResolvedValue(mockOrder);

            const result = await orderService.createOrder(clientId, createData);

            expect(result).toEqual(mockOrder);
            expect(mockRepository.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOrderById', () => {
        it('бояд фармоишро бо ID баргардонад', async () => {
            const mockOrder = {
                id: 'order-123',
                clientId: 'client-123',
                status: constants.ORDER_STATUS.PENDING,
            } as any;

            mockRepository.findById.mockResolvedValue(mockOrder);

            const result = await orderService.getOrderById('order-123');
            expect(result).toEqual(mockOrder);
        });

        it('бояд null баргардонад агар фармоиш ёфт нашуд', async () => {
            mockRepository.findById.mockResolvedValue(null);
            const result = await orderService.getOrderById('order-999');
            expect(result).toBeNull();
        });
    });

    describe('updateOrderStatus', () => {
        it('бояд статуси фармоишро навсозӣ кунад', async () => {
            const mockOrder = {
                id: 'order-123',
                status: constants.ORDER_STATUS.ASSIGNED,
            } as any;

            mockRepository.update.mockResolvedValue(mockOrder);

            const result = await orderService.updateOrderStatus('order-123', constants.ORDER_STATUS.ASSIGNED);
            expect(result).toEqual(mockOrder);
        });

        it('бояд вақти гирифтанро сабт кунад', async () => {
            const mockOrder = {
                id: 'order-123',
                status: constants.ORDER_STATUS.PICKED_UP,
                pickedUpAt: new Date(),
            } as any;

            mockRepository.update.mockResolvedValue(mockOrder);

            const result = await orderService.updateOrderStatus('order-123', constants.ORDER_STATUS.PICKED_UP);
            expect(result?.pickedUpAt).toBeDefined();
        });
    });

    describe('assignCourier', () => {
        it('бояд курьерро ба фармоиш таъин кунад', async () => {
            const mockOrder = {
                id: 'order-123',
                courierId: 'courier-456',
                status: constants.ORDER_STATUS.ASSIGNED,
                assignedAt: new Date(),
            } as any;

            mockRepository.update.mockResolvedValue(mockOrder);

            const result = await orderService.assignCourier('order-123', 'courier-456');
            expect(result?.courierId).toBe('courier-456');
            expect(result?.status).toBe(constants.ORDER_STATUS.ASSIGNED);
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
