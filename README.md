<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>README.md</title>
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
# 🚀 Tojrason - Системаи интиқоли бор (ба монанди Glovo)

[![CI](https://github.com/tojrason/tojrason/actions/workflows/ci.yml/badge.svg)](https://github.com/tojrason/tojrason/actions/workflows/ci.yml)
[![CD](https://github.com/tojrason/tojrason/actions/workflows/cd.yml/badge.svg)](https://github.com/tojrason/tojrason/actions/workflows/cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Дар бораи лоиҳа

Tojrason - ин системаи пурраи интиқоли бор мебошад, ки ба монанди Glovo кор мекунад. Лоиҳа иборат аст аз:

- **Backend API** - бо Express.js ва TypeScript
- **Frontend** - барои админ, клиент ва курьер (React.js)
- **Модулҳо**: аутентификатсия, фармоишҳо, курьерҳо, диспетчеризатсия, пардохт, уведомлениеҳо, ва ғайра

## ✨ Хусусиятҳо

- ✅ Аутентификатсия бо JWT
- ✅ Идоракунии фармоишҳо (эҷод, пайгирӣ, таъини курьер)
- ✅ Диспетчеризатсияи интеллектуалӣ (3 стратегия: nearest, cheapest, smart)
- ✅ Пайгирии воқеии ҷойгиршавӣ бо Socket.IO
- ✅ Пардохт тавассути Stripe ё нақдӣ
- ✅ Уведомлениеҳо (SMS, Email, Push)
- ✅ Кэш бо Redis
- ✅ Навбатҳо (Queue) бо BullMQ
- ✅ Мониторинг бо Prometheus
- ✅ Ҳуҷҷатгузории API бо Swagger
- ✅ CI/CD бо GitHub Actions
- ✅ Docker ва Docker Compose

## 🛠 Технологияҳо

| Қисмат | Технология |
|--------|------------|
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Cache & Queue | Redis, BullMQ |
| Realtime | Socket.IO |
| Payment | Stripe API |
| Auth | JWT, bcryptjs |
| Monitoring | Prometheus |
| Docs | Swagger/OpenAPI |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## 📁 Сохтори лоиҳа
