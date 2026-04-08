<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>seed.ts</title>
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
// prisma/seeds/seed.ts - Пур кардани базаи додаҳо бо маълумоти аввалия (seed data)
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/common/utils/hash';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Оғози seed...');

    // 1. Эҷоди корбарони ADMIN
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tojrason.com' },
        update: {},
        create: {
            email: 'admin@tojrason.com',
            phone: '+992900000001',
            passwordHash: adminPassword,
            fullName: 'Администратор',
            role: 'ADMIN',
            isAvailable: true,
        },
    });
    console.log(`✅ Админ эҷод шуд: ${admin.email}`);

    // 2. Эҷоди корбари DISPATCHER
    const dispatcherPassword = await hashPassword('dispatcher123');
    const dispatcher = await prisma.user.upsert({
        where: { email: 'dispatcher@tojrason.com' },
        update: {},
        create: {
            email: 'dispatcher@tojrason.com',
            phone: '+992900000002',
            passwordHash: dispatcherPassword,
            fullName: 'Диспетчер',
            role: 'DISPATCHER',
            isAvailable: true,
        },
    });
    console.log(`✅ Диспетчер эҷод шуд: ${dispatcher.email}`);

    // 3. Эҷоди курьерҳои намунавӣ
    const courierPassword = await hashPassword('courier123');
    const courier1 = await prisma.user.upsert({
        where: { email: 'courier1@tojrason.com' },
        update: {},
        create: {
            email: 'courier1@tojrason.com',
            phone: '+992900000003',
            passwordHash: courierPassword,
            fullName: 'Курьер Али',
            role: 'COURIER',
            isAvailable: true,
            locationLat: 38.5597,
            locationLng: 68.7878,
        },
    });
    console.log(`✅ Курьер 1 эҷод шуд: ${courier1.email}`);

    const courier2 = await prisma.user.upsert({
        where: { email: 'courier2@tojrason.com' },
        update: {},
        create: {
            email: 'courier2@tojrason.com',
            phone: '+992900000004',
            passwordHash: courierPassword,
            fullName: 'Курьер Умар',
            role: 'COURIER',
            isAvailable: true,
            locationLat: 38.5600,
            locationLng: 68.7880,
        },
    });
    console.log(`✅ Курьер 2 эҷод шуд: ${courier2.email}`);

    // 4. Эҷоди клиентҳои намунавӣ
    const clientPassword = await hashPassword('client123');
    const client1 = await prisma.user.upsert({
        where: { email: 'client1@example.com' },
        update: {},
        create: {
            email: 'client1@example.com',
            phone: '+992900000005',
            passwordHash: clientPassword,
            fullName: 'Клиент Шариф',
            role: 'CLIENT',
            isAvailable: true,
        },
    });
    console.log(`✅ Клиент 1 эҷод шуд: ${client1.email}`);

    const client2 = await prisma.user.upsert({
        where: { email: 'client2@example.com' },
        update: {},
        create: {
            email: 'client2@example.com',
            phone: '+992900000006',
            passwordHash: clientPassword,
            fullName: 'Клиент Лайло',
            role: 'CLIENT',
            isAvailable: true,
        },
    });
    console.log(`✅ Клиент 2 эҷод шуд: ${client2.email}`);

    // 5. Эҷоди фармоишҳои намунавӣ (агар мавҷуд набошанд)
    const existingOrders = await prisma.order.count();
    if (existingOrders === 0) {
        await prisma.order.createMany({
            data: [
                {
                    clientId: client1.id,
                    courierId: courier1.id,
                    pickupAddress: 'Хиёбони Рӯдакӣ 10',
                    pickupLat: 38.5597,
                    pickupLng: 68.7878,
                    deliveryAddress: 'Хиёбони Сомонӣ 25',
                    deliveryLat: 38.5605,
                    deliveryLng: 68.7890,
                    amount: 50000,
                    deliveryFee: 15000,
                    totalAmount: 65000,
                    status: 'DELIVERED',
                    paymentStatus: 'PAID',
                    assignedAt: new Date(),
                    pickedUpAt: new Date(),
                    deliveredAt: new Date(),
                },
                {
                    clientId: client2.id,
                    courierId: courier2.id,
                    pickupAddress: 'Маркази Савдои "Садбарг"',
                    pickupLat: 38.5610,
                    pickupLng: 68.7900,
                    deliveryAddress: 'Гулистон 15',
                    deliveryLat: 38.5550,
                    deliveryLng: 68.7850,
                    amount: 30000,
                    deliveryFee: 15000,
                    totalAmount: 45000,
                    status: 'ASSIGNED',
                    paymentStatus: 'PENDING',
                    assignedAt: new Date(),
                },
                {
                    clientId: client1.id,
                    pickupAddress: 'Бозори Меҳргон',
                    pickupLat: 38.5580,
                    pickupLng: 68.7860,
                    deliveryAddress: 'Хиёбони Исмоили Сомонӣ 100',
                    deliveryLat: 38.5620,
                    deliveryLng: 68.7920,
                    amount: 75000,
                    deliveryFee: 15000,
                    totalAmount: 90000,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                },
            ],
        });
        console.log('✅ Фармоишҳои намунавӣ эҷод шуданд');
    }

    console.log('🎉 Seed ба охир расид!');
}

main()
    .catch((e) => {
        console.error('❌ Хатогӣ ҳангоми seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
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
