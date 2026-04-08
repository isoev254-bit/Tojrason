<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>auth.e2e.test.ts</title>
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
// tests/e2e/auth.e2e.test.ts - Тестҳои END-TO-END барои аутентификатсия
// ИН ФАЙЛ ДАР ПАПКАИ tests/e2e/ ҶОЙГИР МЕШАВАД

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import { hashPassword } from '../../src/common/utils/hash';

describe('Authentication E2E Tests', () => {
    // Маълумоти корбарони тестӣ
    const testClient = {
        email: 'e2e-client@example.com',
        phone: '+992900001001',
        password: 'Test123456',
        fullName: 'E2E Client',
        role: 'CLIENT',
    };

    const testCourier = {
        email: 'e2e-courier@example.com',
        phone: '+992900002002',
        password: 'Test123456',
        fullName: 'E2E Courier',
        role: 'COURIER',
    };

    const testAdmin = {
        email: 'e2e-admin@tojrason.com',
        phone: '+992900003003',
        password: 'Test123456',
        fullName: 'E2E Admin',
        role: 'ADMIN',
    };

    // Тоза кардани база пеш аз ҳамаи тестҳо
    beforeAll(async () => {
        // Тоза кардани корбарони тестӣ
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [testClient.email, testCourier.email, testAdmin.email],
                },
            },
        });
    });

    // Тоза кардани база пас аз ҳамаи тестҳо
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [testClient.email, testCourier.email, testAdmin.email],
                },
            },
        });
        await prisma.$disconnect();
    });

    // ============================================
    // ТЕСТҲОИ РЕГИСТРАТСИЯ (REGISTER)
    // ============================================
    describe('POST /api/auth/register', () => {
        it('бояд корбари нави CLIENT-ро сабт кунад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testClient);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', testClient.email);
            expect(res.body.data.user).toHaveProperty('role', 'CLIENT');
        });

        it('бояд корбари нави COURIER-ро сабт кунад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testCourier);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('role', 'COURIER');
        });

        it('бояд корбари нави ADMIN-ро сабт кунад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testAdmin);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('role', 'ADMIN');
        });

        it('бояд хатогӣ диҳад агар email аллакай мавҷуд бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testClient);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('почтаи электронӣ');
        });

        it('бояд хатогӣ диҳад агар телефон аллакай мавҷуд бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testClient,
                    email: 'unique-email@example.com',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('рақами телефон');
        });

        it('бояд хатогӣ диҳад агар парол кӯтоҳ бошад (мин 6 рамз)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testClient,
                    email: 'short-password@example.com',
                    phone: '+992900004004',
                    password: '123',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Парол бояд ҳадди ақал 6 рамз');
        });

        it('бояд хатогӣ диҳад агар email нодуруст бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testClient,
                    email: 'invalid-email',
                    phone: '+992900005005',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Формати email');
        });

        it('бояд хатогӣ диҳад агар fullName набошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'no-name@example.com',
                    phone: '+992900006006',
                    password: 'Test123456',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Номи пурра ҳатмист');
        });
    });

    // ============================================
    // ТЕСТҲОИ ЛОГИН (LOGIN)
    // ============================================
    describe('POST /api/auth/login', () => {
        it('бояд бомуваффақият ворид шавад (CLIENT)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testClient.email,
                    password: testClient.password,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', testClient.email);
        });

        it('бояд бомуваффақият ворид шавад (COURIER)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testCourier.email,
                    password: testCourier.password,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('role', 'COURIER');
        });

        it('бояд бомуваффақият ворид шавад (ADMIN)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testAdmin.email,
                    password: testAdmin.password,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('role', 'ADMIN');
        });

        it('бояд хатогӣ диҳад агар парол нодуруст бошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testClient.email,
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Email ё парол нодуруст');
        });

        it('бояд хатогӣ диҳад агар email мавҷуд набошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Email ё парол нодуруст');
        });

        it('бояд хатогӣ диҳад агар email набошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'Test123456',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('бояд хатогӣ диҳад агар парол набошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testClient.email,
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ============================================
    // ТЕСТҲОИ GET /me (ГИРИФТАНИ МАЪЛУМОТИ КОРБАРИ ҶОРӢ)
    // ============================================
    describe('GET /api/auth/me', () => {
        let clientToken: string;
        let courierToken: string;
        let adminToken: string;

        beforeAll(async () => {
            // Гирифтани токенҳо
            const clientRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testClient.email, password: testClient.password });
            clientToken = clientRes.body.data.token;

            const courierRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testCourier.email, password: testCourier.password });
            courierToken = courierRes.body.data.token;

            const adminRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testAdmin.email, password: testAdmin.password });
            adminToken = adminRes.body.data.token;
        });

        it('бояд маълумоти клиентро баргардонад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('email', testClient.email);
            expect(res.body.data).toHaveProperty('role', 'CLIENT');
        });

        it('бояд маълумоти курьерро баргардонад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${courierToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('role', 'COURIER');
        });

        it('бояд маълумоти админро баргардонад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('role', 'ADMIN');
        });

        it('бояд хатогӣ диҳад агар токен набошад', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Токен нест');
        });

        it('бояд хатогӣ диҳад агар токен беэътибор бошад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token-12345');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Токен беэътибор');
        });

        it('бояд хатогӣ диҳад агар токен бо формати нодуруст бошад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'WrongFormat token');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ============================================
    // ТЕСТҲОИ ГУЗОРИШИ РЕЙТ ЛИМИТ (RATE LIMIT)
    // ============================================
    describe('Rate Limiting', () => {
        it('бояд пас аз 5 кӯшиши нодурусти логин маҳдуд кунад', async () => {
            // 5 кӯшиши нодуруст
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: testClient.email,
                        password: 'wrongpassword',
                    });
            }

            // Кӯшиши 6-ум бояд маҳдуд шавад
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testClient.email,
                    password: 'wrongpassword',
                });

            // Бояд rate limit хатогӣ диҳад
            expect(res.status).toBe(429);
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
