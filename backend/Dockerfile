<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dockerfile</title>
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
# backend/Dockerfile
# Марҳилаи 1: Билд (Build stage)
FROM node:20-alpine AS builder

WORKDIR /app

# Копияи файлҳои package.json ва package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Насби вобастагиҳо
RUN npm ci --only=production && npm cache clean --force

# Генератсияи Prisma Client
RUN npx prisma generate

# Марҳилаи 2: Иҷро (Production stage)
FROM node:20-alpine

WORKDIR /app

# Насби вобастагиҳои системавӣ барои Node.js
RUN apk add --no-cache tzdata

# Танзими минтақаи вақт (Tajikistan)
ENV TZ=Asia/Dushanbe

# Копияи билд аз марҳилаи аввал
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Копияи рамзи TypeScript (пас аз билд)
COPY package*.json ./
COPY dist ./dist
COPY src ./src

# Порт барои барнома
EXPOSE 5000

# Фармони барои оғози сервер
CMD ["node", "dist/server.js"]
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
