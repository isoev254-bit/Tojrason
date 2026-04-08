<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>swagger.ts</title>
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
// docs/swagger.ts - Конфигуратсияи Swagger/OpenAPI барои ҳуҷҷатгузории API
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { appConfig } from '../config/app.config';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: appConfig.appName,
            version: appConfig.apiVersion,
            description: 'Системаи интиқоли бор (ба монанди Glovo) - API барои фармоишҳо, курьерҳо ва пардохт',
            contact: {
                name: 'Tojrason Support',
                email: 'support@tojrason.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: appConfig.serverUrl,
                description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // Модели хатогӣ
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Хатогӣ рух дод' },
                        details: { type: 'object', nullable: true },
                    },
                },
                // Модели муваффақият
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Амал бомуваффақият анҷом шуд' },
                        data: { type: 'object', nullable: true },
                    },
                },
                // Модели корбар
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        fullName: { type: 'string' },
                        role: { type: 'string', enum: ['CLIENT', 'COURIER', 'ADMIN', 'DISPATCHER'] },
                        isAvailable: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                // Модели фармоиш
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        clientId: { type: 'string', format: 'uuid' },
                        courierId: { type: 'string', format: 'uuid', nullable: true },
                        pickupAddress: { type: 'string' },
                        pickupLat: { type: 'number' },
                        pickupLng: { type: 'number' },
                        deliveryAddress: { type: 'string' },
                        deliveryLat: { type: 'number' },
                        deliveryLng: { type: 'number' },
                        status: { type: 'string', enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'] },
                        paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
                        amount: { type: 'number' },
                        deliveryFee: { type: 'number' },
                        totalAmount: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                // Модели логин
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', format: 'password', example: 'password123' },
                    },
                },
                // Модели регистратсия
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'phone', 'password', 'fullName'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string', example: '+992901234567' },
                        password: { type: 'string', format: 'password', minLength: 6 },
                        fullName: { type: 'string' },
                        role: { type: 'string', enum: ['CLIENT', 'COURIER'], default: 'CLIENT' },
                    },
                },
                // Модели пардохт
                PaymentRequest: {
                    type: 'object',
                    required: ['orderId', 'method'],
                    properties: {
                        orderId: { type: 'string', format: 'uuid' },
                        method: { type: 'string', enum: ['stripe', 'cash'] },
                        successUrl: { type: 'string', nullable: true },
                        cancelUrl: { type: 'string', nullable: true },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Auth', description: 'Аутентификатсия ва регистратсия' },
            { name: 'User', description: 'Идоракунии корбарон' },
            { name: 'Order', description: 'Идоракунии фармоишҳо' },
            { name: 'Courier', description: 'Идоракунии курьерҳо' },
            { name: 'Payment', description: 'Пардохтҳо' },
            { name: 'Health', description: 'Санҷиши саломатии сервер' },
        ],
    },
    apis: ['./src/modules/*/*.ts', './src/modules/*/routes.ts'], // Роутҳо барои таҳлили автоматии Swagger
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: `${appConfig.appName} - API Documentation`,
    }));
    
    // Эндпоинти JSON барои гирифтани спецификация
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
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
