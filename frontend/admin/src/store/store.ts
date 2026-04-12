<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>store.ts</title>
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
// frontend/admin/src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import {
    authReducer,
    userReducer,
    orderReducer,
    courierReducer,
    paymentReducer,
} from './slices';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        orders: orderReducer,
        couriers: courierReducer,
        payments: paymentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Агар баъзе маълумотҳо ғайрисериализатсияшаванда бошанд (масалан, Date), инро истифода баред
                ignoredActions: ['auth/login/fulfilled', 'orders/fetchById/fulfilled'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// Типҳо барои TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
