<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>auth.api.ts</title>
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
// frontend/admin/src/api/auth.api.ts - API барои аутентификатсия
import { api } from './axios.config';

// Типҳо
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    phone: string;
    password: string;
    fullName: string;
    role?: 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';
}

export interface UserResponse {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: UserResponse;
        token: string;
    };
}

// API методҳо
export const authApi = {
    /**
     * Воридшавӣ ба система
     * @param data - Email ва парол
     * @returns Маълумоти корбар ва токен
     */
    login: async (data: LoginRequest): Promise&lt;AuthResponse&gt; => {
        const response = await api.post&lt;AuthResponse&gt;('/auth/login', data);
        return response;
    },

    /**
     * Сабти номи корбари нав
     * @param data - Маълумоти сабти ном
     * @returns Маълумоти корбар ва токен
     */
    register: async (data: RegisterRequest): Promise&lt;AuthResponse&gt; => {
        const response = await api.post&lt;AuthResponse&gt;('/auth/register', data);
        return response;
    },

    /**
     * Гирифтани маълумоти корбари ҷорӣ
     * @returns Маълумоти корбар
     */
    getMe: async (): Promise&lt;{ success: boolean; data: UserResponse }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: UserResponse }&gt;('/auth/me');
        return response;
    },

    /**
     * Баромадан аз система (local logout)
     */
    logout: (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    /**
     * Нигоҳдории токен дар localStorage
     * @param token - JWT токен
     */
    setToken: (token: string): void => {
        localStorage.setItem('accessToken', token);
    },

    /**
     * Гирифтани токен аз localStorage
     * @returns JWT токен ё null
     */
    getToken: (): string | null => {
        return localStorage.getItem('accessToken');
    },

    /**
     * Санҷиши он, ки оё корбар ворид шудааст
     * @returns true агар токен мавҷуд бошад
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('accessToken');
    },

    /**
     * Гирифтани маълумоти корбар аз localStorage
     * @returns Маълумоти корбар ё null
     */
    getUser: (): UserResponse | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as UserResponse;
        } catch {
            return null;
        }
    },

    /**
     * Нигоҳдории маълумоти корбар дар localStorage
     * @param user - Маълумоти корбар
     */
    setUser: (user: UserResponse): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },
};

export default authApi;
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
