<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>deploy.sh</title>
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
#!/bin/bash

# scripts/deploy.sh - Скрипти автоматии deployment барои Tojrason
# Истифода: chmod +x scripts/deploy.sh && ./scripts/deploy.sh [--skip-build] [--skip-migrate]

set -e

# Рангҳо барои логҳо
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметрҳо
SKIP_BUILD=false
SKIP_MIGRATE=false

for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
    esac
done

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Tojrason - Скрипти Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# 1. Санҷиши мавҷудияти Docker
echo -e "${YELLOW}📋 Санҷиши вобастагиҳо...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker насб карда нашудааст${NC}"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose насб карда нашудааст${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Docker ва Docker Compose мавҷуданд${NC}\n"

# 2. Санҷиши мавҷудияти .env файл
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Файли backend/.env ёфт нашуд${NC}"
    echo -e "   Аз .env.example нусхабардорӣ мекунем..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}   ✅ Файли .env эҷод шуд. Лутфан қиматҳоро тафтиш кунед!${NC}\n"
fi

# 3. Билд кардани backend (агар лозим бошад)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}🔨 Билд кардани backend...${NC}"
    cd backend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}   ✅ Backend билд шуд${NC}\n"
else
    echo -e "${YELLOW}⏭️  Билд кардани backend (skip)${NC}\n"
fi

# 4. Истифодаи migrationҳои база
if [ "$SKIP_MIGRATE" = false ]; then
    echo -e "${YELLOW}🔄 Истифодаи migrationҳо...${NC}"
    cd backend
    npx prisma migrate deploy
    cd ..
    echo -e "${GREEN}   ✅ Migrationҳо истифода шуданд${NC}\n"
else
    echo -e "${YELLOW}⏭️  Migrationҳо (skip)${NC}\n"
fi

# 5. Пӯшидани контейнерҳои кӯҳна
echo -e "${YELLOW}🛑 Пӯшидани контейнерҳои кӯҳна...${NC}"
cd docker
docker-compose down
echo -e "${GREEN}   ✅ Контейнерҳо пӯшида шуданд${NC}\n"

# 6. Билд кардани тасвирҳои Docker
echo -e "${YELLOW}🐳 Билд кардани тасвирҳои Docker...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}   ✅ Тасвирҳо билд шуданд${NC}\n"

# 7. Оғози контейнерҳо
echo -e "${YELLOW}🚀 Оғози контейнерҳо...${NC}"
docker-compose up -d
echo -e "${GREEN}   ✅ Контейнерҳо оғоз шуданд${NC}\n"

# 8. Интизори оғози хидматҳо
echo -e "${YELLOW}⏳ Интизори оғози хидматҳо (10 сония)...${NC}"
sleep 10

# 9. Санҷиши саломатӣ
echo -e "${YELLOW}🏥 Санҷиши саломатӣ...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}   ✅ Сервер солим аст (HTTP $HEALTH_CHECK)${NC}"
else
    echo -e "${RED}   ❌ Сервер ҷавоб намедиҳад (HTTP $HEALTH_CHECK)${NC}"
fi

# 10. Нишон додани статуси контейнерҳо
echo -e "\n${BLUE}📊 Статуси контейнерҳо:${NC}"
docker-compose ps

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment бомуваффақият анҷом шуд!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "🌐 Дастрасӣ:"
echo -e "   📱 API: ${GREEN}http://localhost:5000/api${NC}"
echo -e "   📄 Swagger: ${GREEN}http://localhost:5000/api-docs${NC}"
echo -e "   📊 Метрика: ${GREEN}http://localhost:5000/metrics${NC}"
echo -e "   🏥 Health: ${GREEN}http://localhost:5000/health${NC}\n"

echo -e "💡 Фармонҳои муфид:"
echo -e "   - Логҳоро бубинед: ${YELLOW}docker-compose logs -f${NC}"
echo -e "   - Контейнерҳоро пӯшед: ${YELLOW}docker-compose down${NC}"
echo -e "   - Бозоғозӣ: ${YELLOW}docker-compose restart${NC}"
echo -e "   - Seed кардани база: ${YELLOW}docker exec -it tojrason_backend npm run seed${NC}\n"
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
