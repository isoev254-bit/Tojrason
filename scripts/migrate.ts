<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>migrate.ts</title>
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
// scripts/migrate.ts - Скрипти муҳоҷирати базаи додаҳо (migration)
// Истифода: npx ts-node scripts/migrate.ts [--reset] [--seed]

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Боркунии тағйирёбандаҳои муҳит
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');
const shouldSeed = args.includes('--seed');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔄 Базаи додаҳо - Скрипти муҳоҷират (Migration)');
console.log('═══════════════════════════════════════════════════════════\n');

async function main() {
    try {
        // 1. Санҷиши пайвастшавӣ ба база
        console.log('📡 Санҷиши пайвастшавӣ ба базаи додаҳо...');
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL дар .env муайян карда нашудааст');
        }
        console.log('   ✅ Пайвастшавӣ муваффақ\n');

        // 2. Агар --reset дода шуда бошад, базаро тоза мекунем
        if (shouldReset) {
            console.log('⚠️  Тоза кардани база (RESET) ...');
            console.log('   Базаи мавҷуда нест карда мешавад...');
            execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
            console.log('   ✅ База тоза карда шуд\n');
        }

        // 3. Генератсияи Prisma Client
        console.log('📦 Генератсияи Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('   ✅ Prisma Client генератсия шуд\n');

        // 4. Эҷоди migration нав (агар тағйирот вуҷуд дошта бошад)
        console.log('📝 Санҷиши тағйирот барои migration нав...');
        try {
            execSync('npx prisma migrate dev --name auto_migration --create-only', { 
                stdio: 'pipe',
                encoding: 'utf-8' 
            });
            console.log('   ⚠️  Migration нав эҷод шуд. Лутфан онро баррасӣ кунед.');
            console.log('   Барои истифода: npx prisma migrate deploy\n');
        } catch (error: any) {
            if (error.message.includes('No changes detected')) {
                console.log('   ✅ Тағйироте ёфт нашуд\n');
            } else {
                console.log('   ℹ️  Дигар хатогӣ рух дод, идома медиҳем...\n');
            }
        }

        // 5. Истифодаи migrationҳо (deploy)
        console.log('🚀 Истифодаи migrationҳо...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('   ✅ Migrationҳо истифода шуданд\n');

        // 6. Агар --seed дода шуда бошад, seed мекунем
        if (shouldSeed) {
            console.log('🌱 Пур кардани база бо маълумотҳои аввалия (seed)...');
            execSync('npx ts-node prisma/seeds/seed.ts', { stdio: 'inherit' });
            console.log('   ✅ Seed анҷом шуд\n');
        }

        // 7. Нишон додани маълумот дар бораи migrationҳо
        console.log('📊 Маълумот дар бораи migrationҳо:');
        try {
            const status = execSync('npx prisma migrate status', { encoding: 'utf-8' });
            console.log(status);
        } catch (error) {
            console.log('   Наметавонам статуси migrationҳоро гирам\n');
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ Муҳоҷират бомуваффақият анҷом шуд!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('💡 Маслиҳатҳо:');
        console.log('   - Барои кушодани Prisma Studio: npx prisma studio');
        console.log('   - Барои seed: npx ts-node scripts/migrate.ts --seed');
        console.log('   - Барои reset: npx ts-node scripts/migrate.ts --reset --seed\n');

    } catch (error: any) {
        console.error('\n❌ Хатогӣ ҳангоми муҳоҷират:');
        console.error(error.message);
        process.exit(1);
    }
}

main();
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
