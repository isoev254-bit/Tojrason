# 🚀 Tojrason Delivery

### Платформаи расонидани тезтарин дар Душанбе

---

## 📋 Дар бораи лоиҳа

**Tojrason Delivery** — платформаи пурраи расонидан (delivery) бо 3 панели корбарӣ, бэкенди Node.js ва базаи маълумоти PostgreSQL. Лоиҳа барои идоракунии фармоишҳо, курерҳо ва муштариён дар шаҳри Душанбе сохта шудааст.

---

## 🏗 Структураи лоиҳа

```
Tojrason/
├── backend/                  # Сервери Node.js + Express
│   ├── config/
│   │   └── db.js             # Пайвастшавӣ ба PostgreSQL
│   ├── middleware/
│   │   └── auth.js           # JWT тасдиқкунӣ
│   ├── routes/
│   │   ├── auth.js           # Register / Login / Profile
│   │   ├── orders.js         # CRUD фармоишҳо
│   │   ├── couriers.js       # Идоракунии курерҳо
│   │   └── users.js          # Идоракунии корбарон
│   ├── server.js             # Файли асосӣ
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── admin/                # 📊 Панели Админ
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   ├── client/               # 📦 Панели Фармоишгар
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   └── courier/              # 🏍 Панели Курер
│       ├── index.html
│       ├── app.js
│       └── style.css
│
├── shared/                   # 🔧 Файлҳои умумӣ
│   ├── css/
│   │   ├── variables.css     # Рангҳо, шрифтҳо, dark/light
│   │   ├── components.css    # Тугмаҳо, карточкаҳо, модалҳо
│   │   └── layout.css        # Navbar, sidebar, footer
│   ├── js/
│   │   ├── api.js            # HTTP запросҳо + JWT
│   │   ├── theme.js          # Dark/Light toggle
│   │   ├── ui.js             # Toast, modal, formatting
│   │   └── auth-guard.js     # Санҷиши даромад
│   └── assets/
│       ├── logo.svg          # Логотип
│       └── icons.js          # 18 SVG иконка
│
└── README.md
```

---

## ✨ Имконотҳо

### 📊 Панели Админ
- Панели идоракунӣ бо статистика (фармоишҳо, даромад, рейтинг)
- Харитаи зинда бо Leaflet (ҷойгоҳи курерҳо дар вақти воқеӣ)
- Идоракунии фармоишҳо (дидан, таъин кардан, бекор кардан)
- Профилҳои курерҳо ва муштариён
- Қабули курерони нав (3 қадам бо бор кардани ҳуҷҷатҳо)
- Шикоятҳо (нав, баррасӣ, ҳалшуда)
- Танзимоти умумӣ

### 📦 Панели Фармоишгар (Client)
- Харитаи интерактивӣ — клик кунед ё суроға нависед
- Геокодинг бо Nominatim (ҷустуҷӯи суроға)
- Маршрутсозӣ бо OSRM (масофа ва вақт)
- Интихоби навъи бор (8 навъ) ва вазн
- Ҳисоби автоматикии нарх
- Пайгирии фармоиш дар харита
- Баҳогузорӣ (⭐ 1-5) ва шикоят

### 🏍 Панели Курер
- Онлайн/Офлайн toggle
- Рӯйхати фармоишҳои дастрас
- Қабул кардани фармоиш
- Пайгирии маршрут дар харита
- Аниматсияи ҳаракати курер
- Тасдиқи расонидан
- Ду режими харита (торик/равшан)

---

## 🛠 Технологияҳо

| Қисм | Технология |
|------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Frontend** | HTML, CSS, JavaScript (бе framework) |
| **Харита** | Leaflet.js |
| **Геокодинг** | Nominatim (OpenStreetMap) |
| **Маршрут** | OSRM (Open Source Routing Machine) |
| **Шрифтҳо** | DM Sans, Sora, Inter, IBM Plex Mono |
| **Иконкаҳо** | Font Awesome, SVG custom |

---

## 🚀 Оғоз кардан

### 1. Клон кардан

```bash
git clone https://github.com/Tojrason/Tojrason.git
cd Tojrason
```

### 2. Backend

```bash
cd backend
npm install
```

PostgreSQL-ро насб кунед ва database созед:

```sql
CREATE DATABASE tojrason_delivery;
```

Файли `.env` созед:

```bash
cp .env.example .env
```

`.env`-ро тағйир диҳед:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tojrason_delivery
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=3000
```

Оғоз кунед:

```bash
npm run dev
```

### 3. Frontend

Frontend файлҳоро бо ягон HTTP server оғоз кунед:

```bash
# Мисол бо npx
npx serve ./frontend

# Ё бо Python
python -m http.server 8080
```

---

## 📡 API Endpoints

### 🔐 Auth — `/api/auth`

| Метод | Роҳ | Тавсиф |
|-------|-----|--------|
| `POST` | `/api/auth/register` | Бақайдгирӣ |
| `POST` | `/api/auth/login` | Даромадан |
| `GET` | `/api/auth/me` | Профили ман |

### 📦 Orders — `/api/orders`

| Метод | Роҳ | Тавсиф |
|-------|-----|--------|
| `GET` | `/api/orders` | Ҳамаи фармоишҳо |
| `GET` | `/api/orders/:id` | Як фармоиш |
| `POST` | `/api/orders` | Фармоиши нав |
| `PUT` | `/api/orders/:id` | Тағйир додан |
| `PATCH` | `/api/orders/:id/status` | Статус иваз кардан |
| `DELETE` | `/api/orders/:id` | Нест кардан |

**Статусҳо:** `new` → `accepted` → `picked_up` → `delivered` / `cancelled`

### 🏍 Couriers — `/api/couriers`

| Метод | Роҳ | Тавсиф |
|-------|-----|--------|
| `GET` | `/api/couriers` | Ҳамаи курерҳо |
| `GET` | `/api/couriers/free` | Курерҳои озод |
| `GET` | `/api/couriers/:id` | Як курер |
| `PATCH` | `/api/couriers/location` | Навсозии ҷойгоҳ |
| `PATCH` | `/api/couriers/status` | Статус иваз кардан |
| `GET` | `/api/couriers/:id/orders` | Фармоишҳои курер |

### 👥 Users — `/api/users`

| Метод | Роҳ | Тавсиф |
|-------|-----|--------|
| `GET` | `/api/users` | Ҳамаи корбарон |
| `GET` | `/api/users/:id` | Як корбар |
| `PUT` | `/api/users/:id` | Тағйир додан |
| `DELETE` | `/api/users/:id` | Нест кардан |

### 🔑 Истифодаи Token

```
Authorization: Bearer <token>
```

---

## 🎨 Тема

Лоиҳа аз **dark/light theme toggle** дастгирӣ мекунад. Тема дар `localStorage` нигоҳ дошта мешавад.

- **Admin** — темаи торик бо рангҳои кабуд
- **Client** — темаи равшан бо панели сафед
- **Courier** — темаи торик бо toggle ба равшан

---

## 📱 Responsive

Ҳамаи 3 панел барои мобилӣ оптимизатсия шудаанд:

- **Admin** — sidebar пинҳон мешавад, bottom nav намоиш медиҳад
- **Client** — панел аз поён кашида мешавад
- **Courier** — панел ба тамоми экран мегузарад

---

## 👨‍💻 Муаллиф

**Tojrason Team** — Душанбе, Тоҷикистон

---

## 📄 Лицензия

MIT License

---

<div align="center">
  <b>🇹🇯 Сохта шуда бо ❤️ дар Душанбе</b>
</div>
