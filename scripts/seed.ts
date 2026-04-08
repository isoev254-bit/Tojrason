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
// scripts/seed.ts - Скрипти алоҳида барои пур кардани базаи додаҳо
// Истифода: npx ts-node scripts/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Боркунии тағйирёбандаҳои муҳит
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise&lt;string&gt; =&gt; {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

async function main() {
    console.log('🌱 Оғози seed базаи додаҳо...\n');

    // 1. Тоза кардани маълумотҳои кӯҳна (бо эҳтиёт)
    console.log('🗑 Тоза кардани маълумотҳои кӯҳна...');
    await prisma.payment.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Тоза карда шуд\n');

    // 2. Эҷоди корбарони ADMIN
    console.log('📝 Эҷоди корбарон...');
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@tojrason.com',
            phone: '+992900000001',
            passwordHash: adminPassword,
            fullName: 'Администратор',
            role: 'ADMIN',
            isAvailable: true,
        },
    });
    console.log(`   ✅ Админ: ${admin.email}`);

    // 3. Эҷоди DISPATCHER
    const dispatcherPassword = await hashPassword('dispatcher123');
    const dispatcher = await prisma.user.create({
        data: {
            email: 'dispatcher@tojrason.com',
            phone: '+992900000002',
            passwordHash: dispatcherPassword,
            fullName: 'Диспетчер',
            role: 'DISPATCHER',
            isAvailable: true,
        },
    });
    console.log(`   ✅ Диспетчер: ${dispatcher.email}`);

    // 4. Эҷоди курьерҳо
    const courierPassword = await hashPassword('courier123');
    const couriers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'courier1@tojrason.com',
                phone: '+992900000003',
                passwordHash: courierPassword,
                fullName: 'Курьер Али',
                role: 'COURIER',
                isAvailable: true,
                locationLat: 38.5597,
                locationLng: 68.7878,
            },
        }),
        prisma.user.create({
            data: {
                email: 'courier2@tojrason.com',
                phone: '+992900000004',
                passwordHash: courierPassword,
                fullName: 'Курьер Умар',
                role: 'COURIER',
                isAvailable: true,
                locationLat: 38.5600,
                locationLng: 68.7880,
            },
        }),
        prisma.user.create({
            data: {
                email: 'courier3@tojrason.com',
                phone: '+992900000007',
                passwordHash: courierPassword,
                fullName: 'Курьер Карим',
                role: 'COURIER',
                isAvailable: false,
                locationLat: null,
                locationLng: null,
            },
        }),
    ]);
    couriers.forEach(c => console.log(`   ✅ Курьер: ${c.email}`));

    // 5. Эҷоди клиентҳо
    const clientPassword = await hashPassword('client123');
    const clients = await Promise.all([
        prisma.user.create({
            data: {
                email: 'client1@example.com',
                phone: '+992900000005',
                passwordHash: clientPassword,
                fullName: 'Клиент Шариф',
                role: 'CLIENT',
                isAvailable: true,
            },
        }),
        prisma.user.create({
            data: {
                email: 'client2@example.com',
                phone: '+992900000006',
                passwordHash: clientPassword,
                fullName: 'Клиент Лайло',
                role: 'CLIENT',
                isAvailable: true,
            },
        }),
    ]);
    clients.forEach(c => console.log(`   ✅ Клиент: ${c.email}`));

    console.log('\n📝 Эҷоди фармоишҳо...');

    // 6. Эҷоди фармоишҳо
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const orders = await Promise.all([
        // Фармоиши расонидашуда
        prisma.order.create({
            data: {
                clientId: clients[0].id,
                courierId: couriers[0].id,
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
                assignedAt: twoDaysAgo,
                pickedUpAt: twoDaysAgo,
                deliveredAt: yesterday,
                createdAt: twoDaysAgo,
            },
        }),
        // Фармоиши дар ҳоли иҷро (таъин шуда)
        prisma.order.create({
            data: {
                clientId: clients[1].id,
                courierId: couriers[1].id,
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
                assignedAt: now,
                createdAt: now,
            },
        }),
        // Фармоиши интизор (PENDING)
        prisma.order.create({
            data: {
                clientId: clients[0].id,
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
                createdAt: now,
            },
        }),
        // Фармоиши гирифта шуда (PICKED_UP)
        prisma.order.create({
            data: {
                clientId: clients[1].id,
                courierId: couriers[0].id,
                pickupAddress: 'Мактаби №1',
                pickupLat: 38.5570,
                pickupLng: 68.7840,
                deliveryAddress: 'Боғи Ирам',
                deliveryLat: 38.5630,
                deliveryLng: 68.7930,
                amount: 25000,
                deliveryFee: 15000,
                totalAmount: 40000,
                status: 'PICKED_UP',
                paymentStatus: 'PAID',
                assignedAt: now,
                pickedUpAt: now,
                createdAt: now,
            },
        }),
    ]);
    orders.forEach(o => console.log(`   ✅ Фармоиш: ${o.id} (${o.status})`));

    // 7. Эҷоди пардохтҳо
    console.log('\n📝 Эҷоди пардохтҳо...');
    await prisma.payment.create({
        data: {
            orderId: orders[0].id,
            userId: clients[0].id,
            amount: 65000,
            currency: 'TJS',
            method: 'stripe',
            status: 'PAID',
            providerPaymentId: 'pi_test_123456',
            paidAt: yesterday,
        },
    });
    console.log('   ✅ Пардохт барои фармоиши расонидашуда');

    await prisma.payment.create({
        data: {
            orderId: orders[3].id,
            userId: clients[1].id,
            amount: 40000,
            currency: 'TJS',
            method: 'cash',
            status: 'PAID',
            paidAt: now,
        },
    });
    console.log('   ✅ Пардохт барои фармоиши гирифташуда');

    console.log('\n📝 Эҷоди уведомлениеҳо...');
    await prisma.notification.createMany({
        data: [
            {
                userId: clients[0].id,
                type: 'order_created',
                title: 'Фармоиш эҷод шуд',
                body: `Фармоиши шумо №${orders[0].id} қабул шуд`,
                isRead: true,
            },
            {
                userId: clients[0].id,
                type: 'order_delivered',
                title: 'Фармоиш расонида шуд',
                body: `Фармоиши №${orders[0].id} бомуваффақият расонида шуд`,
                isRead: false,
            },
            {
                userId: clients[1].id,
                type: 'order_assigned',
                title: 'Курьер таъин шуд',
                body: `Ба фармоиши №${orders[1].id} курьер таъин шуд`,
                isRead: false,
            },
        ],
    });
    console.log('   ✅ 3 уведомление эҷод шуд');

    console.log('\n🎉 Seed ба охир расид!');
    console.log('═══════════════════════════════════════\n');
    console.log('🔑 Маълумот барои воридшавӣ:');
    console.log('   Админ:     admin@tojrason.com / admin123');
    console.log('   Диспетчер: dispatcher@tojrason.com / dispatcher123');
    console.log('   Курьер:    courier1@tojrason.com / courier123');
    console.log('   Клиент:    client1@example.com / client123');
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
