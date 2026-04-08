<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order-flow.test.ts</title>
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
// tests/integration/order-flow.test.ts - Тестҳои интегратсия барои ҷараёни фармоиш
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import { hashPassword } from '../../src/common/utils/hash';

describe('Order Flow Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let courierId: string;
    let courierToken: string;
    let orderId: string;

    beforeAll(async () => {
        // Тоза кардани база
        await prisma.payment.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.order.deleteMany();
        await prisma.user.deleteMany();

        // Эҷоди клиент
        const clientPassword = await hashPassword('test123');
        const client = await prisma.user.create({
            data: {
                email: 'testclient@example.com',
                phone: '+992900001111',
                passwordHash: clientPassword,
                fullName: 'Test Client',
                role: 'CLIENT',
                isAvailable: true,
            },
        });
        userId = client.id;

        // Воридшавӣ барои гирифтани токен
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'testclient@example.com', password: 'test123' });
        authToken = loginRes.body.data.token;

        // Эҷоди курьер
        const courierPassword = await hashPassword('courier123');
        const courier = await prisma.user.create({
            data: {
                email: 'testcourier@example.com',
                phone: '+992900002222',
                passwordHash: courierPassword,
                fullName: 'Test Courier',
                role: 'COURIER',
                isAvailable: true,
                locationLat: 38.5597,
                locationLng: 68.7878,
            },
        });
        courierId = courier.id;

        const courierLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'testcourier@example.com', password: 'courier123' });
        courierToken = courierLoginRes.body.data.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Order Creation', () => {
        it('бояд фармоиши нав эҷод кунад', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    pickupAddress: 'Хиёбони Рӯдакӣ 10',
                    pickupLat: 38.5597,
                    pickupLng: 68.7878,
                    deliveryAddress: 'Хиёбони Сомонӣ 25',
                    deliveryLat: 38.5605,
                    deliveryLng: 68.7890,
                    amount: 50000,
                    clientNote: 'Тести интегратсия',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            orderId = res.body.data.id;
        });

        it('бояд фармоишро бо ID гирад', async () => {
            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(orderId);
        });

        it('бояд фармоишҳои клиентро гирад', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.data.length).toBeGreaterThan(0);
        });
    });

    describe('Order Assignment', () => {
        it('бояд курьерро ба фармоиш таъин кунад (ADMIN)', async () => {
            // Аввал бояд админ ворид шавад
            const adminPassword = await hashPassword('admin123');
            await prisma.user.upsert({
                where: { email: 'admin@tojrason.com' },
                update: {},
                create: {
                    email: 'admin@tojrason.com',
                    phone: '+992900000001',
                    passwordHash: adminPassword,
                    fullName: 'Admin',
                    role: 'ADMIN',
                    isAvailable: true,
                },
            });

            const adminLoginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@tojrason.com', password: 'admin123' });
            const adminToken = adminLoginRes.body.data.token;

            const res = await request(app)
                .patch(`/api/orders/${orderId}/assign`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ courierId });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Order Status Update', () => {
        it('бояд курьер фармоишро қабул кунад', async () => {
            const res = await request(app)
                .post(`/api/courier/orders/${orderId}/accept`)
                .set('Authorization', `Bearer ${courierToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('бояд курьер фармоишро ҳамчун расонидашуда тамом кунад', async () => {
            const res = await request(app)
                .post(`/api/courier/orders/${orderId}/complete`)
                .set('Authorization', `Bearer ${courierToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
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
