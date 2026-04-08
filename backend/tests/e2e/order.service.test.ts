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
// tests/e2e/auth.e2e.test.ts - Тестҳои E2E барои аутентификатсия
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Authentication E2E Tests', () => {
    const testUser = {
        email: 'e2e-test@example.com',
        phone: '+992900009999',
        password: 'Test123456',
        fullName: 'E2E Test User',
    };

    beforeAll(async () => {
        // Тоза кардани корбари тестӣ агар мавҷуд бошад
        await prisma.user.deleteMany({
            where: { email: testUser.email },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('бояд корбари нав сабт кунад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', testUser.email);
        });

        it('бояд хатогӣ диҳад агар email аллакай мавҷуд бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('почтаи электронӣ аллакай истифода шудааст');
        });

        it('бояд хатогӣ диҳад агар парол кӯтоҳ бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'unique@example.com',
                    phone: '+992900001111',
                    password: '123',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('бояд хатогӣ диҳад агар email нодуруст бошад', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email',
                    phone: '+992900002222',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('бояд бомуваффақият ворид шавад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('бояд хатогӣ диҳад агар парол нодуруст бошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('бояд хатогӣ диҳад агар email мавҷуд набошад', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });
            authToken = loginRes.body.data.token;
        });

        it('бояд маълумоти корбари ҷориро баргардонад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('email', testUser.email);
        });

        it('бояд хатогӣ диҳад агар токен набошад', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('бояд хатогӣ диҳад агар токен беэътибор бошад', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
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
